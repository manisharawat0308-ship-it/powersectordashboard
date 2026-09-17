import { useState, useMemo, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { useGeographyData } from '@/hooks/useGeographyData';
import { useStateProjects } from '@/hooks/useStateProjects';
import { useNuclearPlants } from '@/hooks/useNuclearData';
import { useFilterStore } from '@/store/filterStore';
import { StateCapacityData } from '@/types/index';
import { EnergySource } from '@/types/filters';
import { formatGW, formatBU, formatMW, formatSourceLabel } from '@/utils/formatting';
import { getSourceColor } from '@/utils/colors';

const INDIA_TOPO_URL = '/data/geography/india-states.topo.json';
const NUCLEAR_COLOR = '#7B1FA2';

// Source to emoji icon mapping
const SOURCE_ICONS: Record<string, string> = {
  coal: '🏭',
  lignite: '🏭',
  gas: '🔥',
  diesel: '⛽',
  solar: '☀️',
  wind: '💨',
  small_hydro: '💧',
  large_hydro: '💧',
  biomass: '🌿',
  nuclear: '⚛️',
};

// Filter options
const SOURCE_FILTERS = [
  { source: 'coal', label: 'Coal', icon: '🏭' },
  { source: 'solar', label: 'Solar', icon: '☀️' },
  { source: 'wind', label: 'Wind', icon: '💨' },
  { source: 'large_hydro', label: 'Hydro', icon: '💧' },
  { source: 'gas', label: 'Gas', icon: '🔥' },
  { source: 'nuclear', label: 'Nuclear', icon: '⚛️' },
  { source: 'biomass', label: 'Biomass', icon: '🌿' },
];

// Approximate state center coordinates [longitude, latitude]
const STATE_CENTERS: Record<string, [number, number]> = {
  MH: [76.0, 19.5],
  GJ: [71.8, 22.5],
  RJ: [73.8, 26.5],
  TN: [78.5, 11.0],
  KA: [76.5, 15.0],
  UP: [80.5, 27.0],
  AP: [79.5, 16.0],
  MP: [78.5, 23.5],
  TS: [79.0, 18.0],
  WB: [87.5, 23.5],
  CG: [82.0, 21.5],
  HR: [76.2, 29.0],
  PB: [75.5, 31.0],
  OD: [84.0, 20.5],
  JH: [85.5, 23.5],
  HP: [77.2, 31.8],
  UK: [79.5, 30.2],
  KL: [76.5, 10.0],
  JK: [75.5, 34.0],
  BR: [85.5, 25.5],
  AS: [92.5, 26.2],
  SK: [88.5, 27.5],
};

// Map TopoJSON IDs to our state codes
const TOPO_ID_TO_STATE: Record<string, string> = {
  AN: 'AN', AP: 'AP', AR: 'AR', AS: 'AS', BR: 'BR', CT: 'CG',
  PY: 'PY', PB: 'PB', RJ: 'RJ', SK: 'SK', TN: 'TN', CH: 'CH',
  TS: 'TS', TR: 'TR', UP: 'UP', UK: 'UK', WB: 'WB', OD: 'OD',
  DN: 'DN', DD: 'DD', GA: 'GA', GJ: 'GJ', HR: 'HR', HP: 'HP',
  JK: 'JK', JH: 'JH', KA: 'KA', KL: 'KL', LD: 'LD', MP: 'MP',
  MH: 'MH', MN: 'MN', ML: 'ML', MZ: 'MZ', NL: 'NL', DL: 'DL',
};

export function GeographySection() {
  const { data: statesData, isLoading } = useGeographyData();
  const { data: projectsData } = useStateProjects();
  const { data: nuclearPlantsData } = useNuclearPlants();
  const powerSource = useFilterStore((s) => s.powerSource);
  const [selectedState, setSelectedState] = useState<StateCapacityData | null>(null);
  const [hoveredState, setHoveredState] = useState<StateCapacityData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([82, 24]);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const showNuclearMarkers = (powerSource === 'all' || powerSource === 'nuclear') && (sourceFilter === null || sourceFilter === 'nuclear');

  // Arrow key panning — only when map container is focused
  const PAN_STEP = 2;
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setCenter((prev) => [prev[0], prev[1] + PAN_STEP / zoom]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setCenter((prev) => [prev[0], prev[1] - PAN_STEP / zoom]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        setCenter((prev) => [prev[0] - PAN_STEP / zoom, prev[1]]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        setCenter((prev) => [prev[0] + PAN_STEP / zoom, prev[1]]);
        break;
      case '+':
      case '=':
        e.preventDefault();
        setZoom((z) => Math.min(z * 1.3, 8));
        break;
      case '-':
        e.preventDefault();
        setZoom((z) => Math.max(z / 1.3, 1));
        break;
    }
  }, [zoom]);

  const stateMap = useMemo(() => {
    if (!statesData) return new Map<string, StateCapacityData>();
    const m = new Map<string, StateCapacityData>();
    statesData.forEach((s) => m.set(s.stateCode, s));
    return m;
  }, [statesData]);

  // Get capacity of a specific source for a state (merging hydro if needed)
  const getStateSourceCapacity = (stateData: StateCapacityData, source: string): number => {
    if (source === 'large_hydro') {
      return (stateData.bySource['large_hydro'] || 0) + (stateData.bySource['small_hydro'] || 0);
    }
    return stateData.bySource[source] || 0;
  };

  // Check if state has a specific source
  const stateHasSource = (stateData: StateCapacityData | undefined, source: string): boolean => {
    if (!stateData) return false;
    if (source === 'large_hydro') {
      return (stateData.bySource['large_hydro'] || 0) + (stateData.bySource['small_hydro'] || 0) > 0;
    }
    return (stateData.bySource[source] || 0) > 0;
  };

  // For each state, determine the dominant source and use its color
  const getDominantSourceColor = (stateData: StateCapacityData | undefined): string => {
    if (!stateData || stateData.isUnavailable) return '#E0E0E0';
    if (stateData.topSources.length === 0) return '#E0E0E0';
    let hydroMW = 0;
    let maxSource = stateData.topSources[0];
    stateData.topSources.forEach((s) => {
      if (s.source === 'large_hydro' || s.source === 'small_hydro') {
        hydroMW += s.capacityMW;
      }
    });
    if (hydroMW > maxSource.capacityMW && (maxSource.source !== 'large_hydro' && maxSource.source !== 'small_hydro')) {
      return getSourceColor('large_hydro');
    }
    return getSourceColor(maxSource.source);
  };

  // Get the dominant source name (merging hydro)
  const getDominantSourceName = (stateData: StateCapacityData): string => {
    if (stateData.topSources.length === 0) return '';
    let hydroMW = 0;
    const maxSource = stateData.topSources[0];
    stateData.topSources.forEach((s) => {
      if (s.source === 'large_hydro' || s.source === 'small_hydro') {
        hydroMW += s.capacityMW;
      }
    });
    if (hydroMW > maxSource.capacityMW && (maxSource.source !== 'large_hydro' && maxSource.source !== 'small_hydro')) {
      return 'large_hydro';
    }
    return maxSource.source;
  };

  // Lighter shade of a hex color
  const lightenColor = (hex: string, amount: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, r + Math.round((255 - r) * amount));
    const lg = Math.min(255, g + Math.round((255 - g) * amount));
    const lb = Math.min(255, b + Math.round((255 - b) * amount));
    return `rgb(${lr}, ${lg}, ${lb})`;
  };

  // Get fill color for a state based on filter
  const getStateFillColor = (stateData: StateCapacityData | undefined, stateCode: string): string => {
    if (!stateData || stateData.isUnavailable) return '#E0E0E0';

    // If a source filter is active
    if (sourceFilter) {
      const hasSource = stateHasSource(stateData, sourceFilter);
      if (!hasSource) return '#F5F5F5'; // Very light gray for states without this source
      // Color intensity based on capacity of that source relative to max
      const sourceColor = getSourceColor(sourceFilter as EnergySource);
      const capacity = getStateSourceCapacity(stateData, sourceFilter);
      const maxCapacity = Math.max(...(statesData || []).map((s) => getStateSourceCapacity(s, sourceFilter!)));
      const intensity = maxCapacity > 0 ? capacity / maxCapacity : 0;
      // Lighter for less, darker for more
      return lightenColor(sourceColor, 0.6 - intensity * 0.5);
    }

    // Default: color by dominant source
    if (selectedState?.stateCode === stateCode) return '#F99D27';
    const dominantColor = getDominantSourceColor(stateData);
    return lightenColor(dominantColor, 0.35);
  };

  if (isLoading) {
    return <div className="animate-pulse h-[600px] bg-gray-200 rounded-xl" />;
  }

  if (!statesData || statesData.length === 0) {
    return (
      <div className="icici-card p-6 border-l-4 border-icici-maroon">
        <p className="font-bold text-icici-maroon">Geography Section — Data temporarily unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Compact Source Filter Bar */}
      <div className="sticky top-[52px] z-30 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500 uppercase">Source:</span>
          <button
            onClick={() => setSourceFilter(null)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              sourceFilter === null ? 'bg-icici-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {SOURCE_FILTERS.map((sf) => (
            <button
              key={sf.source}
              onClick={() => setSourceFilter(sourceFilter === sf.source ? null : sf.source)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                sourceFilter === sf.source ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={sourceFilter === sf.source ? { backgroundColor: getSourceColor(sf.source as any) } : {}}
            >
              {sf.icon} {sf.label}
            </button>
          ))}
          {sourceFilter && (
            <span className="text-[10px] text-gray-400 ml-2">Darker = higher capacity</span>
          )}
        </div>
      </div>

      {/* Map Block */}
      <div className="icici-card rounded-xl p-0 overflow-hidden">
        <div
          ref={mapContainerRef}
          className="relative overflow-hidden outline-none"
          style={{ height: '650px' }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => mapContainerRef.current?.focus()}
        >
          <p className="absolute bottom-2 left-2 z-10 text-[14px] text-gray-400 bg-white/80 px-2 py-0.5 rounded">
            Click map to focus • Arrow keys to pan • +/- to zoom
          </p>
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            <button
              onClick={() => setZoom(Math.min(zoom * 1.4, 8))}
              className="w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom / 1.4, 1))}
              className="w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100"
            >
              −
            </button>
            <button
              onClick={() => { setZoom(1); setCenter([82, 24]); }}
              className="w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100"
              title="Reset"
            >
              ⟲
            </button>
          </div>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1100,
              center: [82, 24],
            }}
            width={800}
            height={700}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={INDIA_TOPO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const topoId = geo.id as string;
                    const stateCode = TOPO_ID_TO_STATE[topoId];
                    const stateData = stateCode ? stateMap.get(stateCode) : undefined;
                    const fillColor = getStateFillColor(stateData, stateCode || '');
                    const dominantColor = getDominantSourceColor(stateData);
                    const hoverColor = sourceFilter
                      ? (stateHasSource(stateData, sourceFilter) ? getSourceColor(sourceFilter as EnergySource) : '#E0E0E0')
                      : dominantColor;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="#fff"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: hoverColor, outline: 'none', cursor: 'pointer', opacity: 0.85 },
                          pressed: { fill: hoverColor, outline: 'none' },
                        }}
                        onMouseEnter={(evt) => {
                          if (stateData) {
                            setHoveredState(stateData);
                            setTooltipPos({ x: evt.clientX, y: evt.clientY });
                          }
                        }}
                        onMouseMove={(evt) => {
                          setTooltipPos({ x: evt.clientX, y: evt.clientY });
                        }}
                        onMouseLeave={() => {
                          setHoveredState(null);
                          setTooltipPos(null);
                        }}
                        onClick={() => {
                          if (stateData) {
                            setSelectedState(selectedState?.stateCode === stateCode ? null : stateData);
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              {/* Source icons / capacity labels on states */}
              {statesData
                .filter((s) => STATE_CENTERS[s.stateCode] && s.topSources.length > 0)
                .map((state) => {
                  const coords = STATE_CENTERS[state.stateCode];
                  if (!coords) return null;

                  // If source filter is active, show capacity of that source
                  if (sourceFilter) {
                    const cap = getStateSourceCapacity(state, sourceFilter);
                    if (cap === 0) return null; // Don't show icon for states without this source
                    return (
                      <Marker key={state.stateCode} coordinates={coords}>
                        <text
                          textAnchor="middle"
                          y={-8}
                          fontSize={14}
                          style={{ pointerEvents: 'none' }}
                        >
                          {SOURCE_ICONS[sourceFilter]}
                        </text>
                        <text
                          textAnchor="middle"
                          y={8}
                          fontSize={8}
                          fontFamily="Mulish"
                          fontWeight={800}
                          fill="#333"
                          style={{ pointerEvents: 'none' }}
                        >
                          {cap >= 1000 ? `${(cap / 1000).toFixed(1)} GW` : `${cap} MW`}
                        </text>
                      </Marker>
                    );
                  }

                  // Default: show dominant source icon
                  const topSource = getDominantSourceName(state);
                  const icon = SOURCE_ICONS[topSource] || '⚡';
                  return (
                    <Marker key={state.stateCode} coordinates={coords}>
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={16}
                        style={{ pointerEvents: 'none' }}
                      >
                        {icon}
                      </text>
                    </Marker>
                  );
                })}

              {/* Nuclear plant markers — shown when powerSource = all or nuclear */}
              {showNuclearMarkers && nuclearPlantsData?.plants.map((plant) => {
                const [lng, lat] = plant.coordinates;
                const isOperating = plant.status === 'operating';
                const isUC = plant.status === 'under_construction';
                return (
                  <Marker key={plant.plantId} coordinates={[lng, lat]}>
                    {/* Outer ring for visibility */}
                    <circle r={isOperating ? 7 : 6} fill={isOperating ? NUCLEAR_COLOR : '#F99D27'} opacity={0.25} />
                    <circle r={isOperating ? 4 : 3} fill={isOperating ? NUCLEAR_COLOR : '#F99D27'} stroke="white" strokeWidth={1} />
                    <text
                      textAnchor="middle"
                      y={-10}
                      fontSize={9}
                      fontFamily="Mulish"
                      fontWeight={800}
                      fill={isOperating ? NUCLEAR_COLOR : '#E65100'}
                      style={{ pointerEvents: 'none' }}
                    >
                      {plant.shortName}{isUC ? ' (UC)' : ''}
                    </text>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Floating Tooltip */}
          {hoveredState && tooltipPos && !selectedState && (
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 pointer-events-none font-mulish"
              style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
            >
              <p className="font-black text-sm text-gray-900">{hoveredState.stateName}</p>
              <div className="mt-1.5 space-y-1 text-xs">
                {sourceFilter ? (
                  <>
                    <p>
                      <span className="text-gray-500">{formatSourceLabel(sourceFilter)} Capacity:</span>{' '}
                      <span className="font-bold">{formatMW(getStateSourceCapacity(hoveredState, sourceFilter))} MW</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Total Capacity:</span>{' '}
                      <span className="font-bold">{formatGW(hoveredState.installedCapacityGW)} GW</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Share of state:</span>{' '}
                      <span className="font-bold">
                        {hoveredState.installedCapacityGW > 0
                          ? ((getStateSourceCapacity(hoveredState, sourceFilter) / (hoveredState.installedCapacityGW * 1000)) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p><span className="text-gray-500">Capacity:</span> <span className="font-bold">{formatGW(hoveredState.installedCapacityGW)} GW</span></p>
                    <p><span className="text-gray-500">Generation:</span> <span className="font-bold">{formatBU(hoveredState.generationBU)} BU</span></p>
                    <p className="text-gray-500">Dominant Source:</p>
                    <div className="flex gap-1 mt-1">
                      {hoveredState.topSources.slice(0, 3).map((s, i) => (
                        <span
                          key={s.source}
                          className="text-[14px] px-1.5 py-0.5 rounded font-bold text-white"
                          style={{ backgroundColor: getSourceColor(s.source) }}
                        >
                          {i === 0 ? '👑 ' : ''}{formatSourceLabel(s.source)} ({formatMW(s.capacityMW)} MW)
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* State Projects Popup — compact, fixed in viewport */}
          {selectedState && projectsData && projectsData[selectedState.stateCode] && (
            <div className="fixed top-[140px] right-4 z-40 w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl font-mulish">
              {/* Header */}
              <div className="px-3 py-2 bg-icici-navy text-white flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏗️</span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{selectedState.stateName}</p>
                    <p className="text-[14px] text-white/60">{formatGW(selectedState.installedCapacityGW)} GW • {formatBU(selectedState.generationBU)} BU</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedState(null)}
                  className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-[14px] hover:bg-white/30"
                >
                  ✕
                </button>
              </div>
              {/* Compact project rows */}
              <div className="p-2">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="text-[14px] text-gray-400 font-bold uppercase">
                      <th className="text-left pb-1 pl-1">#</th>
                      <th className="text-left pb-1">Project</th>
                      <th className="text-left pb-1">Source</th>
                      <th className="text-right pb-1 pr-1">MW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectsData[selectedState.stateCode]
                      .filter((p) => p.capacityMW >= 100)
                      .slice(0, 10)
                      .map((project, index) => (
                      <tr key={project.name} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-1.5 pl-1">
                          <span
                            className="inline-flex w-4 h-4 rounded-full items-center justify-center text-white font-black text-[14px]"
                            style={{ backgroundColor: getSourceColor(project.source as any) }}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-1.5 pr-1">
                          <div className="font-bold text-gray-800 leading-tight truncate max-w-[140px]">{project.name}</div>
                          <div className="text-[14px] text-gray-400">{project.location}</div>
                        </td>
                        <td className="py-1.5">
                          <span
                            className="text-[14px] px-1.5 py-0.5 rounded font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: getSourceColor(project.source as any) }}
                          >
                            {SOURCE_ICONS[project.source]} {formatSourceLabel(project.source)}
                          </span>
                        </td>
                        <td className="py-1.5 pr-1 text-right font-black text-gray-900 whitespace-nowrap">
                          {formatMW(project.capacityMW)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Detail Panel */}
      {selectedState && (
        <div className="icici-card p-6 border-t-4 border-icici-orange mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-gray-800">{selectedState.stateName}</h3>
              <p className="text-xs text-gray-500">Detailed power infrastructure breakdown</p>
            </div>
            <button
              onClick={() => setSelectedState(null)}
              className="text-sm font-semibold text-icici-maroon hover:text-icici-maroon-dark"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
            {/* Summary */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-icici-cream to-white border border-gray-100">
                <div className="text-[14px] text-gray-500 font-bold uppercase">Installed Capacity</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{formatGW(selectedState.installedCapacityGW)} GW</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-icici-cream to-white border border-gray-100">
                <div className="text-[14px] text-gray-500 font-bold uppercase">Generation</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{formatBU(selectedState.generationBU)} BU</div>
              </div>
            </div>

            {/* By Source */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase">By Source</h4>
              <div className="space-y-2">
                {Object.entries(selectedState.bySource)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([source, capacity]) => (
                    <div key={source} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSourceColor(source as any) }}
                      />
                      <span className="text-xs font-medium text-gray-700 flex-1">{formatSourceLabel(source)}</span>
                      <span className="text-xs font-black text-gray-900">{formatMW(capacity as number)} MW</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Ownership */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase">By Ownership</h4>
              <div className="space-y-2">
                {Object.entries(selectedState.byOwnership).map(([ownership, capacity]) => (
                  <div key={ownership} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 capitalize">{ownership.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-black text-gray-900">{formatMW(capacity as number)} MW</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top States Ranking */}
      <div className="icici-card p-6 mt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">
          {sourceFilter
            ? `Top States by ${formatSourceLabel(sourceFilter)} Capacity`
            : 'Top 10 States by Installed Capacity'}
        </h3>
        <div className="space-y-2">
          {[...statesData]
            .map((state) => ({
              ...state,
              sortCapacity: sourceFilter
                ? getStateSourceCapacity(state, sourceFilter)
                : state.installedCapacityGW * 1000,
            }))
            .filter((s) => s.sortCapacity > 0)
            .sort((a, b) => b.sortCapacity - a.sortCapacity)
            .slice(0, 10)
            .map((state, index) => {
              const maxCap = sourceFilter
                ? Math.max(...statesData.map((s) => getStateSourceCapacity(s, sourceFilter!)))
                : statesData[0].installedCapacityGW * 1000;
              const barColor = sourceFilter ? getSourceColor(sourceFilter as EnergySource) : getDominantSourceColor(state);

              return (
                <div
                  key={state.stateCode}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedState(state)}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[14px]"
                    style={{ backgroundColor: barColor }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-bold text-gray-800">{state.stateName}</span>
                  </div>
                  <div className="w-48 hidden tablet:block">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${maxCap > 0 ? (state.sortCapacity / maxCap) * 100 : 0}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-gray-900">
                      {sourceFilter
                        ? formatMW(state.sortCapacity) + ' MW'
                        : formatGW(state.installedCapacityGW) + ' GW'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}


