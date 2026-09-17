import { useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { ALL_FOSSIL_SOURCES, ALL_NON_FOSSIL_SOURCES, ALL_OWNERSHIP_TYPES, PowerSourceSlice } from '@/types/filters';
import { formatSourceLabel, formatOwnershipLabel } from '@/utils/formatting';
import { getSourceColor, getOwnershipColor } from '@/utils/colors';

const POWER_SOURCE_OPTIONS: { id: PowerSourceSlice; label: string; icon: string; color: string }[] = [
  { id: 'all',     label: 'All',     icon: '⚡', color: '#B02A30' },
  { id: 'coal',    label: 'Coal',    icon: '🏭', color: '#B02A30' },
  { id: 'gas',     label: 'Gas',     icon: '🔥', color: '#F99D27' },
  { id: 'hydro',   label: 'Hydro',   icon: '💧', color: '#003D50' },
  { id: 'solar',   label: 'Solar',   icon: '☀️', color: '#F99D27' },
  { id: 'wind',    label: 'Wind',    icon: '💨', color: '#005B75' },
  { id: 'nuclear', label: 'Nuclear', icon: '⚛️', color: '#7B1FA2' },
  { id: 'other',   label: 'Other',   icon: '🌿', color: '#4CAF50' },
];

export function FilterPanel() {
  const filters = useFilterStore((s) => s.filters);
  const powerSource = useFilterStore((s) => s.powerSource);
  const toggleSource = useFilterStore((s) => s.toggleSource);
  const toggleOwnership = useFilterStore((s) => s.toggleOwnership);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const setPowerSource = useFilterStore((s) => s.setPowerSource);
  const activeFilterCount = useFilterStore((s) => s.activeFilterCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const count = activeFilterCount();

  return (
    <div className="icici-card p-4 mb-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
          aria-expanded={isExpanded}
        >
          <span className="text-sm font-bold text-gray-700">🎛️ Filters</span>
          {count > 0 && (
            <span className="bg-icici-maroon text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
          <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
        </button>
        {count > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-icici-maroon hover:text-icici-maroon-dark transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Power Source slicer — always visible */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Power Source</p>
        <div className="flex flex-wrap gap-1.5">
          {POWER_SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPowerSource(opt.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                powerSource === opt.id
                  ? 'text-white shadow-sm border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              }`}
              style={powerSource === opt.id ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
              aria-pressed={powerSource === opt.id}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable advanced filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 laptop:grid-cols-3 gap-6">
          {/* Energy Sources */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Energy Sources</h3>
            <div className="space-y-1.5">
              <p className="text-[11px] text-icici-maroon font-bold uppercase">Fossil</p>
              {ALL_FOSSIL_SOURCES.map((source) => (
                <label key={source} className="flex items-center gap-2 text-xs cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.energySources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="rounded border-gray-300 text-icici-maroon focus:ring-icici-maroon"
                  />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSourceColor(source) }} />
                  <span className="font-medium group-hover:text-icici-maroon transition-colors">
                    {formatSourceLabel(source)}
                  </span>
                </label>
              ))}
              <p className="text-[11px] text-icici-navy font-bold uppercase mt-3">Non-Fossil</p>
              {ALL_NON_FOSSIL_SOURCES.map((source) => (
                <label key={source} className="flex items-center gap-2 text-xs cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.energySources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="rounded border-gray-300 text-icici-navy focus:ring-icici-navy"
                  />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSourceColor(source) }} />
                  <span className="font-medium group-hover:text-icici-navy transition-colors">
                    {formatSourceLabel(source)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Ownership */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Ownership</h3>
            <div className="space-y-2">
              {ALL_OWNERSHIP_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.ownershipTypes.includes(type)}
                    onChange={() => toggleOwnership(type)}
                    className="rounded border-gray-300 text-icici-maroon focus:ring-icici-maroon"
                  />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: getOwnershipColor(type) }} />
                  <span className="font-medium group-hover:text-icici-maroon transition-colors">
                    {formatOwnershipLabel(type)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Time Period</h3>
            <div className="p-3 rounded-lg bg-icici-cream border border-gray-100">
              <p className="text-sm font-bold text-gray-700">
                FY {filters.timePeriod.startYear}–{filters.timePeriod.endYear}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Granularity: <span className="font-semibold capitalize">{filters.timePeriod.granularity}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
