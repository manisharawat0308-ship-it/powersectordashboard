import { create } from 'zustand';
import {
  FilterState,
  TimePeriodFilter,
  EnergySource,
  OwnershipType,
  StateCode,
  PowerSourceSlice,
  ALL_ENERGY_SOURCES,
  ALL_OWNERSHIP_TYPES,
} from '@/types/filters';
import { BreadcrumbItem } from '@/types/index';

const currentYear = new Date().getFullYear();

const DEFAULT_TIME_PERIOD: TimePeriodFilter = {
  startYear: currentYear - 1,
  endYear: currentYear - 1,
  granularity: 'annual',
};

const DEFAULT_FILTER_STATE: FilterState = {
  timePeriod: DEFAULT_TIME_PERIOD,
  energySources: [...ALL_ENERGY_SOURCES],
  ownershipTypes: [...ALL_OWNERSHIP_TYPES],
  states: [],
};

interface FilterStore {
  filters: FilterState;
  activeSection: string;
  sectorView: 'all' | 'fossil' | 'non_fossil';
  /** Single-select power source slicer. 'all' = no filter (existing behaviour). */
  powerSource: PowerSourceSlice;
  breadcrumbs: BreadcrumbItem[];

  setTimePeriod: (period: TimePeriodFilter) => void;
  toggleSource: (source: EnergySource) => void;
  toggleOwnership: (type: OwnershipType) => void;
  toggleState: (code: StateCode) => void;
  resetFilters: () => void;
  setActiveSection: (section: string) => void;
  setSectorView: (view: 'all' | 'fossil' | 'non_fossil') => void;
  setPowerSource: (source: PowerSourceSlice) => void;
  pushBreadcrumb: (item: BreadcrumbItem) => void;
  popBreadcrumb: () => void;
  resetBreadcrumbs: () => void;

  activeFilterCount: () => number;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: { ...DEFAULT_FILTER_STATE },
  activeSection: 'industry-overview',
  sectorView: 'all',
  powerSource: 'all',
  breadcrumbs: [{ label: 'Dashboard', path: '/' }],

  setTimePeriod: (period) =>
    set((state) => ({
      filters: { ...state.filters, timePeriod: period },
    })),

  toggleSource: (source) =>
    set((state) => {
      const current = state.filters.energySources;
      const updated = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      return { filters: { ...state.filters, energySources: updated } };
    }),

  toggleOwnership: (type) =>
    set((state) => {
      const current = state.filters.ownershipTypes;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { filters: { ...state.filters, ownershipTypes: updated } };
    }),

  toggleState: (code) =>
    set((state) => {
      const current = state.filters.states;
      const updated = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      return { filters: { ...state.filters, states: updated } };
    }),

  resetFilters: () =>
    set({ filters: { ...DEFAULT_FILTER_STATE }, powerSource: 'all' }),

  setActiveSection: (section) => set({ activeSection: section }),

  setSectorView: (view) => set({ sectorView: view }),

  setPowerSource: (source) => set({ powerSource: source }),

  pushBreadcrumb: (item) =>
    set((state) => {
      const crumbs = state.breadcrumbs;
      if (crumbs.length >= 4) return state;
      return { breadcrumbs: [...crumbs, item] };
    }),

  popBreadcrumb: () =>
    set((state) => {
      if (state.breadcrumbs.length <= 1) return state;
      return { breadcrumbs: state.breadcrumbs.slice(0, -1) };
    }),

  resetBreadcrumbs: () =>
    set({ breadcrumbs: [{ label: 'Dashboard', path: '/' }] }),

  activeFilterCount: () => {
    const { filters, powerSource } = get();
    let count = 0;
    if (filters.energySources.length < ALL_ENERGY_SOURCES.length) count++;
    if (filters.ownershipTypes.length < ALL_OWNERSHIP_TYPES.length) count++;
    if (filters.states.length > 0) count++;
    if (powerSource !== 'all') count++;
    return count;
  },
}));

export { DEFAULT_FILTER_STATE };
