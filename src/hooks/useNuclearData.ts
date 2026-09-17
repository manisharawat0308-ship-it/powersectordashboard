import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

export interface NuclearUnit {
  unit: string;
  technology: string;
  capacityMW: number;
  commissioningYear: number | null;
  status: 'operating' | 'under_construction' | 'shutdown';
}

export interface NuclearPlant {
  plantId: string;
  plantName: string;
  shortName: string;
  state: string;
  stateName: string;
  location: string;
  coordinates: [number, number];
  operator: string;
  technology: string;
  status: 'operating' | 'under_construction' | 'shutdown';
  units: NuclearUnit[];
  totalCapacityMW: number;
  operatingSince: number | null;
  generationFY2025BU: number;
  cuf: number | null;
  note?: string;
}

export interface NuclearStateCapacity {
  stateCode: string;
  stateName: string;
  operatingMW: number;
  underConstructionMW: number;
  approvedMW: number;
  plantCount: number;
  unitCount: number;
}

export interface NuclearPlantsData {
  lastUpdated: string;
  dataAsOf: string;
  dataSource: string;
  note: string;
  totalOperatingMW: number;
  totalUnderConstructionMW: number;
  totalApprovedMW: number;
  totalPlannedMW: number;
  generationFY2025BU: number;
  cuf: number;
  plants: NuclearPlant[];
  stateCapacity: NuclearStateCapacity[];
}

export interface PipelineProject {
  name: string;
  stateName: string;
  capacityMW: number;
  technology: string;
  expectedYear: number | null;
}

export interface PipelineStage {
  stage: 'operating' | 'under_construction' | 'approved' | 'planned';
  label: string;
  totalMW: number;
  projectCount: number;
  unitCount: number;
  projects: PipelineProject[];
  note?: string;
}

export interface NuclearHistoricalPoint {
  year: number;
  capacityMW: number;
}

export interface NuclearHistoricalGeneration {
  year: number;
  generationBU: number;
  cuf: number;
}

export interface NuclearPipelineData {
  lastUpdated: string;
  dataAsOf: string;
  dataSource: string;
  note: string;
  pipeline: PipelineStage[];
  historicalCapacity: NuclearHistoricalPoint[];
  historicalGeneration: NuclearHistoricalGeneration[];
}

export function useNuclearPlants() {
  return useQuery({
    queryKey: ['nuclear', 'plants'],
    queryFn: () => fetchJson<NuclearPlantsData>('/data/capacity/nuclear-plants.json'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNuclearPipeline() {
  return useQuery({
    queryKey: ['nuclear', 'pipeline'],
    queryFn: () => fetchJson<NuclearPipelineData>('/data/capacity/nuclear-pipeline.json'),
    staleTime: 5 * 60 * 1000,
  });
}
