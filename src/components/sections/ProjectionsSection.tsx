import { useState } from 'react';
import { useDemandProjections, usePlannedAdditions } from '@/hooks/useProjectionData';
import { useTimelineData } from '@/hooks/useTimelineData';
import { formatGW } from '@/utils/formatting';
import { ChartToggle } from '@/components/common/ChartToggle';
import { getSourceColor } from '@/utils/colors';
import { formatSourceLabel } from '@/utils/formatting';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine,
  BarChart, Bar,
  AreaChart, Area, Line,
} from 'recharts';

export function ProjectionsSection() {
  const { data: demandData, isLoading: demandLoading } = useDemandProjections();
  const { data: additionsData, isLoading: additionsLoading } = usePlannedAdditions();
  const { data: timelineData } = useTimelineData();
  const [chartType, setChartType] = useState<string>('combined');

  if (demandLoading || additionsLoading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  }

  if (!demandData || !additionsData) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Projections Section — Data temporarily unavailable</p>
      </div>
    );
  }

  const supplyByYear = new Map(
    additionsData.totalPlannedCapacity.map((p: any) => [p.year, p.supplyGW])
  );

  // Build combined historical + projected for the full picture
  const historicalPoints = (timelineData || []).map((entry: any) => ({
    year: entry.year,
    historical: entry.totalCapacityGW,
    demand: null as number | null,
    supply: null as number | null,
    isProjected: false,
  }));

  const projectedPoints = demandData.projections.map((p: any) => ({
    year: p.year,
    historical: null as number | null,
    demand: p.demandGW,
    supply: supplyByYear.get(p.year) || null,
    isProjected: true,
  }));

  const fullData = [...historicalPoints, ...projectedPoints];
  const lastHistoricalYear = historicalPoints[historicalPoints.length - 1]?.year || 2025;

  // Simple demand vs supply only
  const demandSupplyData = demandData.projections.map((p: any) => ({
    year: p.year,
    demand: p.demandGW,
    supply: supplyByYear.get(p.year) || null,
    gap: supplyByYear.has(p.year) ? Math.max(0, p.demandGW - (supplyByYear.get(p.year) || 0)) : 0,
    surplus: supplyByYear.has(p.year) ? Math.max(0, (supplyByYear.get(p.year) || 0) - p.demandGW) : 0,
  }));

  // Planned additions by source for each year
  const additionsByYear = new Map<number, { source: string; additionGW: number }[]>();
  additionsData.planned.forEach((p: any) => {
    if (!additionsByYear.has(p.year)) additionsByYear.set(p.year, []);
    additionsByYear.get(p.year)!.push({ source: p.source, additionGW: p.additionGW });
  });

  return (
    <div className="space-y-6">
      {/* Full Timeline with Projections */}
      <div className="icici-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-700">Historical + Projected Capacity (1975–2035)</h3>
            <p className="text-[14px] text-gray-400 mt-0.5">{demandData.dataSource} • Numbers at key inflection points</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">⚡ Projected</span>
            <ChartToggle
              options={[
                { id: 'combined', label: 'Full View', icon: '📈' },
                { id: 'gap', label: 'Gap Analysis', icon: '⚠️' },
              ]}
              active={chartType}
              onChange={setChartType}
            />
          </div>
        </div>

        {chartType === 'combined' && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={fullData} margin={{ top: 25, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005B75" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#005B75" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'Mulish' }} />
              <YAxis unit=" GW" tick={{ fontSize: 11, fontFamily: 'Mulish' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontFamily: 'Mulish' }} />
              <ReferenceLine x={lastHistoricalYear} stroke="#F99D27" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Now', position: 'top', fontSize: 10, fill: '#F99D27', fontWeight: 700 }} />
              <Area type="monotone" dataKey="historical" fill="url(#histGrad)" stroke="#005B75" strokeWidth={2.5} name="Historical" connectNulls={false} />
              <Line type="monotone" dataKey="supply" stroke="#F99D27" strokeWidth={2.5} strokeDasharray="8 4" dot={{ r: 4, fill: '#F99D27' }} name="Planned Supply" connectNulls />
              <Line type="monotone" dataKey="demand" stroke="#B02A30" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#B02A30' }} name="Projected Demand" connectNulls />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish', fontWeight: 600 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'gap' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={demandSupplyData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: 'Mulish' }} />
              <YAxis unit=" GW" tick={{ fontSize: 11, fontFamily: 'Mulish' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 font-mulish">
                      <p className="font-black text-lg">{d.year} <span className="text-xs text-amber-600">(Projected)</span></p>
                      <p className="text-sm text-icici-maroon font-bold mt-1">Demand: {formatGW(d.demand)} GW</p>
                      <p className="text-sm text-icici-navy font-bold">Supply: {formatGW(d.supply)} GW</p>
                      {d.surplus > 0 && <p className="text-xs text-green-600 mt-1">✓ Surplus: +{formatGW(d.surplus)} GW</p>}
                      {d.gap > 0 && <p className="text-xs text-amber-600 mt-1">⚠ Gap: -{formatGW(d.gap)} GW</p>}
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Mulish', fontWeight: 600 }} />
              <Bar dataKey="demand" fill="#B02A30" radius={[4, 4, 0, 0]} name="Demand"
                label={{ position: 'top', fontSize: 9, fontFamily: 'Mulish', fontWeight: 700, formatter: (v: number) => `${v}` }}
              />
              <Bar dataKey="supply" fill="#005B75" radius={[4, 4, 0, 0]} name="Supply"
                label={{ position: 'top', fontSize: 9, fontFamily: 'Mulish', fontWeight: 700, formatter: (v: number) => `${v}` }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Planned Additions by Source */}
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

      {/* Gap/Surplus Summary */}
      <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3">
        {demandSupplyData.map((d: any) => (
          <div
            key={d.year}
            className={`icici-card p-4 text-center ${d.gap > 0 ? 'border-amber-200' : 'border-green-200'}`}
          >
            <div className="text-sm font-black text-gray-800">{d.year}</div>
            <div className="text-[14px] text-gray-400 mt-0.5">D: {d.demand} | S: {d.supply}</div>
            {d.surplus > 0 ? (
              <div className="text-xs font-bold text-green-600 mt-1">✓ +{formatGW(d.surplus)} GW</div>
            ) : d.gap > 0 ? (
              <div className="text-xs font-bold text-amber-600 mt-1">⚠ -{formatGW(d.gap)} GW</div>
            ) : (
              <div className="text-xs font-bold text-green-600 mt-1">✓ Balanced</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


