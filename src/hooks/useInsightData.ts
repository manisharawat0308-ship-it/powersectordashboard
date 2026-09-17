import { useMemo } from 'react';
import { useCapacityData, useHistoricalCapacity } from '@/hooks/useCapacityData';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { useGeographyData } from '@/hooks/useGeographyData';
import { useNuclearPipeline } from '@/hooks/useNuclearData';
import { useFilterStore } from '@/store/filterStore';
import { powerSliceToSources } from '@/types/filters';
import {
  Insight,
  generateInsights,
  plfInsight,
  geographicConcentrationInsight,
  DashboardSnapshot,
} from '@/utils/insights';

export function useInsightData(): { insights: Insight[]; isLoading: boolean } {
  const powerSource = useFilterStore((s) => s.powerSource);
  const { data: capData, isLoading: capLoading } = useCapacityData();
  const { data: genData, isLoading: genLoading } = useGenerationData();
  const { data: plfData } = usePLFCUFData();
  const { data: historicalData } = useHistoricalCapacity();
  const { data: geoData } = useGeographyData();
  const { data: pipelineData } = useNuclearPipeline();

  return useMemo(() => {
    if (capLoading || genLoading || !capData || !genData) {
      return { insights: [], isLoading: true };
    }

    const scopeSources = powerSliceToSources(powerSource);

    // Build current snapshot (filtered by power source if needed)
    const filteredCapSources = scopeSources
      ? capData.bySource.filter((s) => scopeSources.includes(s.source as any))
      : capData.bySource;
    const filteredGenSources = scopeSources
      ? genData.bySource.filter((s) => scopeSources.includes(s.source as any))
      : genData.bySource;

    const totalCapGW = filteredCapSources.reduce((s, r) => s + r.capacityMW, 0) / 1000;
    const totalGenBU = filteredGenSources.reduce((s, r) => s + r.generationBU, 0);

    const nonFossilCapGW = capData.bySource
      .filter((s) => s.category === 'non_fossil' && (!scopeSources || scopeSources.includes(s.source as any)))
      .reduce((s, r) => s + r.capacityMW, 0) / 1000;

    const nuclearGenBU = genData.bySource.find((s) => s.source === 'nuclear')?.generationBU ?? 0;
    const coalCapGW = (capData.bySource.find((s) => s.source === 'coal')?.capacityMW ?? 0) / 1000;
    const coalGenBU = genData.bySource.find((s) => s.source === 'coal')?.generationBU ?? 0;
    const nuclearCuf = plfData?.cuf?.nuclear;

    const current: DashboardSnapshot = {
      totalCapacityGW: totalCapGW,
      totalGenerationBU: totalGenBU,
      nonFossilCapacityGW: nonFossilCapGW,
      nuclearGenerationBU: nuclearGenBU,
      coalCapacityGW: coalCapGW,
      coalGenerationBU: coalGenBU,
      nuclearCuf,
    };

    // Previous year from historical data
    let previous: Partial<DashboardSnapshot> | null = null;
    if (historicalData && historicalData.length >= 2) {
      const sorted = [...historicalData].sort((a, b) => b.year - a.year);
      const prev = sorted[1]; // second most recent
      previous = {
        totalCapacityGW: prev.totalCapacityGW,
        nonFossilCapacityGW: prev.byCategory?.find((c: any) => c.category === 'non_fossil')?.capacityGW ?? 0,
        // generation YoY not available from historical capacity data alone — mark as unavailable
        totalGenerationBU: 0,
        nuclearGenerationBU: 0,
      };
    }

    // Top state for geographic insight
    const topState = geoData
      ? [...geoData].sort((a, b) => b.installedCapacityGW - a.installedCapacityGW)[0]
      : null;

    // Nuclear UC
    const nucUCMW = pipelineData?.pipeline.find((p) => p.stage === 'under_construction')?.totalMW ?? 7000;

    // Core insights
    const insights = generateInsights(
      current,
      previous,
      topState?.stateName,
      topState?.installedCapacityGW,
      nucUCMW,
    );

    // PLF-specific insights (if PLF data available)
    if (plfData) {
      const relevantPlf = scopeSources
        ? Object.entries(plfData.plf).filter(([k]) => scopeSources.includes(k as any))
        : Object.entries(plfData.plf);
      const relevantCuf = scopeSources
        ? Object.entries(plfData.cuf).filter(([k]) => scopeSources.includes(k as any))
        : Object.entries(plfData.cuf);

      const benchmarks: Record<string, number> = {
        coal: 65, lignite: 60, gas: 30, nuclear: 80,
        solar: 19, wind: 22, large_hydro: 40, small_hydro: 30, biomass: 45,
      };

      // Find biggest PLF underperformer
      let worstGap = 0;
      let worstSource = '';
      let worstActual = 0;
      [...relevantPlf, ...relevantCuf].forEach(([src, val]) => {
        const bench = benchmarks[src] ?? 50;
        const gap = bench - val;
        if (gap > worstGap) { worstGap = gap; worstSource = src; worstActual = val; }
      });

      if (worstSource && worstGap > 2) {
        const isRE = ['solar', 'wind', 'large_hydro', 'small_hydro', 'biomass', 'nuclear'].includes(worstSource);
        const ins = plfInsight(worstSource, worstActual, benchmarks[worstSource] ?? 50, isRE);
        if (ins) {
          // Rewrite as a contextual statement
          ins.text = `${worstSource.charAt(0).toUpperCase() + worstSource.slice(1).replace('_', ' ')} has the largest ${isRE ? 'CUF' : 'PLF'} gap vs benchmark: actual ${worstActual.toFixed(1)}% vs benchmark ~${benchmarks[worstSource]}%.`;
          insights.push(ins);
        }
      }

      // Geographic concentration
      if (geoData && geoData.length > 0) {
        const sortedStates = [...geoData].sort((a, b) => b.installedCapacityGW - a.installedCapacityGW);
        const topShare = totalCapGW > 0 ? (sortedStates[0].installedCapacityGW / totalCapGW) * 100 : 0;
        const geoIns = geographicConcentrationInsight(topShare, sortedStates[0].stateName, 'capacity');
        if (geoIns) insights.push(geoIns);
      }
    }

    return { insights, isLoading: false };
  }, [capData, genData, plfData, historicalData, geoData, pipelineData, powerSource, capLoading, genLoading]);
}
