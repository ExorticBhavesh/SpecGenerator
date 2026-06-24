import { apiClient } from './client';
import type { SimulationRunDto, SimulationResult } from '../types/pipeline';

export async function runSimulation(dto: SimulationRunDto): Promise<SimulationResult> {
  const { data } = await apiClient.post<SimulationResult>('/simulation/run', dto);
  return data;
}
