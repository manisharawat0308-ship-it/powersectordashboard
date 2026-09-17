import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';
import { StateCapacityData } from '@/types/index';

export function useGeographyData() {
  return useQuery({
    queryKey: ['capacity', 'by-state'],
    queryFn: () => fetchJson<StateCapacityData[]>('/data/capacity/by-state.json'),
  });
}
