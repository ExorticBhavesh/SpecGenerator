import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { GeminiService } from '../gemini/gemini.service';
import { PipelineStage } from './pipeline-stage.interface';

@Injectable()
export class DesignStage implements PipelineStage {
  readonly name = StageName.DESIGN;

  constructor(private readonly geminiService: GeminiService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.geminiService.generateDesign(input);
  }
}
