import { Injectable } from '@nestjs/common';
import { StageName } from '@prisma/client';
import { SimulationService } from '../../simulation/simulation.service';
import { PipelineStage } from './pipeline-stage.interface';
import { buildPipelineContext } from '../utils/pipeline-context';

@Injectable()
export class SimulationStage implements PipelineStage {
  readonly name = StageName.SIMULATION;

  constructor(private readonly simulationService: SimulationService) {}

  async execute(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const stageOutputs = input.stageOutputs as Record<
      string,
      Record<string, unknown>
    >;
    const context = buildPipelineContext(stageOutputs);

    const repairOutput = stageOutputs[StageName.REPAIR];
    if (repairOutput?.finalSchema) {
      const repaired = repairOutput.finalSchema as Record<string, unknown>;
      Object.assign(context, repaired);
    }

    const result = this.simulationService.run(context);
    return result as unknown as Record<string, unknown>;
  }
}
