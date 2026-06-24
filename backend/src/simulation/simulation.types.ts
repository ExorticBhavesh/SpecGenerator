export interface SimulationCheck {
  category: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface SimulationResult {
  pass: boolean;
  checks: SimulationCheck[];
  warnings: string[];
  errors: string[];
}

export interface PipelineContext {
  intent?: Record<string, unknown>;
  design?: Record<string, unknown>;
  database?: Record<string, unknown>;
  api?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  auth?: Record<string, unknown>;
}
