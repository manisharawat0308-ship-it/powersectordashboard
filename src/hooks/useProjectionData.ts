import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

interface DemandData {
  lastUpdated: string;
  dataSource: string;
  lastHistoricalYear: number;
  projections: { year: number; demandGW: number; isProjected: boolean }[];
}

interface PlannedAdditionsData {
  lastUpdated: string;
  dataSource: string;
  planned: { year: number; source: string; additionGW: number; cumulativeCapacityGW: number }[];
  totalPlannedCapacity: { year: number; supplyGW: number }[];
}

export function useDemandProjections() {
  return useQuery({
    queryKey: ['projections', 'demand'],
    queryFn: () => fetchJson<DemandData>('/data/projections/demand.json'),
  });
}

export function usePlannedAdditions() {
  return useQuery({
    queryKey: ['projections', 'planned-additions'],
    queryFn: () => fetchJson<PlannedAdditionsData>('/data/projections/planned-additions.json'),
  });
}
