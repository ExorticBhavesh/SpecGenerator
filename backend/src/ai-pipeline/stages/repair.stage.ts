import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { RepairService } from '../../repair/repair.service';
import { PipelineStage } from './pipeline-stage.interface';
import { buildPipelineContext } from '../utils/pipeline-context';

@Injectable()
export class RepairStage implements PipelineStage {
  readonly name = StageName.REPAIR;

  constructor(private readonly repairService: RepairService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const stageOutputs = input.stageOutputs as Record<
      string,
      Record<string, unknown>
    >;
    const pipelineRunId = input.pipelineRunId as string | undefined;
    const context = buildPipelineContext(stageOutputs);

    const result = await this.repairService.repairPipelineContext(
      context,
      pipelineRunId,
    );
    return result as unknown as Record<string, unknown>;
  }
}
