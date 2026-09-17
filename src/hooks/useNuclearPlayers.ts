import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface NuclearUnit {
  unit: string;
  capacityMW: number;
  reactorType: string;
  reactorSupplier: string;
  turbineOEM: string;
  reactorVesselOEM?: string;
  steamGeneratorOEM?: string;
  sodiumPumpsOEM?: string;
  fuelSupplier?: string;
  fuelFabricator?: string;
  commissioningYear: number | null;
  status: 'operating' | 'under_construction' | 'shutdown';
  note?: string;
  expectedYear?: number;
}

export interface NuclearOperatorPlant {
  plantId: string;
  plantName: string;
  state: string;
  totalCapacityMW: number;
  unitConfig: string;
  units: NuclearUnit[];
  generationFY25BU: number;
  cuf: number | null;
  totalUnitCount: number;
  operatingSince: number | null;
}

export interface NuclearOperator {
  rank: number;
  name: string;
  shortName: string;
  ownership: string;
  listed: string;
  totalOperatingMW: number;
  totalUCMW: number;
  headquarters: string;
  source: string;
  notes: string;
  financials: { revenueINRCr: number; netProfitINRCr: number; fy: string } | null;
  plants: NuclearOperatorPlant[];
}

export interface ReactorTechProfile {
  id: string;
  name: string;
  fullName: string;
  description: string;
  fuelType: string;
  coolantModerator: string;
  thermalEfficiency: string;
  designLifeYears: number;
  turbineGenerator: string;
  reactorVesselOEM?: string;
  steamGeneratorOEM?: string;
  reactorSupplier?: string;
  fuelSupplier?: string;
  fuelFabricator?: string;
  note: string;
}

export interface SupplyChainEntity {
  entity: string;
  ownership: string;
  location?: string;
  locations?: string;
  note: string;
}

export interface NuclearPlayersData {
  lastUpdated: string;
  dataAsOf: string;
  dataSource: string;
  note: string;
  reactorTechnology: Record<string, ReactorTechProfile>;
  operators: NuclearOperator[];
  upstreamSupplyChain: {
    uraniumMining: SupplyChainEntity[];
    fuelFabrication: SupplyChainEntity[];
    heavyWater: SupplyChainEntity[];
    reactorComponents: SupplyChainEntity[];
    turbineIsland: SupplyChainEntity[];
  };
}

export function useNuclearPlayers() {
  return useQuery({
    queryKey: ['players', 'nuclear'],
    queryFn: () => fetchJson<NuclearPlayersData>('/data/capacity/nuclear-players.json'),
    staleTime: 10 * 60 * 1000,
  });
}
