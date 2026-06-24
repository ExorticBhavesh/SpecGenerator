// Pipeline Status Types
export type PipelineStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type StageName = 'INTENT' | 'DESIGN' | 'DATABASE' | 'API' | 'UI' | 'CONSISTENCY' | 'REPAIR' | 'SIMULATION';
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

// Evaluation Types
export interface EvaluationMetrics {
  successRate: number;
  averageLatency: number;
  repairRate: number;
  repairCount: number;
  failureTypes: string[];
  consistencyErrors: number;
}

export interface EvaluationRunItem {
  promptId: string;
  subcategory: string;
  category: string;
  success: boolean;
  latencyMs: number;
  repairCount: number;
  consistencyErrors: number;
  failureType?: string;
  pipelineRunId?: string;
}

export interface EvaluationResult {
  runs: EvaluationRunItem[];
  metrics: EvaluationMetrics;
}

export interface EvaluationHistory {
  id: string;
  status: PipelineStatus;
  runs: EvaluationRunItem[];
  metrics: EvaluationMetrics;
  createdAt: string;
  updatedAt: string;
}

// Pipeline Types
export interface StageResultDto {
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

export interface PipelineRunResponseDto {
  id: string;
  requirements: string;
  status: PipelineStatus;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  stageResults: StageResultDto[];
}

export interface StartPipelineDto {
  requirements: string;
  userId?: string;
}

export interface StageInspector {
  name: string;
  status: string;
  durationMs: number | null;
  output: Record<string, unknown> | null;
  error: string | null;
}

export interface ValidationPanel {
  errors: unknown[];
  warnings: unknown[];
  repairs: unknown[];
}

export interface PipelineInspector {
  id: string;
  requirements: string;
  status: string;
  totalDurationMs: number | null;
  stages: StageInspector[];
  consistency: Record<string, unknown> | null;
  repair: Record<string, unknown> | null;
  simulation: Record<string, unknown> | null;
  validation: ValidationPanel;
  createdAt: string;
  updatedAt: string;
}

// Consistency Types
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

export interface ConsistencyCheckDto {
  context: PipelineContext;
  pipelineRunId?: string;
}

// Repair Types
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

export interface RepairRequestDto {
  schema: Record<string, unknown>;
  stage?: string;
  pipelineRunId?: string;
}

// Simulation Types
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

export interface SimulationRunDto {
  context: PipelineContext;
  pipelineRunId?: string;
}
