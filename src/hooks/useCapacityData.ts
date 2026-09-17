import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

interface NationalCapacityData {
  lastUpdated: string;
  dataAsOf?: string;
  note?: string;
  dataSource: string;
  totalCapacityGW: number;
  byCategory: { category: string; capacityGW: number; percentageShare: number }[];
  bySource: { source: string; capacityMW: number; category: string }[];
  byOwnership: { ownership: string; capacityGW: number; percentage: number }[];
}

export function useCapacityData() {
  return useQuery({
    queryKey: ['capacity', 'national'],
    queryFn: () => fetchJson<NationalCapacityData>('/data/capacity/national.json'),
  });
}

export function useCapacityByState() {
  return useQuery({
    queryKey: ['capacity', 'by-state'],
    queryFn: () => fetchJson<any[]>('/data/capacity/by-state.json'),
  });
}

export function useHistoricalCapacity() {
  return useQuery({
    queryKey: ['capacity', 'historical'],
    queryFn: () => fetchJson<any[]>('/data/capacity/historical.json'),
  });
}
