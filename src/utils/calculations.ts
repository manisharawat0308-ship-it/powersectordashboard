/**
 * Compute percentage shares from an array of values.
 * Returns an array of percentages that sum to 100% (±0.1% tolerance).
 */
export function computePercentageShares(values: number[]): number[] {
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total === 0) return values.map(() => 0);
  return values.map((v) => Math.round((v / total) * 1000) / 10);
}

/**
 * Compute Plant Load Factor (PLF) for thermal sources.
 * PLF = (Actual Generation in MU) / (Capacity in MW × Hours) × 100
 */
export function computePLF(generationMU: number, capacityMW: number, hours: number): number {
  if (capacityMW <= 0 || hours <= 0) return 0;
  const plf = (generationMU * 1000) / (capacityMW * hours) * 100;
  return Math.min(100, Math.max(0, Math.round(plf * 10) / 10));
}

/**
 * Compute Capacity Utilization Factor (CUF) for renewable sources.
 * CUF = (Actual Generation in MU) / (Capacity in MW × Hours) × 100
 */
export function computeCUF(generationMU: number, capacityMW: number, hours: number): number {
  if (capacityMW <= 0 || hours <= 0) return 0;
  const cuf = (generationMU * 1000) / (capacityMW * hours) * 100;
  return Math.min(100, Math.max(0, Math.round(cuf * 10) / 10));
}

/**
 * Compute Year-over-Year growth.
 * Returns { percent, absoluteGW }.
 */
export function computeYoYGrowth(
  currentGW: number,
  previousGW: number
): { percent: number; absoluteGW: number } {
  if (previousGW <= 0) return { percent: 0, absoluteGW: currentGW };
  const absoluteGW = Math.round((currentGW - previousGW) * 100) / 100;
  const percent = Math.round(((currentGW - previousGW) / previousGW) * 1000) / 10;
  return { percent, absoluteGW };
}

/**
 * Compute supply gap for a given year.
 * Returns positive value if demand > supply (deficit), 0 otherwise.
 */
export function computeSupplyGap(demandGW: number, supplyGW: number): number {
  if (demandGW > supplyGW) {
    return Math.round((demandGW - supplyGW) * 100) / 100;
  }
  return 0;
}

/**
 * Check if a data point should be classified as projected.
 */
export function isProjectedYear(year: number, lastHistoricalYear: number): boolean {
  return year > lastHistoricalYear;
}
