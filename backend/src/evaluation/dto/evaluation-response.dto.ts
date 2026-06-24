export class EvaluationMetricsDto {
  successRate: number;
  averageLatency: number;
  repairRate: number;
  repairCount: number;
  failureTypes: string[];
  consistencyErrors: number;
}

export class EvaluationRunItemDto {
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

export class EvaluationResponseDto {
  runs: EvaluationRunItemDto[];
  metrics: EvaluationMetricsDto;
}

export class EvaluationHistoryDto {
  id: string;
  status: string;
  runs: EvaluationRunItemDto[];
  metrics: EvaluationMetricsDto;
  createdAt: Date;
  updatedAt: Date;
}
