import { StageName, StageStatus } from '@prisma/client';

export class StageResultDto {
  id: string;
  stage: StageName;
  inputJson: Record<string, unknown>;
  outputJson: Record<string, unknown> | null;
  status: StageStatus;
  error: string | null;
  durationMs: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PipelineRunResponseDto {
  id: string;
  requirements: string;
  status: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  stageResults: StageResultDto[];
}

export class PipelineInspectorDto {
  id: string;
  requirements: string;
  status: string;
  totalDurationMs: number | null;
  stages: StageInspectorDto[];
  consistency: Record<string, unknown> | null;
  repair: Record<string, unknown> | null;
  simulation: Record<string, unknown> | null;
  validation: ValidationPanelDto;
  createdAt: Date;
  updatedAt: Date;
}

export class StageInspectorDto {
  name: StageName;
  status: StageStatus;
  durationMs: number | null;
  output: Record<string, unknown> | null;
  error: string | null;
}

export class ValidationPanelDto {
  errors: unknown[];
  warnings: unknown[];
  repairs: unknown[];
}
