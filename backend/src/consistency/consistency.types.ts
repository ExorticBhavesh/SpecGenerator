export interface ConsistencyIssue {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'warning';
}

export interface ConsistencyResult {
  passed: boolean;
  errors: ConsistencyIssue[];
  warnings: ConsistencyIssue[];
  summary: Record<string, number>;
}

export interface PipelineContext {
  intent?: Record<string, unknown>;
  design?: Record<string, unknown>;
  database?: Record<string, unknown>;
  api?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  auth?: Record<string, unknown>;
  businessRules?: Record<string, unknown>;
}
