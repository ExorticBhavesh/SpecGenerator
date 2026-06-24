import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { GeminiService } from '../gemini/gemini.service';
import { PipelineStage } from './pipeline-stage.interface';

@Injectable()
export class IntentStage implements PipelineStage {
  readonly name = StageName.INTENT;

  constructor(private readonly geminiService: GeminiService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.geminiService.generateIntent(input);
  }
}
