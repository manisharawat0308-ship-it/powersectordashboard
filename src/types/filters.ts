export type FossilSource = 'coal' | 'lignite' | 'gas' | 'diesel';
export type NonFossilSource = 'solar' | 'wind' | 'small_hydro' | 'large_hydro' | 'biomass' | 'nuclear';
export type EnergySource = FossilSource | NonFossilSource;
export type EnergyCategory = 'fossil' | 'non_fossil';

/**
 * PowerSourceSlice is the single-select "Power Source" slicer.
 * 'all' = no filter (existing dashboard behaviour).
 * 'hydro' = large_hydro + small_hydro combined.
 * 'other' = lignite + diesel + biomass combined.
 * All other values map 1-to-1 with EnergySource.
 */
export type PowerSourceSlice =
  | 'all'
  | 'coal'
  | 'gas'
  | 'hydro'
  | 'solar'
  | 'wind'
  | 'nuclear'
  | 'other';

/** Returns the EnergySource[] that a PowerSourceSlice maps to. */
export function powerSliceToSources(slice: PowerSourceSlice): EnergySource[] | null {
  switch (slice) {
    case 'all':    return null; // no source filter
    case 'coal':   return ['coal'];
    case 'gas':    return ['gas'];
    case 'hydro':  return ['large_hydro', 'small_hydro'];
    case 'solar':  return ['solar'];
    case 'wind':   return ['wind'];
    case 'nuclear':return ['nuclear'];
    case 'other':  return ['lignite', 'diesel', 'biomass'];
  }
}

export const ALL_POWER_SOURCE_SLICES: PowerSourceSlice[] = [
  'all', 'coal', 'gas', 'hydro', 'solar', 'wind', 'nuclear', 'other',
];

export type OwnershipType = 'central_psu' | 'state_psu' | 'private';

export type StateCode =
  | 'AP' | 'AR' | 'AS' | 'BR' | 'CG' | 'GA' | 'GJ' | 'HR'
  | 'HP' | 'JH' | 'KA' | 'KL' | 'MP' | 'MH' | 'MN' | 'ML'
  | 'MZ' | 'NL' | 'OD' | 'PB' | 'RJ' | 'SK' | 'TN' | 'TS'
  | 'TR' | 'UK' | 'UP' | 'WB'
  | 'AN' | 'CH' | 'DN' | 'DD' | 'DL' | 'JK' | 'LA' | 'LD' | 'PY';

export interface TimePeriodFilter {
  startYear: number;
  endYear: number;
  granularity: 'annual' | 'quarterly' | 'monthly';
  quarter?: 1 | 2 | 3 | 4;
  month?: number;
}

export interface FilterState {
  timePeriod: TimePeriodFilter;
  energySources: EnergySource[];
  ownershipTypes: OwnershipType[];
  states: StateCode[];
}

export const ALL_FOSSIL_SOURCES: FossilSource[] = ['coal', 'lignite', 'gas', 'diesel'];
export const ALL_NON_FOSSIL_SOURCES: NonFossilSource[] = ['solar', 'wind', 'small_hydro', 'large_hydro', 'biomass', 'nuclear'];
export const ALL_ENERGY_SOURCES: EnergySource[] = [...ALL_FOSSIL_SOURCES, ...ALL_NON_FOSSIL_SOURCES];
export const ALL_OWNERSHIP_TYPES: OwnershipType[] = ['central_psu', 'state_psu', 'private'];
