import { IsObject, IsOptional, IsString } from 'class-validator';
import { PipelineContext } from '../simulation.types';

export class SimulationRunDto {
  @IsObject()
  context: PipelineContext;

  @IsOptional()
  @IsString()
  pipelineRunId?: string;
}
