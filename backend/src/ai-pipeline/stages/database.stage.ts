import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { GeminiService } from '../gemini/gemini.service';
import { PipelineStage } from './pipeline-stage.interface';

@Injectable()
export class DatabaseStage implements PipelineStage {
  readonly name = StageName.DATABASE;

  constructor(private readonly geminiService: GeminiService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.geminiService.generateDatabase(input);
  }
}
