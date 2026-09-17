import { useMemo } from 'react';
import { useCapacityData } from '@/hooks/useCapacityData';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { useGeographyData } from '@/hooks/useGeographyData';
import { useNuclearPlants, useNuclearPipeline } from '@/hooks/useNuclearData';
import { useFilterStore } from '@/store/filterStore';
import { powerSliceToSources } from '@/types/filters';
import {
  computeOperationalRisk,
  computeSupplyRisk,
  computeProjectRisk,
  computeGeographicRisk,
  computeMarketRisk,
  computeClimateRisk,
  computeOverallRiskScore,
  generateRiskAlerts,
  computeTopRiskDrivers,
  buildTechRiskHeatmap,
  RiskCategoryScore,
} from '@/utils/riskCalculations';

const RISK_WEIGHTS: Record<string, number> = {
  operational: 0.25,
  supply: 0.25,
  project: 0.15,
  geographic: 0.15,
  market: 0.10,
  climate: 0.10,
};

export function useRiskData() {
  const powerSource = useFilterStore((s) => s.powerSource);

  const { data: capData } = useCapacityData();
  const { data: genData } = useGenerationData();
  const { data: plfData } = usePLFCUFData();
  const { data: geoData } = useGeographyData();
  const { data: nuclearPlants } = useNuclearPlants();
  const { data: nuclearPipeline } = useNuclearPipeline();

  return useMemo(() => {
    if (!capData || !genData || !plfData) {
      return {
        categories: [],
        overall: { score: null, label: 'Unavailable' as const, color: '#9E9E9E', dataAvailable: false },
        alerts: [],
        topDrivers: [],
        heatmapCells: [],
        isLoading: true,
      };
    }

    // Determine which sources are in scope for this power source slice
    const scopeSources = powerSliceToSources(powerSource);
    const filteredBySource = scopeSources
      ? capData.bySource.filter((s) => scopeSources.includes(s.source as any))
      : capData.bySource;

    const filteredTotalMW = filteredBySource.reduce((s, r) => s + r.capacityMW, 0);

    // Filtered state capacities (approximate — use full portfolio when source = all)
    const stateCapacities = (geoData ?? []).map((s) => {
      if (!scopeSources) {
        return { stateCode: s.stateCode, stateName: s.stateName, capacityGW: s.installedCapacityGW };
      }
      const scopeCapMW = scopeSources.reduce((sum, src) => sum + (s.bySource[src] ?? 0), 0);
      return { stateCode: s.stateCode, stateName: s.stateName, capacityGW: scopeCapMW / 1000 };
    }).filter((s) => s.capacityGW > 0);

    // PLF / CUF — only include sources in scope
    const plfScope = scopeSources
      ? Object.fromEntries(Object.entries(plfData.plf).filter(([k]) => scopeSources.includes(k as any)))
      : plfData.plf;
    const cufScope = scopeSources
      ? Object.fromEntries(Object.entries(plfData.cuf).filter(([k]) => scopeSources.includes(k as any)))
      : plfData.cuf;

    // Nuclear pipeline numbers
    const nucUCMW = nuclearPlants?.totalUnderConstructionMW ?? 7000;
    const nucOperatingMW = nuclearPlants?.totalOperatingMW ?? 8180;

    // Compute categories
    const operational = computeOperationalRisk(plfScope, cufScope, powerSource);
    const supply = computeSupplyRisk(filteredBySource, filteredTotalMW);
    const project = computeProjectRisk(
      powerSource === 'nuclear' ? nucUCMW : (nuclearPipeline?.pipeline.find(p => p.stage === 'under_construction')?.totalMW ?? nucUCMW),
      powerSource === 'nuclear' ? (nuclearPlants?.totalApprovedMW ?? 26000) : 0,
      powerSource === 'nuclear' ? nucOperatingMW : filteredTotalMW,
    );
    const geographic = computeGeographicRisk(stateCapacities);
    const market = computeMarketRisk();
    const climate = computeClimateRisk(stateCapacities);

    const categories: RiskCategoryScore[] = [
      operational, supply, project, geographic, market, climate,
    ];

    const overall = computeOverallRiskScore(categories, RISK_WEIGHTS);
    const alerts = generateRiskAlerts(categories, filteredBySource, filteredTotalMW, nucUCMW, nucOperatingMW);
    const topDrivers = computeTopRiskDrivers(categories);

    // Heatmap technologies
    const techList = filteredBySource
      .sort((a, b) => b.capacityMW - a.capacityMW)
      .slice(0, 8)
      .map((s) => ({
        source: s.source,
        label: s.source.charAt(0).toUpperCase() + s.source.slice(1).replace('_', ' '),
      }));

    const heatmapCells = buildTechRiskHeatmap(
      categories,
      techList,
      plfData.plf,
      plfData.cuf,
      capData.bySource,
      capData.bySource.reduce((s, r) => s + r.capacityMW, 0),
    );

    return { categories, overall, alerts, topDrivers, heatmapCells, isLoading: false };
  }, [capData, genData, plfData, geoData, nuclearPlants, nuclearPipeline, powerSource]);
}
