/**
 * Format a value in GW with exactly 2 decimal places.
 */
export function formatGW(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toFixed(2);
}

/**
 * Format a value in MW with no decimal places.
 */
export function formatMW(value: number | null): string {
  if (value === null) return 'N/A';
  return Math.round(value).toLocaleString('en-IN');
}

/**
 * Format a value in Billion Units with 1 decimal place.
 */
export function formatBU(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toFixed(1);
}

/**
 * Format a value in Million Units with no decimal places.
 */
export function formatMU(value: number | null): string {
  if (value === null) return 'N/A';
  return Math.round(value).toLocaleString('en-IN');
}

/**
 * Format a percentage value with 1 decimal place.
 */
export function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toFixed(1);
}

/**
 * Format a source key into a human-readable label.
 */
export function formatSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    coal: 'Coal',
    lignite: 'Lignite',
    gas: 'Natural Gas',
    diesel: 'Diesel',
    solar: 'Solar',
    wind: 'Wind',
    small_hydro: 'Small Hydro',
    large_hydro: 'Large Hydro',
    biomass: 'Biomass',
    nuclear: 'Nuclear',
    all: 'General',
  };
  return labels[source] || source;
}

/**
 * Format ownership type into a human-readable label.
 */
export function formatOwnershipLabel(ownership: string): string {
  const labels: Record<string, string> = {
    central_psu: 'Central PSU',
    state_psu: 'State PSU',
    private: 'Private Sector',
  };
  return labels[ownership] || ownership;
}
