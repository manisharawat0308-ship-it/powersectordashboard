import { useState } from 'react';
import { useMarketPlayers, MarketPlayer } from '@/hooks/useMarketPlayers';
import { useThermalPlayers, ThermalOperator, HydroOperator, ThermalPlant } from '@/hooks/useThermalPlayers';
import { useNuclearPlayers, NuclearOperator, NuclearOperatorPlant } from '@/hooks/useNuclearPlayers';
import { useOEMData, OEMProfile, TurbineModel } from '@/hooks/useOEMData';
import { ManufacturingDashboard } from '@/components/sections/ManufacturingDashboard';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { formatMW } from '@/utils/formatting';
import { getSourceColor } from '@/utils/colors';

type PlayerTab = 'renewable' | 'thermal' | 'hydro' | 'nuclear' | 'manufacturers';

// ── CSV Download Utility ──────────────────────────────────────────────────────

function downloadPlayersCSV(tab: PlayerTab, thermalData: any, reData: any, nuclearData: any) {
  let csvContent = '';
  let filename = '';

  if (tab === 'thermal' && thermalData) {
    filename = 'thermal_power_players.csv';
    csvContent = 'Rank,Operator,Ownership,Listed,Total Thermal MW,Headquarters,Plant Name,State,Fuel,Plant Capacity MW,Unit Config,PLF %\n';
    thermalData.thermalOperators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        csvContent += `${op.rank},"${op.name}",${op.ownership},${op.listed},${op.totalThermalMW},${op.headquarters},"${p.plantName}",${p.state},${p.fuel},${p.totalCapacityMW},"${p.unitConfig}",${p.plf ?? ''}\n`;
      });
    });
  } else if (tab === 'hydro' && thermalData) {
    filename = 'hydro_power_players.csv';
    csvContent = 'Rank,Operator,Ownership,Listed,Total Hydro MW,Headquarters,Plant Name,State,River,Plant Capacity MW,Unit Config,CUF %,Type\n';
    thermalData.hydroOperators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        csvContent += `${op.rank},"${op.name}",${op.ownership},${op.listed},${op.totalHydroMW},${op.headquarters},"${p.plantName}",${p.state},${p.river ?? ''},${p.totalCapacityMW},"${p.unitConfig}",${p.cuf ?? ''},${p.type ?? ''}\n`;
      });
    });
  } else if (tab === 'nuclear' && nuclearData) {
    filename = 'nuclear_power_players.csv';
    csvContent = 'Rank,Operator,Total Operating MW,Total UC MW,Plant Name,State,Capacity MW,Unit Config,CUF %,Generation BU\n';
    nuclearData.operators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        csvContent += `${op.rank},"${op.name}",${op.totalOperatingMW},${op.totalUCMW},"${p.plantName}",${p.state},${p.totalCapacityMW},"${p.unitConfig}",${p.cuf ?? ''},${p.generationFY25BU}\n`;
      });
    });
  } else if (tab === 'renewable' && reData) {
    filename = 'renewable_energy_players.csv';
    csvContent = 'Rank,Company,Total RE MW,Solar MW,Wind MW,Hydro MW,Ownership,Listed,Notes\n';
    reData.companies.forEach((c: any) => {
      csvContent += `${c.rank},"${c.name}",${c.totalRECapacityMW},${c.solarMW},${c.windMW},${c.hydroMW},${c.ownership},"${c.listed}","${(c.notes || '').replace(/"/g, '""')}"\n`;
    });
  }

  if (!csvContent) return;

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ── All-Players Multi-Sheet Excel Download ────────────────────────────────────
// Builds a genuine multi-sheet Excel workbook (SpreadsheetML 2003 XML, saved as
// .xls) with NO external dependency. Each power category gets its own worksheet,
// so a single file contains every player across Thermal, Hydro, Nuclear and
// Renewable. Opens directly in Excel / LibreOffice / Google Sheets.

function xmlEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSheet(name: string, headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerCells = headers
    .map((h) => `<Cell ss:StyleID="hdr"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`)
    .join('');
  const bodyRows = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          const isNum = typeof val === 'number' && Number.isFinite(val);
          const type = isNum ? 'Number' : 'String';
          const content = isNum ? String(val) : xmlEscape(val ?? '');
          return `<Cell><Data ss:Type="${type}">${content}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');
  // Excel sheet names must be <=31 chars and cannot contain : \ / ? * [ ]
  const safeName = name.replace(/[:\\/?*\[\]]/g, ' ').slice(0, 31);
  return `<Worksheet ss:Name="${xmlEscape(safeName)}"><Table><Row>${headerCells}</Row>${bodyRows}</Table></Worksheet>`;
}

function downloadAllPlayersWorkbook(thermalData: any, reData: any, nuclearData: any) {
  const sheets: string[] = [];

  // Thermal — one row per plant
  if (thermalData?.thermalOperators) {
    const rows: (string | number | null)[][] = [];
    thermalData.thermalOperators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        rows.push([op.rank, op.name, op.ownership, op.listed, op.totalThermalMW, op.headquarters, p.plantName, p.state, p.fuel, p.totalCapacityMW, p.unitConfig, p.plf ?? '', p.status ?? '']);
      });
    });
    sheets.push(buildSheet('Thermal', ['Rank', 'Operator', 'Ownership', 'Listed', 'Total Thermal MW', 'Headquarters', 'Plant Name', 'State', 'Fuel', 'Plant Capacity MW', 'Unit Config', 'PLF %', 'Status'], rows));
  }

  // Hydro — one row per plant
  if (thermalData?.hydroOperators) {
    const rows: (string | number | null)[][] = [];
    thermalData.hydroOperators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        rows.push([op.rank, op.name, op.ownership, op.listed, op.totalHydroMW, op.headquarters, p.plantName, p.state, p.river ?? '', p.totalCapacityMW, p.unitConfig, p.cuf ?? '', p.type ?? '']);
      });
    });
    sheets.push(buildSheet('Hydro', ['Rank', 'Operator', 'Ownership', 'Listed', 'Total Hydro MW', 'Headquarters', 'Plant Name', 'State', 'River', 'Plant Capacity MW', 'Unit Config', 'CUF %', 'Type'], rows));
  }

  // Nuclear — one row per plant
  if (nuclearData?.operators) {
    const rows: (string | number | null)[][] = [];
    nuclearData.operators.forEach((op: any) => {
      op.plants.forEach((p: any) => {
        rows.push([op.rank, op.name, op.totalOperatingMW, op.totalUCMW, p.plantName, p.state, p.totalCapacityMW, p.unitConfig, p.cuf ?? '', p.generationFY25BU]);
      });
    });
    sheets.push(buildSheet('Nuclear', ['Rank', 'Operator', 'Total Operating MW', 'Total UC MW', 'Plant Name', 'State', 'Capacity MW', 'Unit Config', 'CUF %', 'Generation BU'], rows));
  }

  // Renewable — one row per company
  if (reData?.companies) {
    const rows: (string | number | null)[][] = [];
    reData.companies.forEach((c: any) => {
      rows.push([c.rank, c.name, c.totalRECapacityMW, c.solarMW, c.windMW, c.hydroMW, c.ownership, c.listed, c.notes ?? '']);
    });
    sheets.push(buildSheet('Renewable', ['Rank', 'Company', 'Total RE MW', 'Solar MW', 'Wind MW', 'Hydro MW', 'Ownership', 'Listed', 'Notes'], rows));
  }

  if (sheets.length === 0) return;

  const workbook =
    '<?xml version="1.0"?>' +
    '<?mso-application progid="Excel.Sheet"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:html="http://www.w3.org/TR/REC-html40">' +
    '<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#DDDDDD" ss:Pattern="Solid"/></Style></Styles>' +
    sheets.join('') +
    '</Workbook>';

  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'all_power_players.xls';
  link.click();
  URL.revokeObjectURL(link.href);
}


export function MarketPlayersSection() {
  const { data: reData, isLoading: reLoading } = useMarketPlayers();
  const { data: thermalData, isLoading: thermalLoading } = useThermalPlayers();
  const { data: nuclearData, isLoading: nuclearLoading } = useNuclearPlayers();
  const { data: oemData, isLoading: oemLoading } = useOEMData();
  const { sectorView } = useSectorFilter();
  const [activeTab, setActiveTab] = useState<PlayerTab>('thermal');
  const [selectedCompany, setSelectedCompany] = useState<MarketPlayer | null>(null);
  const [expandedOperator, setExpandedOperator] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOEM, setSelectedOEM] = useState<string | null>(null);

  const isLoading = reLoading || thermalLoading || nuclearLoading || oemLoading;

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  }

  const tabs: { id: PlayerTab; label: string; icon: string; color: string }[] = [
    { id: 'thermal', label: 'Thermal Power', icon: '🏭', color: '#B02A30' },
    { id: 'hydro', label: 'Hydro Power', icon: '💧', color: '#003D50' },
    { id: 'nuclear', label: 'Nuclear Power', icon: '⚛️', color: '#7B1FA2' },
    { id: 'renewable', label: 'Renewable Energy', icon: '🌿', color: '#005B75' },
    { id: 'manufacturers', label: 'Manufacturers', icon: '🏭', color: '#E65100' },
  ];

  return (
    <div className="space-y-5">
      {/* Header + Tab Bar */}
      <div className="icici-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">🏢</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Market Players — Power Sector</h2>
            <p className="text-[12px] text-gray-400">Operators · Plants · Unit configurations · Equipment manufacturers</p>
          </div>
          <button
            onClick={() => downloadPlayersCSV(activeTab, thermalData, reData, nuclearData)}
            className="ml-auto text-[11px] font-bold text-icici-navy border border-icici-navy/30 px-3 py-1.5 rounded-lg hover:bg-icici-navy/5 transition-all flex items-center gap-1.5 flex-shrink-0"
            title="Download current tab data as CSV (Excel-compatible)"
          >
            📥 Download Excel
          </button>
          <button
            onClick={() => downloadAllPlayersWorkbook(thermalData, reData, nuclearData)}
            className="text-[11px] font-bold text-white bg-icici-maroon px-3 py-1.5 rounded-lg hover:bg-icici-maroon/90 transition-all flex items-center gap-1.5 flex-shrink-0"
            title="Download ALL players (Thermal, Hydro, Nuclear, Renewable) in one Excel file — each category on its own sheet"
          >
            📚 Download All (All Sheets)
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                activeTab === t.id ? 'text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeTab === t.id ? { backgroundColor: t.color } : {}}
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Thermal Tab ═══ */}
      {activeTab === 'thermal' && thermalData && (
        <ThermalTab operators={thermalData.thermalOperators} oems={thermalData.equipmentManufacturers.turbineGeneratorOEMs} expandedOperator={expandedOperator} setExpandedOperator={setExpandedOperator} oemProfiles={oemData?.oems ?? []} selectedOEM={selectedOEM} setSelectedOEM={setSelectedOEM} />
      )}

      {/* ═══ Hydro Tab ═══ */}
      {activeTab === 'hydro' && thermalData && (
        <HydroTab operators={thermalData.hydroOperators} expandedOperator={expandedOperator} setExpandedOperator={setExpandedOperator} oemProfiles={oemData?.oems ?? []} selectedOEM={selectedOEM} setSelectedOEM={setSelectedOEM} />
      )}

      {/* ═══ Nuclear Tab ═══ */}
      {activeTab === 'nuclear' && nuclearData && (
        <NuclearTab operators={nuclearData.operators} supplyChain={nuclearData.upstreamSupplyChain} />
      )}

      {/* ═══ Renewable Tab (existing) ═══ */}
      {activeTab === 'renewable' && reData && (
        <RenewableTab data={reData} selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} filterType={filterType} setFilterType={setFilterType} sectorView={sectorView} />
      )}

      {/* ═══ Manufacturers Tab ═══ */}
      {activeTab === 'manufacturers' && (
        <div className="space-y-4">
          <ManufacturingDashboard mode="players" />
        </div>
      )}
    </div>
  );
}

// ─── Thermal Tab ──────────────────────────────────────────────────────────────

function ThermalTab({ operators, oems, expandedOperator, setExpandedOperator, oemProfiles, selectedOEM, setSelectedOEM }: {
  operators: ThermalOperator[];
  oems: { id: string; name: string; country: string; note: string }[];
  expandedOperator: string | null;
  setExpandedOperator: (id: string | null) => void;
  oemProfiles: OEMProfile[];
  selectedOEM: string | null;
  setSelectedOEM: (id: string | null) => void;
}) {
  // Filter operators by selected OEM
  const filteredOperators = selectedOEM
    ? operators.filter((op) =>
        op.plants.some((p) =>
          p.units.some((u) => u.turbineOEM === selectedOEM)
        )
      )
    : operators;

  return (
    <div className="space-y-4">
      {/* OEM Slicer */}
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Filter by Turbine/Generator OEM <span className="text-gray-400 normal-case font-normal">(double-click for details)</span></h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedOEM(null)}
            className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${
              !selectedOEM ? 'bg-icici-maroon text-white border-icici-maroon shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All OEMs
          </button>
          {oems.slice(0, 8).map((oem) => (
            <button
              key={oem.id}
              onClick={() => setSelectedOEM(selectedOEM === oem.id ? null : oem.id)}
              onDoubleClick={() => setSelectedOEM(oem.id)}
              className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${
                selectedOEM === oem.id ? 'bg-icici-navy text-white border-icici-navy shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-icici-navy'
              }`}
              title={`Click to filter plants by ${oem.name}. Double-click for full OEM details.`}
            >
              {oem.id === 'BHEL_B' ? 'BHEL (Boiler)' : oem.id} ({oem.country})
            </button>
          ))}
        </div>
        {selectedOEM && (
          <p className="text-[11px] text-icici-navy mt-2 font-bold">
            Showing operators with {selectedOEM} turbines · {filteredOperators.length} operator{filteredOperators.length !== 1 ? 's' : ''} match
          </p>
        )}
      </div>

      {/* OEM Detail Panel (shown when OEM is selected) */}
      {selectedOEM && <OEMDetailPanel oemId={selectedOEM} profiles={oemProfiles} onClose={() => setSelectedOEM(null)} />}

      {/* Operator Cards */}
      {filteredOperators.map((op) => {
        const isExpanded = expandedOperator === op.shortName;
        // Filter plants to show only those with selected OEM
        const visiblePlants = selectedOEM
          ? op.plants.filter((p) => p.units.some((u) => u.turbineOEM === selectedOEM))
          : op.plants;

        return (
          <div key={op.shortName} className="icici-card overflow-hidden">
            <div
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() => setExpandedOperator(isExpanded ? null : op.shortName)}
            >
              <div className="w-8 h-8 rounded-full bg-icici-maroon flex items-center justify-center text-white font-black text-[12px] flex-shrink-0">
                {op.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-gray-800 truncate">{op.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>{op.ownership === 'central_psu' ? '🏛️ Central PSU' : op.ownership === 'state_psu' ? '🏛️ State PSU' : '🏢 Private'}</span>
                  <span>· {op.listed}</span>
                  <span>· {op.headquarters}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black text-icici-maroon">{(op.totalThermalMW / 1000).toFixed(1)} GW</div>
                <div className="text-[11px] text-gray-400">Thermal · {visiblePlants.length} plant{visiblePlants.length !== 1 ? 's' : ''}</div>
              </div>
              <span className="text-gray-400 text-sm ml-2">{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-[11px] text-gray-400 italic">{op.notes}</p>
                {visiblePlants.map((plant) => (
                  <PlantCard key={plant.plantName} plant={plant} fuelLabel="🏭" highlightOEM={selectedOEM} />
                ))}
                <p className="text-[10px] text-gray-400 mt-2">Source: {op.source}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Hydro Tab ────────────────────────────────────────────────────────────────

function HydroTab({ operators, expandedOperator, setExpandedOperator, oemProfiles, selectedOEM, setSelectedOEM }: {
  operators: HydroOperator[];
  expandedOperator: string | null;
  setExpandedOperator: (id: string | null) => void;
  oemProfiles: OEMProfile[];
  selectedOEM: string | null;
  setSelectedOEM: (id: string | null) => void;
}) {
  const hydroOEMs = ['BHEL', 'ANDRITZ', 'ALSTOM', 'TOSHIBA'];
  const filteredOperators = selectedOEM
    ? operators.filter((op) => op.plants.some((p) => p.units.some((u) => u.turbineOEM === selectedOEM)))
    : operators;

  return (
    <div className="space-y-4">
      {/* OEM Slicer for Hydro */}
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Filter by Turbine OEM <span className="text-gray-400 normal-case font-normal">(double-click for details)</span></h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedOEM(null)}
            className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${
              !selectedOEM ? 'bg-icici-navy text-white border-icici-navy shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            All OEMs
          </button>
          {hydroOEMs.map((oemId) => (
            <button
              key={oemId}
              onClick={() => setSelectedOEM(selectedOEM === oemId ? null : oemId)}
              onDoubleClick={() => setSelectedOEM(oemId)}
              className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${
                selectedOEM === oemId ? 'bg-icici-navy text-white border-icici-navy shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-icici-navy'
              }`}
              title={`Click to filter. Double-click for full ${oemId} details.`}
            >
              {oemId}
            </button>
          ))}
        </div>
      </div>

      {/* OEM Detail Panel */}
      {selectedOEM && <OEMDetailPanel oemId={selectedOEM} profiles={oemProfiles} onClose={() => setSelectedOEM(null)} />}

      {filteredOperators.map((op) => {
        const isExpanded = expandedOperator === op.shortName;
        const visiblePlants = selectedOEM
          ? op.plants.filter((p) => p.units.some((u) => u.turbineOEM === selectedOEM))
          : op.plants;

        return (
          <div key={op.shortName} className="icici-card overflow-hidden">
            <div
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() => setExpandedOperator(isExpanded ? null : op.shortName)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[12px] flex-shrink-0" style={{ backgroundColor: '#003D50' }}>
                {op.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-gray-800 truncate">{op.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>{op.ownership === 'central_psu' ? '🏛️ Central PSU' : op.ownership === 'state_psu' ? '🏛️ State PSU' : '🏢 Private'}</span>
                  <span>· {op.listed}</span>
                  <span>· {op.headquarters}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black" style={{ color: '#003D50' }}>{(op.totalHydroMW / 1000).toFixed(1)} GW</div>
                <div className="text-[11px] text-gray-400">Hydro · {visiblePlants.length} plant{visiblePlants.length !== 1 ? 's' : ''}</div>
              </div>
              <span className="text-gray-400 text-sm ml-2">{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                <p className="text-[11px] text-gray-400 italic">{op.notes}</p>
                {visiblePlants.map((plant) => (
                  <PlantCard key={plant.plantName} plant={plant} fuelLabel="💧" highlightOEM={selectedOEM} />
                ))}
                <p className="text-[10px] text-gray-400 mt-2">Source: {op.source}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Plant Card (shared for Thermal & Hydro) ─────────────────────────────────

function PlantCard({ plant, fuelLabel, highlightOEM }: { plant: ThermalPlant; fuelLabel: string; highlightOEM?: string | null }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[12px] font-black text-gray-800">{fuelLabel} {plant.plantName}</div>
          <div className="text-[11px] text-gray-500">📍 {plant.state} · {plant.fuel?.toUpperCase() ?? (plant.type?.replace('_', ' ') ?? 'Hydro')}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[13px] font-black text-gray-800">{formatMW(plant.totalCapacityMW)} MW</div>
          {plant.plf !== undefined && plant.plf > 0 && <div className="text-[10px] text-green-700 font-bold">PLF {plant.plf}%</div>}
          {plant.cuf !== undefined && plant.cuf !== null && plant.cuf > 0 && <div className="text-[10px] text-blue-700 font-bold">CUF {plant.cuf}%</div>}
        </div>
      </div>

      {/* Unit Config highlight */}
      <div className="text-[11px] font-bold text-icici-maroon bg-red-50 border border-red-100 rounded px-2 py-1 mb-2">
        ⚙️ {plant.unitConfig}
      </div>

      {/* Unit breakdown */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-1.5">
        {plant.units.map((unit, i) => {
          const isHighlighted = highlightOEM && unit.turbineOEM === highlightOEM;
          return (
            <div key={i} className={`flex items-start gap-2 p-1.5 rounded border text-[11px] ${isHighlighted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex-1">
                <span className="font-bold text-gray-800">{unit.config}</span>
                <span className="text-gray-400 ml-1">({unit.totalMW} MW)</span>
                <div className="text-gray-500 mt-0.5">
                  {unit.technology}
                  {unit.turbineOEM && (
                    <span className={`ml-1 font-bold ${isHighlighted ? 'text-blue-700' : 'text-icici-navy'}`}>
                      · {unit.turbineOEM} {isHighlighted ? '✓' : ''}
                    </span>
                  )}
                  {unit.boilerOEM && <span className="text-gray-400"> + {unit.boilerOEM}</span>}
                </div>
                {unit.commissioningPeriod && <div className="text-gray-400">📅 {unit.commissioningPeriod}</div>}
                {unit.note && <div className="text-amber-600 mt-0.5 italic text-[10px]">💡 {unit.note}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {plant.note && <p className="text-[10px] text-amber-600 mt-2 italic">ℹ️ {plant.note}</p>}
    </div>
  );
}

// ─── OEM Detail Panel ─────────────────────────────────────────────────────────

function OEMDetailPanel({ oemId, profiles, onClose }: { oemId: string; profiles: OEMProfile[]; onClose: () => void }) {
  const oem = profiles.find((p) => p.id === oemId);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  if (!oem) {
    return (
      <div className="icici-card p-5 border-l-4 border-amber-300">
        <p className="text-[12px] text-amber-700">Detailed OEM data for "{oemId}" not yet available. Data exists for: BHEL, DOOSAN, GE, SIEMENS, ANDRITZ, L_T_MHI, ALSTOM.</p>
      </div>
    );
  }

  return (
    <div className="icici-card p-5 border-l-4 border-icici-navy">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-800">{oem.name}</h3>
          <p className="text-[11px] text-gray-500">{oem.country} · {oem.headquarters} · Founded {oem.founded} · {oem.listed}</p>
          <a href={oem.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-icici-navy font-bold hover:underline">{oem.website} ↗</a>
        </div>
        <button onClick={onClose} className="text-[12px] font-bold text-gray-400 hover:text-gray-600 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">✕ Close</button>
      </div>

      {/* Overview */}
      <p className="text-[12px] text-gray-700 mb-3 leading-relaxed">{oem.overview}</p>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 tablet:grid-cols-5 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <div className="text-base font-black text-icici-maroon">{(oem.indianFleet.totalInstalledMW / 1000).toFixed(0)} GW</div>
          <div className="text-[10px] text-gray-500">Total Fleet India</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <div className="text-base font-black text-gray-800">{oem.indianFleet.thermalUnitCount}</div>
          <div className="text-[10px] text-gray-500">Thermal Units</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <div className="text-base font-black text-blue-700">{oem.indianFleet.hydroUnitCount}</div>
          <div className="text-[10px] text-gray-500">Hydro Units</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <div className="text-base font-black text-purple-700">{oem.indianFleet.nuclearUnitCount}</div>
          <div className="text-[10px] text-gray-500">Nuclear Units</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <div className="text-base font-black text-icici-navy">{oem.indianFleet.marketSharePct}%</div>
          <div className="text-[10px] text-gray-500">Market Share</div>
        </div>
      </div>

      {/* Turbine Models */}
      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Turbine/Generator Models ({oem.turbineModels.length})</h4>
      <div className="space-y-2 mb-4">
        {oem.turbineModels.map((model) => {
          const isExpanded = expandedModel === model.model;
          return (
            <div key={model.model} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <div
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-all"
                onClick={() => setExpandedModel(isExpanded ? null : model.model)}
              >
                <div className="flex-1">
                  <div className="text-[12px] font-black text-gray-800">{model.model}</div>
                  <div className="text-[11px] text-gray-500">{model.type} · {model.capacity} · {model.technology}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[12px] font-black text-icici-navy">{model.unitsInstalled} units</div>
                  <div className="text-[10px] text-gray-400">{(model.totalFleetMW / 1000).toFixed(1)} GW fleet</div>
                </div>
                <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-3 text-[11px]">
                  {/* Specs grid */}
                  <div className="grid grid-cols-2 tablet:grid-cols-4 gap-2">
                    <div><span className="font-bold text-gray-500">Speed:</span> <span className="text-gray-700">{model.speed}</span></div>
                    <div><span className="font-bold text-gray-500">Steam:</span> <span className="text-gray-700">{model.steamConditions}</span></div>
                    <div><span className="font-bold text-gray-500">Efficiency:</span> <span className="text-gray-700">{model.efficiency}</span></div>
                    <div><span className="font-bold text-gray-500">License:</span> <span className="text-gray-700">{model.licenseFrom}</span></div>
                    <div><span className="font-bold text-gray-500">Year Range:</span> <span className="text-gray-700">{model.yearRange}</span></div>
                    <div className="tablet:col-span-3"><span className="font-bold text-gray-500">Typical Plants:</span> <span className="text-gray-700">{model.typicalPlants}</span></div>
                  </div>

                  {/* Known Issues */}
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="font-bold text-amber-800 mb-1">⚠️ Known Issues / Failure Patterns</p>
                    <ul className="space-y-0.5">
                      {model.knownIssues.map((issue, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-1"><span className="text-amber-500 flex-shrink-0">•</span>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Claims History */}
                  <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="font-bold text-red-800 mb-1">📋 Claims History & Loss Experience</p>
                    <p className="text-gray-700">{model.claimsHistory}</p>
                  </div>

                  {/* Insurance Notes */}
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="font-bold text-blue-800 mb-1">🛡️ Insurance Underwriting Notes</p>
                    <p className="text-gray-700">{model.insuranceNotes}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-green-50 border border-green-100">
          <h5 className="text-[11px] font-bold text-green-800 uppercase mb-1">Key Strengths</h5>
          <ul className="space-y-0.5 text-[11px] text-gray-700">{oem.keyStrengths.map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-green-600 flex-shrink-0">✓</span>{s}</li>)}</ul>
        </div>
        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
          <h5 className="text-[11px] font-bold text-red-800 uppercase mb-1">Key Risks</h5>
          <ul className="space-y-0.5 text-[11px] text-gray-700">{oem.keyRisks.map((r, i) => <li key={i} className="flex items-start gap-1"><span className="text-red-500 flex-shrink-0">▸</span>{r}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

// ─── Nuclear Tab ──────────────────────────────────────────────────────────────

function NuclearTab({ operators, supplyChain }: {
  operators: NuclearOperator[];
  supplyChain: any;
}) {
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);
  const [oemFilter, setOemFilter] = useState<string | null>(null);

  const nuclearOEMs = ['BHEL', 'AtomEnergomash (Russia)', 'GE (USA)'];

  return (
    <div className="space-y-4">
      {/* OEM Filter */}
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Filter by Turbine/Generator OEM</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOemFilter(null)}
            className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${!oemFilter ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            style={!oemFilter ? { backgroundColor: '#7B1FA2' } : {}}
          >
            All
          </button>
          {nuclearOEMs.map((oem) => (
            <button
              key={oem}
              onClick={() => setOemFilter(oemFilter === oem ? null : oem)}
              className={`text-[12px] px-3 py-1.5 rounded-full font-bold transition-all border ${oemFilter === oem ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              style={oemFilter === oem ? { backgroundColor: '#7B1FA2' } : {}}
            >
              {oem}
            </button>
          ))}
        </div>
        {oemFilter && <p className="text-[11px] text-purple-700 mt-2 font-bold">Showing plants with {oemFilter} turbines</p>}
      </div>

      {/* Operators */}
      {operators.map((op) => {
        // Filter plants by OEM if filter active
        const visiblePlants = oemFilter
          ? op.plants.filter((p: any) => p.units.some((u: any) => (u.turbineOEM || '').includes(oemFilter.split(' ')[0])))
          : op.plants;
        if (oemFilter && visiblePlants.length === 0) return null;

        return (
        <div key={op.shortName} className="icici-card overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[12px] flex-shrink-0" style={{ backgroundColor: '#7B1FA2' }}>
                {op.rank}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-black text-gray-800">{op.name}</div>
                <div className="text-[11px] text-gray-500">🏛️ {op.ownership === 'central_psu' ? 'Central PSU' : 'PSU'} · {op.listed} · {op.headquarters}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black" style={{ color: '#7B1FA2' }}>{(op.totalOperatingMW / 1000).toFixed(1)} GW</div>
                <div className="text-[11px] text-gray-400">Operating {op.totalUCMW > 0 ? `+ ${(op.totalUCMW / 1000).toFixed(1)} GW UC` : ''}</div>
              </div>
            </div>
            {op.financials && (
              <div className="flex gap-3 mt-2 text-[11px]">
                <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded">Revenue ₹{(op.financials.revenueINRCr / 1000).toFixed(1)}K Cr ({op.financials.fy})</span>
                <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">PAT ₹{(op.financials.netProfitINRCr / 1000).toFixed(1)}K Cr</span>
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-1 italic">{op.notes}</p>
          </div>

          {/* Plants */}
          <div className="p-4 space-y-3 bg-gray-50">
            {visiblePlants.map((plant: any) => {
              const isExpanded = expandedPlant === plant.plantId;
              return (
                <div key={plant.plantId} className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                  <div
                    className="p-3 flex items-center gap-2 cursor-pointer hover:bg-purple-50 transition-all"
                    onClick={() => setExpandedPlant(isExpanded ? null : plant.plantId)}
                  >
                    <div className="flex-1">
                      <div className="text-[12px] font-black text-gray-800">⚛️ {plant.plantName}</div>
                      <div className="text-[11px] text-gray-500">📍 {plant.state} · {plant.unitConfig}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-black" style={{ color: '#7B1FA2' }}>{plant.totalCapacityMW} MW</div>
                      {plant.cuf && <div className="text-[10px] text-green-700 font-bold">CUF {plant.cuf}%</div>}
                      {plant.generationFY25BU > 0 && <div className="text-[10px] text-gray-400">{plant.generationFY25BU} BU FY25</div>}
                    </div>
                    <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-3 bg-purple-50/50 space-y-2">
                      {plant.units.map((unit) => (
                        <div key={unit.unit} className="p-2 rounded-lg bg-white border border-purple-100 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-gray-800">{unit.unit}</span>
                            <span className="font-bold" style={{ color: unit.status === 'operating' ? '#4CAF50' : unit.status === 'under_construction' ? '#F99D27' : '#9E9E9E' }}>
                              {unit.capacityMW} MW · {unit.status === 'operating' ? '🟢 Operating' : unit.status === 'under_construction' ? '🟡 Under Construction' : '⚪ Shutdown'}
                            </span>
                          </div>
                          <div className="mt-1 text-gray-600 space-y-0.5">
                            <div><span className="font-bold text-gray-500">Reactor:</span> {unit.reactorType} — {unit.reactorSupplier}</div>
                            <div><span className="font-bold text-gray-500">Turbine-Generator:</span> {unit.turbineOEM}</div>
                            {unit.reactorVesselOEM && <div><span className="font-bold text-gray-500">Reactor Vessel:</span> {unit.reactorVesselOEM}</div>}
                            {unit.steamGeneratorOEM && <div><span className="font-bold text-gray-500">Steam Generator:</span> {unit.steamGeneratorOEM}</div>}
                            {unit.fuelSupplier && <div><span className="font-bold text-gray-500">Fuel:</span> {unit.fuelSupplier}</div>}
                            {unit.commissioningYear && <div><span className="font-bold text-gray-500">Commissioned:</span> {unit.commissioningYear}</div>}
                          </div>
                          {unit.note && <p className="text-[10px] text-purple-700 mt-1 italic">💡 {unit.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
      })}

      {/* Supply Chain */}
      {supplyChain && (
        <div className="icici-card p-5">
          <h3 className="text-sm font-black text-gray-800 mb-3">🔗 Nuclear Supply Chain — Key Entities</h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
            {Object.entries(supplyChain).map(([key, entities]: [string, any]) => (
              <div key={key} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </h4>
                <div className="space-y-1.5">
                  {(entities as any[]).map((e: any, i: number) => (
                    <div key={i} className="text-[11px]">
                      <span className="font-bold text-gray-800">{e.entity}</span>
                      <span className="text-gray-400 ml-1">({e.ownership})</span>
                      <div className="text-gray-500 mt-0.5">{e.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Renewable Tab (existing logic preserved) ────────────────────────────────

function RenewableTab({ data, selectedCompany, setSelectedCompany, filterType, setFilterType, sectorView }: {
  data: any;
  selectedCompany: MarketPlayer | null;
  setSelectedCompany: (c: MarketPlayer | null) => void;
  filterType: string;
  setFilterType: (f: string) => void;
  sectorView: string;
}) {
  if (sectorView === 'fossil') {
    return (
      <div className="icici-card p-6 border-l-4 border-amber-400">
        <p className="font-bold text-amber-700">RE Market Players data is available for Non-Fossil sector only</p>
        <p className="text-xs text-gray-500 mt-1">Switch to "All" or "Non-Fossil" sector view to see renewable energy market players.</p>
      </div>
    );
  }

  const maxCapacity = data.companies[0]?.totalRECapacityMW || 1;
  const filteredCompanies = (filterType === 'all'
    ? data.companies
    : data.companies.filter((c: MarketPlayer) => {
        if (filterType === 'solar') return c.solarMW > c.windMW && c.solarMW > c.hydroMW;
        if (filterType === 'wind') return c.windMW > c.solarMW;
        if (filterType === 'psu') return c.ownership === 'central_psu';
        return true;
      })
  ).sort((a: MarketPlayer, b: MarketPlayer) => b.totalRECapacityMW - a.totalRECapacityMW);

  return (
    <div className="space-y-4">
      {/* National RE Summary */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1">India Renewable Energy — Market Overview</h3>
        <p className="text-[11px] text-gray-400 mb-4">Source: MNRE Physical Progress (mnre.gov.in) as on 30.06.2026</p>
        <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3 mb-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
            <div className="text-lg font-black text-amber-700">{(data.nationalRESummary.solarMW / 1000).toFixed(1)} GW</div>
            <div className="text-[11px] font-bold text-gray-500">☀️ Solar</div>
          </div>
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100 text-center">
            <div className="text-lg font-black text-teal-700">{(data.nationalRESummary.windMW / 1000).toFixed(1)} GW</div>
            <div className="text-[11px] font-bold text-gray-500">💨 Wind</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
            <div className="text-lg font-black text-blue-700">{(data.nationalRESummary.largeHydroMW / 1000).toFixed(1)} GW</div>
            <div className="text-[11px] font-bold text-gray-500">💧 Large Hydro</div>
          </div>
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
            <div className="text-lg font-black text-green-700">{(data.nationalRESummary.biomassMW / 1000).toFixed(1)} GW</div>
            <div className="text-[11px] font-bold text-gray-500">🌿 Biomass</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-center">
            <div className="text-lg font-black text-purple-700">{(data.nationalRESummary.nuclearMW / 1000).toFixed(1)} GW</div>
            <div className="text-[11px] font-bold text-gray-500">⚛️ Nuclear</div>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-icici-cream border border-gray-100 text-center">
          <span className="text-sm font-black text-gray-900">Total Non-Fossil: {(data.nationalRESummary.totalNonFossilMW / 1000).toFixed(1)} GW</span>
        </div>
      </div>

      {/* Transformer OEMs for RE Sector */}
      <div className="icici-card p-4 border-l-4 border-amber-400">
        <h3 className="text-xs font-bold text-gray-700 mb-2">⚡ Transformer Suppliers — RE Sector</h3>
        <p className="text-[11px] text-gray-500 mb-2">Key OEMs supplying grid-connection transformers for solar, wind & BESS projects. Lead time: 12–18 months (2026 crisis).</p>
        <div className="grid grid-cols-2 tablet:grid-cols-3 gap-2 text-[11px]">
          {[
            { name: 'ABB / Hitachi Energy', capacity: '2.5–50 MVA', types: 'Inverter-duty, step-up', backlog: '14–16 mo' },
            { name: 'Siemens India', capacity: '5–100 MVA', types: 'Wind, Solar parks', backlog: '12–14 mo' },
            { name: 'CG Power (Crompton)', capacity: '2.5–50 MVA', types: 'Solar string, wind pad-mount', backlog: '10–12 mo' },
            { name: 'BHEL Transformers', capacity: '10–315 MVA', types: 'Pooling substations, ISTS', backlog: '12–18 mo' },
            { name: 'Voltamp Transformers', capacity: '2.5–25 MVA', types: 'Solar inverter-duty', backlog: '8–10 mo' },
            { name: 'TBEA India', capacity: '5–50 MVA', types: 'Chinese OEM, competitive pricing', backlog: '6–8 mo' },
          ].map((t) => (
            <div key={t.name} className="p-2 rounded-lg bg-white border border-gray-200">
              <div className="font-bold text-gray-800">{t.name}</div>
              <div className="text-gray-500">{t.capacity} · {t.types}</div>
              <div className="text-amber-700 font-bold mt-0.5">Backlog: {t.backlog}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="icici-card p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Players', icon: '🏢' },
            { id: 'solar', label: 'Solar-Led', icon: '☀️' },
            { id: 'wind', label: 'Wind-Led', icon: '💨' },
            { id: 'psu', label: 'PSU Only', icon: '🏛️' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === f.id ? 'bg-icici-maroon text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards */}
      {filteredCompanies.map((company: MarketPlayer) => {
        const isSelected = selectedCompany?.rank === company.rank;
        const marketShare = ((company.totalRECapacityMW / data.nationalRESummary.totalRECapacityMW) * 100).toFixed(1);
        return (
          <div key={company.rank} className="icici-card overflow-hidden">
            <div
              className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'bg-icici-cream' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedCompany(isSelected ? null : company)}
            >
              <div className="w-7 h-7 rounded-full bg-icici-navy flex items-center justify-center text-white font-black text-[11px] flex-shrink-0">{company.rank}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-gray-800 truncate">{company.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{company.listed}</span>
                  <span>{marketShare}% share</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base font-black text-gray-900">{(company.totalRECapacityMW / 1000).toFixed(1)} GW</div>
              </div>
            </div>

            {/* Mix bar */}
            <div className="px-4 pb-3">
              <div className="flex rounded-lg overflow-hidden h-4 border border-gray-200">
                {company.solarMW > 0 && (
                  <div className="flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${(company.solarMW / company.totalRECapacityMW) * 100}%`, backgroundColor: getSourceColor('solar') }}>
                    {(company.solarMW / company.totalRECapacityMW) * 100 >= 20 ? '☀️' : ''}
                  </div>
                )}
                {company.windMW > 0 && (
                  <div className="flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${(company.windMW / company.totalRECapacityMW) * 100}%`, backgroundColor: getSourceColor('wind') }}>
                    {(company.windMW / company.totalRECapacityMW) * 100 >= 20 ? '💨' : ''}
                  </div>
                )}
                {company.hydroMW > 0 && (
                  <div className="flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${(company.hydroMW / company.totalRECapacityMW) * 100}%`, backgroundColor: getSourceColor('large_hydro') }}>
                    {(company.hydroMW / company.totalRECapacityMW) * 100 >= 20 ? '💧' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Expanded */}
            {isSelected && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {company.solarMW > 0 && <div>☀️ Solar: <span className="font-black">{formatMW(company.solarMW)} MW</span></div>}
                  {company.windMW > 0 && <div>💨 Wind: <span className="font-black">{formatMW(company.windMW)} MW</span></div>}
                  {company.hydroMW > 0 && <div>💧 Hydro: <span className="font-black">{formatMW(company.hydroMW)} MW</span></div>}
                  <div>🏢 Ownership: <span className="font-bold">{company.ownership === 'central_psu' ? 'Central PSU' : 'Private'}</span></div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">{company.notes}</p>
                <p className="text-[10px] text-gray-400 mt-1 italic">Source: {company.source}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Data source footer */}
      <div className="icici-card p-4">
        <p className="text-[11px] text-gray-400">
          {data.dataSources.map((s: string, i: number) => <span key={i}>• {s}<br /></span>)}
        </p>
      </div>
    </div>
  );
}
