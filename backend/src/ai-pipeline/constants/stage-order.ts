import { StageName } from '@prisma/client';

export const PIPELINE_STAGE_ORDER: StageName[] = [
  StageName.INTENT,
  StageName.DESIGN,
  StageName.DATABASE,
  StageName.API,
  StageName.UI,
  StageName.CONSISTENCY,
  StageName.REPAIR,
  StageName.SIMULATION,
];

export const POST_GENERATION_STAGES: StageName[] = [
  StageName.CONSISTENCY,
  StageName.REPAIR,
  StageName.SIMULATION,
];
