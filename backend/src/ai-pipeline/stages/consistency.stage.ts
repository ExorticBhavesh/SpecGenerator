import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { ConsistencyService } from '../../consistency/consistency.service';
import { PipelineStage } from './pipeline-stage.interface';
import { buildPipelineContext } from '../utils/pipeline-context';

@Injectable()
export class ConsistencyStage implements PipelineStage {
  readonly name = StageName.CONSISTENCY;

  constructor(private readonly consistencyService: ConsistencyService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const stageOutputs = input.stageOutputs as Record<
      string,
      Record<string, unknown>
    >;
    const pipelineRunId = input.pipelineRunId as string | undefined;
    const context = buildPipelineContext(stageOutputs);

    const result = await this.consistencyService.check(context, pipelineRunId);
    return result as unknown as Record<string, unknown>;
  }
}
