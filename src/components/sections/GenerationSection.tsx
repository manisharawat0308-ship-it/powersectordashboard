import { useState } from 'react';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { useCapacityData } from '@/hooks/useCapacityData';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { formatBU, formatSourceLabel } from '@/utils/formatting';
import { getSourceColor, getCategoryColor } from '@/utils/colors';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

export function GenerationSection() {
  const { data: genData, isLoading: genLoading } = useGenerationData();
  const { data: plfData, isLoading: plfLoading } = usePLFCUFData();
  const { data: capData } = useCapacityData();
  const { sectorView, getSectorLabel, isSourceInView } = useSectorFilter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (genLoading || plfLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-28 bg-gray-200 rounded-xl" /><div className="h-72 bg-gray-200 rounded-xl" /></div>;
  }

  if (!genData) {
    return <div className="icici-card p-6 border-l-4 border-icici-maroon"><p className="font-bold text-icici-maroon">Generation — Data temporarily unavailable</p></div>;
  }

  const filteredSources = genData.bySource.filter((s) => isSourceInView(s.source)).sort((a, b) => b.generationBU - a.generationBU);
  const filteredTotal = filteredSources.reduce((sum, s) => sum + s.generationBU, 0);

  const pieData = filteredSources.map((s) => ({
    name: formatSourceLabel(s.source),
    value: s.generationBU,
    source: s.source,
    pct: filteredTotal > 0 ? ((s.generationBU / filteredTotal) * 100).toFixed(1) : '0',
  }));

  const barData = filteredSources.map((s) => ({
    name: formatSourceLabel(s.source),
    generation: s.generationBU,
    source: s.source,
  }));

  // Capacity vs Generation comparison
  const comparisonData = genData.bySource
    .filter((g) => isSourceInView(g.source))
    .map((g) => {
      const capEntry = capData?.bySource.find((c) => c.source === g.source);
      const capMW = capEntry ? capEntry.capacityMW : 0;
      const totalCapMW = capData?.bySource.reduce((sum, c) => sum + c.capacityMW, 0) || 1;
      const capPct = (capMW / totalCapMW) * 100;
      const genPct = filteredTotal > 0 ? (g.generationBU / filteredTotal) * 100 : 0;
      const loadFactor = plfData?.plf[g.source as keyof typeof plfData.plf] || plfData?.cuf[g.source as keyof typeof plfData.cuf] || 0;
      return { name: formatSourceLabel(g.source), source: g.source, capPct: Math.round(capPct * 10) / 10, genPct: Math.round(genPct * 10) / 10, loadFactor, gap: Math.round((genPct - capPct) * 10) / 10 };
    }).sort((a, b) => b.genPct - a.genPct);

  return (
    <div className="space-y-5">
      {/* Hero Summary */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-icici-navy" />
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-4 items-center">
          <div>
            <p className="text-[14px] font-bold text-gray-500 uppercase">{getSectorLabel()} — Generation</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900 animate-[pulse_3s_ease-in-out_1]">{formatBU(filteredTotal)}</span>
              <span className="text-sm font-bold text-gray-400">BU</span>
            </div>
            <p className="text-[14px] text-gray-400 mt-1">FY 2024-25 • {genData.dataSource}</p>
          </div>
          {sectorView === 'all' && (
            <div className="laptop:col-span-2">
              <div className="flex rounded-full overflow-hidden h-8">
                {genData.byCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-center text-[14px] text-white font-bold" style={{ width: `${cat.percentageOfTotal}%`, backgroundColor: getCategoryColor(cat.category as any) }}>
                    {cat.category === 'fossil' ? '🔥' : '🌿'} {formatBU(cat.generationBU)} BU ({cat.percentageOfTotal.toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Donut + Bar side by side */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5">
        {/* Left: Donut Chart — animated, interactive */}
        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Generation Share</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
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
                {pieData.map((entry, index) => (
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
              <Tooltip formatter={(value: number, name: string) => [`${formatBU(value)} BU`, name]} contentStyle={{ borderRadius: '10px', fontFamily: 'Mulish', fontSize: '12px' }} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish', fontWeight: 600, lineHeight: '24px', paddingLeft: '8px' }}
                formatter={(value: string) => {
                  const item = pieData.find(p => p.name === value);
                  return `${value} — ${item?.pct || 0}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Horizontal Bar Chart */}
        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Generation by Source (BU)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ left: 75, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Mulish' }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11, fontFamily: 'Mulish', fontWeight: 600 }} />
              <Tooltip formatter={(value: number) => [`${formatBU(value)} BU`, 'Generation']} contentStyle={{ borderRadius: '8px', fontFamily: 'Mulish' }} />
              <Bar dataKey="generation" radius={[0, 8, 8, 0]} animationBegin={200} animationDuration={1000} animationEasing="ease-out" label={{ position: 'right', fontSize: 10, fontFamily: 'Mulish', fontWeight: 700, formatter: (v: number) => `${formatBU(v)} BU` }}>
                {barData.map((entry) => (
                  <Cell key={entry.source} fill={getSourceColor(entry.source as any)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PLF / CUF — Gauge Style Cards */}
      {plfData && (
        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-4">Load Factor — How efficiently is each source used?</h3>
          <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3">
            {(sectorView === 'all' || sectorView === 'fossil') && Object.entries(plfData.plf).map(([source, value]) => (
              <div key={source} className="p-3 rounded-xl bg-white border-2 border-gray-100 text-center hover:border-gray-300 hover:scale-105 transition-all duration-300 cursor-default group">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  {/* Background ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                  {/* Spinning colored ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-[spin_8s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]" style={{ borderRightColor: getSourceColor(source as any), borderBottomColor: getSourceColor(source as any), borderLeftColor: getSourceColor(source as any) }} />
                  {/* Center value */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black" style={{ color: getSourceColor(source as any) }}>{value}%</span>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-gray-700">{formatSourceLabel(source)}</div>
                <div className="text-[14px] text-gray-400 font-semibold">PLF</div>
              </div>
            ))}
            {(sectorView === 'all' || sectorView === 'non_fossil') && Object.entries(plfData.cuf).map(([source, value]) => (
              <div key={source} className="p-3 rounded-xl bg-white border-2 border-gray-100 text-center hover:border-gray-300 hover:scale-105 transition-all duration-300 cursor-default group">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  {/* Background ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                  {/* Spinning colored ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-[spin_8s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]" style={{ borderRightColor: getSourceColor(source as any), borderBottomColor: getSourceColor(source as any), borderLeftColor: getSourceColor(source as any) }} />
                  {/* Center value */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black" style={{ color: getSourceColor(source as any) }}>{value}%</span>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-gray-700">{formatSourceLabel(source)}</div>
                <div className="text-[14px] text-gray-400 font-semibold">CUF</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capacity vs Generation Comparison — Visual Cards */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-icici-navy via-icici-maroon to-icici-orange rounded-t-xl" />
        <h3 className="text-sm font-black text-gray-800 mb-1 mt-1">⚡ Capacity vs 🔌 Generation</h3>
        <p className="text-[14px] text-gray-500 mb-5">Comparing installed share vs actual generation share — reveals efficiency gaps</p>

        <div className="space-y-3">
          {comparisonData.map((item) => {
            const gapLabel = item.gap > 0 ? `+${item.gap}%` : `${item.gap}%`;
            const isOverPerformer = item.gap > 0;
            return (
              <div key={item.name} className="p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSourceColor(item.source as any) }} />
                    <span className="text-xs font-bold text-gray-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[14px] font-black px-2 py-0.5 rounded-full ${isOverPerformer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {isOverPerformer ? '▲' : '▼'} {gapLabel}
                    </span>
                    {item.loadFactor > 0 && (
                      <span className="text-[14px] font-semibold text-gray-400">PLF/CUF: {item.loadFactor}%</span>
                    )}
                  </div>
                </div>
                {/* Dual bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-500 w-16">Capacity</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                        style={{ width: `${Math.max(item.capPct * 1.5, 3)}%`, backgroundColor: '#005B75' }}
                      >
                        <span className="text-[14px] font-black text-white">{item.capPct}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-gray-500 w-16">Generation</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                        style={{ width: `${Math.max(item.genPct * 1.5, 3)}%`, backgroundColor: '#B02A30' }}
                      >
                        <span className="text-[14px] font-black text-white">{item.genPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend + Insight */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-icici-navy" /><span className="text-[14px] font-semibold text-gray-600">Capacity %</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-icici-maroon" /><span className="text-[14px] font-semibold text-gray-600">Generation %</span></div>
          <div className="flex items-center gap-1.5"><span className="text-[14px] font-bold text-green-600">▲ Over-performs</span></div>
          <div className="flex items-center gap-1.5"><span className="text-[14px] font-bold text-red-500">▼ Under-performs</span></div>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <p className="text-[14px] text-gray-700">
            <strong className="text-amber-800">💡 Key Insight:</strong> Coal has 47% capacity but generates 62% (runs 24/7 baseload). Solar has 20% capacity but only 8% generation (daylight constraint). Nuclear is most efficient at 79% CUF.
          </p>
        </div>
      </div>
    </div>
  );
}


