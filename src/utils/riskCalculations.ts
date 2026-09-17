/**
 * Risk calculation utilities for the Power Sector Intelligence & Risk Dashboard.
 *
 * Scores are computed only from actual data inputs.
 * Where data is missing, scores are returned as null with a reason.
 * Scores are 0–100: 0 = no risk, 100 = maximum observable risk.
 */

import { PowerSourceSlice } from '@/types/filters';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RiskScore {
  score: number | null;
  label: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Unavailable';
  color: string;
  dataAvailable: boolean;
  reason?: string;
}

export interface RiskCategoryScore {
  category: string;
  label: string;
  score: number | null;
  trend: 'improving' | 'stable' | 'deteriorating' | 'unknown';
  dataAvailable: boolean;
  inputs: string[];
  reason?: string;
}

export interface RiskAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  actual: number;
  category: string;
}

export interface TopRiskDriver {
  rank: number;
  name: string;
  description: string;
  score: number;
  category: string;
}

export interface RiskHeatmapCell {
  rowLabel: string;
  colLabel: string;
  score: number | null;
  dataAvailable: boolean;
}

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

/** Clamp a value to [0, 100]. */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Normalize a value given expected min/max range → 0-100. */
function normalize(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100);
}

/** Classify a 0-100 score into risk level. */
export function classifyRisk(score: number | null): RiskScore['label'] {
  if (score === null) return 'Unavailable';
  if (score <= 30) return 'Low';
  if (score <= 55) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

/** Get color for a risk level label. */
export function riskLevelColor(label: RiskScore['label']): string {
  const colors: Record<RiskScore['label'], string> = {
    Low: '#4CAF50',
    Moderate: '#F99D27',
    High: '#E65100',
    Critical: '#B02A30',
    Unavailable: '#9E9E9E',
  };
  return colors[label];
}

// ─── Operational Risk ─────────────────────────────────────────────────────────

/**
 * Operational risk — based on PLF/CUF values relative to technology norms.
 * Low PLF for thermal = high operational risk.
 * For renewables, below-norm CUF signals underperformance.
 */
export function computeOperationalRisk(
  plfValues: Record<string, number>,
  cufValues: Record<string, number>,
  powerSource: PowerSourceSlice,
): RiskCategoryScore {
  const benchmarks: Record<string, number> = {
    coal: 65, lignite: 60, gas: 30, diesel: 10,
    solar: 19, wind: 22, small_hydro: 30, large_hydro: 40,
    biomass: 45, nuclear: 80,
  };

  const relevant: { source: string; actual: number; benchmark: number }[] = [];

  const addSource = (src: string, val: number) => {
    if (val > 0 && benchmarks[src]) {
      relevant.push({ source: src, actual: val, benchmark: benchmarks[src] });
    }
  };

  if (powerSource === 'all') {
    Object.entries(plfValues).forEach(([s, v]) => addSource(s, v));
    Object.entries(cufValues).forEach(([s, v]) => addSource(s, v));
  } else if (powerSource === 'coal') {
    if (plfValues.coal) addSource('coal', plfValues.coal);
  } else if (powerSource === 'gas') {
    if (plfValues.gas) addSource('gas', plfValues.gas);
  } else if (powerSource === 'nuclear') {
    if (cufValues.nuclear) addSource('nuclear', cufValues.nuclear);
  } else if (powerSource === 'solar') {
    if (cufValues.solar) addSource('solar', cufValues.solar);
  } else if (powerSource === 'wind') {
    if (cufValues.wind) addSource('wind', cufValues.wind);
  } else if (powerSource === 'hydro') {
    if (cufValues.large_hydro) addSource('large_hydro', cufValues.large_hydro);
    if (cufValues.small_hydro) addSource('small_hydro', cufValues.small_hydro);
  } else if (powerSource === 'other') {
    if (plfValues.lignite) addSource('lignite', plfValues.lignite);
    if (cufValues.biomass) addSource('biomass', cufValues.biomass);
  }

  if (relevant.length === 0) {
    return {
      category: 'operational',
      label: 'Operational',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'No PLF/CUF data for selected power source.',
    };
  }

  // Score: how far below benchmark (capped at 100)
  const gaps = relevant.map((r) => {
    const gapPct = ((r.benchmark - r.actual) / r.benchmark) * 100;
    return Math.max(0, gapPct); // only penalise shortfalls, not excess
  });
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  // Map gap 0–40pp → risk 0–80
  const score = clamp(avgGap * 2);

  return {
    category: 'operational',
    label: 'Operational',
    score: Math.round(score),
    trend: 'stable',
    dataAvailable: true,
    inputs: relevant.map((r) => `${r.source} PLF/CUF: ${r.actual.toFixed(1)}% (benchmark ${r.benchmark}%)`),
  };
}

// ─── Supply / Capacity Risk ───────────────────────────────────────────────────

/**
 * Supply risk — based on technology concentration.
 * Single-technology dominance increases supply risk.
 */
export function computeSupplyRisk(
  bySource: { source: string; capacityMW: number }[],
  totalCapacityMW: number,
): RiskCategoryScore {
  if (!totalCapacityMW || bySource.length === 0) {
    return {
      category: 'supply',
      label: 'Supply / Capacity',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'Capacity data unavailable.',
    };
  }

  // Herfindahl-Hirschman Index (HHI) for technology concentration
  const hhi = bySource.reduce((sum, s) => {
    const share = (s.capacityMW / totalCapacityMW) * 100;
    return sum + share * share;
  }, 0);

  // HHI: 0 = perfectly diversified, 10000 = monopoly
  // Map HHI 1000–6000 → risk 20–80
  const score = clamp(normalize(hhi, 800, 6000) * 0.8);
  const topSource = [...bySource].sort((a, b) => b.capacityMW - a.capacityMW)[0];
  const topShare = topSource ? (topSource.capacityMW / totalCapacityMW) * 100 : 0;

  return {
    category: 'supply',
    label: 'Supply / Capacity',
    score: Math.round(score),
    trend: 'stable',
    dataAvailable: true,
    inputs: [
      `Technology HHI: ${hhi.toFixed(0)} (1000=diverse, 10000=monopoly)`,
      `Largest source: ${topSource?.source ?? '—'} at ${topShare.toFixed(1)}% of capacity`,
      `Sources tracked: ${bySource.length}`,
    ],
  };
}

// ─── Project / Development Risk ──────────────────────────────────────────────

export function computeProjectRisk(
  underConstructionMW: number,
  approvedMW: number,
  operatingMW: number,
): RiskCategoryScore {
  if (!operatingMW) {
    return {
      category: 'project',
      label: 'Project / Development',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'Operating capacity data unavailable.',
    };
  }

  // High UC ratio relative to operating base → higher execution risk
  const ucRatio = (underConstructionMW / operatingMW) * 100;
  // Scale: 0% = 0 risk, 100% UC = 60 risk, >200% = 80+
  const score = clamp(normalize(ucRatio, 0, 200) * 0.85);

  return {
    category: 'project',
    label: 'Project / Development',
    score: Math.round(score),
    trend: 'stable',
    dataAvailable: true,
    inputs: [
      `Under construction: ${(underConstructionMW / 1000).toFixed(1)} GW`,
      `Approved pipeline: ${(approvedMW / 1000).toFixed(1)} GW`,
      `Operating base: ${(operatingMW / 1000).toFixed(1)} GW`,
      `UC/Operating ratio: ${ucRatio.toFixed(0)}%`,
    ],
  };
}

// ─── Geographic Concentration Risk ───────────────────────────────────────────

export function computeGeographicRisk(
  stateCapacities: { stateCode: string; stateName: string; capacityGW: number }[],
): RiskCategoryScore {
  const total = stateCapacities.reduce((s, st) => s + st.capacityGW, 0);
  if (!total) {
    return {
      category: 'geographic',
      label: 'Geographic',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'State capacity data unavailable.',
    };
  }

  const hhi = stateCapacities.reduce((sum, st) => {
    const share = (st.capacityGW / total) * 100;
    return sum + share * share;
  }, 0);

  const topState = [...stateCapacities].sort((a, b) => b.capacityGW - a.capacityGW)[0];
  const topShare = topState ? (topState.capacityGW / total) * 100 : 0;
  // HHI: a state portfolio with N=10 states evenly = HHI 1000. Very concentrated = 3000+
  const score = clamp(normalize(hhi, 400, 4000) * 0.85);

  return {
    category: 'geographic',
    label: 'Geographic',
    score: Math.round(score),
    trend: 'stable',
    dataAvailable: true,
    inputs: [
      `State HHI: ${hhi.toFixed(0)}`,
      `Top state: ${topState?.stateName ?? '—'} at ${topShare.toFixed(1)}%`,
      `States tracked: ${stateCapacities.length}`,
    ],
  };
}

// ─── Market Risk ──────────────────────────────────────────────────────────────

export function computeMarketRisk(): RiskCategoryScore {
  // Power-price and DISCOM payment data not available in the current dataset
  return {
    category: 'market',
    label: 'Market',
    score: null,
    trend: 'unknown',
    dataAvailable: false,
    inputs: [],
    reason: 'Power price and DISCOM payment data not currently integrated. Required for market risk scoring.',
  };
}

// ─── Climate / Physical Risk ──────────────────────────────────────────────────

/** State-level climate hazard proxy scores (0–100) based on publicly known hazard exposure. */
const STATE_CLIMATE_HAZARD: Record<string, number> = {
  // High cyclone + flood exposure
  AP: 72, TN: 70, OD: 75, WB: 68, GJ: 65,
  // Moderate exposure
  MH: 55, KL: 52, KA: 40, HR: 30, RJ: 35,
  // Lower exposure
  UP: 28, MP: 25, CG: 28, JH: 25, PB: 22,
  HP: 35, UK: 40, // Flood/landslide
  AS: 60, // Flood
  // Rest
  BR: 35, TS: 32, DL: 20, GA: 48, JK: 38, AR: 45,
};

export function computeClimateRisk(
  stateCapacities: { stateCode: string; stateName: string; capacityGW: number }[],
): RiskCategoryScore {
  const total = stateCapacities.reduce((s, st) => s + st.capacityGW, 0);
  if (!total) {
    return {
      category: 'climate',
      label: 'Climate / Physical',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'State capacity data unavailable.',
    };
  }

  // Capacity-weighted average climate hazard score
  let weightedScore = 0;
  const statesWithData: string[] = [];
  let weightedTotal = 0;

  stateCapacities.forEach((st) => {
    const hazard = STATE_CLIMATE_HAZARD[st.stateCode];
    if (hazard !== undefined) {
      weightedScore += hazard * st.capacityGW;
      weightedTotal += st.capacityGW;
      statesWithData.push(`${st.stateName}: hazard ${hazard}/100`);
    }
  });

  if (weightedTotal === 0) {
    return {
      category: 'climate',
      label: 'Climate / Physical',
      score: null,
      trend: 'unknown',
      dataAvailable: false,
      inputs: [],
      reason: 'No hazard data available for the states in the filtered dataset.',
    };
  }

  const score = Math.round(weightedScore / weightedTotal);

  return {
    category: 'climate',
    label: 'Climate / Physical',
    score: clamp(score),
    trend: 'stable',
    dataAvailable: true,
    inputs: [
      'Proxy score based on state-level cyclone, flood, and heat exposure.',
      'Site-level climate hazard data not currently available.',
      ...statesWithData.slice(0, 5),
    ],
  };
}

// ─── Overall Risk Score ───────────────────────────────────────────────────────

export function computeOverallRiskScore(
  categories: RiskCategoryScore[],
  weights: Record<string, number>,
): RiskScore {
  const available = categories.filter((c) => c.dataAvailable && c.score !== null);

  if (available.length < 2) {
    return {
      score: null,
      label: 'Unavailable',
      color: '#9E9E9E',
      dataAvailable: false,
      reason: `Insufficient data for overall scoring — only ${available.length} of ${categories.length} risk categories have adequate data.`,
    };
  }

  let totalWeight = 0;
  let weightedSum = 0;

  available.forEach((cat) => {
    const w = weights[cat.category] ?? (1 / available.length);
    weightedSum += (cat.score as number) * w;
    totalWeight += w;
  });

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  const label = classifyRisk(score);

  return {
    score,
    label,
    color: riskLevelColor(label),
    dataAvailable: true,
  };
}

// ─── Risk Alerts ──────────────────────────────────────────────────────────────

export function generateRiskAlerts(
  categories: RiskCategoryScore[],
  bySource: { source: string; capacityMW: number }[],
  totalCapacityMW: number,
  nuclearUCMW: number,
  nuclearOperatingMW: number,
): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // High operational risk
  const ops = categories.find((c) => c.category === 'operational');
  if (ops?.score !== null && ops.score !== undefined && ops.score >= 60) {
    alerts.push({
      id: 'alert-ops-high',
      severity: ops.score >= 75 ? 'critical' : 'warning',
      title: 'Elevated Operational Risk',
      description: `PLF/CUF values for key sources are materially below technology benchmarks.`,
      metric: 'Operational Risk Score',
      threshold: 60,
      actual: ops.score,
      category: 'operational',
    });
  }

  // Technology concentration
  if (totalCapacityMW > 0 && bySource.length > 0) {
    const topSource = [...bySource].sort((a, b) => b.capacityMW - a.capacityMW)[0];
    const topShare = (topSource.capacityMW / totalCapacityMW) * 100;
    if (topShare >= 50) {
      alerts.push({
        id: 'alert-concentration',
        severity: topShare >= 65 ? 'critical' : 'warning',
        title: 'High Technology Concentration',
        description: `${topSource.source.charAt(0).toUpperCase() + topSource.source.slice(1)} accounts for ${topShare.toFixed(1)}% of installed capacity — single-source dependency risk.`,
        metric: 'Top Source Share',
        threshold: 50,
        actual: topShare,
        category: 'supply',
      });
    }
  }

  // Nuclear pipeline execution risk
  if (nuclearOperatingMW > 0) {
    const ucRatio = (nuclearUCMW / nuclearOperatingMW) * 100;
    if (ucRatio >= 50) {
      alerts.push({
        id: 'alert-nuclear-uc',
        severity: ucRatio >= 80 ? 'warning' : 'info',
        title: 'Significant Nuclear Pipeline',
        description: `Under-construction nuclear capacity (${(nuclearUCMW / 1000).toFixed(1)} GW) is ${ucRatio.toFixed(0)}% of operating base — execution and timeline risk to be monitored.`,
        metric: 'Nuclear UC/Operating Ratio',
        threshold: 50,
        actual: ucRatio,
        category: 'project',
      });
    }
  }

  // Geographic risk alert
  const geo = categories.find((c) => c.category === 'geographic');
  if (geo?.score !== null && geo?.score !== undefined && geo.score >= 60) {
    alerts.push({
      id: 'alert-geo-concentration',
      severity: geo.score >= 75 ? 'warning' : 'info',
      title: 'Geographic Concentration',
      description: 'Capacity is concentrated in a small number of states, amplifying weather and regulatory disruption risk.',
      metric: 'Geographic Risk Score',
      threshold: 60,
      actual: geo.score,
      category: 'geographic',
    });
  }

  return alerts;
}

// ─── Top Risk Drivers ─────────────────────────────────────────────────────────

export function computeTopRiskDrivers(categories: RiskCategoryScore[]): TopRiskDriver[] {
  const available = categories
    .filter((c) => c.dataAvailable && c.score !== null)
    .sort((a, b) => (b.score as number) - (a.score as number));

  const descriptions: Record<string, string> = {
    operational: 'PLF/CUF deviation from technology benchmarks',
    supply: 'Technology concentration (HHI-based)',
    project: 'Under-construction capacity relative to operating base',
    geographic: 'State concentration (HHI-based)',
    market: 'Power price and DISCOM payment exposure',
    climate: 'Capacity-weighted state-level climate hazard exposure',
  };

  return available.slice(0, 5).map((c, i) => ({
    rank: i + 1,
    name: c.label,
    description: descriptions[c.category] ?? c.label,
    score: c.score as number,
    category: c.category,
  }));
}

// ─── Risk Heatmap Data ────────────────────────────────────────────────────────

export function buildTechRiskHeatmap(
  categories: RiskCategoryScore[],
  technologies: { source: string; label: string }[],
  plfValues: Record<string, number>,
  cufValues: Record<string, number>,
  bySource: { source: string; capacityMW: number }[],
  totalCapacityMW: number,
): RiskHeatmapCell[] {
  const cells: RiskHeatmapCell[] = [];
  const catLabels = categories.map((c) => c.label);

  technologies.forEach((tech) => {
    const plf = plfValues[tech.source] ?? cufValues[tech.source] ?? null;
    const benchmarks: Record<string, number> = {
      coal: 65, lignite: 60, gas: 30, solar: 19, wind: 22,
      small_hydro: 30, large_hydro: 40, biomass: 45, nuclear: 80,
    };
    const benchmark = benchmarks[tech.source] ?? 50;

    catLabels.forEach((catLabel) => {
      let score: number | null = null;
      let dataAvail = true;

      if (catLabel === 'Operational') {
        if (plf !== null) {
          const gap = Math.max(0, benchmark - plf);
          score = Math.round(clamp(gap * 2.5));
        } else {
          dataAvail = false;
        }
      } else if (catLabel === 'Supply / Capacity') {
        const src = bySource.find((s) => s.source === tech.source);
        if (src && totalCapacityMW > 0) {
          const share = (src.capacityMW / totalCapacityMW) * 100;
          score = Math.round(clamp(normalize(share, 0, 70) * 0.9));
        } else {
          dataAvail = false;
        }
      } else if (catLabel === 'Climate / Physical') {
        // Use a technology-specific proxy
        const climateProxy: Record<string, number> = {
          coal: 50, gas: 40, solar: 55, wind: 60,
          large_hydro: 45, small_hydro: 40, nuclear: 50,
          biomass: 35, lignite: 45, diesel: 30,
        };
        score = climateProxy[tech.source] ?? null;
        if (score === null) dataAvail = false;
      } else {
        // Other categories — use overall category score as proxy
        const cat = categories.find((c) => c.label === catLabel);
        score = cat?.score ?? null;
        dataAvail = cat?.dataAvailable ?? false;
      }

      cells.push({
        rowLabel: tech.label,
        colLabel: catLabel,
        score,
        dataAvailable: dataAvail,
      });
    });
  });

  return cells;
}
