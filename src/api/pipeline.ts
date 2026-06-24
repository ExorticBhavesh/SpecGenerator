import { apiClient } from './client';
import type { PipelineInspector } from '../types/pipeline';

export async function getPipeline(id: string): Promise<PipelineInspector> {
  const { data } = await apiClient.get<PipelineInspector>(`/pipeline/${id}`);
  return data;
}
