import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface SourceBreakdown {
  capacityMW: number;
  percentage: number;
}

export interface OwnershipCategory {
  totalCapacityGW: number;
  fossil: { capacityGW: number; percentage: number };
  non_fossil: { capacityGW: number; percentage: number };
  bySource: Record<string, SourceBreakdown>;
}

export interface OwnershipDetailData {
  lastUpdated: string;
  dataSource: string;
  ownershipBySource: {
    central_psu: OwnershipCategory;
    state_psu: OwnershipCategory;
    private: OwnershipCategory;
  };
}

export function useOwnershipDetail() {
  return useQuery({
    queryKey: ['capacity', 'ownership-detail'],
    queryFn: () => fetchJson<OwnershipDetailData>('/data/capacity/ownership-detail.json'),
  });
}
