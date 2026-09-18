import { useInsightData } from '@/hooks/useInsightData';
import { useFilterStore } from '@/store/filterStore';
import { Insight } from '@/utils/insights';

const CATEGORY_ICONS: Record<string, string> = {
  capacity:   '🏗️',
  generation: '⚡',
  efficiency: '📈',
  nuclear:    '⚛️',
  renewable:  '🌿',
  risk:       '🛡️',
  geography:  '🗺️',
};

const DIRECTION_ICONS: Record<string, string> = {
  increase: '↑',
  decrease: '↓',
  stable:   '→',
};

const DIRECTION_COLORS: Record<string, string> = {
  increase: 'text-blue-700',
  decrease: 'text-amber-700',
  stable:   'text-gray-600',
};

function InsightCard({ insight }: { insight: Insight }) {
  const borderColor =
    insight.magnitude === 'major'   ? '#B02A30' :
    insight.magnitude === 'moderate'? '#F99D27' : '#D1D5DB';

  return (
    <div
      className="bg-white rounded-md border-l-3 border border-gray-100 px-3 py-2"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm flex-shrink-0">{CATEGORY_ICONS[insight.category] ?? '📌'}</span>
        <div className="flex-1">
          <p className="text-[13px] text-gray-700 leading-snug">{insight.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[11px] font-bold ${DIRECTION_COLORS[insight.direction]}`}>
              {DIRECTION_ICONS[insight.direction]} {insight.direction}
            </span>
            <span className="text-[11px] text-gray-400 capitalize">{insight.category}</span>
            {insight.magnitude === 'major' && (
              <span className="text-[10px] font-bold text-icici-maroon bg-red-50 px-1.5 py-0.5 rounded">
                Key Signal
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatChanged() {
  const { insights, isLoading } = useInsightData();
  const powerSource = useFilterStore((s) => s.powerSource);

  const sourceLabel = powerSource === 'all' ? 'Power Sector' :
    powerSource.charAt(0).toUpperCase() + powerSource.slice(1);

  if (isLoading) {
    return (
      <div className="icici-card p-5 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="icici-card p-5">
        <h2 className="text-sm font-black text-gray-800 mb-1">What Changed? — {sourceLabel}</h2>
        <p className="text-xs text-gray-400">No significant changes detected in the current dataset for the selected filters.</p>
      </div>
    );
  }

  // Group by category
  const major    = insights.filter((i) => i.magnitude === 'major');
  const moderate = insights.filter((i) => i.magnitude === 'moderate');
  const minor    = insights.filter((i) => i.magnitude === 'minor');

  return (
    <div className="icici-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-lg flex-shrink-0">
          💡
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-800">What Changed? — {sourceLabel}</h2>
          <p className="text-[11px] text-gray-400">
            Automatically identified from dataset · {insights.length} signal{insights.length !== 1 ? 's' : ''} detected
          </p>
        </div>
      </div>

      {/* Key signals (major) */}
      {major.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Key Signals</p>
          <div className="space-y-1.5">
            {major.map((i) => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}

      {/* Moderate signals */}
      {moderate.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notable</p>
          <div className="space-y-1.5">
            {moderate.map((i) => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}

      {/* Minor signals — collapsible if many */}
      {minor.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Additional Context</p>
          <div className="space-y-2">
            {minor.map((i) => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-300 mt-4 pt-3 border-t border-gray-50">
        Insights computed from CEA/NPCIL data. Directional statements reflect measured changes only — not investment advice.
      </p>
    </div>
  );
}
