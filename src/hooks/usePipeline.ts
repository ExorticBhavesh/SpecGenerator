import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startPipeline, listPipelineRuns, getPipelineRun } from '../api/ai-pipeline';
import type { StartPipelineDto } from '../types/pipeline';
import toast from 'react-hot-toast';

export function useStartPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: StartPipelineDto) => startPipeline(dto),
    onSuccess: (data) => {
      toast.success('Pipeline started successfully');
      queryClient.invalidateQueries({ queryKey: ['pipeline-runs'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline', data.id] });
    },
    onError: () => {
      toast.error('Failed to start pipeline');
    },
  });
}

export function usePipelineRuns() {
  return useQuery({
    queryKey: ['pipeline-runs'],
    queryFn: listPipelineRuns,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePipelineRun(id: string | undefined) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => getPipelineRun(id!),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: (query) => {
      // Auto-refetch if pipeline is running
      if (query.state.data?.status === 'RUNNING') {
        return 2000;
      }
      return false;
    },
  });
}
