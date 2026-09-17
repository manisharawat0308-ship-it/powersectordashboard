import { useState, useMemo } from 'react';
import { useNuclearPlants, useNuclearPipeline } from '@/hooks/useNuclearData';
import { useGenerationData } from '@/hooks/useGenerationData';
import { useCapacityData } from '@/hooks/useCapacityData';
import { getSourceColor } from '@/utils/colors';
import { formatSourceLabel } from '@/utils/formatting';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend, PieChart, Pie,
} from 'recharts';

const NUCLEAR_COLOR = '#7B1FA2';
const STATUS_COLORS: Record<string, string> = {
  operating:         '#4CAF50',
  under_construction:'#F99D27',
  shutdown:          '#9E9E9E',
  approved:          '#005B75',
  planned:           '#7B1FA2',
};

const STATUS_LABELS: Record<string, string> = {
  operating:         'Operating',
  under_construction:'Under Construction',
  shutdown:          'Shutdown',
  approved:          'Approved',
  planned:           'Planned',
};

export function NuclearSection() {
  const { data: plantsData, isLoading: plantsLoading } = useNuclearPlants();
  const { data: pipelineData, isLoading: pipelineLoading } = useNuclearPipeline();
  const { data: genData } = useGenerationData();
  const { data: capData } = useCapacityData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'plants' | 'pipeline' | 'new-entrants' | 'states'>('overview');

  const isLoading = plantsLoading || pipelineLoading;

  // --- Derived data ---
  const totalGenBU = genData?.totalGenerationBU ?? 1771.7;
  const nuclearGenBU = plantsData?.generationFY2025BU ?? 56.3;
  const nuclearCuf = plantsData?.cuf ?? 78.6;
  const totalCapMW = capData?.bySource.reduce((s, r) => s + r.capacityMW, 0) ?? 450290;
  const nuclearCapMW = plantsData?.totalOperatingMW ?? 8180;
  const nuclearCapShare = totalCapMW > 0 ? (nuclearCapMW / totalCapMW) * 100 : 1.8;
  const nuclearGenShare = totalGenBU > 0 ? (nuclearGenBU / totalGenBU) * 100 : 3.2;

  // Historical trend data
  const capacityTrend = pipelineData?.historicalCapacity.map((d) => ({
    year: d.year,
    capacityGW: +(d.capacityMW / 1000).toFixed(2),
  })) ?? [];

  const generationTrend = pipelineData?.historicalGeneration.map((d) => ({
    year: d.year,
    generationBU: d.generationBU,
    cuf: d.cuf,
  })) ?? [];

  // Plants filtered by search
  const filteredPlants = useMemo(() => {
    if (!plantsData) return [];
    const q = searchQuery.toLowerCase();
    return plantsData.plants.filter(
      (p) =>
        p.plantName.toLowerCase().includes(q) ||
        p.stateName.toLowerCase().includes(q) ||
        p.operator.toLowerCase().includes(q) ||
        p.technology.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [plantsData, searchQuery]);

  // Mix comparison data
  const mixData = useMemo(() => {
    if (!capData || !genData) return [];
    return capData.bySource
      .map((s) => {
        const gen = genData.bySource.find((g) => g.source === s.source);
        return {
          name: formatSourceLabel(s.source),
          source: s.source,
          capShare: +((s.capacityMW / totalCapMW) * 100).toFixed(1),
          genShare: gen ? +((gen.generationBU / totalGenBU) * 100).toFixed(1) : 0,
        };
      })
      .sort((a, b) => b.capShare - a.capShare);
  }, [capData, genData, totalCapMW, totalGenBU]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-28 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: NUCLEAR_COLOR }} />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: NUCLEAR_COLOR }}>
            ⚛️
          </div>
          <div>
            <h2 className="text-base font-black text-gray-800">Nuclear Power — Deep Dive</h2>
            <p className="text-[12px] text-gray-400">India's nuclear energy sector · NPCIL/BHAVINI · Data as of {plantsData?.dataAsOf ?? 'Jun 2026'}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Operating Capacity', value: `${(nuclearCapMW / 1000).toFixed(2)} GW`, sub: `${nuclearCapShare.toFixed(1)}% of national`, color: NUCLEAR_COLOR },
            { label: 'Generation FY25', value: `${nuclearGenBU} BU`, sub: `${nuclearGenShare.toFixed(1)}% of national`, color: '#005B75' },
            { label: 'Capacity Factor', value: `${nuclearCuf}%`, sub: 'Highest in sector', color: '#4CAF50' },
            { label: 'Under Construction', value: `${((plantsData?.totalUnderConstructionMW ?? 7000) / 1000).toFixed(1)} GW`, sub: `+${(((plantsData?.totalUnderConstructionMW ?? 7000) / nuclearCapMW) * 100).toFixed(0)}% of operating`, color: '#F99D27' },
          ].map((k) => (
            <div key={k.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{k.label}</div>
              <div className="text-xl font-black mt-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Additional KPIs */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
          {[
            { label: 'Approved Pipeline', value: `${((plantsData?.totalApprovedMW ?? 26000) / 1000).toFixed(0)} GW`, sub: 'Sanctioned projects' },
            { label: 'Planned (2047)', value: '100 GW', sub: 'Govt target' },
            { label: 'Operating Plants', value: `${plantsData?.plants.filter(p => p.status === 'operating').length ?? 7}`, sub: 'Across 5 states' },
            { label: 'Operating Units', value: `${plantsData?.plants.filter(p => p.status === 'operating').reduce((s, p) => s + p.units.filter(u => u.status === 'operating').length, 0) ?? 22}`, sub: 'Active reactors' },
          ].map((k) => (
            <div key={k.label} className="p-3 rounded-xl bg-white border border-gray-200">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{k.label}</div>
              <div className="text-lg font-black text-gray-800 mt-0.5">{k.value}</div>
              <div className="text-[11px] text-gray-400">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {[
          { id: 'overview' as const, label: '📊 Overview & Trends' },
          { id: 'plants'   as const, label: '🏭 Plants & Reactors' },
          { id: 'pipeline' as const, label: '🔭 Pipeline' },
          { id: 'new-entrants' as const, label: '🏢 New Entrants & News' },
          { id: 'states'   as const, label: '🗺️ State Analysis' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
              activeTab === t.id
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === t.id ? { backgroundColor: NUCLEAR_COLOR } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Capacity & Generation Trends side by side */}
          <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5">
            {/* Capacity Trend */}
            <div className="icici-card p-5">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Nuclear Installed Capacity (GW)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={capacityTrend} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} unit=" GW" width={50} />
                  <Tooltip formatter={(v: number) => [`${v} GW`, 'Capacity']} />
                  <Line type="monotone" dataKey="capacityGW" stroke={NUCLEAR_COLOR} strokeWidth={2} dot={{ r: 3, fill: NUCLEAR_COLOR }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Generation Trend */}
            <div className="icici-card p-5">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Nuclear Generation (BU) & CUF (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={generationTrend} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[30, 65]} unit=" BU" width={50} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[55, 95]} unit="%" width={35} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left"  type="monotone" dataKey="generationBU" name="Generation (BU)" stroke={NUCLEAR_COLOR} strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="cuf"          name="CUF (%)"         stroke="#4CAF50"    strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nuclear vs Other Sources — Capacity Mix vs Generation Mix */}
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-1">Nuclear in the Mix — Capacity Share vs Generation Share</h3>
            <p className="text-[12px] text-gray-400 mb-4">
              Nuclear punches above its capacity weight due to high CUF ({nuclearCuf}%). Generation share ({nuclearGenShare.toFixed(1)}%) exceeds capacity share ({nuclearCapShare.toFixed(1)}%).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mixData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 80]} />
                <Tooltip formatter={(v: number, n: string) => [`${v}%`, n === 'capShare' ? 'Capacity Share' : 'Generation Share']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => v === 'capShare' ? 'Capacity Share' : 'Generation Share'} />
                <Bar dataKey="capShare" name="capShare" radius={[4, 4, 0, 0]}>
                  {mixData.map((e) => (
                    <Cell key={e.source} fill={e.source === 'nuclear' ? NUCLEAR_COLOR : getSourceColor(e.source as any)} opacity={0.6} />
                  ))}
                </Bar>
                <Bar dataKey="genShare" name="genShare" radius={[4, 4, 0, 0]}>
                  {mixData.map((e) => (
                    <Cell key={e.source} fill={e.source === 'nuclear' ? NUCLEAR_COLOR : getSourceColor(e.source as any)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data note */}
          <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            📌 {plantsData?.note}
          </div>
        </div>
      )}

      {/* ── Plants Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'plants' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="icici-card p-4">
            <input
              type="text"
              placeholder="Search plants by name, state, operator, technology or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-icici-maroon/30"
            />
          </div>

          {/* Plants Cards */}
          {filteredPlants.map((plant) => (
            <div key={plant.plantId} className="icici-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-gray-800">{plant.plantName}</h3>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: STATUS_COLORS[plant.status] ?? '#9E9E9E' }}
                    >
                      {STATUS_LABELS[plant.status] ?? plant.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    📍 {plant.location} · {plant.stateName} · {plant.operator} · {plant.technology}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: NUCLEAR_COLOR }}>{plant.totalCapacityMW} MW</div>
                  {plant.generationFY2025BU > 0 && (
                    <div className="text-[11px] text-gray-400">{plant.generationFY2025BU} BU FY25</div>
                  )}
                  {plant.cuf && (
                    <div className="text-[11px] text-green-600 font-bold">CUF {plant.cuf}%</div>
                  )}
                </div>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-2 tablet:grid-cols-4 gap-2">
                {plant.units.map((unit) => (
                  <div
                    key={unit.unit}
                    className="p-2 rounded-lg border text-[11px]"
                    style={{ borderColor: STATUS_COLORS[unit.status] + '55', backgroundColor: STATUS_COLORS[unit.status] + '11' }}
                  >
                    <div className="font-black text-gray-800">{unit.unit}</div>
                    <div className="text-gray-600">{unit.technology}</div>
                    <div className="font-bold" style={{ color: STATUS_COLORS[unit.status] }}>
                      {unit.capacityMW} MW · {STATUS_LABELS[unit.status] ?? unit.status}
                    </div>
                    {unit.commissioningYear && (
                      <div className="text-gray-400">Since {unit.commissioningYear}</div>
                    )}
                  </div>
                ))}
              </div>

              {plant.note && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                  ℹ️ {plant.note}
                </p>
              )}
            </div>
          ))}

          {filteredPlants.length === 0 && (
            <div className="icici-card p-8 text-center">
              <p className="text-gray-400 text-sm">No plants match "{searchQuery}"</p>
            </div>
          )}

          <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            Source: {plantsData?.dataSource}
          </div>
        </div>
      )}

      {/* ── Pipeline Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'pipeline' && pipelineData && (
        <div className="space-y-4">
          {/* Pipeline funnel visual */}
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-4">Nuclear Capacity Pipeline</h3>
            <div className="space-y-3">
              {pipelineData.pipeline.map((stage) => {
                const maxMW = Math.max(...pipelineData.pipeline.map((s) => s.totalMW));
                const widthPct = (stage.totalMW / maxMW) * 100;
                const colorMap: Record<string, string> = {
                  operating: '#4CAF50',
                  under_construction: '#F99D27',
                  approved: '#005B75',
                  planned: '#7B1FA2',
                };
                const col = colorMap[stage.stage] ?? '#9E9E9E';
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-gray-700">{stage.label}</span>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="font-black" style={{ color: col }}>{(stage.totalMW / 1000).toFixed(1)} GW</span>
                        <span className="text-gray-400">{stage.projectCount} projects · {stage.unitCount} units</span>
                      </div>
                    </div>
                    <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center px-3 text-[11px] font-bold text-white transition-all"
                        style={{ width: `${widthPct}%`, backgroundColor: col }}
                      >
                        {widthPct > 20 ? `${(stage.totalMW / 1000).toFixed(1)} GW` : ''}
                      </div>
                    </div>
                    {/* Projects list */}
                    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-1.5 mt-2">
                      {stage.projects.map((proj: any) => (
                        <PipelineProjectCard key={proj.name} proj={proj} />
                      ))}
                    </div>
                    {stage.note && (
                      <p className="text-[11px] text-gray-400 italic mt-1">{stage.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            ⚠️ {pipelineData.note}
          </div>
        </div>
      )}

      {/* ── New Entrants & News Tab ─────────────────────────────────────── */}
      {activeTab === 'new-entrants' && pipelineData && (
        <div className="space-y-4">
          {/* New Entrants */}
          {(pipelineData as any).newEntrants && (
            <div className="icici-card p-5">
              <h3 className="text-sm font-black text-gray-800 mb-1">{(pipelineData as any).newEntrants.title}</h3>
              <p className="text-[11px] text-gray-500 mb-4">{(pipelineData as any).newEntrants.note}</p>
              <div className="space-y-2">
                {(pipelineData as any).newEntrants.players.map((player: any, i: number) => (
                  <NewEntrantCard key={i} player={player} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Nuclear News */}
          {(pipelineData as any).nuclearNews && (
            <div className="icici-card p-5">
              <h3 className="text-sm font-black text-gray-800 mb-3">📰 Nuclear Sector News & Developments</h3>
              <div className="space-y-2">
                {(pipelineData as any).nuclearNews.map((news: any, i: number) => {
                  const catColors: Record<string, string> = {
                    commissioning: 'bg-green-50 border-green-200 text-green-700',
                    policy: 'bg-blue-50 border-blue-200 text-blue-700',
                    supply_chain: 'bg-amber-50 border-amber-200 text-amber-700',
                    international: 'bg-purple-50 border-purple-200 text-purple-700',
                    construction: 'bg-teal-50 border-teal-200 text-teal-700',
                    regulatory: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                    private_sector: 'bg-orange-50 border-orange-200 text-orange-700',
                    operations: 'bg-gray-50 border-gray-200 text-gray-700',
                  };
                  const catStyle = catColors[news.category] || catColors.operations;
                  return (
                    <div key={i} className={`p-3 rounded-xl border ${catStyle.split(' ')[1]} ${catStyle.split(' ')[0]}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-gray-800">{news.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                            <span>📅 {news.date}</span>
                            <span>· {news.source}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${catStyle}`}>{news.category.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── States Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'states' && plantsData && (
        <div className="space-y-4">
          <div className="icici-card p-5">
            <h3 className="text-sm font-black text-gray-800 mb-4">Nuclear Capacity by State</h3>

            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={plantsData.stateCapacity
                  .sort((a, b) => b.operatingMW - a.operatingMW)
                  .map((s) => ({
                    name: s.stateName.length > 10 ? s.stateName.slice(0, 10) + '…' : s.stateName,
                    operating: s.operatingMW,
                    uc: s.underConstructionMW,
                    approved: s.approvedMW,
                  }))}
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit=" MW" width={55} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="operating" name="Operating" fill="#4CAF50" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="uc"        name="Under Construction" fill="#F99D27" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="approved"  name="Approved" fill="#005B75" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* State detail table */}
          <div className="icici-card p-5 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 uppercase text-[11px]">
                  <th className="text-left p-2">State</th>
                  <th className="text-right p-2">Operating</th>
                  <th className="text-right p-2">Under Construction</th>
                  <th className="text-right p-2">Approved</th>
                  <th className="text-right p-2">Plants</th>
                  <th className="text-right p-2">Units</th>
                  <th className="text-right p-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {plantsData.stateCapacity
                  .sort((a, b) => b.operatingMW + b.underConstructionMW - a.operatingMW - a.underConstructionMW)
                  .map((s) => {
                    const totalNucMW = plantsData.stateCapacity.reduce((sum, st) => sum + st.operatingMW, 0);
                    const share = totalNucMW > 0 ? (s.operatingMW / totalNucMW) * 100 : 0;
                    return (
                      <tr key={s.stateCode} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 font-bold text-gray-800">{s.stateName}</td>
                        <td className="p-2 text-right font-bold text-green-700">{s.operatingMW > 0 ? `${s.operatingMW} MW` : '—'}</td>
                        <td className="p-2 text-right font-bold text-amber-600">{s.underConstructionMW > 0 ? `${s.underConstructionMW} MW` : '—'}</td>
                        <td className="p-2 text-right text-icici-navy font-bold">{s.approvedMW > 0 ? `${(s.approvedMW / 1000).toFixed(1)} GW` : '—'}</td>
                        <td className="p-2 text-right text-gray-600">{s.plantCount}</td>
                        <td className="p-2 text-right text-gray-600">{s.unitCount}</td>
                        <td className="p-2 text-right">
                          {share > 0 ? (
                            <div className="flex items-center justify-end gap-1">
                              <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: NUCLEAR_COLOR }} />
                              </div>
                              <span className="font-bold" style={{ color: NUCLEAR_COLOR }}>{share.toFixed(0)}%</span>
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Pipeline Project Card — compact with deep-dive modal ─────────────────────

function PipelineProjectCard({ proj }: { proj: any }) {
  const [showDetail, setShowDetail] = useState(false);
  const hasDetail = proj.operator || proj.status || proj.keyMilestones;

  return (
    <>
      {/* Compact row (original style) */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px]">
        <div>
          <span className="font-bold text-gray-800">{proj.name}</span>
          <span className="text-gray-400 ml-2">{proj.stateName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="font-black text-gray-700">{(proj.capacityMW / 1000).toFixed(1)} GW</span>
          {proj.expectedYear && (
            <span className="text-gray-400">~{proj.expectedYear}</span>
          )}
          {hasDetail && (
            <button
              onClick={() => setShowDetail(true)}
              className="text-[10px] text-icici-navy font-bold bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-100 transition-all"
              title="Click for detailed project information"
            >
              ℹ️
            </button>
          )}
        </div>
      </div>

      {/* Deep-dive modal */}
      {showDetail && hasDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-800">{proj.name}</h3>
                  <p className="text-[11px] text-gray-500">{proj.stateName} · {proj.technology} · {(proj.capacityMW / 1000).toFixed(1)} GW{proj.expectedYear ? ` · Target ~${proj.expectedYear}` : ''}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>

              {/* Players & OEMs */}
              {proj.operator && (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {proj.operator && <div><span className="font-bold text-gray-500">Operator:</span><br/><span className="text-gray-700">{proj.operator}</span></div>}
                  {proj.reactorOEM && <div><span className="font-bold text-gray-500">Reactor OEM:</span><br/><span className="text-gray-700">{proj.reactorOEM}</span></div>}
                  {proj.turbineOEM && <div><span className="font-bold text-gray-500">Turbine OEM:</span><br/><span className="text-gray-700">{proj.turbineOEM}</span></div>}
                  {proj.vesselOEM && <div><span className="font-bold text-gray-500">Vessel:</span><br/><span className="text-gray-700">{proj.vesselOEM}</span></div>}
                  {proj.sgOEM && <div><span className="font-bold text-gray-500">Steam Gen:</span><br/><span className="text-gray-700">{proj.sgOEM}</span></div>}
                  {proj.fuelSource && <div><span className="font-bold text-gray-500">Fuel:</span><br/><span className="text-gray-700">{proj.fuelSource}</span></div>}
                </div>
              )}

              {proj.sites && (
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px]">
                  <span className="font-bold text-blue-800">📍 Site:</span> <span className="text-gray-700">{proj.sites}</span>
                </div>
              )}

              {proj.status && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px]">
                  <span className="font-bold text-amber-800">📋 Status:</span> <span className="text-gray-700">{proj.status}</span>
                </div>
              )}

              {proj.keyMilestones && (
                <div className="p-2 rounded-lg bg-green-50 border border-green-100 text-[11px]">
                  <span className="font-bold text-green-800">📅 Timeline:</span> <span className="text-gray-700">{proj.keyMilestones}</span>
                </div>
              )}

              {proj.marketContext && (
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-[11px]">
                  <span className="font-bold text-purple-800">🏢 Market:</span> <span className="text-gray-700">{proj.marketContext}</span>
                </div>
              )}

              <button
                onClick={() => setShowDetail(false)}
                className="w-full py-2 rounded-xl bg-icici-navy text-white font-bold text-[12px] hover:bg-icici-navy/90 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ── New Entrant Card ─────────────────────────────────────────────────────────

function NewEntrantCard({ player, index }: { player: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'Active supply chain': 'bg-green-100 text-green-700',
    'Active — NPCIL\'s primary component manufacturer': 'bg-green-100 text-green-700',
    'Active — NPCIL steam generator supplier': 'bg-green-100 text-green-700',
    'Active — DAE/NPCIL supplier': 'bg-green-100 text-green-700',
    'Active — DAE PSU': 'bg-green-100 text-green-700',
    'Positioning': 'bg-amber-100 text-amber-700',
    'Watching': 'bg-gray-100 text-gray-600',
    'Discussions': 'bg-blue-100 text-blue-700',
  };
  const statusStyle = statusColors[player.status] || 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-black text-[11px] flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-black text-gray-800">{player.name}</div>
          <div className="text-[10px] text-gray-500">{player.type}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle}`}>{player.status}</span>
        <span className="text-gray-300 text-sm">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2 text-[11px]">
          <div className="p-2 rounded-lg bg-white border border-gray-100">
            <span className="font-bold text-gray-600">Interest & Strategy:</span>
            <p className="text-gray-700 mt-0.5">{player.interest}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="font-bold text-blue-800">📅 Timeline:</span>
            <p className="text-gray-700 mt-0.5">{player.timeline}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
            <span className="font-bold text-purple-800">🏢 Market Position:</span>
            <p className="text-gray-700 mt-0.5">{player.marketPosition}</p>
          </div>
        </div>
      )}
    </div>
  );
}
