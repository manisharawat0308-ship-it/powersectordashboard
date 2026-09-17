import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';
import { Milestone } from '@/types/index';

export function useTimelineData() {
  return useQuery({
    queryKey: ['capacity', 'historical'],
    queryFn: () => fetchJson<any[]>('/data/capacity/historical.json'),
  });
}

export function useMilestones() {
  return useQuery({
    queryKey: ['meta', 'milestones'],
    queryFn: () => fetchJson<Milestone[]>('/data/meta/milestones.json'),
  });
}
