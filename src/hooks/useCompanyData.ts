import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface CompanyInfo {
  name: string;
  capacityMW: number;
  generationBU: number;
  sourceBreakdown: Record<string, number>;
}

interface CompanyData {
  central_psu: CompanyInfo[];
  state_psu: CompanyInfo[];
  private: CompanyInfo[];
}

export function useCompanyData() {
  return useQuery({
    queryKey: ['capacity', 'companies'],
    queryFn: () => fetchJson<CompanyData>('/data/capacity/companies.json'),
  });
}
