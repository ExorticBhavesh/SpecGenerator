import { IsObject, IsOptional, IsString } from 'class-validator';
import { PipelineContext } from '../consistency.types';

export class ConsistencyCheckDto {
  @IsObject()
  context: PipelineContext;

  @IsOptional()
  @IsString()
  pipelineRunId?: string;
}
