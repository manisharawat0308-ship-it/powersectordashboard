import { useState } from 'react';
import { useCapacityData } from '@/hooks/useCapacityData';
import { formatMW, formatSourceLabel } from '@/utils/formatting';
import { getSourceColor, getCategoryColor } from '@/utils/colors';
import { ChartToggle } from '@/components/common/ChartToggle';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function EnergySourceSection() {
  const { data, isLoading } = useCapacityData();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>('split');

  if (isLoading) {
    return <div className="animate-pulse h-72 bg-gray-200 rounded-xl" />;
  }

  if (!data) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Energy Source Section — Data temporarily unavailable</p>
      </div>
    );
  }

  const pieData = data.bySource.map((s) => ({
    name: formatSourceLabel(s.source),
    value: s.capacityMW,
    source: s.source,
    category: s.category,
  }));

  return (
    <div className="space-y-6">
      <div className="icici-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-700">Energy Mix Classification</h3>
            <p className="text-[14px] text-gray-400 mt-0.5">Fossil vs Non-Fossil breakdown</p>
          </div>
          <ChartToggle
            options={[
              { id: 'split', label: 'Split View', icon: '⚡' },
              { id: 'pie', label: 'Pie Chart', icon: '🥧' },
            ]}
            active={viewMode}
            onChange={setViewMode}
          />
        </div>

        {/* Visual split bar */}
        <div className="mb-6">
          <div className="flex rounded-full overflow-hidden h-8 shadow-inner">
            {data.byCategory.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-center text-xs text-white font-bold transition-all duration-500"
                style={{
                  width: `${cat.percentageShare}%`,
                  backgroundColor: getCategoryColor(cat.category as any),
                }}
              >
                {cat.category === 'fossil' ? '🔥' : '🌿'} {cat.percentageShare.toFixed(1)}%
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-semibold">
            <span style={{ color: getCategoryColor('fossil') }}>
              Fossil — {data.byCategory[0]?.capacityGW.toFixed(2)} GW
            </span>
            <span style={{ color: getCategoryColor('non_fossil') }}>
              Non-Fossil — {data.byCategory[1]?.capacityGW.toFixed(2)} GW
            </span>
          </div>
        </div>

        {viewMode === 'pie' && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={130}
                paddingAngle={1}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.source} fill={getSourceColor(entry.source as any)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${formatMW(value)} MW`, '']}
                contentStyle={{ borderRadius: '8px', fontFamily: 'Mulish' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Mulish' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
            {data.byCategory.map((cat) => {
              const isExpanded = expandedCategory === cat.category;
              const sources = data.bySource.filter((s) => s.category === cat.category);

              return (
                <div key={cat.category} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                    className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: getCategoryColor(cat.category as any) }}
                        />
                        <span className="font-bold text-gray-800">
                          {cat.category === 'fossil' ? '🔥 Fossil Energy' : '🌿 Non-Fossil Energy'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black">{cat.capacityGW.toFixed(2)}</span>
                        <span className="text-sm text-gray-400 ml-1">GW</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold mt-2" style={{ color: getCategoryColor(cat.category as any) }}>
                      {isExpanded ? '▼ Collapse' : '▶ Expand details'}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-2">
                      {sources.map((s) => (
                        <div
                          key={s.source}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getSourceColor(s.source as any) }}
                            />
                            <span className="text-sm font-semibold">{formatSourceLabel(s.source)}</span>
                          </div>
                          <span className="text-sm font-black text-gray-800">{formatMW(s.capacityMW)} MW</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


