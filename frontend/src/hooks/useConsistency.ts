import { useMutation } from '@tanstack/react-query';
import { checkConsistency } from '../api/consistency';
import type { ConsistencyCheckDto } from '../types/pipeline';
import toast from 'react-hot-toast';

export function useCheckConsistency() {
  return useMutation({
    mutationFn: (dto: ConsistencyCheckDto) => checkConsistency(dto),
    onSuccess: (data) => {
      if (data.passed) {
        toast.success('Consistency check passed');
      } else {
        toast('Consistency check found issues');
      }
    },
    onError: () => {
      toast.error('Failed to check consistency');
    },
  });
}
