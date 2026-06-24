import { apiClient } from './client';
import type { ConsistencyCheckDto, ConsistencyResult } from '../types/pipeline';

export async function checkConsistency(dto: ConsistencyCheckDto): Promise<ConsistencyResult> {
  const { data } = await apiClient.post<ConsistencyResult>('/consistency/check', dto);
  return data;
}
