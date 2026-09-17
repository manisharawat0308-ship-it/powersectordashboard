import { EnergySource } from '@/types/filters';
import { StateCapacityData } from '@/types/index';

/**
 * Get top N energy sources by capacity for a state.
 */
export function getTopNSources(
  stateData: StateCapacityData,
  n: number = 3
): { source: EnergySource; capacityMW: number }[] {
  return [...stateData.topSources]
    .sort((a, b) => b.capacityMW - a.capacityMW)
    .slice(0, n);
}

/**
 * Get choropleth color based on capacity value within a range.
 * Returns a shade from light green to dark green.
 */
export function getChoroplethColor(
  capacity: number,
  minCapacity: number,
  maxCapacity: number
): string {
  if (capacity <= 0) return '#E0E0E0'; // Gray for unavailable
  const range = maxCapacity - minCapacity;
  if (range === 0) return '#4CAF50';
  const normalized = Math.min(1, Math.max(0, (capacity - minCapacity) / range));
  // Light (#C8E6C9) to Dark (#1B5E20)
  const r = Math.round(200 - normalized * 173);
  const g = Math.round(230 - normalized * 136);
  const b = Math.round(201 - normalized * 169);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get capacity range from state data for choropleth scaling.
 */
export function getCapacityRange(states: StateCapacityData[]): {
  min: number;
  max: number;
} {
  const capacities = states
    .filter((s) => !s.isUnavailable)
    .map((s) => s.installedCapacityGW);
  return {
    min: Math.min(...capacities),
    max: Math.max(...capacities),
  };
}
