import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCapacityData } from '@/hooks/useCapacityData';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { useRiskData } from '@/hooks/useRiskData';
import { useFilterStore } from '@/store/filterStore';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { SectorStory } from '@/components/sections/SectorStory';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { WhatChanged } from '@/components/sections/WhatChanged';
import { FilterPanel } from '@/components/layout/FilterPanel';
import { getSourceColor } from '@/utils/colors';
import { formatSourceLabel, formatGW } from '@/utils/formatting';
import { powerSliceToSources } from '@/types/filters';

interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
  period?: string;
  change?: string;
  changeDir?: 'up' | 'down' | 'neutral';
  tooltip?: string;
  accentColor?: string;
  source?: string;
}

function KPICard({ label, value, unit, period, change, changeDir, tooltip, accentColor = '#B02A30', source }: KPICardProps) {
  const changeColor = changeDir === 'up' ? 'text-blue-600' : changeDir === 'down' ? 'text-amber-600' : 'text-gray-500';
  const changeIcon  = changeDir === 'up' ? '↑' : changeDir === 'down' ? '↓' : '→';

  return (
    <div className="icici-card p-4 relative overflow-visible group hover:z-20" title={tooltip}>
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: accentColor }} />
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-gray-900">{value}</span>
        {unit && <span className="text-[13px] font-semibold text-gray-400">{unit}</span>}
      </div>
      {period && <div className="text-[11px] text-gray-400 mt-0.5">{period}</div>}
      {change && (
        <div className={`text-[11px] font-bold mt-1 ${changeColor}`}>
          {changeIcon} {change}
        </div>
      )}
      {source && (
        <div className="text-[9px] text-gray-300 mt-1 truncate" title={source}>📌 {source}</div>
      )}
      {tooltip && (
        <div className="absolute inset-0 bg-gray-900/90 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-3 pointer-events-none z-30">
          <p className="text-[11px] text-white text-center leading-relaxed">{tooltip}</p>
        </div>
      )}
    </div>
  );
}

export function IndustryOverview() {
  const { data, isLoading }      = useCapacityData();
  const { data: genData }        = useGenerationData();
  const { data: plfData }        = usePLFCUFData();
  const { overall: riskOverall } = useRiskData();
  const powerSource              = useFilterStore((s) => s.powerSource);
  const { sectorView, getSectorLabel, isSourceInView } = useSectorFilter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading || !data) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  }

  // Apply power source filter on top of sector view
  const scopeSources = powerSliceToSources(powerSource);
  const filteredSources = data.bySource.filter((s) => {
    if (!isSourceInView(s.source)) return false;
    if (scopeSources) return scopeSources.includes(s.source as any);
    return true;
  });
  const filteredTotalGW = filteredSources.reduce((sum, s) => sum + s.capacityMW, 0) / 1000;

  // Installed-capacity pie data (mirrors the Generation page donut)
  const capacityPieData = [...filteredSources]
    .sort((a, b) => b.capacityMW - a.capacityMW)
    .map((s) => ({
      name: formatSourceLabel(s.source),
      value: s.capacityMW / 1000, // GW
      source: s.source,
      pct: filteredTotalGW > 0 ? ((s.capacityMW / 1000 / filteredTotalGW) * 100).toFixed(1) : '0',
    }));

  const fossilGW      = data.byCategory.find(c => c.category === 'fossil')?.capacityGW ?? 0;
  const nonFossilGW   = data.byCategory.find(c => c.category === 'non_fossil')?.capacityGW ?? 0;
  const fossilPct     = data.byCategory.find(c => c.category === 'fossil')?.percentageShare ?? 0;
  const nonFossilPct  = data.byCategory.find(c => c.category === 'non_fossil')?.percentageShare ?? 0;

  // Derived KPIs
  const totalCapMW        = data.bySource.reduce((s, r) => s + r.capacityMW, 0);
  const nuclearCapMW      = data.bySource.find(s => s.source === 'nuclear')?.capacityMW ?? 8180;
  const nuclearShare      = totalCapMW > 0 ? (nuclearCapMW / totalCapMW * 100).toFixed(1) : '—';
  const renewableShare    = nonFossilPct.toFixed(1);
  const totalGenBU        = genData?.totalGenerationBU ?? 1771.7;
  const nuclearGenBU      = genData?.bySource.find(s => s.source === 'nuclear')?.generationBU ?? 56.3;
  const nuclearGenShare   = totalGenBU > 0 ? (nuclearGenBU / totalGenBU * 100).toFixed(1) : '—';
  const coalPLF           = plfData?.plf?.coal ?? 64.2;
  const nuclearCUF        = plfData?.cuf?.nuclear ?? 78.6;

  return (
    <div className="space-y-5">
      {/* Filter Panel */}
      <FilterPanel />

      {/* Hero Stats row */}
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-4">
        {/* Left: Key Metric */}
        <div className="icici-card p-5 flex flex-col justify-center relative overflow-visible">
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{
            background: sectorView === 'fossil' ? '#B02A30' : sectorView === 'non_fossil' ? '#005B75' : 'linear-gradient(90deg, #B02A30, #005B75)',
          }} />
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{getSectorLabel()}{powerSource !== 'all' ? ` · ${powerSource.charAt(0).toUpperCase() + powerSource.slice(1)}` : ''}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-gray-900">{formatGW(filteredTotalGW)}</span>
            <span className="text-base font-bold text-gray-400">GW</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Installed Capacity · {data.dataAsOf || 'FY24-25'}</p>
        </div>

        {/* Middle: Fossil vs Non-Fossil split */}
        {sectorView === 'all' && powerSource === 'all' ? (
          <div className="icici-card p-5 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Energy Split</p>
            <div className="flex rounded-full overflow-hidden h-7 shadow-inner">
              <div className="flex items-center justify-center text-[12px] text-white font-bold" style={{ width: `${fossilPct}%`, backgroundColor: '#B02A30' }}>
                🔥 {fossilGW.toFixed(0)} GW ({fossilPct.toFixed(0)}%)
              </div>
              <div className="flex items-center justify-center text-[12px] text-white font-bold" style={{ width: `${nonFossilPct}%`, backgroundColor: '#005B75' }}>
                🌿 {nonFossilGW.toFixed(0)} GW ({nonFossilPct.toFixed(0)}%)
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>Fossil</span>
              <span>Non-Fossil</span>
            </div>
          </div>
        ) : (
          <div className="icici-card p-5 flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Sources</p>
            <div className="flex rounded-lg overflow-hidden h-7 border border-gray-200">
              {filteredSources.sort((a, b) => b.capacityMW - a.capacityMW).slice(0, 4).map(s => {
                const pct = filteredTotalGW > 0 ? (s.capacityMW / (filteredTotalGW * 1000)) * 100 : 0;
                return (
                  <div key={s.source} className="flex items-center justify-center text-[11px] text-white font-bold" style={{ width: `${pct}%`, backgroundColor: getSourceColor(s.source as any) }}>
                    {pct >= 15 ? formatSourceLabel(s.source) : ''}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Quick stats */}
        <div className="icici-card p-5 flex flex-col justify-center">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Key Facts</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <div className="text-sm font-black text-icici-maroon">22.5×</div>
              <div className="text-[10px] text-gray-400">Growth since 1975</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <div className="text-sm font-black text-icici-navy">53.5%</div>
              <div className="text-[10px] text-gray-400">Private Sector</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <div className="text-sm font-black text-green-700">{totalGenBU.toFixed(0)}</div>
              <div className="text-[10px] text-gray-400">BU Generated FY25</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <div className="text-sm font-black text-amber-600">36</div>
              <div className="text-[10px] text-gray-400">States & UTs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Vintage Banner */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 flex-wrap">
        <span className="text-[11px] font-bold text-blue-700">📅 Data as of: {data.dataAsOf || 'FY 2024-25 (Mar 2025)'}</span>
        <span className="text-[10px] text-blue-500">· Source: {data.dataSource || 'CEA'} · Updated: {data.lastUpdated || '2026-06-30'}</span>
        {data.note && <span className="text-[10px] text-blue-600 italic w-full mt-0.5">💡 {data.note}</span>}
      </div>

      {/* Installed Capacity — Donut + Source Breakdown side by side */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5">
        {/* Left: Donut Chart — mirrors the Generation page */}
        <div className="icici-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700">Installed Capacity Share</h3>
            <span className="text-[11px] text-gray-400">{formatGW(filteredTotalGW)} GW total</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={capacityPieData}
                dataKey="value"
                nameKey="name"
                cx="45%" cy="50%"
                innerRadius={55} outerRadius={110}
                paddingAngle={3}
                animationBegin={0}
                animationDuration={1400}
                animationEasing="ease-out"
                label={false}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {capacityPieData.map((entry, index) => (
                  <Cell
                    key={entry.source}
                    fill={getSourceColor(entry.source as any)}
                    stroke="#fff"
                    strokeWidth={activeIndex === index ? 3 : 2}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    style={{ transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center', transition: 'all 0.3s ease' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${formatGW(value)} GW`, name]} contentStyle={{ borderRadius: '10px', fontFamily: 'Mulish', fontSize: '12px' }} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish', fontWeight: 600, lineHeight: '22px', paddingLeft: '8px' }}
                formatter={(value: string) => {
                  const item = capacityPieData.find(p => p.name === value);
                  return `${value} — ${item?.pct || 0}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Source Breakdown — detailed list */}
        <div className="icici-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700">Source-wise Capacity</h3>
            <span className="text-[11px] text-gray-400">{data.dataSource}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {capacityPieData.map(s => (
              <div key={s.source} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getSourceColor(s.source as any) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-gray-700 truncate">{s.name}</div>
                  <div className="text-[10px] text-gray-400">{s.value.toFixed(1)} GW · {s.pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extended KPI Grid */}
      <div className="grid grid-cols-2 tablet:grid-cols-4 laptop:grid-cols-5 gap-3">
        <KPICard
          label="Total Generation"
          value={totalGenBU.toFixed(0)}
          unit="BU"
          period="FY 2024-25"
          tooltip="Total electrical energy generated across all sources. 1 BU = 1 TWh = 1 billion kWh."
          accentColor="#005B75"
          source="CEA (cea.nic.in)"
        />
        <KPICard
          label="Renewable Share"
          value={renewableShare}
          unit="%"
          period="of installed capacity"
          change="↑ expanding"
          changeDir="up"
          tooltip="Non-fossil capacity (solar + wind + hydro + nuclear + biomass) as % of total installed capacity."
          accentColor="#4CAF50"
          source="CEA Mar 2025"
        />
        <KPICard
          label="Nuclear Share (Cap)"
          value={nuclearShare}
          unit="%"
          period="of installed capacity"
          tooltip="Nuclear's share of total installed capacity. Small by capacity but high by generation due to 78%+ CUF."
          accentColor="#7B1FA2"
          source="CEA / NPCIL"
        />
        <KPICard
          label="Nuclear Gen Share"
          value={nuclearGenShare}
          unit="%"
          period="of total generation"
          tooltip="Nuclear's share of total electricity generation — higher than its capacity share due to baseload operation."
          accentColor="#7B1FA2"
          source="CEA FY25"
        />
        <KPICard
          label="Coal PLF"
          value={`${coalPLF}`}
          unit="%"
          period="FY 2024-25"
          tooltip="Plant Load Factor for coal — ratio of actual generation to maximum possible. 64% = coal ran at 64% of its rated capacity on average."
          accentColor="#B02A30"
          source="CEA PLF report"
        />
        <KPICard
          label="Nuclear CUF"
          value={`${nuclearCUF}`}
          unit="%"
          period="FY 2024-25"
          tooltip="Capacity Utilisation Factor for nuclear — highest of any technology in India's power sector."
          accentColor="#7B1FA2"
          source="NPCIL AR FY25"
        />
        <KPICard
          label="Solar CUF"
          value={`${plfData?.cuf?.solar ?? 18.2}`}
          unit="%"
          period="FY 2024-25"
          tooltip="Solar CUF reflects daylight-hours limitation. Despite 18% CUF, solar is the fastest growing capacity addition."
          accentColor="#F99D27"
          source="CEA"
        />
        <KPICard
          label="Wind CUF"
          value={`${plfData?.cuf?.wind ?? 21.5}`}
          unit="%"
          period="FY 2024-25"
          tooltip="Wind CUF reflects seasonal and geographic variation in wind speeds across India."
          accentColor="#005B75"
        />
        <KPICard
          label="Overall Risk Score"
          value={riskOverall.score !== null ? `${riskOverall.score}` : 'N/A'}
          unit={riskOverall.score !== null ? '/100' : ''}
          period={riskOverall.label}
          tooltip="Weighted risk score across Operational, Supply, Project, Geographic, and Climate risk categories. Market risk excluded — price data unavailable."
          accentColor={riskOverall.color}
        />
        <KPICard
          label="Nuclear Pipeline"
          value="7.1"
          unit="GW"
          period="under construction"
          tooltip="Total nuclear capacity currently under construction — Kudankulam-3&4, PFBR, GHAVP, Kovvada-1&2."
          accentColor="#7B1FA2"
        />
      </div>

      {/* What Changed */}
      <WhatChanged />

      {/* Sector Story */}
      <SectorStory />

      {/* Timeline */}
      <div className="icici-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-icici-navy" />
          <h3 className="text-xs font-bold text-gray-700">Growth Journey & Future Outlook</h3>
        </div>
        <TimelineSection />
      </div>
    </div>
  );
}
