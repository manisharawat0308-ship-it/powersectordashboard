import { EnergyCategory } from '@/types/filters';
import { SubSourceCapacity } from '@/types/index';
import { formatMW, formatPercentage, formatSourceLabel } from '@/utils/formatting';
import { getSourceColor } from '@/utils/colors';

interface DrillDownPanelProps {
  category: EnergyCategory;
  items: SubSourceCapacity[];
  onBack: () => void;
}

export function DrillDownPanel({ category, items, onBack }: DrillDownPanelProps) {
  const categoryLabel = category === 'fossil' ? 'Fossil Energy' : 'Non-Fossil Energy';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {categoryLabel} — Detailed Breakdown
        </h3>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.source}
            className={`rounded-lg border p-3 ${
              item.isUnavailable ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSourceColor(item.source) }}
              />
              <span className="text-sm font-medium text-gray-700">
                {formatSourceLabel(item.source)}
              </span>
            </div>

            {item.isUnavailable ? (
              <div className="text-gray-400 text-sm">Data unavailable</div>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-900">
                  {formatMW(item.capacityMW)} MW
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>{formatPercentage(item.percentageOfCategory)}% of {categoryLabel}</div>
                  <div>{formatPercentage(item.percentageOfTotal)}% of national total</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


