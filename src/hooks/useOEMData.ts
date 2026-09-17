import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface TurbineModel {
  model: string;
  type: string;
  capacity: string;
  technology: string;
  speed: string;
  steamConditions: string;
  efficiency: string;
  licenseFrom: string;
  unitsInstalled: number;
  totalFleetMW: number;
  typicalPlants: string;
  yearRange: string;
  knownIssues: string[];
  claimsHistory: string;
  insuranceNotes: string;
}

export interface OEMProfile {
  id: string;
  name: string;
  shortName: string;
  country: string;
  headquarters: string;
  founded: number;
  listed: string;
  ownership: string;
  website: string;
  overview: string;
  indianFleet: {
    totalInstalledMW: number;
    thermalUnitCount: number;
    hydroUnitCount: number;
    nuclearUnitCount: number;
    marketSharePct: number;
  };
  turbineModels: TurbineModel[];
  keyStrengths: string[];
  keyRisks: string[];
}

export interface OEMData {
  lastUpdated: string;
  dataSource: string;
  note: string;
  oems: OEMProfile[];
}

export function useOEMData() {
  return useQuery({
    queryKey: ['oem', 'details'],
    queryFn: () => fetchJson<OEMData>('/data/capacity/oem-details.json'),
    staleTime: 30 * 60 * 1000,
  });
}
