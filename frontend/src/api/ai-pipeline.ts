import { apiClient } from './client';
import type { StartPipelineDto, PipelineRunResponseDto } from '../types/pipeline';

export async function startPipeline(dto: StartPipelineDto): Promise<PipelineRunResponseDto> {
  const { data } = await apiClient.post<PipelineRunResponseDto>('/ai-pipeline', dto);
  return data;
}

export async function listPipelineRuns(): Promise<PipelineRunResponseDto[]> {
  const { data } = await apiClient.get<PipelineRunResponseDto[]>('/ai-pipeline');
  return data;
}

export async function getPipelineRun(id: string): Promise<PipelineRunResponseDto> {
  const { data } = await apiClient.get<PipelineRunResponseDto>(`/ai-pipeline/${id}`);
  return data;
}
