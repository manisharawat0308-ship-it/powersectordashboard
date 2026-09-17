import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface ProjectInfo {
  name: string;
  capacityMW: number;
  source: string;
  location: string;
}

export function useStateProjects() {
  return useQuery({
    queryKey: ['capacity', 'state-projects'],
    queryFn: () => fetchJson<Record<string, ProjectInfo[]>>('/data/capacity/state-projects.json'),
  });
}
