import { useState } from 'react';
import { useTimelineData, useMilestones } from '@/hooks/useTimelineData';
import { useDemandProjections, usePlannedAdditions } from '@/hooks/useProjectionData';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { formatGW, formatPercentage, formatSourceLabel } from '@/utils/formatting';
import { getCategoryColor, getSourceColor } from '@/utils/colors';
import { ChartToggle } from '@/components/common/ChartToggle';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, ReferenceLine,
} from 'recharts';

export function TimelineSection() {
  const { data: timelineData, isLoading: timelineLoading } = useTimelineData();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();
  const { data: demandData } = useDemandProjections();
  const { data: additionsData } = usePlannedAdditions();
  const { sectorView, getSectorLabel } = useSectorFilter();
  const [chartFilter, setChartFilter] = useState<string>('all');

  if (timelineLoading || milestonesLoading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Timeline Section — Data temporarily unavailable</p>
      </div>
    );
  }

  // Build historical data
  const historicalData = timelineData.map((entry: any, index: number) => {
    const prev = index > 0 ? timelineData[index - 1] : null;
    const yoyPercent = prev
      ? Math.round(((entry.totalCapacityGW - prev.totalCapacityGW) / prev.totalCapacityGW) * 1000) / 10
      : null;
    const fossil = entry.byCategory?.find((c: any) => c.category === 'fossil')?.capacityGW || 0;
    const nonFossil = entry.byCategory?.find((c: any) => c.category === 'non_fossil')?.capacityGW || 0;
    return {
      year: entry.year,
      total: entry.totalCapacityGW,
      fossil,
      nonFossil,
      yoyPercent,
      isProjected: false,
      demand: null as number | null,
      supply: null as number | null,
    };
  });

  // Append projection data
  const projectionPoints: any[] = [];
  if (demandData && additionsData) {
    const supplyByYear = new Map(
      additionsData.totalPlannedCapacity.map((p: any) => [p.year, p.supplyGW])
    );
    demandData.projections.forEach((p: any) => {
      projectionPoints.push({
        year: p.year,
        total: null,
        fossil: null,
        nonFossil: null,
        yoyPercent: null,
        isProjected: true,
        demand: p.demandGW,
        supply: supplyByYear.get(p.year) || null,
      });
    });
  }

  const combinedData = [...historicalData, ...projectionPoints];
  const lastHistoricalYear = historicalData[historicalData.length - 1]?.year || 2025;

  // Show numbers every 5 years
  const labelYears = new Set([1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025, 2030, 2035]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 font-mulish">
        <div className="flex items-center gap-2">
          <p className="font-black text-lg text-gray-900">{d.year}</p>
          {d.isProjected && <span className="text-[14px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Projected</span>}
        </div>
        <div className="mt-2 space-y-1">
          {d.total !== null && (
            <p className="text-sm">
              <span className="text-gray-500">Total Capacity:</span>{' '}
              <span className="font-bold">{formatGW(d.total)} GW</span>
            </p>
          )}
          {d.fossil !== null && (
            <p className="text-sm" style={{ color: getCategoryColor('fossil') }}>
              🔥 Fossil: <span className="font-bold">{formatGW(d.fossil)} GW</span>
            </p>
          )}
          {d.nonFossil !== null && (
            <p className="text-sm" style={{ color: getCategoryColor('non_fossil') }}>
              🌿 Non-Fossil: <span className="font-bold">{formatGW(d.nonFossil)} GW</span>
            </p>
          )}
          {d.supply !== null && (
            <p className="text-sm font-bold text-amber-600">
              📈 Planned Supply: {formatGW(d.supply)} GW
            </p>
          )}
          {d.demand !== null && (
            <p className="text-sm font-bold text-icici-maroon">
              📉 Demand: {formatGW(d.demand)} GW
            </p>
          )}
          {d.yoyPercent !== null && (
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
              YoY: <span className="font-bold text-icici-maroon">{formatPercentage(d.yoyPercent)}%</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Dot renderer: show GW numbers every 5 years
  const renderLabelDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return <g />;
    if (!labelYears.has(payload.year)) return <g />;
    const value = payload.total || payload.supply;
    if (!value) return <g />;
    const isProj = payload.isProjected;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={isProj ? '#F99D27' : '#005B75'} stroke="#fff" strokeWidth={2} />
        <rect x={cx - 22} y={cy - 26} width={44} height={16} rx={4} fill={isProj ? '#FFF8E1' : '#E0F2F1'} stroke={isProj ? '#F99D27' : '#005B75'} strokeWidth={0.5} opacity={0.9} />
        <text x={cx} y={cy - 15} textAnchor="middle" fontSize={9} fontFamily="Mulish" fontWeight={800} fill={isProj ? '#E65100' : '#004D40'}>
          {Math.round(value)} GW
        </text>
      </g>
    );
  };

  // Planned additions data
  const additionsByYear = new Map<number, { source: string; additionGW: number }[]>();
  if (additionsData) {
    additionsData.planned.forEach((p: any) => {
      if (!additionsByYear.has(p.year)) additionsByYear.set(p.year, []);
      additionsByYear.get(p.year)!.push({ source: p.source, additionGW: p.additionGW });
    });
  }

  // Gap data
  const gapData = projectionPoints.map((p) => ({
    year: p.year,
    demand: p.demand,
    supply: p.supply,
    gap: (p.demand && p.supply) ? Math.max(0, p.demand - p.supply) : 0,
    surplus: (p.demand && p.supply) ? Math.max(0, p.supply - p.demand) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Combined Timeline + Projection Chart */}
      <div className="icici-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-700">India's {getSectorLabel()} Journey — 1975 to 2035</h3>
            <p className="text-[14px] text-gray-400 mt-0.5">Historical + Projected • GW numbers every 5 years • Fossil & Non-Fossil growth lines</p>
          </div>
          <ChartToggle
            options={[
              { id: 'all', label: 'All', icon: '⚡' },
              { id: 'fossil', label: 'Fossil', icon: '🔥' },
              { id: 'non_fossil', label: 'Non-Fossil', icon: '🌿' },
            ]}
            active={chartFilter}
            onChange={setChartFilter}
          />
        </div>

        {/* Line Chart — always shown */}
        <ResponsiveContainer width="100%" height={460}>
          <LineChart data={combinedData} margin={{ top: 35, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'Mulish', fontWeight: 600 }} />
            <YAxis unit=" GW" tick={{ fontSize: 11, fontFamily: 'Mulish' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={lastHistoricalYear} stroke="#F99D27" strokeWidth={2} strokeDasharray="6 3" label={{ value: '◀ Past | Future ▶', position: 'insideTopRight', fontSize: 9, fill: '#F99D27', fontWeight: 700 }} />
            {/* Historical lines — controlled by chartFilter */}
            {(chartFilter === 'all') && <Line type="monotone" dataKey="total" stroke="#005B75" strokeWidth={3} dot={renderLabelDot} name="Total Capacity" connectNulls={false} />}
            {(chartFilter === 'all' || chartFilter === 'fossil') && sectorView !== 'non_fossil' && <Line type="monotone" dataKey="fossil" stroke="#B02A30" strokeWidth={chartFilter === 'fossil' ? 3 : 2} dot={chartFilter === 'fossil' ? renderLabelDot : false} name="🔥 Fossil" connectNulls={false} />}
            {(chartFilter === 'all' || chartFilter === 'non_fossil') && sectorView !== 'fossil' && <Line type="monotone" dataKey="nonFossil" stroke="#43A047" strokeWidth={chartFilter === 'non_fossil' ? 3 : 2} dot={chartFilter === 'non_fossil' ? renderLabelDot : false} name="🌿 Non-Fossil" connectNulls={false} />}
            {/* Projected lines */}
            <Line type="monotone" dataKey="supply" stroke="#F99D27" strokeWidth={3} strokeDasharray="8 4" dot={renderLabelDot} name="📈 Planned Supply" connectNulls />
            <Line type="monotone" dataKey="demand" stroke="#B02A30" strokeWidth={2} strokeDasharray="4 2" dot={false} name="📉 Demand" connectNulls />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish', fontWeight: 600 }} />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* Demand vs Supply Gap */}
      {gapData.length > 0 && (
        <div className="icici-card p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Demand vs Supply — Gap Analysis (2026–2035)</h3>
          <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3">
            {gapData.map((d) => (
              <div
                key={d.year}
                className={`rounded-xl border p-4 text-center ${d.gap > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}
              >
                <div className="text-base font-black text-gray-800">{d.year}</div>
                <div className="text-[14px] text-gray-500 mt-1">D: {d.demand} | S: {d.supply} GW</div>
                {d.surplus > 0 ? (
                  <div className="text-sm font-bold text-green-600 mt-2">✓ +{formatGW(d.surplus)} GW</div>
                ) : d.gap > 0 ? (
                  <div className="text-sm font-bold text-amber-600 mt-2">⚠ -{formatGW(d.gap)} GW</div>
                ) : (
                  <div className="text-sm font-bold text-green-600 mt-2">✓ Balanced</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planned Additions by Source */}
      {additionsByYear.size > 0 && (
        <div className="icici-card p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Planned Capacity Additions by Source</h3>
          <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3">
            {Array.from(additionsByYear.entries()).slice(0, 5).map(([year, sources]) => (
              <div key={year} className="rounded-xl border border-gray-200 p-3">
                <div className="text-sm font-black text-gray-800 mb-2">{year}</div>
                <div className="space-y-1.5">
                  {sources.sort((a, b) => b.additionGW - a.additionGW).map((s) => (
                    <div key={s.source} className="flex items-center justify-between">
                      <span
                        className="text-[14px] px-1.5 py-0.5 rounded font-bold text-white"
                        style={{ backgroundColor: getSourceColor(s.source as any) }}
                      >
                        {formatSourceLabel(s.source)}
                      </span>
                      <span className="text-xs font-bold text-gray-700">+{s.additionGW} GW</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="icici-card p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Key Milestones</h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-4">
            {milestones.map((m) => (
              <div key={m.year} className="relative p-4 rounded-xl bg-gradient-to-br from-icici-cream to-white border border-gray-100">
                <div className="text-2xl font-black text-icici-navy">{m.year}</div>
                <div className="text-sm font-bold text-gray-800 mt-1">{m.title}</div>
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


