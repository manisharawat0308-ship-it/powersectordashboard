import { useFilterStore } from '@/store/filterStore';
import { ALL_FOSSIL_SOURCES, ALL_NON_FOSSIL_SOURCES, EnergySource } from '@/types/filters';

export function useSectorFilter() {
  const sectorView = useFilterStore((s) => s.sectorView);

  const getSectorLabel = (): string => {
    if (sectorView === 'fossil') return 'Fossil Energy';
    if (sectorView === 'non_fossil') return 'Non-Fossil Energy';
    return 'Power Sector';
  };

  const getSectorSources = (): EnergySource[] => {
    if (sectorView === 'fossil') return ALL_FOSSIL_SOURCES;
    if (sectorView === 'non_fossil') return ALL_NON_FOSSIL_SOURCES;
    return [...ALL_FOSSIL_SOURCES, ...ALL_NON_FOSSIL_SOURCES];
  };

  const isFossilSource = (source: string): boolean => {
    return (ALL_FOSSIL_SOURCES as string[]).includes(source);
  };

  const isSourceInView = (source: string): boolean => {
    if (sectorView === 'all') return true;
    if (sectorView === 'fossil') return isFossilSource(source);
    return !isFossilSource(source);
  };

  const filterSourceData = <T extends { source?: string; category?: string }>(data: T[]): T[] => {
    if (sectorView === 'all') return data;
    return data.filter((d) => {
      if (d.category) return sectorView === 'fossil' ? d.category === 'fossil' : d.category === 'non_fossil';
      if (d.source) return isSourceInView(d.source);
      return true;
    });
  };

  return {
    sectorView,
    getSectorLabel,
    getSectorSources,
    isSourceInView,
    isFossilSource,
    filterSourceData,
  };
}
