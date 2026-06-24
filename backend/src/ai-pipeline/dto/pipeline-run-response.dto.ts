import { PipelineStatus, StageName, StageStatus } from '@prisma/client';

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
  status: PipelineStatus;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  stageResults: StageResultDto[];
}
