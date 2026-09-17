import { EnergyCategory, EnergySource, StateCode } from './filters';
import { Milestone, ProjectionPoint, StateCapacityData, SubSourceCapacity, SupplyGap, YearlyCapacityData } from './index';

export interface SummaryCardProps {
  title: string;
  value: number | null;
  unit: 'GW' | 'MW' | 'BU' | 'MU' | '%';
  percentageShare?: number;
  lastUpdated: string;
  dataSource: string;
  isUnavailable?: boolean;
}

export interface DrillDownPanelProps {
  category: EnergyCategory;
  items: SubSourceCapacity[];
  onBack: () => void;
}

export interface IndiaMapProps {
  data: StateCapacityData[];
  selectedSource?: EnergySource | EnergyCategory;
  onStateClick: (stateCode: StateCode) => void;
  onStateHover: (stateCode: StateCode | null) => void;
}

export interface StateTooltipProps {
  stateCode: StateCode;
  stateName: string;
  installedCapacity: number;
  generation: number;
  topSources: { source: EnergySource; capacity: number }[];
  isUnavailable: boolean;
}

export interface TimelineChartProps {
  data: YearlyCapacityData[];
  selectedSource?: EnergySource;
  milestones: Milestone[];
  missingYears: number[];
}

export interface ProjectionChartProps {
  historicalData: YearlyCapacityData[];
  projectedDemand: ProjectionPoint[];
  plannedCapacity: ProjectionPoint[];
  supplyGaps: SupplyGap[];
}
