import { StageName } from '@prisma/client';

export interface PipelineStage {
  readonly name: StageName;
  execute(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}
