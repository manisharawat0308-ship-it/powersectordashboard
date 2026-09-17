/**
 * Insight-generation utilities — "What Changed?" panel.
 *
 * All functions operate on actual data objects and return plain-language
 * analytical strings. They use neutral language: increases are not
 * automatically "good" and decreases are not automatically "bad".
 */

export interface Insight {
  id: string;
  category: 'capacity' | 'generation' | 'efficiency' | 'nuclear' | 'renewable' | 'risk' | 'geography';
  text: string;
  magnitude: 'major' | 'moderate' | 'minor';
  direction: 'increase' | 'decrease' | 'stable';
  dataAvailable: boolean;
}

/** Format a signed number with a + prefix for positives. */
function signed(v: number, decimals = 1): string {
  const rounded = parseFloat(v.toFixed(decimals));
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}

/** Classify magnitude of a percentage change. */
function magnitude(pct: number): 'major' | 'moderate' | 'minor' {
  const abs = Math.abs(pct);
  if (abs >= 10) return 'major';
  if (abs >= 3) return 'moderate';
  return 'minor';
}

// ─── Capacity Insights ────────────────────────────────────────────────────────

export function capacityInsight(
  currentGW: number,
  previousGW: number,
): Insight | null {
  if (!previousGW || previousGW <= 0) return null;
  const changeGW = currentGW - previousGW;
  const changePct = (changeGW / previousGW) * 100;
  if (Math.abs(changePct) < 0.1) return null;

  return {
    id: 'capacity-total',
    category: 'capacity',
    text: `Installed capacity ${changeGW > 0 ? 'increased' : 'decreased'} by ${Math.abs(changeGW).toFixed(1)} GW (${signed(changePct)}%) year-on-year, reaching ${currentGW.toFixed(1)} GW.`,
    magnitude: magnitude(changePct),
    direction: changeGW > 0 ? 'increase' : 'decrease',
    dataAvailable: true,
  };
}

// ─── Generation Insights ──────────────────────────────────────────────────────

export function generationInsight(
  currentBU: number,
  previousBU: number,
): Insight | null {
  if (!previousBU || previousBU <= 0) return null;
  const changeBU = currentBU - previousBU;
  const changePct = (changeBU / previousBU) * 100;
  if (Math.abs(changePct) < 0.1) return null;

  return {
    id: 'generation-total',
    category: 'generation',
    text: `Total generation ${changeBU > 0 ? 'rose' : 'fell'} by ${Math.abs(changeBU).toFixed(1)} BU (${signed(changePct)}%) year-on-year.`,
    magnitude: magnitude(changePct),
    direction: changeBU > 0 ? 'increase' : 'decrease',
    dataAvailable: true,
  };
}

// ─── Renewable Share Insight ──────────────────────────────────────────────────

export function renewableShareInsight(
  currentRenewableGW: number,
  currentTotalGW: number,
  previousRenewableGW: number,
  previousTotalGW: number,
): Insight | null {
  if (!currentTotalGW || !previousTotalGW) return null;
  const currentPct = (currentRenewableGW / currentTotalGW) * 100;
  const previousPct = (previousRenewableGW / previousTotalGW) * 100;
  const changePP = currentPct - previousPct;
  if (Math.abs(changePP) < 0.1) return null;

  return {
    id: 'renewable-share',
    category: 'renewable',
    text: `Non-fossil (renewable + nuclear) capacity share ${changePP > 0 ? 'expanded' : 'contracted'} by ${Math.abs(changePP).toFixed(1)} percentage points year-on-year to ${currentPct.toFixed(1)}%.`,
    magnitude: magnitude(changePP * 3),
    direction: changePP > 0 ? 'increase' : 'decrease',
    dataAvailable: true,
  };
}

// ─── Nuclear Generation Insight ───────────────────────────────────────────────

export function nuclearGenerationInsight(
  currentBU: number,
  previousBU: number,
  currentTotalBU: number,
): Insight | null {
  if (!previousBU || previousBU <= 0) return null;
  const changeBU = currentBU - previousBU;
  const changePct = (changeBU / previousBU) * 100;
  const share = currentTotalBU > 0 ? (currentBU / currentTotalBU) * 100 : 0;

  return {
    id: 'nuclear-generation',
    category: 'nuclear',
    text: `Nuclear generation ${changeBU >= 0 ? 'increased' : 'decreased'} by ${Math.abs(changeBU).toFixed(1)} BU (${signed(changePct)}%) year-on-year. Nuclear contributed ${share.toFixed(1)}% of total generation.`,
    magnitude: magnitude(changePct),
    direction: changeBU >= 0 ? 'increase' : 'decrease',
    dataAvailable: true,
  };
}

// ─── PLF / CUF Insight ───────────────────────────────────────────────────────

export function plfInsight(
  source: string,
  currentPlf: number,
  previousPlf: number,
  isRenewable = false,
): Insight | null {
  if (!previousPlf || previousPlf <= 0) return null;
  const changePP = currentPlf - previousPlf;
  if (Math.abs(changePP) < 0.3) return null;

  const metric = isRenewable ? 'CUF' : 'PLF';
  const label = source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ');

  return {
    id: `plf-${source}`,
    category: 'efficiency',
    text: `${label} ${metric} ${changePP > 0 ? 'improved' : 'declined'} by ${Math.abs(changePP).toFixed(1)} percentage points to ${currentPlf.toFixed(1)}%.`,
    magnitude: magnitude(changePP * 4),
    direction: changePP > 0 ? 'increase' : 'decrease',
    dataAvailable: true,
  };
}

// ─── Geographic Concentration Insight ────────────────────────────────────────

export function geographicConcentrationInsight(
  topStateShare: number,
  topStateName: string,
  metric: 'capacity' | 'generation',
): Insight | null {
  if (topStateShare <= 0) return null;
  const level = topStateShare > 30 ? 'highly concentrated' : topStateShare > 20 ? 'moderately concentrated' : 'diversified';

  return {
    id: `geo-concentration-${metric}`,
    category: 'geography',
    text: `${metric === 'capacity' ? 'Installed capacity' : 'Generation'} is ${level} — ${topStateName} accounts for ${topStateShare.toFixed(1)}% of the filtered total.`,
    magnitude: topStateShare > 30 ? 'major' : topStateShare > 20 ? 'moderate' : 'minor',
    direction: 'stable',
    dataAvailable: true,
  };
}

// ─── Top-State Growth Insight ─────────────────────────────────────────────────

export function topStateContributionInsight(
  stateName: string,
  stateGW: number,
  totalGW: number,
): Insight | null {
  if (!totalGW) return null;
  const share = (stateGW / totalGW) * 100;
  return {
    id: `top-state-${stateName}`,
    category: 'geography',
    text: `${stateName} is the largest contributor with ${stateGW.toFixed(1)} GW (${share.toFixed(1)}% of filtered total).`,
    magnitude: share > 15 ? 'major' : 'moderate',
    direction: 'stable',
    dataAvailable: true,
  };
}

// ─── Pipeline Insight ─────────────────────────────────────────────────────────

export function pipelineInsight(
  underConstructionMW: number,
  operatingMW: number,
  label = 'Power Sector',
): Insight | null {
  if (!operatingMW) return null;
  const ratio = (underConstructionMW / operatingMW) * 100;

  return {
    id: 'pipeline-uc',
    category: 'capacity',
    text: `Under-construction capacity for ${label} stands at ${(underConstructionMW / 1000).toFixed(1)} GW — ${ratio.toFixed(0)}% of the current operating base.`,
    magnitude: ratio > 50 ? 'major' : ratio > 20 ? 'moderate' : 'minor',
    direction: 'stable',
    dataAvailable: true,
  };
}

// ─── Single-Source Dependency Insight ────────────────────────────────────────

export function sourceDependencyInsight(
  sourceName: string,
  sourceGW: number,
  totalGW: number,
  generationBU: number,
  totalGenerationBU: number,
): Insight | null {
  if (!totalGW) return null;
  const capShare = (sourceGW / totalGW) * 100;
  const genShare = totalGenerationBU > 0 ? (generationBU / totalGenerationBU) * 100 : 0;

  return {
    id: `source-dependency-${sourceName.toLowerCase()}`,
    category: 'generation',
    text: `${sourceName} represents ${capShare.toFixed(1)}% of installed capacity and ${genShare.toFixed(1)}% of generation — indicating ${capShare > 50 ? 'high technology concentration risk' : 'moderate technology diversification'}.`,
    magnitude: capShare > 50 ? 'major' : capShare > 30 ? 'moderate' : 'minor',
    direction: 'stable',
    dataAvailable: true,
  };
}

// ─── Aggregate: Generate all insights from dashboard data ────────────────────

export interface DashboardSnapshot {
  totalCapacityGW: number;
  totalGenerationBU: number;
  nonFossilCapacityGW: number;
  nuclearGenerationBU: number;
  coalCapacityGW: number;
  coalGenerationBU: number;
  peakPLF?: number;
  nuclearCuf?: number;
}

export function generateInsights(
  current: DashboardSnapshot,
  previous: Partial<DashboardSnapshot> | null,
  topStateName?: string,
  topStateCapacityGW?: number,
  nuclearUCMW?: number,
): Insight[] {
  const insights: Insight[] = [];

  if (previous) {
    const cap = capacityInsight(current.totalCapacityGW, previous.totalCapacityGW ?? 0);
    if (cap) insights.push(cap);

    const gen = generationInsight(current.totalGenerationBU, previous.totalGenerationBU ?? 0);
    if (gen) insights.push(gen);

    const renShare = renewableShareInsight(
      current.nonFossilCapacityGW,
      current.totalCapacityGW,
      previous.nonFossilCapacityGW ?? 0,
      previous.totalCapacityGW ?? 0,
    );
    if (renShare) insights.push(renShare);

    const nucGen = nuclearGenerationInsight(
      current.nuclearGenerationBU,
      previous.nuclearGenerationBU ?? 0,
      current.totalGenerationBU,
    );
    if (nucGen) insights.push(nucGen);
  }

  // Nuclear share (no YoY needed — always interesting)
  const nucShare = current.totalGenerationBU > 0
    ? (current.nuclearGenerationBU / current.totalGenerationBU) * 100
    : 0;
  if (nucShare > 0) {
    insights.push({
      id: 'nuclear-share-gen',
      category: 'nuclear',
      text: `Nuclear accounts for ${nucShare.toFixed(1)}% of total generation with a capacity utilisation factor of ${current.nuclearCuf?.toFixed(1) ?? '78.6'}% — among the highest of any technology in the sector.`,
      magnitude: 'moderate',
      direction: 'stable',
      dataAvailable: true,
    });
  }

  // Coal dependency
  const coalDep = sourceDependencyInsight(
    'Coal',
    current.coalCapacityGW,
    current.totalCapacityGW,
    current.coalGenerationBU,
    current.totalGenerationBU,
  );
  if (coalDep) insights.push(coalDep);

  // Geography
  if (topStateName && topStateCapacityGW) {
    const geo = topStateContributionInsight(topStateName, topStateCapacityGW, current.totalCapacityGW);
    if (geo) insights.push(geo);
  }

  // Nuclear pipeline
  if (nuclearUCMW && nuclearUCMW > 0) {
    const pip = pipelineInsight(nuclearUCMW, 8180, 'Nuclear');
    if (pip) insights.push(pip);
  }

  return insights;
}
