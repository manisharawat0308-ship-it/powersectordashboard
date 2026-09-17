import { useState } from 'react';
import { useOwnershipData } from '@/hooks/useOwnershipData';
import { useCompanyData, CompanyInfo } from '@/hooks/useCompanyData';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { formatOwnershipLabel, formatMW, formatSourceLabel } from '@/utils/formatting';
import { getOwnershipColor, getSourceColor } from '@/utils/colors';

export function OwnershipSection() {
  const { data, isLoading } = useOwnershipData();
  const { data: companyData, isLoading: companyLoading } = useCompanyData();
  const { getSectorLabel, isSourceInView } = useSectorFilter();
  const [selectedOwnership, setSelectedOwnership] = useState<string | null>(null);

  if (isLoading || companyLoading) {
    return <div className="animate-pulse h-72 bg-gray-200 rounded-xl" />;
  }

  if (!data || !data.byOwnership) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Ownership Section — Data temporarily unavailable</p>
      </div>
    );
  }

  const installedData = data.byOwnership.map((item: any) => ({
    name: formatOwnershipLabel(item.ownership),
    value: item.capacityGW,
    percentage: item.percentage,
    ownership: item.ownership,
  }));

  const generationByOwnership: Record<string, { bu: number; gw: number; pct: number }> = {
    central_psu: { bu: 420.5, gw: 48.0, pct: 24.0 },
    state_psu: { bu: 438.2, gw: 50.0, pct: 25.0 },
    private: { bu: 893.7, gw: 102.0, pct: 51.0 },
  };

  const getCompanies = (ownership: string): CompanyInfo[] => {
    if (!companyData) return [];
    const key = ownership as keyof typeof companyData;
    return (companyData[key] || []).sort((a, b) => b.capacityMW - a.capacityMW);
  };

  const selectedInstalledGW = selectedOwnership
    ? installedData.find((i: any) => i.ownership === selectedOwnership)?.value || 0
    : 0;
  const selectedGen = selectedOwnership ? generationByOwnership[selectedOwnership] : null;

  const getSourceTotalsForOwnership = (ownership: string) => {
    const companies = getCompanies(ownership);
    const totals: Record<string, number> = {};
    companies.forEach((c) => {
      Object.entries(c.sourceBreakdown).forEach(([src, mw]) => {
        if (isSourceInView(src)) {
          totals[src] = (totals[src] || 0) + mw;
        }
      });
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a);
  };

  const ownershipIcons: Record<string, string> = {
    central_psu: '🏛️',
    state_psu: '🏢',
    private: '🏭',
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-icici-navy via-icici-maroon to-icici-orange rounded-t-xl" />
        <div className="flex items-center justify-between mt-1">
          <div>
            <h2 className="text-lg font-black text-gray-800">Ownership Structure — {getSectorLabel()}</h2>
            <p className="text-[14px] text-gray-500">Who owns India's power generation capacity? Click any card to explore.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">450.29 <span className="text-sm text-gray-500">GW</span></div>
            <div className="text-[14px] text-gray-400">Total Installed • FY24-25</div>
          </div>
        </div>
      </div>

      {/* Ownership Cards — Big, Bold, Interactive */}
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-4">
        {installedData.map((item: any) => {
          const gen = generationByOwnership[item.ownership];
          const isSelected = selectedOwnership === item.ownership;
          const icon = ownershipIcons[item.ownership] || '⚡';
          return (
            <div
              key={item.ownership}
              onClick={() => setSelectedOwnership(isSelected ? null : item.ownership)}
              className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isSelected
                  ? 'border-gray-800 shadow-xl scale-[1.02]'
                  : selectedOwnership
                    ? 'border-gray-200 opacity-50 hover:opacity-80'
                    : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ background: isSelected ? `linear-gradient(135deg, ${getOwnershipColor(item.ownership)}10, white)` : 'white' }}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ backgroundColor: getOwnershipColor(item.ownership) }} />

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${getOwnershipColor(item.ownership)}15` }}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800">{item.name}</h3>
                  <p className="text-[14px] text-gray-400 font-medium">{item.ownership === 'central_psu' ? 'NTPC, NHPC, NPC...' : item.ownership === 'state_psu' ? 'State Gencos' : 'Adani, Tata, JSW...'}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <div className="text-[14px] font-semibold text-gray-400 uppercase">Installed</div>
                  <div className="text-lg font-black text-gray-900">{item.value.toFixed(1)} <span className="text-[14px] text-gray-500">GW</span></div>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <div className="text-[14px] font-semibold text-gray-400 uppercase">Generation</div>
                  <div className="text-lg font-black text-gray-900">{gen.bu.toFixed(0)} <span className="text-[14px] text-gray-500">BU</span></div>
                </div>
              </div>

              {/* Percentage bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[14px] text-gray-500 font-semibold">
                  <span>Capacity Share</span>
                  <span className="font-black" style={{ color: getOwnershipColor(item.ownership) }}>{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%`, backgroundColor: getOwnershipColor(item.ownership) }}
                  />
                </div>
                <div className="flex justify-between text-[14px] text-gray-500 font-semibold">
                  <span>Generation Share</span>
                  <span className="font-black" style={{ color: getOwnershipColor(item.ownership) }}>{gen.pct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${gen.pct}%`, backgroundColor: getOwnershipColor(item.ownership), opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Click indicator */}
              <div className="mt-3 text-center">
                <span className="text-[14px] font-bold text-gray-400">{isSelected ? '▲ Click to close' : '▼ Click to expand'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Ownership Detail Panel */}
      {selectedOwnership && (
        <div className="icici-card p-6 border-t-4 animate-[fadeIn_0.3s_ease-out]" style={{ borderTopColor: getOwnershipColor(selectedOwnership) }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${getOwnershipColor(selectedOwnership)}15` }}>
                {ownershipIcons[selectedOwnership] || '⚡'}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">{formatOwnershipLabel(selectedOwnership)}</h3>
                <p className="text-xs text-gray-500">Detailed breakdown — {getSectorLabel()}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedOwnership(null)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 laptop:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <div className="text-[14px] font-bold text-blue-500 uppercase">Installed</div>
              <div className="text-xl font-black text-gray-900">{selectedInstalledGW.toFixed(2)} GW</div>
              <div className="text-[14px] text-gray-400">{installedData.find((i: any) => i.ownership === selectedOwnership)?.percentage.toFixed(1)}% of 450.29 GW</div>
            </div>
            {selectedGen && (
              <>
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-white border border-red-100">
                  <div className="text-[14px] font-bold text-red-500 uppercase">Generation</div>
                  <div className="text-xl font-black text-gray-900">{selectedGen.bu.toFixed(1)} BU</div>
                  <div className="text-[14px] text-gray-400">{selectedGen.pct}% of 1,752.4 BU</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100">
                  <div className="text-[14px] font-bold text-green-500 uppercase">GW Equivalent</div>
                  <div className="text-xl font-black text-gray-900">{selectedGen.gw.toFixed(1)} GW</div>
                  <div className="text-[14px] text-gray-400">Effective output</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
                  <div className="text-[14px] font-bold text-amber-600 uppercase">Utilization</div>
                  <div className="text-xl font-black text-gray-900">{((selectedGen.gw / selectedInstalledGW) * 100).toFixed(1)}%</div>
                  <div className="text-[14px] text-gray-400">Actual vs Installed</div>
                </div>
              </>
            )}
          </div>

          {/* Source Breakdown */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-700 mb-3">Energy Source Mix</h4>
            {/* Stacked bar */}
            <div className="relative">
            <div className="flex rounded-xl h-10 mb-3 border border-gray-200 shadow-sm">
              {getSourceTotalsForOwnership(selectedOwnership).map(([source, mw], idx, arr) => {
                const pct = (mw / (selectedInstalledGW * 1000)) * 100;
                return (
                  <div
                    key={source}
                    className={`flex items-center justify-center text-white relative group transition-all duration-300 hover:brightness-110 ${idx === 0 ? 'rounded-l-xl' : ''} ${idx === arr.length - 1 ? 'rounded-r-xl' : ''}`}
                    style={{ width: `${pct}%`, backgroundColor: getSourceColor(source as any), minWidth: pct > 2 ? undefined : '4px' }}
                  >
                    {pct >= 10 && (
                      <span className="text-[14px] font-bold">{formatSourceLabel(source)} {pct.toFixed(0)}%</span>
                    )}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[14px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none shadow-lg">
                      {formatSourceLabel(source)}: {formatMW(mw)} MW ({pct.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
            </div>

            {/* Source list cards */}
            <div className="grid grid-cols-2 laptop:grid-cols-3 gap-2">
              {getSourceTotalsForOwnership(selectedOwnership).map(([source, mw]) => {
                const pct = (mw / (selectedInstalledGW * 1000)) * 100;
                return (
                  <div key={source} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getSourceColor(source as any) }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-gray-700 truncate">{formatSourceLabel(source)}</div>
                      <div className="text-[14px] text-gray-500">{formatMW(mw)} MW</div>
                    </div>
                    <span className="text-[14px] font-black text-gray-800">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Companies List */}
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-sm font-bold text-gray-700 mb-4">🏢 Top Companies — {formatOwnershipLabel(selectedOwnership)}</h4>
            <div className="space-y-2.5">
              {(() => {
                const companies = getCompanies(selectedOwnership);

                return companies.map((company, index) => {
                  const sourceEntries = Object.entries(company.sourceBreakdown)
                    .filter(([src]) => isSourceInView(src))
                    .sort(([, a], [, b]) => b - a);
                  const filteredCapacityMW = sourceEntries.reduce((sum, [, mw]) => sum + mw, 0);
                  if (filteredCapacityMW === 0) return null;
                  const fossilSources = ['coal', 'lignite', 'gas', 'diesel'];
                  let fossilMW = 0;
                  let nonFossilMW = 0;
                  sourceEntries.forEach(([src, mw]) => {
                    if (fossilSources.includes(src)) fossilMW += mw;
                    else nonFossilMW += mw;
                  });
                  const fossilPct = filteredCapacityMW > 0 ? (fossilMW / filteredCapacityMW) * 100 : 0;
                  const nonFossilPct = filteredCapacityMW > 0 ? (nonFossilMW / filteredCapacityMW) * 100 : 0;

                  return (
                    <div key={company.name} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: getOwnershipColor(selectedOwnership) }}
                        >
                          #{index + 1}
                        </div>
                        {/* Company name */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-gray-800 block truncate">{company.name}</span>
                        </div>
                        {/* Stats */}
                        <div className="flex gap-4 flex-shrink-0 items-center">
                          <div className="text-right">
                            <div className="text-[14px] text-gray-400 font-medium uppercase">Installed</div>
                            <div className="text-sm font-black text-gray-900">{formatMW(filteredCapacityMW)} MW</div>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div className="text-right">
                            <div className="text-[14px] text-gray-400 font-medium uppercase">Generation</div>
                            <div className="text-sm font-black text-icici-navy">{company.generationBU.toFixed(1)} BU</div>
                          </div>
                        </div>
                        {/* Fossil / Non-Fossil mini bar */}
                        <div className="w-24 flex-shrink-0 hidden laptop:block">
                          <div className="flex rounded-full overflow-hidden h-5 border border-gray-200">
                            {fossilPct > 0 && (
                              <div className="flex items-center justify-center text-[14px] text-white font-bold" style={{ width: `${fossilPct}%`, backgroundColor: '#B02A30' }}>
                                {fossilPct >= 20 ? `🔥${fossilPct.toFixed(0)}%` : ''}
                              </div>
                            )}
                            {nonFossilPct > 0 && (
                              <div className="flex items-center justify-center text-[14px] text-white font-bold" style={{ width: `${nonFossilPct}%`, backgroundColor: '#005B75' }}>
                                {nonFossilPct >= 20 ? `🌿${nonFossilPct.toFixed(0)}%` : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-[7px] text-gray-400">Fossil</span>
                            <span className="text-[7px] text-gray-400">Clean</span>
                          </div>
                        </div>
                      </div>
                      {/* Source tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3 ml-11">
                        {sourceEntries.map(([source, mw]) => {
                          const pctOfCompany = ((mw / filteredCapacityMW) * 100).toFixed(1);
                          return (
                            <span
                              key={source}
                              className="text-[14px] px-2 py-0.5 rounded-md font-bold text-white shadow-sm"
                              style={{ backgroundColor: getSourceColor(source as any) }}
                            >
                              {formatSourceLabel(source)} {pctOfCompany}%
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                }).filter(Boolean);
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


