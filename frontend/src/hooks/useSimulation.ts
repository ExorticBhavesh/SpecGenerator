import { useMutation } from '@tanstack/react-query';
import { runSimulation } from '../api/simulation';
import type { SimulationRunDto } from '../types/pipeline';
import toast from 'react-hot-toast';

export function useSimulation() {
  return useMutation({
    mutationFn: (dto: SimulationRunDto) => runSimulation(dto),
    onSuccess: (data) => {
      if (data.pass) {
        toast.success('Simulation passed successfully');
      } else {
        toast('Simulation found issues');
      }
    },
    onError: () => {
      toast.error('Failed to run simulation');
    },
  });
}
