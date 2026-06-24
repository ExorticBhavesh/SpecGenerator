import { apiClient } from './client';
import type { RepairRequestDto, RepairResult } from '../types/pipeline';

export async function repairSchema(dto: RepairRequestDto): Promise<RepairResult> {
  const { data } = await apiClient.post<RepairResult>('/repair', dto);
  return data;
}
