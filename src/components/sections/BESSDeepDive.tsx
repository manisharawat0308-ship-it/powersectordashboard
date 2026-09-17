import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';

interface BESSData {
  marketOverview: any;
  technology: any;
  riskProfile: any;
  insuranceFramework: any;
  transformerCrisis: any;
}

export function BESSDeepDive() {
  const { data, isLoading } = useQuery({
    queryKey: ['bess', 'deep-dive'],
    queryFn: () => fetchJson<BESSData>('/data/capacity/bess-deep-dive.json'),
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'technology' | 'risks' | 'insurance' | 'transformer'>('overview');

  if (isLoading || !data) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl bg-gradient-to-r from-red-600 via-amber-500 to-green-600" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-xl">🔋</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Battery Energy Storage Systems (BESS) — Deep Dive</h2>
            <p className="text-[12px] text-gray-400">Technology · Chemistry · Risks · Insurance · India Market · Transformer Crisis</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-xl font-black text-red-600">{data.marketOverview.indiaInstalledGWh} GWh</div>
            <div className="text-[10px] text-gray-500">India Installed (2026)</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-xl font-black text-amber-600">{data.marketOverview.indiaTargetGWh2030} GWh</div>
            <div className="text-[10px] text-gray-500">India Target 2030</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-xl font-black text-green-600">${data.marketOverview.averageCostPerKWh2026USD}/kWh</div>
            <div className="text-[10px] text-gray-500">Cell Cost 2026</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-xl font-black text-blue-600">{data.marketOverview.costReductionSince2020Pct}%</div>
            <div className="text-[10px] text-gray-500">Cost Reduction Since 2020</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {[
            { id: 'overview' as const, label: '📊 Market & Players' },
            { id: 'technology' as const, label: '🔬 Chemistry & Tech' },
            { id: 'risks' as const, label: '⚠️ Risks & Incidents' },
            { id: 'insurance' as const, label: '🛡️ Insurance' },
            { id: 'transformer' as const, label: '⚡ Transformer Crisis' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Market Overview Tab ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">India BESS Market — Key Drivers</h3>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
              {data.marketOverview.keyDrivers.map((driver: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100 text-[12px]">
                  <span className="text-green-600 font-bold flex-shrink-0">{i + 1}.</span>
                  <span className="text-gray-700">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Key Players in India BESS</h3>
            <div className="space-y-2">
              {data.marketOverview.keyPlayers.map((player: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-[11px] flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-[12px] font-black text-gray-800">{player.name}</div>
                    <div className="text-[11px] text-gray-500">{player.type} · {player.note}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[13px] font-black text-red-700">{player.capacityMWh} MWh</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="icici-card p-4 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-[12px] text-gray-700"><strong>Dominant Chemistry:</strong> {data.marketOverview.dominantChemistry}</p>
            <p className="text-[12px] text-gray-700 mt-1"><strong>Secondary:</strong> {data.marketOverview.secondaryChemistry}</p>
            <p className="text-[12px] text-gray-700 mt-1"><strong>Emerging:</strong> {data.marketOverview.emergingChemistry}</p>
          </div>
        </div>
      )}

      {/* ═══ Technology Tab ═══ */}
      {activeTab === 'technology' && (
        <div className="space-y-4">
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Battery Chemistries Compared</h3>
            {data.technology.chemistries.map((chem: any) => (
              <ChemistryCard key={chem.id} chem={chem} />
            ))}
          </div>

          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">BESS System Components</h3>
            <div className="space-y-2">
              {data.technology.systemComponents.map((comp: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[12px] font-black text-gray-800">{comp.component}</span>
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">{comp.insuranceRelevance.slice(0, 60)}…</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mb-1">{comp.description}</p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-gray-500"><strong>OEMs:</strong> {comp.oems}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1">
                    <strong>Typical Failure:</strong> {comp.typicalFailure}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Risks Tab ═══ */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {data.riskProfile.primaryRisks.map((risk: any, i: number) => (
            <div key={i} className="icici-card p-5 border-l-4" style={{ borderLeftColor: risk.severity === 'CRITICAL' ? '#B02A30' : risk.severity === 'HIGH' ? '#E65100' : '#F99D27' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-gray-800">{risk.risk}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${risk.severity === 'CRITICAL' ? 'bg-red-600' : risk.severity === 'HIGH' ? 'bg-orange-600' : 'bg-amber-500'}`}>
                    {risk.severity}
                  </span>
                  <span className="text-[11px] text-gray-500">Probability: {risk.probability}</span>
                </div>
              </div>
              <p className="text-[12px] text-gray-700 mb-3">{risk.description}</p>

              {/* Root Causes */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 mb-3">
                <h4 className="text-[11px] font-bold text-amber-800 uppercase mb-1">Root Causes</h4>
                <ul className="space-y-0.5">
                  {risk.rootCauses.map((cause: string, j: number) => (
                    <li key={j} className="text-[11px] text-gray-700 flex items-start gap-1"><span className="text-amber-500 flex-shrink-0">•</span>{cause}</li>
                  ))}
                </ul>
              </div>

              {/* Indian Context */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-3">
                <h4 className="text-[11px] font-bold text-blue-800 uppercase mb-1">🇮🇳 India Context</h4>
                <p className="text-[11px] text-gray-700">{risk.indianContext}</p>
              </div>

              {/* Financial Impact */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 mb-3">
                <h4 className="text-[11px] font-bold text-purple-800 uppercase mb-1">💰 Financial Impact</h4>
                <p className="text-[11px] text-gray-700">{risk.financialImpact}</p>
              </div>

              {/* Prevention */}
              <div className="p-3 rounded-xl bg-green-50 border border-green-100 mb-3">
                <h4 className="text-[11px] font-bold text-green-800 uppercase mb-1">🛡️ Prevention</h4>
                <p className="text-[11px] text-gray-700">{risk.prevention}</p>
              </div>

              {/* Incidents */}
              {risk.incidents && risk.incidents.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <h4 className="text-[11px] font-bold text-red-800 uppercase mb-1">📋 Real Incidents</h4>
                  <ul className="space-y-1">
                    {risk.incidents.map((inc: string, j: number) => (
                      <li key={j} className="text-[11px] text-gray-700 flex items-start gap-1"><span className="text-red-500 flex-shrink-0">▸</span>{inc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Secondary Risks */}
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Secondary Risks</h3>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
              {data.riskProfile.secondaryRisks.map((risk: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-black text-gray-800">{risk.risk}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">{risk.severity}</span>
                  </div>
                  <p className="text-[11px] text-gray-600">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Insurance Tab ═══ */}
      {activeTab === 'insurance' && (
        <div className="space-y-4">
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">BESS Insurance Coverage Structure</h3>
            <div className="space-y-3">
              {Object.entries(data.insuranceFramework.coverageStructure).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 rounded-xl bg-green-50 border border-green-100">
                  <h4 className="text-[12px] font-black text-green-800 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <p className="text-[11px] text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Key Exclusions</h3>
            <ul className="space-y-1.5">
              {data.insuranceFramework.keyExclusions.map((excl: string, i: number) => (
                <li key={i} className="text-[12px] text-gray-700 flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-red-500 flex-shrink-0 font-bold">✗</span>{excl}
                </li>
              ))}
            </ul>
          </div>

          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Underwriting Considerations (Survey Points)</h3>
            <div className="space-y-1.5">
              {data.insuranceFramework.underwritingConsiderations.map((item: string, i: number) => (
                <div key={i} className="text-[12px] text-gray-700 flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-blue-600 flex-shrink-0 font-bold">{i + 1}.</span>{item}
                </div>
              ))}
            </div>
          </div>

          <div className="icici-card p-4 bg-purple-50 border-l-4 border-purple-400">
            <h4 className="text-[12px] font-bold text-purple-800 mb-1">Premium Range</h4>
            <p className="text-[12px] text-gray-700">{data.insuranceFramework.typicalPremiumRange}</p>
            <h4 className="text-[12px] font-bold text-purple-800 mt-2 mb-1">Claims Experience</h4>
            <p className="text-[12px] text-gray-700">{data.insuranceFramework.claimsExperience}</p>
          </div>
        </div>
      )}

      {/* ═══ Transformer Crisis Tab ═══ */}
      {activeTab === 'transformer' && (
        <div className="space-y-4">
          <div className="icici-card p-5 border-l-4 border-red-500">
            <h3 className="text-sm font-black text-gray-800 mb-2">⚡ {data.transformerCrisis.title}</h3>
            <p className="text-[12px] text-gray-700 leading-relaxed mb-4">{data.transformerCrisis.overview}</p>

            <h4 className="text-[11px] font-bold text-red-800 uppercase mb-2">Impact on RE & BESS Sector</h4>
            <div className="space-y-1.5 mb-4">
              {data.transformerCrisis.impactOnRE.map((impact: string, i: number) => (
                <div key={i} className="text-[12px] text-gray-700 flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-red-500 flex-shrink-0">⚠️</span>{impact}
                </div>
              ))}
            </div>
          </div>

          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-3">Transformer Manufacturers — Backlog Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 text-[11px] uppercase">
                    <th className="text-left p-2">Manufacturer</th>
                    <th className="text-right p-2">Capacity (MVA/yr)</th>
                    <th className="text-right p-2">Current Backlog</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transformerCrisis.manufacturers.map((mfr: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-800">{mfr.name}</td>
                      <td className="p-2 text-right text-gray-600">{mfr.capacity}</td>
                      <td className="p-2 text-right">
                        <span className={`font-bold px-2 py-0.5 rounded ${parseInt(mfr.backlog) > 12 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {mfr.backlog}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="icici-card p-5 border-l-4 border-amber-400">
            <h3 className="text-sm font-black text-gray-800 mb-2">Insurance Implications</h3>
            <p className="text-[12px] text-gray-700 mb-3">{data.transformerCrisis.insuranceImplication}</p>
            <h4 className="text-[11px] font-bold text-amber-800 uppercase mb-2">Recommendations</h4>
            <div className="space-y-1.5">
              {data.transformerCrisis.recommendations.map((rec: string, i: number) => (
                <div key={i} className="text-[12px] text-gray-700 flex items-start gap-2">
                  <span className="text-amber-600 flex-shrink-0 font-bold">{i + 1}.</span>{rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chemistry Card ──────────────────────────────────────────────────────────

function ChemistryCard({ chem }: { chem: any }) {
  const [expanded, setExpanded] = useState(false);
  const fireColors = { LOW: 'bg-green-100 text-green-700', 'VERY LOW': 'bg-green-100 text-green-700', HIGH: 'bg-red-100 text-red-700' };
  const fireColor = (fireColors as any)[chem.fireRisk.split(' ')[0]] || 'bg-amber-100 text-amber-700';

  return (
    <div className="p-4 rounded-xl border border-gray-200 mb-3 bg-white">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <h4 className="text-[13px] font-black text-gray-800">{chem.name}</h4>
          <p className="text-[11px] text-gray-500">Market share: {chem.share}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${fireColor}`}>
            Fire Risk: {chem.fireRisk.split(' ')[0]}
          </span>
          <span className="text-gray-300">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* Specs */}
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-2 text-[11px]">
            <div><span className="font-bold text-gray-500">Energy Density:</span> <span className="text-gray-700">{chem.energyDensity}</span></div>
            <div><span className="font-bold text-gray-500">Cycle Life:</span> <span className="text-gray-700">{chem.cycleLife}</span></div>
            <div><span className="font-bold text-gray-500">Calendar Life:</span> <span className="text-gray-700">{chem.calendarLife}</span></div>
            <div><span className="font-bold text-gray-500">Efficiency:</span> <span className="text-gray-700">{chem.roundTripEfficiency}</span></div>
            <div><span className="font-bold text-gray-500">Runaway Temp:</span> <span className="text-gray-700">{chem.thermalRunawayTemp}</span></div>
            <div><span className="font-bold text-gray-500">Cost/kWh:</span> <span className="text-gray-700">{chem.costPerKWh}</span></div>
          </div>

          {/* Advantages/Disadvantages */}
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-green-50 border border-green-100">
              <h5 className="text-[10px] font-bold text-green-800 uppercase mb-1">Advantages</h5>
              <ul className="space-y-0.5">{chem.advantages.map((a: string, i: number) => <li key={i} className="text-[11px] text-gray-700 flex items-start gap-1"><span className="text-green-600 flex-shrink-0">✓</span>{a}</li>)}</ul>
            </div>
            <div className="p-2 rounded-lg bg-red-50 border border-red-100">
              <h5 className="text-[10px] font-bold text-red-800 uppercase mb-1">Disadvantages</h5>
              <ul className="space-y-0.5">{chem.disadvantages.map((d: string, i: number) => <li key={i} className="text-[11px] text-gray-700 flex items-start gap-1"><span className="text-red-500 flex-shrink-0">▸</span>{d}</li>)}</ul>
            </div>
          </div>

          {/* Indian Context */}
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <h5 className="text-[10px] font-bold text-blue-800 uppercase mb-1">🇮🇳 India Context</h5>
            <p className="text-[11px] text-gray-700">{chem.indianContext}</p>
          </div>

          {/* Fire Risk */}
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
            <h5 className="text-[10px] font-bold text-amber-800 uppercase mb-1">🔥 Fire Risk Assessment</h5>
            <p className="text-[11px] text-gray-700">{chem.fireRisk}</p>
          </div>
        </div>
      )}
    </div>
  );
}
