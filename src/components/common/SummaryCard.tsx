import { formatGW, formatMW, formatBU, formatMU, formatPercentage } from '@/utils/formatting';

interface SummaryCardProps {
  title: string;
  value: number | null;
  unit: 'GW' | 'MW' | 'BU' | 'MU' | '%';
  percentageShare?: number;
  lastUpdated: string;
  dataSource: string;
  dataAsOf?: string;
  isUnavailable?: boolean;
  accentColor?: string;
}

export function SummaryCard({
  title,
  value,
  unit,
  percentageShare,
  lastUpdated,
  dataSource,
  dataAsOf,
  isUnavailable = false,
  accentColor = '#B02A30',
}: SummaryCardProps) {
  const formatValue = () => {
    if (isUnavailable || value === null) return 'Data unavailable';
    switch (unit) {
      case 'GW': return formatGW(value);
      case 'MW': return formatMW(value);
      case 'BU': return formatBU(value);
      case 'MU': return formatMU(value);
      case '%': return formatPercentage(value);
      default: return String(value);
    }
  };

  return (
    <div
      className={`icici-card p-5 relative overflow-hidden ${
        isUnavailable ? 'opacity-60' : ''
      }`}
      role="region"
      aria-label={`${title}: ${formatValue()} ${unit}`}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {title}
      </h3>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl font-black ${
            isUnavailable ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {formatValue()}
        </span>
        {!isUnavailable && value !== null && (
          <span className="text-base font-semibold text-gray-400">{unit}</span>
        )}
      </div>

      {percentageShare !== undefined && !isUnavailable && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentageShare}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: accentColor }}>
              {formatPercentage(percentageShare)}%
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[14px] text-gray-400 font-medium">{dataSource}</span>
        <span className="text-[14px] text-gray-400">{lastUpdated}</span>
      </div>
      {dataAsOf && (
        <div className="text-[14px] text-gray-400 mt-1 italic">Data as of: {dataAsOf}</div>
      )}
    </div>
  );
}


