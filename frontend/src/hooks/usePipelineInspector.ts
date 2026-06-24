import { useQuery } from '@tanstack/react-query';
import { getPipeline } from '../api/pipeline';

export function usePipelineInspector(id: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-inspector', id],
    queryFn: () => getPipeline(id!),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
