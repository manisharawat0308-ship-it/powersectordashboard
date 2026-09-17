import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface UnitConfig {
  config: string;
  totalMW: number;
  technology: string;
  turbineOEM: string | null;
  boilerOEM?: string | null;
  commissioningPeriod?: string;
  note?: string;
}

export interface ThermalPlant {
  plantName: string;
  state: string;
  fuel: 'coal' | 'gas' | 'hydro';
  totalCapacityMW: number;
  unitConfig: string;
  units: UnitConfig[];
  plf?: number;
  cuf?: number;
  status: 'operating' | 'under_construction' | 'shutdown';
  note?: string;
  river?: string;
  type?: 'run_of_river' | 'storage' | 'pumped_storage';
}

export interface ThermalOperator {
  rank: number;
  name: string;
  shortName: string;
  ownership: 'central_psu' | 'state_psu' | 'private';
  listed: string;
  totalThermalMW: number;
  totalCapacityMW: number;
  headquarters: string;
  source: string;
  notes: string;
  plants: ThermalPlant[];
}

export interface HydroOperator {
  rank: number;
  name: string;
  shortName: string;
  ownership: 'central_psu' | 'state_psu' | 'private';
  listed: string;
  totalHydroMW: number;
  headquarters: string;
  source: string;
  notes: string;
  plants: ThermalPlant[];
}

export interface EquipmentOEM {
  id: string;
  name: string;
  country: string;
  headquarters: string;
  note: string;
}

export interface ThermalPlayersData {
  lastUpdated: string;
  dataAsOf: string;
  dataSource: string;
  note: string;
  equipmentManufacturers: {
    turbineGeneratorOEMs: EquipmentOEM[];
    boilerOEMs: EquipmentOEM[];
  };
  thermalOperators: ThermalOperator[];
  hydroOperators: HydroOperator[];
}

export function useThermalPlayers() {
  return useQuery({
    queryKey: ['players', 'thermal'],
    queryFn: () => fetchJson<ThermalPlayersData>('/data/capacity/thermal-players.json'),
    staleTime: 10 * 60 * 1000,
  });
}
