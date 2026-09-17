import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export function useOwnershipData() {
  return useQuery({
    queryKey: ['capacity', 'national'],
    queryFn: () => fetchJson<any>('/data/capacity/national.json'),
    select: (data) => ({
      byOwnership: data.byOwnership,
      lastUpdated: data.lastUpdated,
      dataSource: data.dataSource,
    }),
  });
}
