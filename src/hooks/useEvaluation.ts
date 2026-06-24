import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvaluation, getEvaluationHistory, runEvaluation } from '../api/evaluation';
import toast from 'react-hot-toast';

export function useEvaluation() {
  return useQuery({
    queryKey: ['evaluation'],
    queryFn: getEvaluation,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useEvaluationHistory() {
  return useQuery({
    queryKey: ['evaluation-history'],
    queryFn: getEvaluationHistory,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useRunEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runEvaluation(),
    onSuccess: () => {
      toast.success('Evaluation completed successfully');
      queryClient.invalidateQueries({ queryKey: ['evaluation'] });
      queryClient.invalidateQueries({ queryKey: ['evaluation-history'] });
    },
    onError: () => {
      toast.error('Failed to run evaluation');
    },
  });
}
