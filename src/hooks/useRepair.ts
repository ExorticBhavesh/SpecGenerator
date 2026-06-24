import { useMutation } from '@tanstack/react-query';
import { repairSchema } from '../api/repair';
import type { RepairRequestDto } from '../types/pipeline';
import toast from 'react-hot-toast';

export function useRepair() {
  return useMutation({
    mutationFn: (dto: RepairRequestDto) => repairSchema(dto),
    onSuccess: (data) => {
      if (data.repaired) {
        toast.success(`Repair completed with ${data.repairs.length} fixes`);
      } else {
        toast('No repairs were needed');
      }
    },
    onError: () => {
      toast.error('Failed to repair schema');
    },
  });
}
