import { EnergySource, FossilSource, NonFossilSource } from '@/types/filters';

interface SourceColorConfig {
  color: string;
  hue: number;
}

// ICICI-themed color palette
const FOSSIL_COLORS: Record<FossilSource, SourceColorConfig> = {
  coal: { color: '#B02A30', hue: 357 },
  lignite: { color: '#D4464C', hue: 357 },
  gas: { color: '#F99D27', hue: 35 },
  diesel: { color: '#FBBD6A', hue: 35 },
};

const NON_FOSSIL_COLORS: Record<NonFossilSource, SourceColorConfig> = {
  solar: { color: '#F99D27', hue: 35 },
  wind: { color: '#005B75', hue: 192 },
  small_hydro: { color: '#007A9E', hue: 193 },
  large_hydro: { color: '#003D50', hue: 195 },
  biomass: { color: '#4CAF50', hue: 122 },
  nuclear: { color: '#7B1FA2', hue: 282 },
};

const FOSSIL_SOURCES: FossilSource[] = ['coal', 'lignite', 'gas', 'diesel'];

// Fallback for unknown/aggregate sources (e.g. "all") so callers never crash on
// a source key that isn't in the color maps.
const FALLBACK_COLOR = '#6B7280'; // gray-500
const FALLBACK_HUE = 220;

/**
 * Get the color for an energy source.
 * Returns a neutral fallback for unknown sources instead of throwing.
 */
export function getSourceColor(source: EnergySource): string {
  if (FOSSIL_SOURCES.includes(source as FossilSource)) {
    return FOSSIL_COLORS[source as FossilSource]?.color ?? FALLBACK_COLOR;
  }
  return NON_FOSSIL_COLORS[source as NonFossilSource]?.color ?? FALLBACK_COLOR;
}

/**
 * Get the hue for an energy source.
 * Returns a neutral fallback for unknown sources instead of throwing.
 */
export function getSourceHue(source: EnergySource): number {
  if (FOSSIL_SOURCES.includes(source as FossilSource)) {
    return FOSSIL_COLORS[source as FossilSource]?.hue ?? FALLBACK_HUE;
  }
  return NON_FOSSIL_COLORS[source as NonFossilSource]?.hue ?? FALLBACK_HUE;
}

/**
 * Get category color.
 */
export function getCategoryColor(category: 'fossil' | 'non_fossil'): string {
  return category === 'fossil' ? '#B02A30' : '#005B75';
}

/**
 * Get ownership color — ICICI themed.
 */
export function getOwnershipColor(ownership: string): string {
  const colors: Record<string, string> = {
    central_psu: '#005B75',
    state_psu: '#B02A30',
    private: '#F99D27',
  };
  return colors[ownership] || '#757575';
}

/**
 * ICICI-themed chart colors array for various visualizations.
 */
export const CHART_COLORS = [
  '#B02A30', '#005B75', '#F99D27', '#D4464C', '#007A9E',
  '#FBBD6A', '#8B1A1F', '#003D50', '#4CAF50', '#7B1FA2',
];
