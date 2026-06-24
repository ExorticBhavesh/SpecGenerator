import { apiClient } from './client';
import type { EvaluationHistory, EvaluationResult } from '../types/pipeline';

export async function getEvaluation(): Promise<EvaluationHistory | null> {
  const { data } = await apiClient.get<EvaluationHistory | null>('/evaluation');
  return data;
}

export async function getEvaluationHistory(): Promise<EvaluationHistory[]> {
  const { data } = await apiClient.get<EvaluationHistory[]>('/evaluation/history');
  return data;
}

export async function runEvaluation(): Promise<EvaluationResult> {
  const { data } = await apiClient.post<EvaluationResult>('/evaluation/run');
  return data;
}
