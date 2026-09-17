import { EnergyCategory, EnergySource, OwnershipType, StateCode } from './filters';

// === Capacity Data Models ===
export interface CapacityRecord {
  year: number;
  month: number;
  stateCode: StateCode;
  source: EnergySource;
  ownership: OwnershipType;
  capacityMW: number;
  lastUpdated: string;
}

export interface CategoryCapacity {
  category: EnergyCategory;
  capacityGW: number;
  percentageShare: number;
}

export interface SubSourceCapacity {
  source: EnergySource;
  category: EnergyCategory;
  capacityMW: number;
  percentageOfCategory: number;
  percentageOfTotal: number;
  isUnavailable: boolean;
}

// === Generation Data Models ===
export interface GenerationRecord {
  year: number;
  month: number;
  stateCode: StateCode;
  source: EnergySource;
  ownership: OwnershipType;
  generationMU: number;
  plfPercent?: number;
  cufPercent?: number;
  lastUpdated: string;
}

export interface SourceGeneration {
  source: EnergySource;
  category: EnergyCategory;
  generationBU: number;
  percentageOfTotal: number;
}

export interface OwnershipBreakdown {
  ownership: OwnershipType;
  valueGW?: number;
  valueBU?: number;
  percentage: number;
  isUnavailable: boolean;
}

// === Timeline Data Models ===
export interface YearlyCapacityData {
  year: number;
  totalCapacityGW: number;
  byCategory: CategoryCapacity[];
  bySource: Record<string, number>;
  yoyGrowthPercent: number | null;
  yoyGrowthAbsoluteGW: number | null;
}

export interface Milestone {
  year: number;
  title: string;
  description: string;
}

// === Projection Data Models ===
export interface ProjectionPoint {
  year: number;
  demandGW: number;
  isProjected: boolean;
}

export interface PlannedAddition {
  year: number;
  source: EnergySource;
  additionGW: number;
  cumulativeCapacityGW: number;
}

export interface SupplyGap {
  year: number;
  demandGW: number;
  supplyGW: number;
  gapGW: number;
}

// === Geography Data Models ===
export interface StateCapacityData {
  stateCode: StateCode;
  stateName: string;
  installedCapacityGW: number;
  generationBU: number;
  topSources: { source: EnergySource; capacityMW: number }[];
  bySource: Record<string, number>;
  byOwnership: Record<string, number>;
  isUnavailable: boolean;
}

// === Breadcrumb ===
export interface BreadcrumbItem {
  label: string;
  path: string;
}
