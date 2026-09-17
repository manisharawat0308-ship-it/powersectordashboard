import { useState } from 'react';
import { useCapacityData } from '@/hooks/useCapacityData';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { SummaryCard } from '@/components/common/SummaryCard';
import { DrillDownPanel } from '@/components/common/DrillDownPanel';
import { SectorStory } from '@/components/sections/SectorStory';
import { EnergyCategory } from '@/types/filters';
import { getCategoryColor, getSourceColor } from '@/utils/colors';
import { formatSourceLabel, formatMW } from '@/utils/formatting';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function CapacityOverview() {
  const { data, isLoading, error } = useCapacityData();
  const { sectorView, getSectorLabel, isSourceInView } = useSectorFilter();
  const [drillDown, setDrillDown] = useState<EnergyCategory | null>(null);
  const [expandedPie, setExpandedPie] = useState<EnergyCategory | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-28 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Capacity Overview — Data temporarily unavailable</p>
        <p className="text-sm mt-1 text-gray-600">Unable to load installed capacity data.</p>
      </div>
    );
  }

  if (drillDown) {
    const categoryData = data.bySource
      .filter((s) => s.category === drillDown)
      .map((s) => ({
        source: s.source as any,
        category: drillDown,
        capacityMW: s.capacityMW,
        percentageOfCategory: 0,
        percentageOfTotal: 0,
        isUnavailable: false,
      }));

    const categoryTotal = categoryData.reduce((sum, s) => sum + s.capacityMW, 0);
    const nationalTotal = data.totalCapacityGW * 1000;
    categoryData.forEach((s) => {
      s.percentageOfCategory = categoryTotal > 0
        ? Math.round((s.capacityMW / categoryTotal) * 1000) / 10
        : 0;
      s.percentageOfTotal = nationalTotal > 0
        ? Math.round((s.capacityMW / nationalTotal) * 1000) / 10
        : 0;
    });

    return (
      <DrillDownPanel
        category={drillDown}
        items={categoryData}
        onBack={() => setDrillDown(null)}
      />
    );
  }

  // Filter data by sector view
  const filteredSources = data.bySource.filter((s) => isSourceInView(s.source));
  const filteredTotalGW = filteredSources.reduce((sum, s) => sum + s.capacityMW, 0) / 1000;
  const filteredCategories = sectorView === 'all'
    ? data.byCategory
    : data.byCategory.filter((c) => c.category === sectorView);

  // Category-level pie data (Fossil vs Non-Fossil) — only when viewing 'all'
  const categoryPieData = filteredCategories.map((cat) => ({
    name: cat.category === 'fossil' ? '🔥 Fossil' : '🌿 Non-Fossil',
    value: cat.capacityGW * 1000,
    category: cat.category,
  }));

  // Get expanded source-level pie data for selected category
  const getExpandedPieData = () => {
    if (sectorView !== 'all') {
      // Already filtered to one category — show all sources in that category
      return filteredSources
        .sort((a, b) => b.capacityMW - a.capacityMW)
        .map((s) => ({
          name: formatSourceLabel(s.source),
          value: s.capacityMW,
          source: s.source,
        }));
    }
    if (!expandedPie) return [];
    return data.bySource
      .filter((s) => s.category === expandedPie)
      .sort((a, b) => b.capacityMW - a.capacityMW)
      .map((s) => ({
        name: formatSourceLabel(s.source),
        value: s.capacityMW,
        source: s.source,
      }));
  };

  return (
    <div className="space-y-6">
      {/* Sector Evolution Story */}
      <SectorStory />

      {/* Total Capacity - Hero Card */}
      <SummaryCard
        title={`${getSectorLabel()} — Total Installed Capacity`}
        value={filteredTotalGW}
        unit="GW"
        lastUpdated={data.lastUpdated}
        dataSource={data.dataSource}
        dataAsOf={data.dataAsOf || ''}
        accentColor={sectorView === 'fossil' ? '#B02A30' : sectorView === 'non_fossil' ? '#005B75' : '#B02A30'}
      />

      {data.note && (
        <div className="text-[14px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-2">
          💡 {data.note}
        </div>
      )}

      {/* Energy Mix Split Bar — individual sources grouped */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1">{getSectorLabel()} — Source-wise Breakdown</h3>
        <p className="text-[14px] text-gray-400 mb-3">Proportional to installed capacity</p>

        {sectorView === 'all' ? (
          <>
            {/* Fossil Bar */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-bold text-icici-maroon">🔥 Fossil — {data.byCategory.find(c => c.category === 'fossil')?.capacityGW.toFixed(1)} GW ({data.byCategory.find(c => c.category === 'fossil')?.percentageShare.toFixed(1)}%)</span>
              </div>
              <div className="relative">
              <div className="flex rounded-lg h-10 shadow-sm border border-gray-200">
                {data.bySource
                  .filter((s) => s.category === 'fossil')
                  .sort((a, b) => b.capacityMW - a.capacityMW)
                  .map((s, idx, arr) => {
                    const pct = (s.capacityMW / (data.totalCapacityGW * 1000)) * 100;
                    const catTotal = data.byCategory.find(c => c.category === 'fossil')?.capacityGW || 1;
                    const pctOfCat = (s.capacityMW / (catTotal * 1000)) * 100;
                    return (
                      <div key={s.source} className={`flex items-center justify-center text-white transition-all hover:opacity-80 cursor-pointer relative group ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}`} style={{ width: `${pctOfCat}%`, backgroundColor: getSourceColor(s.source as any), minWidth: pctOfCat > 3 ? undefined : '20px' }} onClick={() => setDrillDown('fossil')}>
                        {pctOfCat >= 12 && (<div className="text-center leading-tight"><div className="text-[14px] font-bold">{formatSourceLabel(s.source)}</div><div className="text-[14px] font-medium opacity-90">{(s.capacityMW / 1000).toFixed(1)} GW • {pct.toFixed(1)}%</div></div>)}
                        {pctOfCat < 12 && (<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[14px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">{formatSourceLabel(s.source)}: {(s.capacityMW / 1000).toFixed(1)} GW ({pct.toFixed(1)}%)</div>)}
                      </div>
                    );
                  })}
              </div>
              </div>
            </div>
            {/* Non-Fossil Bar */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-bold text-icici-navy">🌿 Non-Fossil — {data.byCategory.find(c => c.category === 'non_fossil')?.capacityGW.toFixed(1)} GW ({data.byCategory.find(c => c.category === 'non_fossil')?.percentageShare.toFixed(1)}%)</span>
              </div>
              <div className="relative">
              <div className="flex rounded-lg h-10 shadow-sm border border-gray-200">
                {data.bySource
                  .filter((s) => s.category === 'non_fossil')
                  .sort((a, b) => b.capacityMW - a.capacityMW)
                  .map((s, idx, arr) => {
                    const pct = (s.capacityMW / (data.totalCapacityGW * 1000)) * 100;
                    const catTotal = data.byCategory.find(c => c.category === 'non_fossil')?.capacityGW || 1;
                    const pctOfCat = (s.capacityMW / (catTotal * 1000)) * 100;
                    return (
                      <div key={s.source} className={`flex items-center justify-center text-white transition-all hover:opacity-80 cursor-pointer relative group ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}`} style={{ width: `${pctOfCat}%`, backgroundColor: getSourceColor(s.source as any), minWidth: pctOfCat > 3 ? undefined : '20px' }} onClick={() => setDrillDown('non_fossil')}>
                        {pctOfCat >= 10 && (<div className="text-center leading-tight"><div className="text-[14px] font-bold">{formatSourceLabel(s.source)}</div><div className="text-[14px] font-medium opacity-90">{(s.capacityMW / 1000).toFixed(1)} GW • {pct.toFixed(1)}%</div></div>)}
                        {pctOfCat < 10 && (<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[14px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">{formatSourceLabel(s.source)}: {(s.capacityMW / 1000).toFixed(1)} GW ({pct.toFixed(1)}%)</div>)}
                      </div>
                    );
                  })}
              </div>
              </div>
            </div>
          </>
        ) : (
          /* Single bar for filtered sector */
          <div className="relative">
          <div className="flex rounded-lg h-12 shadow-sm border border-gray-200">
            {filteredSources
              .sort((a, b) => b.capacityMW - a.capacityMW)
              .map((s, idx, arr) => {
                const pctOfFiltered = (s.capacityMW / (filteredTotalGW * 1000)) * 100;
                return (
                  <div key={s.source} className={`flex items-center justify-center text-white transition-all hover:opacity-80 relative group ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}`} style={{ width: `${pctOfFiltered}%`, backgroundColor: getSourceColor(s.source as any), minWidth: pctOfFiltered > 3 ? undefined : '20px' }}>
                    {pctOfFiltered >= 10 && (<div className="text-center leading-tight"><div className="text-[14px] font-bold">{formatSourceLabel(s.source)}</div><div className="text-[14px] font-medium opacity-90">{(s.capacityMW / 1000).toFixed(1)} GW • {pctOfFiltered.toFixed(1)}%</div></div>)}
                    {pctOfFiltered < 10 && (<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[14px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">{formatSourceLabel(s.source)}: {(s.capacityMW / 1000).toFixed(1)} GW ({pctOfFiltered.toFixed(1)}%)</div>)}
                  </div>
                );
              })}
          </div>
          </div>
        )}
      </div>

      {/* Energy Mix Pie */}
      <div className="icici-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-700">{getSectorLabel()} — Energy Mix</h3>
            <p className="text-[14px] text-gray-400">
              {sectorView === 'all'
                ? (!expandedPie ? 'Click a slice to see source breakdown' : `Showing ${expandedPie === 'fossil' ? '🔥 Fossil' : '🌿 Non-Fossil'} breakdown`)
                : 'Source-wise capacity share'}
            </p>
          </div>
          {(expandedPie && sectorView === 'all') && (
            <button onClick={() => setExpandedPie(null)} className="text-xs font-bold text-icici-maroon hover:text-icici-maroon-dark px-3 py-1 rounded-lg bg-red-50">
              ← Back to Fossil / Non-Fossil
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            {(sectorView === 'all' && !expandedPie) ? (
              <Pie
                data={categoryPieData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={140}
                paddingAngle={4}
                onClick={(_, index) => { const cat = categoryPieData[index]?.category; if (cat) setExpandedPie(cat as EnergyCategory); }}
                style={{ cursor: 'pointer' }}
                label={({ name, value, percent }) => `${name}: ${(value / 1000).toFixed(1)} GW (${(percent * 100).toFixed(1)}%)`}
                labelLine={true}
              >
                {categoryPieData.map((entry) => (
                  <Cell key={entry.category} fill={getCategoryColor(entry.category as any)} />
                ))}
              </Pie>
            ) : (
              <Pie
                data={getExpandedPieData()}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={140}
                paddingAngle={2}
                label={({ name, value, percent }) => { if (percent < 0.03) return ''; return `${name}: ${(value / 1000).toFixed(1)} GW (${(percent * 100).toFixed(1)}%)`; }}
                labelLine={true}
              >
                {getExpandedPieData().map((entry) => (
                  <Cell key={entry.source} fill={getSourceColor(entry.source as any)} />
                ))}
              </Pie>
            )}
            <Tooltip
              formatter={(value: number, name: string) => [`${(value / 1000).toFixed(2)} GW (${formatMW(value)} MW)`, name]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'Mulish' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Source list when showing expanded or sector view */}
        {(expandedPie || sectorView !== 'all') && (
          <div className="mt-4 grid grid-cols-2 laptop:grid-cols-3 gap-2">
            {getExpandedPieData().map((item) => (
              <div key={item.source} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSourceColor(item.source as any) }} />
                <span className="text-xs font-semibold text-gray-700 flex-1">{item.name}</span>
                <span className="text-xs font-black text-gray-900">{(item.value / 1000).toFixed(1)} GW</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


