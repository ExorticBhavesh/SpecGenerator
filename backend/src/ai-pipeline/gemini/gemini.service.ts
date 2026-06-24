import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZodType } from 'zod';
import { RepairService } from '../../repair/repair.service';
import { applyFallbacks, applyPreValidationDefaults, GeminiLogger } from './fallback-utils';
import { MockDataGeneratorService } from './mock-data';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenerativeAI | null;
  private readonly model: string;
  private readonly logger = new Logger(GeminiService.name);
  private readonly mockGenerator = new MockDataGeneratorService();

  constructor(
    private readonly configService: ConfigService,
    private readonly repairService: RepairService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Using fallback mock data.');
      this.client = null;
      this.model = 'gemini-2.5-flash';
      return;
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.logger.log('Gemini service initialized with model: ' + this.model);
  }

  async generateIntent(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { intentSchema } = await import('../schemas');
    return this.generateStructuredJson(
      'You are an AI architecture expert. Extract the intent from user requirements.',
      input,
      intentSchema,
      'intent',
      () => this.mockGenerator.generateIntent(),
    ) as unknown as Record<string, unknown>;
  }

  async generateDesign(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { designSchema } = await import('../schemas');
    return this.generateStructuredJson(
      'You are a system design expert. Create a high-level system design.',
      input,
      designSchema,
      'design',
      () => this.mockGenerator.generateDesign(),
    ) as unknown as Record<string, unknown>;
  }

  async generateDatabase(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { databaseSchema } = await import('../schemas');
    return this.generateStructuredJson(
      'You are a database expert. Design a database schema.',
      input,
      databaseSchema,
      'database',
      () => this.mockGenerator.generateDatabase(),
    ) as unknown as Record<string, unknown>;
  }

  async generateApi(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { apiSchema } = await import('../schemas');
    return this.generateStructuredJson(
      'You are an API design expert. Design REST API endpoints.',
      input,
      apiSchema,
      'api',
      () => this.mockGenerator.generateApi(),
    ) as unknown as Record<string, unknown>;
  }

  async generateUi(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { uiSchema } = await import('../schemas');
    return this.generateStructuredJson(
      'You are a UI/UX expert. Design user interface components.',
      input,
      uiSchema,
      'ui',
      () => this.mockGenerator.generateUi(),
    ) as unknown as Record<string, unknown>;
  }

  private async generateStructuredJson<T extends Record<string, unknown>>(
    systemPrompt: string,
    input: Record<string, unknown>,
    schema: ZodType<T>,
    schemaName: string,
    fallbackGenerator: () => Record<string, unknown>,
  ): Promise<T> {
    const maxRetries = 5;
    const timeoutMs = 60000; // 60 seconds

    // If no client, use fallback immediately
    if (!this.client) {
      this.logger.warn(`Gemini client not available, using fallback mock data for ${schemaName}`);
      return fallbackGenerator() as T;
    }

    const prompt = `${systemPrompt}\n\nRules:\n1) Return only valid JSON.\n2) Do not include markdown fences.\n3) Include all required fields.\n4) Never return empty strings for required fields.\n\nInput:\n${JSON.stringify(input, null, 2)}`;

    GeminiLogger.debug('Prompt sent to Gemini', { prompt, schemaName });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const generativeModel = this.client.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });

        // Add timeout using Promise.race
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        const result = await Promise.race([
          generativeModel.generateContent(prompt),
          timeoutPromise,
        ]);

        const response = result.response;
        const raw = response.text();

        GeminiLogger.debug('Raw Gemini response', { raw, schemaName, attempt });

        if (!raw) {
          throw new Error('Gemini returned an empty response');
        }

        // Repair JSON
        const jsonResult = this.repairService.repairJson(raw);
        let parsed: unknown = jsonResult.finalSchema;

        GeminiLogger.debug('Repaired JSON', { parsed, schemaName });

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Gemini returned non-JSON output');
        }

        // Apply pre-validation defaults for common fields
        parsed = applyPreValidationDefaults(parsed as Record<string, unknown>);

        // Apply recursive fallbacks for empty/null/undefined values
        parsed = applyFallbacks(parsed as Record<string, unknown>, schemaName);

        GeminiLogger.debug('Data after fallbacks applied', { parsed, schemaName });

        // Validate against schema
        const validated = schema.safeParse(parsed);
        if (validated.success) {
          GeminiLogger.info('Schema validation passed', { schemaName, attempt });
          return validated.data;
        }

        GeminiLogger.warn('Schema validation failed, attempting repair', {
          errors: validated.error.errors,
          schemaName,
          attempt,
        });

        // Attempt automatic repair
        const repaired = this.repairService.repairSchema(parsed, schema);
        GeminiLogger.debug('Data after repair', { repaired: repaired.data, schemaName });

        const retry = schema.safeParse(repaired.data);
        if (retry.success) {
          GeminiLogger.info('Schema validation passed after repair', { schemaName, attempt });
          return retry.data;
        }

        // If repair failed, log and continue to next retry
        GeminiLogger.warn('Repair failed, will retry or use fallback', {
          errors: retry.error?.errors,
          schemaName,
          attempt,
        });

        throw new Error(`Validation failed after repair: ${retry.error?.message ?? validated.error.message}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check for 503 or rate limit errors
        const is503Error = errorMessage.includes('503') || errorMessage.includes('SERVICE_UNAVAILABLE') || errorMessage.includes('quota');
        
        this.logger.error(`Gemini API attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);

        if (attempt === maxRetries) {
          this.logger.warn(`All ${maxRetries} attempts failed for ${schemaName}, using fallback mock data`);
          GeminiLogger.warn('Using fallback mock data', { schemaName, errorMessage });
          return fallbackGenerator() as T;
        }

        // Exponential backoff: 2s, 4s, 8s, 16s, 32s for 503 errors
        // Regular backoff: 1s, 2s, 4s, 8s, 16s for other errors
        const baseBackoff = is503Error ? 2000 : 1000;
        const backoffMs = baseBackoff * Math.pow(2, attempt - 1);
        
        this.logger.debug(`Backing off for ${backoffMs}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    // Should never reach here, but return fallback as safety net
    this.logger.error(`Max retries exceeded for ${schemaName}, using fallback`);
    return fallbackGenerator() as T;
  }
}

