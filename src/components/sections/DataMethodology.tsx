import { useCapacityData } from '@/hooks/useCapacityData';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { useNuclearPlants, useNuclearPipeline } from '@/hooks/useNuclearData';

interface DataSourceCardProps {
  icon: string;
  name: string;
  url: string;
  description: string;
  lastUpdated: string;
  coverage: string;
  unit: string;
  availability: 'available' | 'partial' | 'unavailable';
}

function DataSourceCard({ icon, name, url, description, lastUpdated, coverage, unit, availability }: DataSourceCardProps) {
  const avail = {
    available:   { bg: 'bg-green-50', text: 'text-green-700', label: 'Available', dot: 'bg-green-500' },
    partial:     { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Partial',   dot: 'bg-amber-500' },
    unavailable: { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Not integrated', dot: 'bg-gray-400' },
  }[availability];

  return (
    <div className="p-4 rounded-xl bg-white border border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-black text-icici-navy hover:underline">
            {name} ↗
          </a>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${avail.bg} ${avail.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
          {avail.label}
        </span>
      </div>
      <p className="text-[12px] text-gray-600 mb-2">{description}</p>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div><span className="font-bold text-gray-500">Updated:</span> <span className="text-gray-700">{lastUpdated}</span></div>
        <div><span className="font-bold text-gray-500">Coverage:</span> <span className="text-gray-700">{coverage}</span></div>
        <div><span className="font-bold text-gray-500">Units:</span> <span className="text-gray-700">{unit}</span></div>
      </div>
    </div>
  );
}

interface KPIDefProps {
  name: string;
  formula: string;
  unit: string;
  interpretation: string;
}

function KPIDef({ name, formula, unit, interpretation }: KPIDefProps) {
  return (
    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-black text-gray-800">{name}</span>
        <span className="text-[11px] font-bold bg-icici-navy/10 text-icici-navy px-2 py-0.5 rounded flex-shrink-0">{unit}</span>
      </div>
      <code className="text-[11px] text-icici-maroon bg-red-50 px-2 py-0.5 rounded mt-1 block font-mono">{formula}</code>
      <p className="text-[12px] text-gray-600 mt-1">{interpretation}</p>
    </div>
  );
}

export function DataMethodology() {
  const { data: capData }     = useCapacityData();
  const { data: genData }     = useGenerationData();
  const { data: plfData }     = usePLFCUFData();
  const { data: nuclearData } = useNuclearPlants();
  const { data: pipelineData }= useNuclearPipeline();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-icici-navy" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-icici-navy flex items-center justify-center text-xl">📖</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Data & Methodology</h2>
            <p className="text-[12px] text-gray-400">Sources · Coverage · Definitions · Calculations · Missing data indicators</p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">Data Sources</h3>
        <div className="space-y-3">
          <DataSourceCard
            icon="🏛️"
            name="Central Electricity Authority (CEA)"
            url="https://cea.nic.in"
            description="Primary source for installed capacity by source, state, and ownership. Also provides plant-level generation, PLF, and historical capacity data."
            lastUpdated={capData?.lastUpdated ?? 'Jun 2026'}
            coverage="All India, State-wise, Source-wise"
            unit="MW / GW / BU"
            availability="available"
          />
          <DataSourceCard
            icon="🌞"
            name="Ministry of New & Renewable Energy (MNRE)"
            url="https://mnre.gov.in"
            description="Renewable energy capacity additions, physical progress, ALMM list, and target data."
            lastUpdated="Jun 2026"
            coverage="Solar, Wind, Small Hydro, Biomass"
            unit="MW / GW"
            availability="available"
          />
          <DataSourceCard
            icon="⚛️"
            name="Nuclear Power Corporation of India (NPCIL)"
            url="https://npcil.nic.in"
            description="Nuclear plant capacity, unit-wise status, generation data. Annual reports and press releases."
            lastUpdated={nuclearData?.lastUpdated ?? 'Jun 2026'}
            coverage="All operating and UC nuclear plants"
            unit="MW / BU"
            availability="available"
          />
          <DataSourceCard
            icon="🏗️"
            name="Department of Atomic Energy (DAE)"
            url="https://dae.gov.in"
            description="Nuclear pipeline — approved, planned capacity. Annual reports and government announcements."
            lastUpdated={pipelineData?.lastUpdated ?? 'Jun 2026'}
            coverage="Approved and planned nuclear projects"
            unit="MW / GW"
            availability="partial"
          />
          <DataSourceCard
            icon="💰"
            name="PRAAPTI — Payment Ratification and Analysis"
            url="https://www.praapti.in"
            description="DISCOM payment data, outstanding dues. Required for Market Risk scoring."
            lastUpdated="Not integrated"
            coverage="DISCOM-wise dues"
            unit="₹ Crore"
            availability="unavailable"
          />
          <DataSourceCard
            icon="🌡️"
            name="India Meteorological Department (IMD)"
            url="https://mausam.imd.gov.in"
            description="Climate hazard data — cyclone, flood, heat. Site-level hazard data required for Climate Risk scoring."
            lastUpdated="Not integrated"
            coverage="State/district level"
            unit="Categorical"
            availability="unavailable"
          />
          <DataSourceCard
            icon="⚡"
            name="POSOCO / NLDC"
            url="https://posoco.in"
            description="Grid operation data, curtailment reports, demand-supply data."
            lastUpdated="Not integrated"
            coverage="Regional / national"
            unit="MW / MU"
            availability="unavailable"
          />
        </div>
      </div>

      {/* KPI Definitions */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">KPI Definitions</h3>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-3">
          <KPIDef
            name="Installed Capacity"
            formula="Σ capacityMW for all sources in scope"
            unit="GW / MW"
            interpretation="Total nameplate capacity of power plants. Does not represent actual generation capability."
          />
          <KPIDef
            name="Generation"
            formula="Σ generationBU for all sources in scope"
            unit="BU (Billion Units)"
            interpretation="Actual electrical energy produced. 1 BU = 1 TWh = 1,000 MU = 1,000,000 kWh."
          />
          <KPIDef
            name="Plant Load Factor (PLF)"
            formula="(Generation MU × 1000) / (Capacity MW × Hours) × 100"
            unit="%"
            interpretation="Used for thermal sources. Ratio of actual generation to maximum possible generation. Higher = more efficient utilisation."
          />
          <KPIDef
            name="Capacity Utilisation Factor (CUF)"
            formula="(Generation MU × 1000) / (Capacity MW × Hours) × 100"
            unit="%"
            interpretation="Used for renewable sources. Same calculation as PLF. Nuclear CUF ~78% is high relative to most technologies."
          />
          <KPIDef
            name="Renewable Share (Capacity)"
            formula="Non-Fossil Capacity GW / Total Capacity GW × 100"
            unit="%"
            interpretation="Share of installed capacity from non-fossil sources including nuclear, solar, wind, hydro, biomass."
          />
          <KPIDef
            name="Nuclear Share (Generation)"
            formula="Nuclear Generation BU / Total Generation BU × 100"
            unit="%"
            interpretation="Nuclear's contribution to total electricity generation. Currently ~3.2% despite government push for expansion."
          />
          <KPIDef
            name="HHI (Concentration Index)"
            formula="Σ (share_i)² where share_i is % of total"
            unit="0–10,000"
            interpretation="Herfindahl-Hirschman Index. 0 = perfectly diverse, 10,000 = single source. Used in Supply and Geographic risk scoring."
          />
          <KPIDef
            name="Risk Score"
            formula="Weighted average of scored categories"
            unit="0–100"
            interpretation="0 = no measured risk, 100 = maximum observed risk. Not an absolute rating — relative analytical indicator only."
          />
        </div>
      </div>

      {/* Missing Data Register */}
      <div className="icici-card p-5 border-l-4 border-amber-300">
        <h3 className="text-sm font-black text-gray-800 mb-3">Missing Data Register</h3>
        <p className="text-[12px] text-gray-500 mb-3">
          The following data would materially improve dashboard completeness. Figures are not fabricated — components display "Data unavailable" where inputs are missing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 text-[11px] uppercase">
                <th className="text-left p-2">Missing Data</th>
                <th className="text-center p-2">Impact</th>
                <th className="text-left p-2">Potential Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                { data: 'Forced outage rates by plant/source', impact: 'High', source: 'CEA annual reports (partial)', section: 'Operational Risk' },
                { data: 'Power purchase price / tariff data', impact: 'High', source: 'CERC, state DISCOM tariff orders', section: 'Market Risk' },
                { data: 'DISCOM outstanding dues (source-wise)', impact: 'High', source: 'PRAAPTI portal', section: 'Market Risk' },
                { data: 'Site-level climate hazard scores', impact: 'Medium', source: 'IMD, NDMA, Munich Re NatCat', section: 'Climate Risk' },
                { data: 'Monthly PLF trend (multi-year)', impact: 'Medium', source: 'CEA monthly reports', section: 'PLF Trend' },
                { data: 'Plant-level generation data', impact: 'Medium', source: 'NLDC/RLDC, NPCIL annual report', section: 'Plant Intelligence' },
                { data: 'Peak demand vs available supply', impact: 'Medium', source: 'POSOCO, CEA demand reports', section: 'Supply Risk' },
                { data: 'Grid curtailment data by source', impact: 'Medium', source: 'POSOCO monthly reports', section: 'Operational Risk' },
                { data: 'Historical generation by source (multi-year)', impact: 'Low', source: 'CEA annual generation reports', section: 'YoY Analysis' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2 text-gray-700">{row.data}</td>
                  <td className="p-2 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${row.impact === 'High' ? 'bg-red-50 text-red-700' : row.impact === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                      {row.impact}
                    </span>
                  </td>
                  <td className="p-2 text-gray-500">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Methodology Summary */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">Risk Scoring Methodology Summary</h3>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
          {[
            { cat: 'Operational', weight: '25%', basis: 'PLF/CUF vs technology benchmarks. Gap normalized 0-100. Higher gap = higher risk.', available: true },
            { cat: 'Supply / Capacity', weight: '25%', basis: 'HHI of technology concentration. Scale: HHI 800 (low) → 6000 (high risk).', available: true },
            { cat: 'Project / Development', weight: '15%', basis: 'Under-construction MW as % of operating base. 0% = 0 risk, >200% = near-max.', available: true },
            { cat: 'Geographic', weight: '15%', basis: 'State HHI of installed capacity. Scale: 400 (diverse) → 4000 (concentrated).', available: true },
            { cat: 'Market', weight: '10%', basis: 'Power price volatility + DISCOM payment data. Not scored — data not integrated.', available: false },
            { cat: 'Climate / Physical', weight: '10%', basis: 'Capacity-weighted state-level climate hazard proxy. Site-level data not available.', available: true },
          ].map((row) => (
            <div key={row.cat} className={`p-3 rounded-xl border ${row.available ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-black text-gray-800">{row.cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-icici-navy bg-icici-navy/10 px-2 py-0.5 rounded">{row.weight}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${row.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {row.available ? '✓ Scored' : '✗ No data'}
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-gray-600">{row.basis}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-gray-700">
          <strong>Overall Score:</strong> Weighted average of scored categories only. If a category lacks data it is excluded and remaining weights are renormalized.
          Scores are 0–100: ≤30 Low · ≤55 Moderate · ≤75 High · &gt;75 Critical.
          This is an analytical tool only — not a professional risk rating or insurance recommendation.
        </div>
      </div>

      {/* Freshness table */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">Dataset Freshness</h3>
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
          {[
            { dataset: 'National Capacity',    lastUpdated: capData?.lastUpdated,     dataAsOf: capData?.dataAsOf },
            { dataset: 'Generation',           lastUpdated: genData?.lastUpdated,     dataAsOf: genData?.dataAsOf },
            { dataset: 'PLF / CUF',            lastUpdated: plfData?.lastUpdated,     dataAsOf: plfData?.dataAsOf },
            { dataset: 'Nuclear Plants',       lastUpdated: nuclearData?.lastUpdated, dataAsOf: nuclearData?.dataAsOf },
          ].map((d) => (
            <div key={d.dataset} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase">{d.dataset}</div>
              <div className="text-[12px] font-black text-gray-800 mt-1">{d.dataAsOf ?? '—'}</div>
              <div className="text-[11px] text-gray-400">Updated: {d.lastUpdated ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
