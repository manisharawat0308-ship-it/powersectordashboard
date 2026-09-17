import { useMemo } from 'react';
import { useCapacityData } from '@/hooks/useCapacityData';
import { useGenerationData, usePLFCUFData } from '@/hooks/useGenerationData';
import { getSourceColor } from '@/utils/colors';
import { formatSourceLabel } from '@/utils/formatting';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';

interface SourceRow {
  source: string;
  label: string;
  category: 'fossil' | 'non_fossil';
  capacityGW: number;
  capShare: number;
  generationBU: number;
  genShare: number;
  loadFactor: number | null;
  loadFactorType: 'PLF' | 'CUF' | null;
  color: string;
}

export function PowerSourceComparison() {
  const { data: capData, isLoading: capLoading } = useCapacityData();
  const { data: genData, isLoading: genLoading } = useGenerationData();
  const { data: plfData } = usePLFCUFData();

  const rows: SourceRow[] = useMemo(() => {
    if (!capData || !genData) return [];

    const totalCapMW = capData.bySource.reduce((s, r) => s + r.capacityMW, 0);
    const totalGenBU  = genData.bySource.reduce((s, r) => s + r.generationBU, 0);

    return capData.bySource.map((cs) => {
      const gs = genData.bySource.find((g) => g.source === cs.source);
      const plf = plfData?.plf[cs.source];
      const cuf = plfData?.cuf[cs.source];
      const lf = plf ?? cuf ?? null;
      const lfType: 'PLF' | 'CUF' | null = plf ? 'PLF' : cuf ? 'CUF' : null;

      return {
        source: cs.source,
        label: formatSourceLabel(cs.source),
        category: cs.category as 'fossil' | 'non_fossil',
        capacityGW: +(cs.capacityMW / 1000).toFixed(2),
        capShare: +((cs.capacityMW / totalCapMW) * 100).toFixed(1),
        generationBU: gs?.generationBU ?? 0,
        genShare: gs ? +((gs.generationBU / totalGenBU) * 100).toFixed(1) : 0,
        loadFactor: lf,
        loadFactorType: lfType,
        color: getSourceColor(cs.source as any),
      };
    }).sort((a, b) => b.capacityGW - a.capacityGW);
  }, [capData, genData, plfData]);

  if (capLoading || genLoading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  }

  if (!capData || !genData) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Source Comparison — Data temporarily unavailable</p>
      </div>
    );
  }

  // Radar data: normalise each metric 0-100 for radar chart
  const maxCap = Math.max(...rows.map((r) => r.capacityGW));
  const maxGen = Math.max(...rows.map((r) => r.generationBU));
  const maxLF  = 100;

  // Only show top 6 sources to keep radar readable
  const radarRows = rows.slice(0, 6);
  const radarData = [
    { metric: 'Capacity Share',   ...Object.fromEntries(radarRows.map((r) => [r.source, r.capShare])) },
    { metric: 'Generation Share', ...Object.fromEntries(radarRows.map((r) => [r.source, r.genShare])) },
    { metric: 'Load Factor',      ...Object.fromEntries(radarRows.map((r) => [r.source, r.loadFactor ?? 0])) },
    { metric: 'Capacity (GW)',    ...Object.fromEntries(radarRows.map((r) => [r.source, (r.capacityGW / maxCap) * 100])) },
    { metric: 'Generation (BU)',  ...Object.fromEntries(radarRows.map((r) => [r.source, (r.generationBU / maxGen) * 100])) },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-icici-maroon to-icici-navy" />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">📊</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Power Source Comparison</h2>
            <p className="text-[12px] text-gray-400">Cross-technology analysis · Capacity · Generation · Load Factor · FY 2024-25</p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="icici-card p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">All Sources — Comparative Metrics</h3>
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-500 text-[11px] uppercase">
              <th className="text-left p-2">Source</th>
              <th className="text-center p-2">Category</th>
              <th className="text-right p-2">Capacity (GW)</th>
              <th className="text-right p-2">Cap Share</th>
              <th className="text-right p-2">Generation (BU)</th>
              <th className="text-right p-2">Gen Share</th>
              <th className="text-right p-2">PLF / CUF</th>
              <th className="text-right p-2">Overperformance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const gap = r.genShare - r.capShare;
              const isOver = gap > 0;
              return (
                <tr key={r.source} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="font-bold text-gray-800">{r.label}</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.category === 'fossil' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {r.category === 'fossil' ? '🔥 Fossil' : '🌿 Non-Fossil'}
                    </span>
                  </td>
                  <td className="p-2 text-right font-black text-gray-800">{r.capacityGW}</td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(r.capShare * 1.5, 100)}%`, backgroundColor: r.color }} />
                      </div>
                      <span className="font-bold text-gray-700 w-10 text-right">{r.capShare}%</span>
                    </div>
                  </td>
                  <td className="p-2 text-right font-black text-gray-800">{r.generationBU.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(r.genShare * 1.5, 100)}%`, backgroundColor: r.color, opacity: 0.8 }} />
                      </div>
                      <span className="font-bold text-gray-700 w-10 text-right">{r.genShare}%</span>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    {r.loadFactor !== null ? (
                      <span className="font-black" style={{ color: r.color }}>{r.loadFactor}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                    {r.loadFactorType && (
                      <span className="text-[10px] text-gray-400 ml-1">{r.loadFactorType}</span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    <span className={`text-[12px] font-black ${isOver ? 'text-green-600' : 'text-red-500'}`}>
                      {isOver ? '▲' : '▼'} {Math.abs(gap).toFixed(1)}pp
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[11px] text-gray-400 mt-2 italic">
          Overperformance = Generation Share minus Capacity Share. Positive means the source generates more than its installed share — typically due to high utilisation.
        </p>
      </div>

      {/* Capacity vs Generation Bar Chart */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5">
        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Installed Capacity by Source (GW)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows} layout="vertical" margin={{ left: 70, right: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} unit=" GW" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fontWeight: 600 }} width={65} />
              <Tooltip formatter={(v: number) => [`${v} GW`, 'Capacity']} />
              <Bar dataKey="capacityGW" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fontWeight: 700, formatter: (v: number) => `${v}` }}>
                {rows.map((r) => <Cell key={r.source} fill={r.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Generation by Source (BU)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows} layout="vertical" margin={{ left: 70, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} unit=" BU" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fontWeight: 600 }} width={65} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(1)} BU`, 'Generation']} />
              <Bar dataKey="generationBU" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 10, fontWeight: 700, formatter: (v: number) => `${v.toFixed(0)}` }}>
                {rows.map((r) => <Cell key={r.source} fill={r.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Load Factor Comparison */}
      <div className="icici-card p-5">
        <h3 className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Load Factor — PLF / CUF by Source</h3>
        <p className="text-[12px] text-gray-400 mb-4">How efficiently each installed MW is being utilised</p>
        <div className="grid grid-cols-2 tablet:grid-cols-5 gap-3">
          {rows.filter((r) => r.loadFactor !== null).map((r) => {
            const pct = r.loadFactor!;
            return (
              <div key={r.source} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <circle
                      cx="28" cy="28" r="22"
                      stroke={r.color} strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[12px] font-black" style={{ color: r.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-gray-700">{r.label}</div>
                <div className="text-[10px] text-gray-400">{r.loadFactorType}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Observations */}
      <div className="icici-card p-5 border-l-4 border-icici-navy">
        <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Key Observations</h3>
        <div className="space-y-2">
          {[
            { icon: '⚛️', text: `Nuclear has the highest CUF (${plfData?.cuf?.nuclear ?? 78.6}%) of any technology — it generates ${rows.find(r=>r.source==='nuclear')?.genShare ?? 3.2}% of electricity from only ${rows.find(r=>r.source==='nuclear')?.capShare ?? 1.8}% of installed capacity.` },
            { icon: '🏭', text: `Coal dominates generation at ${rows.find(r=>r.source==='coal')?.genShare ?? 67.2}% despite PLF of only ${plfData?.plf?.coal ?? 64}% — its sheer scale makes it the backbone of the grid.` },
            { icon: '☀️', text: `Solar has a large capacity share (${rows.find(r=>r.source==='solar')?.capShare ?? 19.6}%) but generates only ${rows.find(r=>r.source==='solar')?.genShare ?? 7.9}% of electricity due to its daylight-hours constraint (CUF ${plfData?.cuf?.solar ?? 18.2}%).` },
            { icon: '💧', text: `Large hydro combines high CUF (${plfData?.cuf?.large_hydro ?? 38.4}%) with significant scale — generation share (${rows.find(r=>r.source==='large_hydro')?.genShare ?? 8.9}%) exceeds capacity share.` },
          ].map((obs, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
              <span className="flex-shrink-0">{obs.icon}</span>
              <span>{obs.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
