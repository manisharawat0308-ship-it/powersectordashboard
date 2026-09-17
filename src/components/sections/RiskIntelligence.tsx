import { useState } from 'react';
import { useRiskData } from '@/hooks/useRiskData';
import { useFilterStore } from '@/store/filterStore';
import { RiskCategoryScore, TopRiskDriver, RiskHeatmapCell } from '@/utils/riskCalculations';

// ── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(score: number | null): string {
  if (score === null) return '#9E9E9E';
  if (score <= 30) return '#4CAF50';
  if (score <= 55) return '#F99D27';
  if (score <= 75) return '#E65100';
  return '#B02A30';
}

function riskBg(score: number | null): string {
  if (score === null) return 'bg-gray-100';
  if (score <= 30) return 'bg-green-50';
  if (score <= 55) return 'bg-amber-50';
  if (score <= 75) return 'bg-orange-50';
  return 'bg-red-50';
}

const TREND_ICON: Record<string, string> = {
  improving:     '↓ Improving',
  stable:        '→ Stable',
  deteriorating: '↑ Deteriorating',
  unknown:       '— Unknown',
};

// ── Score Gauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90" width="112" height="112" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="42" stroke="#e5e7eb" strokeWidth="10" fill="none" />
          <circle
            cx="56" cy="56" r="42"
            stroke={color} strokeWidth="10" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-400 font-bold">/100</span>
        </div>
      </div>
      <span className="text-[12px] font-black" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────

function CategoryRow({ cat }: { cat: RiskCategoryScore }) {
  const [showInputs, setShowInputs] = useState(false);
  const color = riskColor(cat.score);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 cursor-pointer" onClick={() => setShowInputs(!showInputs)}>
        <div className="flex-1">
          <span className="text-[13px] font-bold text-gray-800">{cat.label}</span>
        </div>

        {cat.dataAvailable && cat.score !== null ? (
          <>
            {/* Score bar */}
            <div className="w-32 hidden tablet:block">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.score}%`, backgroundColor: color }}
                />
              </div>
            </div>
            <span className="text-[13px] font-black w-8 text-right" style={{ color }}>{cat.score}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white w-20 text-center" style={{ backgroundColor: color }}>
              {cat.score <= 30 ? 'Low' : cat.score <= 55 ? 'Moderate' : cat.score <= 75 ? 'High' : 'Critical'}
            </span>
          </>
        ) : (
          <span className="text-[12px] text-gray-400 italic">Data unavailable</span>
        )}

        <span className="text-[11px] text-gray-400 w-28 text-right hidden laptop:block">
          {TREND_ICON[cat.trend]}
        </span>
        <span className="text-gray-400 text-xs">{showInputs ? '▲' : '▼'}</span>
      </div>

      {showInputs && (
        <div className="px-4 pb-3 pt-1 bg-gray-50">
          {cat.reason ? (
            <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded p-2">
              ⚠️ {cat.reason}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Inputs used</p>
              {cat.inputs.map((inp, i) => (
                <p key={i} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-gray-300 mt-0.5">•</span> {inp}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

function RiskHeatmap({ cells }: { cells: RiskHeatmapCell[] }) {
  const rows = [...new Set(cells.map((c) => c.rowLabel))];
  const cols = [...new Set(cells.map((c) => c.colLabel))];

  if (rows.length === 0 || cols.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-gray-500 font-bold uppercase">Technology</th>
            {cols.map((col) => (
              <th key={col} className="p-2 text-center text-gray-500 font-bold uppercase whitespace-nowrap">
                {col.replace(' / ', '/')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="hover:bg-gray-50">
              <td className="p-2 font-bold text-gray-700 whitespace-nowrap">{row}</td>
              {cols.map((col) => {
                const cell = cells.find((c) => c.rowLabel === row && c.colLabel === col);
                const score = cell?.score ?? null;
                const color = riskColor(score);
                return (
                  <td key={col} className="p-1 text-center">
                    <div
                      className="w-full rounded text-[11px] font-bold py-1.5 transition-all"
                      style={
                        score !== null
                          ? { backgroundColor: color + '33', color, border: `1px solid ${color}55` }
                          : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                      }
                      title={score !== null ? `${row} × ${col}: ${score}/100` : 'Data unavailable'}
                    >
                      {score !== null ? score : '—'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Top Drivers ───────────────────────────────────────────────────────────────

function TopDriversList({ drivers }: { drivers: TopRiskDriver[] }) {
  if (drivers.length === 0) {
    return <p className="text-[12px] text-gray-400 italic">Insufficient data to rank risk drivers.</p>;
  }
  const maxScore = Math.max(...drivers.map((d) => d.score));

  return (
    <div className="space-y-2">
      {drivers.map((d) => (
        <div key={d.rank} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[12px] flex-shrink-0"
            style={{ backgroundColor: riskColor(d.score) }}
          >
            {d.rank}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-gray-800">{d.name}</div>
            <div className="text-[11px] text-gray-500">{d.description}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden hidden tablet:block">
              <div
                className="h-full rounded-full"
                style={{ width: `${(d.score / maxScore) * 100}%`, backgroundColor: riskColor(d.score) }}
              />
            </div>
            <span className="text-[13px] font-black" style={{ color: riskColor(d.score) }}>{d.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RiskIntelligence() {
  const { categories, overall, alerts, topDrivers, heatmapCells, isLoading } = useRiskData();
  const powerSource = useFilterStore((s) => s.powerSource);
  const [showMethodology, setShowMethodology] = useState(false);

  const sourceLabel = powerSource === 'all' ? 'Power Sector' :
    powerSource.charAt(0).toUpperCase() + powerSource.slice(1);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + Overall Score */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-icici-maroon via-amber-500 to-green-600" />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl flex-shrink-0">🛡️</div>
            <div>
              <h2 className="text-base font-black text-gray-800">Risk Intelligence — {sourceLabel}</h2>
              <p className="text-[12px] text-gray-400">Quantitative risk scoring from actual data · {categories.filter(c => c.dataAvailable).length} of {categories.length} categories scored</p>
            </div>
          </div>
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-[12px] font-bold text-icici-navy border border-icici-navy/30 px-3 py-1.5 rounded-lg hover:bg-icici-navy/5 transition-all"
          >
            📐 Methodology
          </button>
        </div>

        {/* Methodology Panel */}
        {showMethodology && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-gray-700 space-y-2">
            <p className="font-bold text-blue-800">Risk Score Methodology</p>
            <p><strong>Operational:</strong> PLF/CUF values vs technology benchmarks. Gap normalized to 0–100.</p>
            <p><strong>Supply/Capacity:</strong> Herfindahl-Hirschman Index (HHI) of technology concentration. Higher HHI = higher risk.</p>
            <p><strong>Project:</strong> Under-construction capacity as % of operating base. High UC ratio = execution risk.</p>
            <p><strong>Geographic:</strong> State-level HHI. Concentrated geography = higher correlated exposure.</p>
            <p><strong>Market:</strong> Not scored — power price and DISCOM payment data not integrated.</p>
            <p><strong>Climate/Physical:</strong> Capacity-weighted state-level climate hazard proxy. Site-level data not available.</p>
            <p><strong>Overall:</strong> Weighted average of scored categories (Operational 25%, Supply 25%, Project 15%, Geographic 15%, Market 10%, Climate 10%). Categories with insufficient data are excluded.</p>
            <p className="text-gray-400 italic">Scores are 0–100 (0 = no risk, 100 = maximum observable). This is an analytical tool, not a professional risk rating.</p>
          </div>
        )}

        {/* Overall score display */}
        <div className="mt-5 flex items-center gap-6 flex-wrap">
          {overall.dataAvailable && overall.score !== null ? (
            <>
              <ScoreGauge score={overall.score} label={overall.label} color={overall.color} />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-600 mb-2">Overall Risk Score: <span className="text-xl font-black" style={{ color: overall.color }}>{overall.score} / 100 — {overall.label}</span></p>
                <div className="grid grid-cols-2 tablet:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <div key={cat.category} className={`p-2 rounded-lg ${riskBg(cat.score)} border border-transparent`}>
                      <div className="text-[11px] font-bold text-gray-500">{cat.label}</div>
                      {cat.dataAvailable && cat.score !== null ? (
                        <div className="text-[15px] font-black mt-0.5" style={{ color: riskColor(cat.score) }}>{cat.score}</div>
                      ) : (
                        <div className="text-[12px] text-gray-400 italic">N/A</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-bold text-amber-800">Risk score unavailable — additional data required</p>
              <p className="text-[12px] text-amber-700 mt-1">{overall.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Alerts */}
      {alerts.length > 0 && (
        <div className="icici-card p-5">
          <h3 className="text-sm font-black text-gray-800 mb-3">⚠️ Risk Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert) => {
              const colors = {
                critical: { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', text: 'text-red-800' },
                warning:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🟡', text: 'text-amber-800' },
                info:     { bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔵', text: 'text-blue-800' },
              };
              const c = colors[alert.severity];
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl ${c.bg} border ${c.border}`}>
                  <span className="text-base flex-shrink-0">{c.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[13px] font-bold ${c.text}`}>{alert.title}</p>
                    <p className="text-[12px] text-gray-600 mt-0.5">{alert.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-gray-400">Actual</div>
                    <div className={`text-[13px] font-black ${c.text}`}>{alert.actual.toFixed(1)}</div>
                    <div className="text-[10px] text-gray-400">threshold {alert.threshold}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">Risk Category Breakdown</h3>
        <p className="text-[12px] text-gray-400 mb-3">Click any row to see inputs and methodology</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {categories.map((cat) => <CategoryRow key={cat.category} cat={cat} />)}
        </div>
      </div>

      {/* Top Risk Drivers */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">🎯 Top Risk Drivers</h3>
        <TopDriversList drivers={topDrivers} />
        {topDrivers.length === 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[12px] text-amber-700">Market and Climate risk categories are not scored due to data limitations — these would typically feature in top drivers for insurance underwriting.</p>
          </div>
        )}
      </div>

      {/* Risk Heatmap */}
      {heatmapCells.length > 0 && (
        <div className="icici-card p-5">
          <h3 className="text-sm font-black text-gray-800 mb-1">Risk Heatmap — Technology × Risk Category</h3>
          <p className="text-[12px] text-gray-400 mb-4">Score 0–100: <span className="text-green-600 font-bold">Low ≤30</span> · <span className="text-amber-600 font-bold">Moderate ≤55</span> · <span className="text-orange-600 font-bold">High ≤75</span> · <span className="text-red-600 font-bold">Critical &gt;75</span></p>
          <RiskHeatmap cells={heatmapCells} />
          <p className="text-[11px] text-gray-400 mt-3 italic">
            Heatmap cells use technology-specific sub-scores where available. Some cells use category-level proxy scores. Market risk cells are unavailable — price data required.
          </p>
        </div>
      )}

      {/* ── Source-Specific Risk Context ── */}
      <SourceRiskContext powerSource={powerSource} />

      {/* Data gaps notice */}
      <div className="icici-card p-4 border-l-4 border-amber-300">
        <h4 className="text-[12px] font-bold text-amber-800 mb-2">📋 Data Gaps — Risk Scoring Limitations</h4>
        <ul className="space-y-1">
          {[
            'Forced outage rates not available in public CEA data — would improve Operational score',
            'Power price / tariff volatility data not integrated — Market risk category unavailable',
            'DISCOM payment data not integrated — Market risk category unavailable',
            'Site-level climate hazard assessments not available — Climate score uses state-level proxy',
            'Monthly PLF trend not available — trend direction shown as "stable" for all categories',
          ].map((gap, i) => (
            <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              {gap}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Source-Specific Risk Context ─────────────────────────────────────────────

const SOURCE_CONTEXT: Record<string, {
  title: string;
  icon: string;
  color: string;
  keyRiskNarrative: string;
  whatToWatch: string[];
  actionableInsights: string[];
  underwritingConsiderations: string[];
  historicalContext: string;
}> = {
  all: {
    title: 'Power Sector — Overall Risk Assessment',
    icon: '⚡',
    color: '#B02A30',
    keyRiskNarrative: 'India\'s 450 GW power sector is dominated by coal (47% capacity, 67% generation), creating significant technology concentration risk. The rapid RE expansion (non-fossil now 45.8% of capacity) is diversifying the portfolio but introduces new risk categories — hail damage for solar, cyclone exposure for wind, and execution risk for the 7 GW nuclear pipeline. The sector\'s greatest vulnerability is coal\'s dual role as risk concentrator AND reliability backbone.',
    whatToWatch: [
      'Coal PLF declining year-on-year (64% FY25 vs 78% a decade ago) — indicates merit-order displacement by RE',
      'Solar hail losses accelerating post-2020 — Rajasthan/MP corridor emerging as secondary peril hotspot',
      'Nuclear pipeline execution — 7 GW under construction with 8–15 year timelines, any delay compounds BI exposure',
      'Monsoon variability affecting hydro generation (hydro contributes 8.9% of generation but is highly seasonal)',
      'DISCOM financial health — outstanding dues exceeding ₹1 lakh crore impacts counterparty risk for all generators',
    ],
    actionableInsights: [
      'Portfolio diversification across coal/RE/nuclear reduces correlated loss risk — but coal remains the tail risk driver due to its generation dominance',
      'Geographic concentration in MH/GJ/RJ/TN accounts for 40% of total capacity — a single severe cyclone or hailstorm can trigger multi-billion-rupee aggregate losses',
      'Gas fleet (25 GW installed) operates at <25% PLF due to fuel shortage — represents stranded assets but low BI risk (already not generating)',
      'The insurance sector needs to develop hydro-specific and nuclear-specific expertise — both are underserved relative to thermal/solar/wind',
    ],
    underwritingConsiderations: [
      'Total insurable asset value of Indian power sector: estimated ₹15–20 lakh crore (turbine islands, BOP, switchyards)',
      'Annual premium pool: estimated ₹4,000–6,000 crore across property, MB, BI, and liability covers',
      'Key accumulation risk: Gujarat coast (cyclone), Rajasthan (hail), Uttarakhand valley (GLOF/flood) — need catastrophe modelling',
      'Technology transition: coal retirement + RE expansion means risk profile is shifting from "high-frequency-moderate-severity" (boiler tubes) to "low-frequency-high-severity" (hail, cyclone)',
    ],
    historicalContext: 'Indian power sector has grown 22.5× since 1975. The risk profile has fundamentally changed in the last decade — from a thermal-dominated sector with well-understood machinery breakdown risks to a mixed fleet requiring expertise across coal, solar, wind, hydro, and nuclear technologies simultaneously.',
  },
  coal: {
    title: 'Coal/Thermal — Risk Context',
    icon: '🏭',
    color: '#B02A30',
    keyRiskNarrative: 'Coal remains India\'s reliability backbone (67% generation) but faces structural decline in utilisation. PLF has fallen from 78% (2010) to 64% (FY25) as RE displaces coal in merit order. The fleet is aging — 60%+ of units are >15 years old. Boiler tube failures remain the #1 frequency driver. Turbine failures are low-frequency but catastrophic (₹100–500 Cr per event). The biggest emerging risk is stranded asset risk as policy pushes for net-zero.',
    whatToWatch: [
      'PLF decline trajectory — if PLF drops below 55%, many units become financially unviable (fixed cost recovery fails)',
      'Emission compliance (FGD installation) — ₹2,400 Cr per plant capital expenditure needed, extending useful life requirement',
      'Fleet age distribution — 162 units of 210 MW class are 25–50 years old, increasing failure probability',
      'Vedanta Singhitarai (2025) and NTPC Unchahar (2017) events show boiler explosion risk remains lethal',
      'Coastal plants (Mundra, Krishnapatnam, Tuticorin) — cyclone and flood exposure increasing with climate change',
    ],
    actionableInsights: [
      'BHEL is the sole turbine supplier for ~70% of the fleet — any BHEL supply chain disruption (labor strike, material shortage) compounds BI across the sector',
      'LP rotor replacement (₹80–120 Cr, 12–18 months lead time) is the single most expensive insurable event in thermal. Pre-agree BHEL mobilization protocol',
      'Coal quality deterioration (ash content increasing from 35% to 45%+) accelerates boiler tube erosion — inspect annual tube thickness survey compliance',
      'DGA (Dissolved Gas Analysis) on transformers prevents 90% of transformer failures — mandate quarterly DGA as risk improvement',
    ],
    underwritingConsiderations: [
      'Sum insured per 660 MW unit: ₹400–600 Cr. Indemnity period: 18–24 months minimum',
      'Boiler tube failure: ₹10–30 Cr per event, 3–6 month repair. High frequency, predictable. Factor into base premium',
      'Turbine failure: ₹80–250 Cr per event. Low frequency (1 per 500 unit-years) but catastrophic. BI dominates MD',
      'Coastal loadings: +30–50% for cyclone-exposed plants (Mundra, Krishnapatnam, Tuticorin)',
      'Age loading: +15–25% for units >25 years old due to increasing failure probability',
    ],
    historicalContext: 'Coal has powered India\'s industrialisation. NTPC alone has 56 GW and a fleet safety record among the best in the developing world. However, the 2017 Unchahar explosion (38 dead, ₹300 Cr loss) and 2025 Vedanta Singhitarai blast (25 dead) demonstrate that operational risk remains real, particularly where maintenance culture is weak.',
  },
  nuclear: {
    title: 'Nuclear — Risk Context',
    icon: '⚛️',
    color: '#7B1FA2',
    keyRiskNarrative: 'Nuclear is India\'s highest-CUF technology (78.6%) with the lowest claims frequency. The Kaiga-1 world record (962 days continuous) validates NPCIL\'s operational excellence. However, the sector has unique risk characteristics: single operator (NPCIL ~95%), single turbine OEM (BHEL), Russian fuel dependency (Kudankulam), and the AERB regulatory framework that can extend any BI event by 3–12 months. The 7 GW pipeline introduces execution risk.',
    whatToWatch: [
      'KAPS-3&4 (PHWR-700) performance — first new-design units, their CUF in years 1–3 validates the 10-unit fleet mode programme',
      'PFBR commercial operation — India\'s first fast breeder reactor. Sodium-cooled technology has different risk profile than water-cooled',
      'Kudankulam-3&4 construction timeline — any Russia sanctions scenario affects fuel supply (though 18-month strategic reserve exists)',
      'CLNDA right-of-recourse clause — continues to deter foreign reactor suppliers (Westinghouse AP1000, EDF EPR projects delayed)',
      'AERB regulatory stance post-incident — any event triggering AERB investigation adds 3–6 months minimum to BI',
    ],
    actionableInsights: [
      'Nuclear turbine island is commercially insurable (PAR + MB + BI) — reactor island excluded. The boundary is clear and well-defined by AERB regulations',
      'BHEL monopoly for nuclear TG sets means 24-month minimum rotor replacement lead time — longest of any technology in India. Indemnity period must be 36 months',
      'Claims frequency is extremely low (600+ reactor-years since last significant event in 1993) — NCD structures highly attractive. Consider multi-year policies',
      'BI exposure per unit is very high (₹7 Cr/day for KKNPP 1000 MW) but probability-weighted BI cost is lowest in the sector due to reliability',
    ],
    underwritingConsiderations: [
      'Sum insured (turbine island): ₹200–500 Cr per unit depending on size (220 MW vs 1000 MW)',
      'Indemnity period: 36 months mandatory (includes AERB investigation + restart approval time)',
      'Nuclear-specific BI clause: "regulatory shutdown extension" must be explicitly covered in policy wording',
      'Nuclear exclusion buyback: turbine hall fire, transformer failure, generator winding burnout — all insurable standard MB perils',
      'Key exclusion: reactor vessel, core, fuel, radioactive contamination — covered under Indian Nuclear Insurance Pool (INIP)',
    ],
    historicalContext: 'India\'s nuclear programme began in 1969 (TAPS-1). Despite international isolation (1974–2008 due to sanctions), NPCIL indigenised the PHWR technology and achieved world-class CUF. Post-2008 India-US nuclear deal enabled VVER imports. The sector is now set for massive expansion — government targets 100 GW by 2047.',
  },
  solar: {
    title: 'Solar — Risk Context',
    icon: '☀️',
    color: '#F99D27',
    keyRiskNarrative: 'Solar is India\'s fastest-growing technology (88 GW → 162 GW in 2 years) but faces a maturing risk profile. Hailstorm damage has emerged as the dominant loss driver post-2020 — GCube data shows 54% of global solar insurance costs come from hail (despite only 1.4% of claims by volume). India\'s Rajasthan-MP hail corridor is now the world\'s highest-risk zone for solar. Grid curtailment and DISCOM payment delays are non-insurable but material commercial risks.',
    whatToWatch: [
      'March–April hail season in Rajasthan/MP/UP — pre-monsoon convective storms with 40–60mm hailstones',
      'BCD (40% import duty) impact on module replacement costs and timeline during claims — adds ₹5–10 Cr and 2 months per 100 MW',
      'ALMM (Approved List) compliance — restricts replacement module options during claims, forcing domestic sourcing only',
      'Tracker auto-stow reliability — systems that fail to stow in cyclone/storm events lose 40% more modules',
      'DC arc flash fire risk — connector degradation in hot climates. Rajasthan/Gujarat dry conditions accelerate fire spread',
    ],
    actionableInsights: [
      'Hail sublimits must be adequate — ₹350+ Cr loss in single March 2023 event (Bhadla corridor). Token sublimits are insufficient',
      'Parametric hail covers (Swiss Re model, triggered by radar data) provide 72-hour payout vs 6–9 months for traditional claims',
      'EL (Electroluminescence) imaging within 48 hours post-event detects hidden micro-cracks that visual inspection misses (30% latent damage)',
      'Tracker plants need mandatory stow-test certificate before each cyclone season — stow failure is a preventable loss',
    ],
    underwritingConsiderations: [
      'Sum insured per 100 MW: ₹350–450 Cr (modules + inverters + BOS). Dominated by module cost (~70%)',
      'Hail sublimit: recommend 80–100% of module value (not a token 10% sublimit)',
      'Deductible structure: ₹50 Lakh per occurrence (not annual aggregate) for utility-scale',
      'BCD/ALMM clause: policy should acknowledge 2-month additional lead time for compliant module replacement',
      'BI: CUF-based (18% = ~4.3 hours/day at full rated). Daily revenue per 100 MW: ₹25–35 Lakh',
    ],
    historicalContext: 'India went from 3 GW solar (2015) to 162 GW (Jun 2026) — a 50× increase in 11 years. The insurance market is still adapting. Hail emerged as the dominant peril only from 2020 onwards as large-scale installations in Rajasthan matured. The March 2023 Bhadla event (₹350 Cr, 600 MW) was a watershed moment for Indian solar insurance.',
  },
  wind: {
    title: 'Wind — Risk Context',
    icon: '💨',
    color: '#005B75',
    keyRiskNarrative: 'India\'s 57 GW wind fleet is concentrated in 4 states (TN, GJ, KA, RJ). Cyclone exposure (Gujarat/TN coasts) is the #1 severity driver — Cyclone Tauktae (2021) caused ₹500 Cr industry loss. Lightning is the #1 frequency driver (45% of claims by volume). Gearbox serial defects on older sub-2MW turbines (Suzlon S111, Gamesa G97) have caused portfolio-level losses. The shift to larger turbines (3–5 MW) introduces new risk patterns.',
    whatToWatch: [
      'Cyclone season (May–December for Arabian Sea, Oct–Dec for Bay of Bengal) — Gujarat and TN coasts most exposed',
      'Lightning season (monsoon Jun–Sep) — blade tip receptor damage. 45% of wind claims by number',
      'Repowering transition — old sub-MW turbines (1990s vintage) have no spares. Stuck between non-functional and regulatory delay for repowering',
      'Crane availability — only 10–15 large cranes (500T+) available in India. 3–6 month wait post-major-event. Dominates BI duration',
      'CUF improvement with larger rotors (3–5 MW) — higher generation per unit but also higher per-unit replacement cost',
    ],
    actionableInsights: [
      'Crane pre-booking agreements (annual retainers) reduce BI claim duration by 50%. Recommend as risk improvement',
      'Design wind speed class matters: Class IIA (52 m/s) on Gujarat coast is INADEQUATE — Class IA (70 m/s) required. Survey must verify',
      'Lightning Protection System (LPS) upgrades reduce blade damage frequency by 70% — can be mandated as risk improvement',
      'Serial defect clauses are essential for fleet policies — Suzlon S111 blade debonding (2019–21) affected 200+ turbines across India',
    ],
    underwritingConsiderations: [
      'Sum insured per 3 MW WTG: ₹15–25 Cr (nacelle, blades, tower). Blade is ~30% of cost',
      'Named storm/cyclone sublimit: adequate for portfolio loss (₹50–200 Cr for 100-turbine portfolio)',
      '72-hour waiting period deductible for BI (not annual deductible) — standard market practice for wind',
      'Seasonal BI: if blade replacement misses monsoon wind season (Jun–Sep), full year generation revenue lost',
      'Crane hire costs: ₹50 Lakh–1 Cr per mobilisation. Include in sum insured or as additional cover',
    ],
    historicalContext: 'India was a wind pioneer (4th globally in 2010). The industry was built on small turbines (250 kW–2 MW). The fleet is now aging — 15,000+ turbines are 15–25 years old with limited spare availability. Repowering policy has been slow. Modern installations (3–5 MW) have better CUF but higher individual unit exposure.',
  },
  hydro: {
    title: 'Hydro — Risk Context',
    icon: '💧',
    color: '#003D50',
    keyRiskNarrative: 'India\'s 47 GW large hydro fleet is concentrated in the Himalayan states (HP, UK, JK, SK, AR). The primary risk is catastrophic flood/GLOF — the 2021 Chamoli disaster (₹1,500 Cr) demonstrated the extreme end. Day-to-day, silt erosion of turbine runners is the universal operational challenge for Himalayan projects. The sector faces regulatory headwinds (environmental clearances) and long construction timelines (8–15 years). Pumped storage (new) introduces different risk characteristics.',
    whatToWatch: [
      'Monsoon season (Jun–Sep) — peak generation but also peak flood/landslide risk. 60% of annual hydro revenue in 4 months',
      'Glacial lake monitoring (post-Chamoli 2021) — CWC/GSI now track potential GLOF sources for all Himalayan projects',
      'Silt concentration during monsoon — above 5000 ppm, turbine runners should be shut to prevent catastrophic erosion',
      'Dam Safety Act 2021 compliance — mandatory inspections, EAPs, instrumentation upgrades for all large dams',
      'Pumped storage expansion (Tehri PSP, Greenko Pinnapuram) — new asset class with limited Indian operational experience',
    ],
    actionableInsights: [
      'Hydro BI is SEASONAL — loss during May–September costs 60% of annual revenue even if repair takes only 4 months. Valuation must use seasonal generation profile',
      'Access road destruction accompanies 80% of major Himalayan hydro losses — "prevention of access" BI clause essential',
      'BHEL/Andritz runner replacement: 12–18 months fabrication. Pre-booking runner fabrication slots at BHEL reduces BI by 3–4 months',
      'Silt abrasion is EXCLUDED (gradual deterioration) but sudden runner blade FRACTURE from cavitation IS insurable — wording precision critical',
    ],
    underwritingConsiderations: [
      'Sum insured per 250 MW unit: ₹80–150 Cr (turbine-generator + penstock + civil works)',
      'Indemnity period: 36 months for Himalayan projects (access + fabrication + monsoon window)',
      'Dam body: typically EXCLUDED from standard PAR. Separate cover or acceptance required',
      'Seasonal BI weighting: agree generation profile at inception — monsoon months valued 3–4× winter months',
      'GLOF/flash flood: emerging peril. Recommend parametric trigger based on river gauge data for rapid payout',
    ],
    historicalContext: 'Indian hydro development began with Bhakra (1963). The sector grew steadily to 47 GW but new projects face 8–15 year construction timelines, environmental opposition, and geological surprises. The 2013 Uttarakhand floods (₹3,000 Cr sector loss) and 2021 Chamoli GLOF were watershed events that reshaped the insurance approach for Himalayan hydro.',
  },
  gas: {
    title: 'Gas/CCGT — Risk Context',
    icon: '🔥',
    color: '#F99D27',
    keyRiskNarrative: 'India has 25 GW of gas-fired capacity but operates at only 22.8% PLF due to chronic domestic gas shortage. The fleet is effectively a stranded asset — built for gas that never materialized. BI exposure is paradoxically low (plants already aren\'t generating revenue). Key risks are hot gas path component degradation from cycling (start-stop operation) and long-term preservation challenges for idle equipment.',
    whatToWatch: [
      'LNG import price volatility — plants can become economically viable during gas price dips, suddenly increasing operational risk exposure',
      'Hot gas path (combustion liners, transition pieces) degradation from thermal cycling — each start-stop cycle ages components',
      'Preservation of idle equipment — generators, transformers, and gas turbines require active preservation even when not operating',
      'Government gas allocation policy changes — sudden allocation can restart plants with minimal preparation time',
    ],
    actionableInsights: [
      'BI cover has limited value for gas plants at <25% PLF — revenue to be insured is already minimal',
      'MD cover still required — the ASSET exists and can be damaged even if not generating revenue. Sum insured should be reinstatement value',
      'GE/Siemens Long-Term Service Agreements (LTSA) often cover hot gas path components — verify scope vs insurance overlap',
      'Conversion to hydrogen/ammonia co-firing being discussed for some plants — would change risk profile entirely if implemented',
    ],
    underwritingConsiderations: [
      'Sum insured per 400 MW CCGT block: ₹300–450 Cr (2 GTs + 1 ST + HRSGs + BOP)',
      'BI basis: use ACTUAL generation revenue (not installed capacity potential) — at 22% PLF, BI exposure is much lower than rated',
      'GE/Siemens LTSA scope check: if OEM covers hot gas path, reduce premium for those components',
      'Idle preservation risk: if plant has been idle >2 years without proper preservation, increase loading for recommissioning damage',
    ],
    historicalContext: 'India\'s gas fleet was built in anticipation of domestic KG-D6 production that disappointed. The 25 GW fleet operates at a fraction of capacity. GAIL/ONGC attempts to import LNG have not changed economics fundamentally. The fleet may find new life as hydrogen-ready infrastructure in the 2030s.',
  },
  other: {
    title: 'Other (Lignite/Diesel/Biomass) — Risk Context',
    icon: '🌿',
    color: '#4CAF50',
    keyRiskNarrative: 'The "Other" category covers lignite (6.7 GW, NLC India dominant), diesel (0.7 GW, island territories), and biomass (11.4 GW, distributed small plants). Lignite plants face fuel-quality variability and ash-handling challenges. Biomass faces fuel supply disruption (seasonal agricultural waste availability). Diesel is declining and mostly for backup/island systems.',
    whatToWatch: [
      'NLC India lignite mine productivity — mine-mouth power depends on consistent lignite extraction',
      'Biomass fuel aggregation — agricultural waste supply is seasonal and fragmented, creating fuel interruption risk',
      'Lignite plants face same emission norms as coal — FGD compliance deadline approaching',
      'Diesel generation declining to near-zero on mainland — only relevant for A&N Islands and Lakshadweep',
    ],
    actionableInsights: [
      'Lignite plants are essentially mine-mouth thermal — combine property risk assessment with mining risk assessment',
      'Biomass plants (<50 MW typically) have lower individual exposure but face fuel supply disruption that is NOT a standard insured peril',
      'NLC India fleet is aging (some units 30+ years) — similar BHEL maintenance and failure patterns as coal',
    ],
    underwritingConsiderations: [
      'Lignite: same as coal thermal for turbine island — same BHEL equipment, same failure modes',
      'Biomass: lower sum insured per plant (₹30–80 Cr for 20–50 MW). Fuel supply interruption excluded',
      'Diesel: minimal exposure. Island systems have unique logistics risk (spare delivery via ship/air)',
    ],
    historicalContext: 'Lignite has been mined at Neyveli since 1956 — NLC is one of India\'s oldest power utilities. Biomass emerged as a distributed RE technology in the 2000s. Both face uncertain futures as solar economics undercut their generation costs.',
  },
};

function SourceRiskContext({ powerSource }: { powerSource: string }) {
  const ctx = SOURCE_CONTEXT[powerSource] ?? SOURCE_CONTEXT['all'];
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="icici-card p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl" style={{ backgroundColor: ctx.color }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{ctx.icon}</span>
          <div>
            <h3 className="text-sm font-black text-gray-800">{ctx.title}</h3>
            <p className="text-[11px] text-gray-400">Analytical context for insurance underwriting and risk assessment</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] font-bold text-icici-navy px-3 py-1.5 rounded-lg border border-icici-navy/20 hover:bg-icici-navy/5"
        >
          {showDetails ? '▲ Less' : '▼ Full Analysis'}
        </button>
      </div>

      {/* Key Narrative — always visible */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
        <p className="text-[12px] text-gray-700 leading-relaxed">{ctx.keyRiskNarrative}</p>
      </div>

      {/* What to Watch */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">👁️ What to Watch</h4>
        <div className="space-y-1.5">
          {ctx.whatToWatch.slice(0, showDetails ? undefined : 3).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px]">
              <span className="text-amber-500 mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
          {!showDetails && ctx.whatToWatch.length > 3 && (
            <button onClick={() => setShowDetails(true)} className="text-[11px] text-icici-navy font-bold hover:underline ml-5">
              + {ctx.whatToWatch.length - 3} more signals →
            </button>
          )}
        </div>
      </div>

      {/* Expanded sections */}
      {showDetails && (
        <>
          {/* Actionable Insights */}
          <div className="mb-4">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">💡 Actionable Insights</h4>
            <div className="space-y-2">
              {ctx.actionableInsights.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100 text-[12px]">
                  <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Underwriting Considerations */}
          <div className="mb-4">
            <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">🛡️ Underwriting Considerations</h4>
            <div className="space-y-1.5">
              {ctx.underwritingConsiderations.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="text-icici-navy flex-shrink-0">•</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Context */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <h4 className="text-[11px] font-bold text-blue-800 uppercase mb-1">📚 Historical Context</h4>
            <p className="text-[12px] text-gray-700 leading-relaxed">{ctx.historicalContext}</p>
          </div>
        </>
      )}
    </div>
  );
}
