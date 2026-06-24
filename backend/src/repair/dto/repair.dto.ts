import { IsObject, IsOptional, IsString } from 'class-validator';

export class RepairRequestDto {
  @IsObject()
  schema: Record<string, unknown>;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  pipelineRunId?: string;
}
