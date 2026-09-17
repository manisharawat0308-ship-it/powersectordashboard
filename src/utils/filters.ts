import { EnergySource, OwnershipType, StateCode, TimePeriodFilter } from '@/types/filters';

interface HasTimestamp {
  year: number;
  month?: number;
}

interface HasSource {
  source: EnergySource;
}

interface HasOwnership {
  ownership: OwnershipType;
}

interface HasState {
  stateCode: StateCode;
}

/**
 * Filter records by time period.
 */
export function filterByTimePeriod<T extends HasTimestamp>(
  records: T[],
  period: TimePeriodFilter
): T[] {
  return records.filter((record) => {
    if (record.year < period.startYear || record.year > period.endYear) return false;

    if (period.granularity === 'quarterly' && period.quarter && record.month) {
      const recordQuarter = Math.ceil(record.month / 3);
      return recordQuarter === period.quarter;
    }

    if (period.granularity === 'monthly' && period.month && record.month) {
      return record.month === period.month;
    }

    return true;
  });
}

/**
 * Filter records by energy source.
 */
export function filterBySource<T extends HasSource>(
  records: T[],
  sources: EnergySource[]
): T[] {
  if (sources.length === 0) return records;
  return records.filter((record) => sources.includes(record.source));
}

/**
 * Filter records by ownership type.
 */
export function filterByOwnership<T extends HasOwnership>(
  records: T[],
  types: OwnershipType[]
): T[] {
  if (types.length === 0) return records;
  return records.filter((record) => types.includes(record.ownership));
}

/**
 * Filter records by state code.
 */
export function filterByState<T extends HasState>(
  records: T[],
  codes: StateCode[]
): T[] {
  if (codes.length === 0) return records;
  return records.filter((record) => codes.includes(record.stateCode));
}
