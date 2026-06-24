export interface RepairAction {
  type: string;
  path: string;
  description: string;
  before?: unknown;
  after?: unknown;
}

export interface RepairResult {
  repaired: boolean;
  repairs: RepairAction[];
  finalSchema: Record<string, unknown>;
}

export interface PipelineContext {
  intent?: Record<string, unknown>;
  design?: Record<string, unknown>;
  database?: Record<string, unknown>;
  api?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  auth?: Record<string, unknown>;
}
