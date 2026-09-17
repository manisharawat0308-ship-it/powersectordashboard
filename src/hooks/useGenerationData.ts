import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

interface NationalGenerationData {
  lastUpdated: string;
  dataSource: string;
  defaultPeriod: { year: number; type: string };
  totalGenerationBU: number;
  bySource: { source: string; category: string; generationBU: number; percentageOfTotal: number }[];
  byCategory: { category: string; generationBU: number; percentageOfTotal: number }[];
}

interface PLFCUFData {
  lastUpdated: string;
  dataSource: string;
  period: { year: number; type: string };
  plf: Record<string, number>;
  cuf: Record<string, number>;
}

export function useGenerationData() {
  return useQuery({
    queryKey: ['generation', 'national'],
    queryFn: () => fetchJson<NationalGenerationData>('/data/generation/national.json'),
  });
}

export function usePLFCUFData() {
  return useQuery({
    queryKey: ['generation', 'plf-cuf'],
    queryFn: () => fetchJson<PLFCUFData>('/data/generation/plf-cuf.json'),
  });
}
