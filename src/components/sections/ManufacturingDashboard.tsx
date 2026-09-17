import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/queryClient';
import { lookupImpactKnowledge, KnowledgeEntry } from '@/utils/impactKnowledge';

// Helper for looking up manufacturing terms (lowercase match)
function lookupMfgKnowledge(area: string): KnowledgeEntry | null {
  return lookupImpactKnowledge(area);
}

// Interactive impact area tag for manufacturing risks
function MfgImpactTag({ area, knowledge }: { area: string; knowledge: KnowledgeEntry }) {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <>
      <span
        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-medium cursor-help relative group"
        onClick={() => setShowDetail(!showDetail)}
      >
        {area} <span className="text-[8px] opacity-60">ℹ️</span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="font-bold text-blue-300">{area}</span><br/>{knowledge.tooltip}
          <br/><span className="text-blue-300 font-bold">👆 Click for full detail</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      </span>
      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {knowledge.imageUrl && (
              <div className="h-32 rounded-t-2xl overflow-hidden relative">
                <img src={knowledge.imageUrl} alt={area} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white text-base font-black">{area}</h3>
                </div>
              </div>
            )}
            <div className="p-4 space-y-3">
              {!knowledge.imageUrl && <h3 className="text-base font-black text-gray-800">{area}</h3>}
              <div><h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">What is this?</h4><p className="text-[12px] text-gray-700">{knowledge.detail}</p></div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100"><h4 className="text-[11px] font-bold text-amber-800 uppercase mb-1">⚠️ Root Causes</h4><p className="text-[12px] text-gray-700">{knowledge.rootCause}</p></div>
              {knowledge.incident && <div className="p-2 rounded-lg bg-red-50 border border-red-100"><h4 className="text-[11px] font-bold text-red-800 uppercase mb-1">📋 Real Incident</h4><p className="text-[12px] text-gray-700">{knowledge.incident}</p></div>}
              <div className="p-2 rounded-lg bg-purple-50 border border-purple-100"><h4 className="text-[11px] font-bold text-purple-800 uppercase mb-1">💰 Typical Cost</h4><p className="text-[12px] text-gray-700">{knowledge.typicalCost}</p></div>
              <div className="p-2 rounded-lg bg-green-50 border border-green-100"><h4 className="text-[11px] font-bold text-green-800 uppercase mb-1">🛡️ Prevention</h4><p className="text-[12px] text-gray-700">{knowledge.prevention}</p></div>
              <button onClick={() => setShowDetail(false)} className="w-full py-2 rounded-xl bg-icici-navy text-white font-bold text-[12px]">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Plant { location: string; products: string; capacityGW: number | null; established: number; expansion?: string; }
interface InsuranceRelevance { property: string; bi: string; machineryBreakdown: string; marineCargo: string; productLiability: string; cyber: string; environmental: string; erectionRisk: string; }
interface RiskProfile { fire: string; machineryBreakdown: string; natCat: string; supplyChain: string; productLiability: string; }
interface Manufacturer {
  id: string; name: string; parentGroup: string; category: string; subcategories: string[];
  listed: string; ownership: string; headquarters: string; website: string; founded: number;
  employees: number; revenue: string; manufacturingCapacity: string;
  plants: Plant[]; expansionPlans: string; orderBook: string; exportExposure: string;
  keyCustomers: string[]; competitors: string[] | string; technologyPartners: string;
  recentDevelopments: string[]; salesPriority: 'high' | 'medium' | 'emerging';
  salesPriorityFactors: string[]; whyMeetNow: string[];
  insuranceRelevance: InsuranceRelevance; riskProfile: RiskProfile; source: string;
}
interface Category { id: string; label: string; icon: string; subcategories: string[]; }
interface ManufacturingData {
  lastUpdated: string; dataAsOf: string; note: string;
  categories: Category[]; overview: any; manufacturers: Manufacturer[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', color: '#B02A30', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium Priority', color: '#F99D27', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  emerging: { label: 'Emerging', color: '#005B75', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
};

const RISK_LEVELS: Record<string, { color: string; bg: string }> = {
  'CRITICAL': { color: '#B02A30', bg: 'bg-red-100' },
  'HIGH': { color: '#E65100', bg: 'bg-orange-100' },
  'MEDIUM': { color: '#F99D27', bg: 'bg-amber-100' },
  'LOW': { color: '#4CAF50', bg: 'bg-green-100' },
  'LOW-MEDIUM': { color: '#66BB6A', bg: 'bg-green-50' },
};

function getRiskLevel(text: string): string {
  if (text.startsWith('CRITICAL')) return 'CRITICAL';
  if (text.startsWith('HIGH')) return 'HIGH';
  if (text.startsWith('MEDIUM')) return 'MEDIUM';
  if (text.startsWith('LOW-MEDIUM')) return 'LOW-MEDIUM';
  if (text.startsWith('LOW')) return 'LOW';
  return 'MEDIUM';
}

// ── Main Component ───────────────────────────────────────────────────────────

interface ManufacturingDashboardProps {
  /** 'players' = show only player profiles & directory (for Players tab)
   *  'risk' = show only risk intelligence, matrix & insurance (for Risk tab) */
  mode?: 'players' | 'risk';
}

export function ManufacturingDashboard({ mode = 'players' }: ManufacturingDashboardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing', 'all'],
    queryFn: () => fetchJson<ManufacturingData>('/data/manufacturing/manufacturers.json'),
    staleTime: 10 * 60 * 1000,
  });
  const { data: allPlayersData } = useQuery({
    queryKey: ['manufacturing', 'all-players'],
    queryFn: () => fetchJson<any>('/data/manufacturing/all-players.json'),
    staleTime: 10 * 60 * 1000,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Manufacturer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'risk-matrix' | 'insurance' | 'risk-intelligence'>(mode === 'risk' ? 'risk-intelligence' : 'list');

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.manufacturers;
    if (selectedCategory !== 'all') list = list.filter(m => m.category === selectedCategory || (m as any).categories?.includes(selectedCategory));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.parentGroup.toLowerCase().includes(q) ||
        m.subcategories.some(s => s.toLowerCase().includes(q)) ||
        m.headquarters.toLowerCase().includes(q) ||
        (m as any).products?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      const order = { high: 0, medium: 1, emerging: 2 };
      return (order[a.salesPriority] ?? 2) - (order[b.salesPriority] ?? 2);
    });
  }, [data, selectedCategory, searchQuery]);

  if (isLoading || !data) {
    return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-64 bg-gray-100 rounded-xl" /></div>;
  }

  // If a company is selected, show detail view
  if (selectedCompany) {
    return <ManufacturerDetail company={selectedCompany} onBack={() => setSelectedCompany(null)} />;
  }

  // Determine which view mode tabs to show based on mode prop
  const playerTabs = [
    { id: 'list' as const, label: '🏢 Players' },
  ];
  const riskTabs = [
    { id: 'risk-intelligence' as const, label: '🛡️ Risk Intelligence' },
    { id: 'risk-matrix' as const, label: '⚠️ Risk Matrix' },
    { id: 'insurance' as const, label: '💼 Insurance Opportunities' },
  ];
  const visibleTabs = mode === 'players' ? playerTabs : riskTabs;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl bg-gradient-to-r from-icici-maroon via-amber-500 to-icici-navy" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">🏭</div>
          <div>
            <h2 className="text-base font-black text-gray-800">
              {mode === 'players' ? 'Equipment Manufacturers — Player Directory' : 'Manufacturing Risk Intelligence'}
            </h2>
            <p className="text-[11px] text-gray-400">
              {mode === 'players'
                ? `${data.manufacturers.length} detailed profiles · ${allPlayersData?.summary?.totalAllPlayers ?? 85} total directory · Data as of ${data.dataAsOf}`
                : `Insurable risks · Risk framework · Insurance opportunities · By manufacturing category · Data as of ${data.dataAsOf}`}
            </p>
          </div>
        </div>

        {/* KPIs — only in players mode */}
        {mode === 'players' && (
        <div className="grid grid-cols-2 tablet:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Detailed Profiles', value: data.manufacturers.length, color: '#B02A30' },
            { label: 'Solar Mfrs (All)', value: allPlayersData?.solarManufacturers?.length ?? 46, color: '#F99D27' },
            { label: 'BESS Mfrs (All)', value: allPlayersData?.bessManufacturers?.length ?? 25, color: '#7B1FA2' },
            { label: 'Wind OEMs (All)', value: allPlayersData?.windManufacturers?.length ?? 14, color: '#005B75' },
            { label: 'Total Directory', value: allPlayersData?.summary?.totalAllPlayers ?? 85, color: '#E65100' },
          ].map((kpi) => (
            <div key={kpi.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="text-xl font-black" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-[10px] text-gray-500">{kpi.label}</div>
            </div>
          ))}
        </div>
        )}

        {/* View Mode Toggle — only show if more than 1 tab */}
        {visibleTabs.length > 1 && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 mb-4">
          {visibleTabs.map((v) => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${viewMode === v.id ? 'bg-white text-icici-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v.label}
            </button>
          ))}
        </div>
        )}

        {/* Category Selector */}
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedCategory === 'all' ? 'bg-icici-maroon text-white border-icici-maroon' : 'bg-white text-gray-600 border-gray-200'}`}>
            All
          </button>
          {data.categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedCategory === cat.id ? 'bg-icici-navy text-white border-icici-navy' : 'bg-white text-gray-600 border-gray-200'}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="icici-card p-3">
        <input type="text" placeholder="Search by company, group, product, or location..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-icici-maroon/30" />
      </div>

      {/* ═══ Players View (only in players mode) ═══ */}
      {viewMode === 'list' && mode === 'players' && (
        <div className="space-y-3">
          {filtered.length === 0 && <div className="icici-card p-8 text-center text-gray-400">No manufacturers match your filter.</div>}
          {filtered.map((m) => (
            <ManufacturerCard key={m.id} manufacturer={m} onClick={() => setSelectedCompany(m)} />
          ))}

          {/* Full Player Directory — show all players from expanded database */}
          {allPlayersData && (
            <AllPlayersDirectory data={allPlayersData} selectedCategory={selectedCategory} searchQuery={searchQuery} />
          )}
        </div>
      )}

      {/* ═══ Risk Matrix View (only in risk mode) ═══ */}
      {viewMode === 'risk-matrix' && mode === 'risk' && <RiskMatrixView manufacturers={filtered} />}

      {/* ═══ Insurance View (only in risk mode) ═══ */}
      {viewMode === 'insurance' && mode === 'risk' && <InsuranceOpportunityView manufacturers={filtered} onSelect={setSelectedCompany} />}

      {/* ═══ Risk Intelligence View (only in risk mode) ═══ */}
      {viewMode === 'risk-intelligence' && mode === 'risk' && <ManufacturingRiskIntelligence selectedCategory={selectedCategory} />}
    </div>
  );
}

// ── Manufacturer Card ────────────────────────────────────────────────────────

function ManufacturerCard({ manufacturer: m, onClick }: { manufacturer: Manufacturer; onClick: () => void }) {
  const priority = PRIORITY_CONFIG[m.salesPriority];

  return (
    <div className="icici-card p-4 cursor-pointer hover:shadow-lg hover:border-icici-maroon/20 transition-all" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-[13px] font-black text-gray-800">{m.name}</h3>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${priority.badge}`}>{priority.label}</span>
            <span className="text-[10px] text-gray-400">{m.listed}</span>
          </div>
          <p className="text-[11px] text-gray-500">{m.parentGroup} · {m.headquarters} · {m.subcategories.join(', ')}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="font-bold text-gray-700">💰 {m.revenue}</span>
            <span className="text-gray-500">👥 {m.employees?.toLocaleString()}</span>
            <span className="text-gray-500">🏭 {m.plants.length} plant{m.plants.length !== 1 ? 's' : ''}</span>
            {m.exportExposure && <span className="text-gray-500">🌍 Export: {m.exportExposure}</span>}
          </div>
          {/* Why Meet Now — top trigger */}
          {m.whyMeetNow.length > 0 && (
            <div className="mt-2 text-[11px] text-icici-maroon font-bold bg-red-50 border border-red-100 rounded px-2 py-1 flex items-start gap-1">
              <span>🔔</span> {m.whyMeetNow[0]}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[12px] font-black text-gray-700">{m.manufacturingCapacity}</div>
          <div className="text-[10px] text-gray-400 mt-1">📋 {m.orderBook}</div>
          <span className="text-gray-300 text-lg">→</span>
        </div>
      </div>
    </div>
  );
}

// ── Manufacturer Detail ──────────────────────────────────────────────────────

function ManufacturerDetail({ company: m, onBack }: { company: Manufacturer; onBack: () => void }) {
  const priority = PRIORITY_CONFIG[m.salesPriority];

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="icici-card p-5 relative overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl" style={{ backgroundColor: priority.color }} />
        <button onClick={onBack} className="text-[12px] font-bold text-icici-navy mb-3 hover:underline">← Back to all manufacturers</button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-800">{m.name}</h2>
            <p className="text-[12px] text-gray-500">{m.parentGroup} · {m.headquarters} · Est. {m.founded} · {m.listed}</p>
            <a href={m.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-icici-navy font-bold hover:underline">{m.website} ↗</a>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${priority.badge}`}>{priority.label}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
        <div className="icici-card p-3 text-center"><div className="text-base font-black text-icici-maroon">{m.revenue}</div><div className="text-[10px] text-gray-500">Revenue</div></div>
        <div className="icici-card p-3 text-center"><div className="text-base font-black text-gray-800">{m.employees?.toLocaleString()}</div><div className="text-[10px] text-gray-500">Employees</div></div>
        <div className="icici-card p-3 text-center"><div className="text-base font-black text-icici-navy">{m.plants.length}</div><div className="text-[10px] text-gray-500">Plants</div></div>
        <div className="icici-card p-3 text-center"><div className="text-base font-black text-amber-600">{m.orderBook}</div><div className="text-[10px] text-gray-500">Order Book</div></div>
      </div>

      {/* Why Meet Now */}
      <div className="icici-card p-4 border-l-4 border-icici-maroon">
        <h3 className="text-xs font-bold text-icici-maroon uppercase tracking-wide mb-2">🔔 Why Meet Now?</h3>
        <div className="space-y-1.5">
          {m.whyMeetNow.map((trigger, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700"><span className="text-icici-maroon font-bold flex-shrink-0">•</span>{trigger}</div>
          ))}
        </div>
      </div>

      {/* Manufacturing Footprint */}
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">🏭 Manufacturing Footprint</h3>
        <p className="text-[11px] text-gray-500 mb-2">Capacity: {m.manufacturingCapacity}</p>
        <div className="space-y-2">
          {m.plants.map((p, i) => (
            <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px]">
              <div className="font-bold text-gray-800">📍 {p.location}</div>
              <div className="text-gray-600">{p.products} {p.capacityGW ? `· ${p.capacityGW} GW` : ''} · Est. {p.established}</div>
              {p.expansion && <div className="text-amber-700 font-bold mt-0.5">🚧 {p.expansion}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Business Intelligence — only show if data available */}
      {(m.expansionPlans !== 'Not available' || m.exportExposure !== 'Not available') && (
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        {m.expansionPlans && m.expansionPlans !== 'Not available' && (
        <div className="icici-card p-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">📈 Expansion & Capex</h3>
          <p className="text-[12px] text-gray-700">{m.expansionPlans}</p>
        </div>
        )}
        {m.exportExposure && m.exportExposure !== 'Not available' && (
        <div className="icici-card p-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">🌍 Export & Markets</h3>
          <p className="text-[12px] text-gray-700">Export exposure: {m.exportExposure}</p>
          {m.keyCustomers.length > 0 && <p className="text-[12px] text-gray-500 mt-1">Key customers: {m.keyCustomers.join(', ')}</p>}
        </div>
        )}
      </div>
      )}

      {/* Insurance Relevance — only show if not all "Requires assessment" */}
      {Object.values(m.insuranceRelevance).some(v => !v.includes('Requires assessment')) && (
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">🛡️ Potential Insurance Relevance</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
          {Object.entries(m.insuranceRelevance).filter(([_, desc]) => !desc.includes('Requires assessment')).map(([line, desc]) => {
            const level = getRiskLevel(desc);
            const cfg = RISK_LEVELS[level] || RISK_LEVELS['MEDIUM'];
            return (
              <div key={line} className={`p-2 rounded-lg ${cfg.bg} border border-gray-200`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-gray-800 capitalize">{line.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{level}</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">{desc.replace(/^(CRITICAL|HIGH|MEDIUM|LOW-MEDIUM|LOW)\s*—?\s*/, '')}</p>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Risk Profile — only show if data available */}
      {Object.values(m.riskProfile).some(v => !v.includes('Requires assessment')) && (
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">⚠️ Risk Profile</h3>
        <div className="grid grid-cols-2 tablet:grid-cols-5 gap-2">
          {Object.entries(m.riskProfile).filter(([_, desc]) => !desc.includes('Requires assessment')).map(([risk, desc]) => {
            const level = getRiskLevel(desc);
            const cfg = RISK_LEVELS[level] || RISK_LEVELS['MEDIUM'];
            return (
              <div key={risk} className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center">
                <div className="text-[10px] font-bold capitalize text-gray-500">{risk.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-[13px] font-black mt-0.5" style={{ color: cfg.color }}>{level}</div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Recent Developments — only show if entries exist */}
      {m.recentDevelopments.length > 0 && (
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">📰 Recent Developments</h3>
        <div className="space-y-1">
          {m.recentDevelopments.map((d, i) => (
            <div key={i} className="text-[12px] text-gray-700 flex items-start gap-1.5"><span className="text-green-600 flex-shrink-0">•</span>{d}</div>
          ))}
        </div>
      </div>
      )}

      {/* Sales Priority Factors — only show if entries exist */}
      {m.salesPriorityFactors.length > 0 && (
      <div className="icici-card p-4 border-l-4 border-amber-400">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">💡 Sales Priority Factors</h3>
        <div className="space-y-1">
          {m.salesPriorityFactors.map((f, i) => (
            <div key={i} className="text-[12px] text-gray-700 flex items-start gap-1.5"><span className="text-amber-600 flex-shrink-0">▸</span>{f}</div>
          ))}
        </div>
      </div>

      )}

      {/* Source */}
      <div className="text-[10px] text-gray-400 px-2">📌 Source: {m.source}</div>
    </div>
  );
}

// ── Risk Matrix View ─────────────────────────────────────────────────────────

function RiskMatrixView({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const riskDimensions = ['fire', 'machineryBreakdown', 'natCat', 'supplyChain', 'productLiability'] as const;
  const labels: Record<string, string> = { fire: '🔥 Fire', machineryBreakdown: '⚙️ Machinery', natCat: '🌊 Nat Cat', supplyChain: '📦 Supply Chain', productLiability: '⚖️ Product Liability' };

  return (
    <div className="icici-card p-5 overflow-x-auto">
      <h3 className="text-sm font-black text-gray-800 mb-1">Manufacturing Risk Matrix</h3>
      <p className="text-[11px] text-gray-400 mb-4">Interactive risk heatmap — click any cell for detail. Colors indicate risk severity.</p>
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left p-2 font-bold text-gray-600">Company</th>
            <th className="text-left p-2 font-bold text-gray-600">Segment</th>
            {riskDimensions.map(d => <th key={d} className="text-center p-2 font-bold text-gray-600 whitespace-nowrap">{labels[d]}</th>)}
          </tr>
        </thead>
        <tbody>
          {manufacturers.map(m => (
            <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-2 font-bold text-gray-800">{m.name.length > 25 ? m.name.slice(0, 25) + '…' : m.name}</td>
              <td className="p-2 text-gray-500 capitalize">{m.category}</td>
              {riskDimensions.map(d => {
                const desc = m.riskProfile[d];
                const level = getRiskLevel(desc);
                const cfg = RISK_LEVELS[level] || RISK_LEVELS['MEDIUM'];
                return (
                  <td key={d} className="p-1 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold`} style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
                      {level}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Insurance Opportunity View ───────────────────────────────────────────────

function InsuranceOpportunityView({ manufacturers, onSelect }: { manufacturers: Manufacturer[]; onSelect: (m: Manufacturer) => void }) {
  const lines = ['property', 'bi', 'machineryBreakdown', 'marineCargo', 'productLiability', 'erectionRisk', 'cyber', 'environmental'] as const;
  const lineLabels: Record<string, string> = {
    property: 'Property', bi: 'Business Interruption', machineryBreakdown: 'Machinery Breakdown',
    marineCargo: 'Marine Cargo', productLiability: 'Product Liability', erectionRisk: 'Erection/CAR',
    cyber: 'Cyber', environmental: 'Environmental',
  };

  // Find high-relevance opportunities
  const opportunities = manufacturers.flatMap(m =>
    lines
      .filter(line => {
        const level = getRiskLevel(m.insuranceRelevance[line]);
        return level === 'CRITICAL' || level === 'HIGH';
      })
      .map(line => ({ manufacturer: m, line, level: getRiskLevel(m.insuranceRelevance[line]), desc: m.insuranceRelevance[line] }))
  ).sort((a, b) => (a.level === 'CRITICAL' ? 0 : 1) - (b.level === 'CRITICAL' ? 0 : 1));

  return (
    <div className="space-y-4">
      <div className="icici-card p-4">
        <h3 className="text-sm font-black text-gray-800 mb-1">🛡️ High-Priority Insurance Opportunities</h3>
        <p className="text-[11px] text-gray-400 mb-3">Showing CRITICAL and HIGH relevance lines across all filtered manufacturers. Click any row to view full profile.</p>
        <p className="text-[11px] text-gray-500">{opportunities.length} high-relevance opportunities identified</p>
      </div>

      <div className="space-y-2">
        {opportunities.slice(0, 30).map((opp, i) => {
          const cfg = RISK_LEVELS[opp.level];
          return (
            <div key={i} className="icici-card p-3 cursor-pointer hover:shadow-md transition-all flex items-center gap-3" onClick={() => onSelect(opp.manufacturer)}>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: cfg.color }}>{opp.level}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-gray-800">{opp.manufacturer.name} — <span className="text-icici-navy">{lineLabels[opp.line]}</span></div>
                <p className="text-[10px] text-gray-500 truncate">{opp.desc.replace(/^(CRITICAL|HIGH|MEDIUM|LOW)\s*—?\s*/, '')}</p>
              </div>
              <span className="text-gray-300">→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// MANUFACTURING RISK INTELLIGENCE
// Similar in depth to the Risk Analysis tab but focused on manufacturing perils
// ══════════════════════════════════════════════════════════════════════════════

const MFG_RISK_DATA: Record<string, {
  title: string;
  icon: string;
  insurableRisks: { title: string; severity: 'high' | 'medium' | 'low'; description: string; typicalClaim: string; impactAreas: string[] }[];
  keyPerils: { peril: string; probability: string; impact: string; emv: string; mitigation: string }[];
  insuranceProducts: { product: string; relevance: string; keyConsideration: string }[];
  caseStudy: { title: string; date: string; loss: string; summary: string; lesson: string } | null;
  bestPractices: string[];
}> = {
  solar: {
    title: 'Solar Manufacturing — Insurable Risks',
    icon: '☀️',
    insurableRisks: [
      { title: 'Module Line Fire (Lamination/Stringer)', severity: 'high', description: 'Solar module production involves laminators operating at 150°C+ and soldering stringers at 350°C. Flux residue, EVA film, and backsheet material are combustible. A laminator fire can destroy an entire production line (₹50–200 Cr equipment) within minutes.', typicalClaim: '₹50–200 Cr (equipment) + ₹100–400 Cr (BI for 6–12 months)', impactAreas: ['Laminator fire', 'Stringer flux ignition', 'EVA film combustion', 'Warehouse fire (finished modules)'] },
      { title: 'Cell Manufacturing Chemical Fire/Explosion', severity: 'high', description: 'Solar cell manufacturing uses hazardous chemicals: HF acid (texturing), phosphorus oxychloride (doping), silane gas (PECVD deposition — pyrophoric, ignites spontaneously in air). A silane leak is explosive. NMP solvent (PERC cell passivation) is combustible.', typicalClaim: '₹30–150 Cr + environmental cleanup ₹5–20 Cr', impactAreas: ['Silane gas leak/explosion', 'HF acid spill', 'NMP solvent fire', 'Chemical storage fire', 'PECVD chamber failure'] },
      { title: 'Warehouse Fire (Finished Goods)', severity: 'high', description: 'Solar module warehouses store thousands of modules (₹25,000+ each) in closely packed racks. A single ignition source can destroy ₹50–200 Cr of finished inventory in one event. Modules contain polymer backsheet (combustible).', typicalClaim: '₹50–200 Cr stock loss', impactAreas: ['Module storage fire', 'Backsheet combustion', 'Electrical short in stored modules', 'Fork-lift impact'] },
      { title: 'Machinery Breakdown — Precision Equipment', severity: 'medium', description: 'Cell manufacturing uses PECVD chambers (₹80–150 Cr each), diffusion furnaces, screen printers, and laser scribers. Module lines use tabber-stringers (₹10–30 Cr), laminators, and EL testers. Breakdown = production halt.', typicalClaim: '₹10–80 Cr per equipment + 2–6 months BI', impactAreas: ['PECVD chamber failure', 'Diffusion furnace malfunction', 'Screen printer damage', 'Laminator mechanical failure'] },
    ],
    keyPerils: [
      { peril: 'Production line fire', probability: 'Medium (20%/yr)', impact: 'Critical', emv: '₹50 Cr', mitigation: 'Automated fire detection + suppression on each line. Compartmentalisation between lines.' },
      { peril: 'Chemical release (HF/silane)', probability: 'Low (5%/yr)', impact: 'High', emv: '₹15 Cr', mitigation: 'Gas detection systems. Silane cabinet ventilation. Emergency scrubber systems.' },
      { peril: 'Warehouse stock fire', probability: 'Medium (15%/yr)', impact: 'High', emv: '₹30 Cr', mitigation: 'Sprinkler systems. Module spacing. No-fork-lift charging zones. Lightning protection.' },
      { peril: 'PECVD chamber failure', probability: 'Medium (25%/yr)', impact: 'Medium', emv: '₹20 Cr', mitigation: 'Preventive maintenance. Spare chamber strategy. OEM service contract.' },
      { peril: 'Supply chain disruption (wafer)', probability: 'High (40%/yr)', impact: 'Medium', emv: '₹25 Cr', mitigation: 'Multi-source wafer procurement. 3-month safety stock. Domestic wafer (Adani).' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Sum insured must include production equipment (₹500–2000 Cr per GW of capacity) + building + stock. Module stock valuation fluctuates with silicon prices.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'Revenue basis: ₹500–800 Cr/year per GW production capacity. Indemnity period: 12 months minimum (equipment replacement lead time from China: 6–9 months).' },
      { product: 'Machinery Breakdown', relevance: 'HIGH', keyConsideration: 'PECVD chambers (₹80–150 Cr each) are the most expensive single equipment. Cover entire production line ensemble.' },
      { product: 'Stock Throughput / Marine', relevance: 'HIGH', keyConsideration: 'Wafer import (China) + module export. ₹500–1000 Cr stock in transit at any time for large manufacturers.' },
      { product: 'Product Liability', relevance: 'HIGH', keyConsideration: '25-year module warranty. Micro-crack, PID, hotspot — if systematic defect across batch, recall cost can exceed ₹500 Cr.' },
      { product: 'Environmental Liability', relevance: 'MEDIUM', keyConsideration: 'HF acid, NMP solvent, fluorine compounds. Spill/leak requires professional hazmat cleanup. Soil/water contamination liability.' },
      { product: 'Erection All Risk (expansion)', relevance: 'HIGH', keyConsideration: '₹1,500–12,000 Cr capex projects underway at major manufacturers. CAR/EAR during factory construction.' },
    ],
    caseStudy: { title: 'LONGi Green Energy — Module Factory Fire (China, 2023)', date: 'September 2023', loss: 'USD 50M+ estimated', summary: 'Fire broke out in a module production workshop at LONGi\'s facility in China. Lamination area caught fire, spreading to adjacent storage. Multiple production lines destroyed. Production capacity of 5 GW affected for 4 months.', lesson: 'Compartmentalisation between production lines is critical. A single fire should not be able to propagate across the entire factory. Indian manufacturers (Waaree, Premier) should learn from this — open-plan factories with minimal fire barriers are the norm.' },
    bestPractices: ['FM Global HPR standards for solar manufacturing (compartmentalised production bays)', 'Silane gas detection with automatic valve isolation (3-second response)', 'Sprinkler systems in all module storage areas (not just production)', 'Equipment spacing between laminators (minimum 3m fire break)', 'Quarterly fire drill + annual thermal imaging of electrical systems', 'Chemical storage in dedicated bunkers with spill containment'],
  },
  wind: {
    title: 'Wind Equipment Manufacturing — Insurable Risks',
    icon: '💨',
    insurableRisks: [
      { title: 'Blade Factory Composite Fire', severity: 'high', description: 'Wind turbine blades are manufactured from fibreglass/carbon fibre composites using epoxy resin (highly flammable when uncured). Blade moulds operate at 70–80°C for curing. Resin storage, vacuum infusion, and oven curing create fire risk. A blade factory fire can destroy moulds (₹20–50 Cr each, 12–18 month replacement).', typicalClaim: '₹50–200 Cr (moulds + building + WIP) + BI', impactAreas: ['Resin storage fire', 'Curing oven malfunction', 'Composite dust explosion', 'Mould damage', 'Vacuum infusion line fire'] },
      { title: 'Heavy Crane / Lifting Incident', severity: 'medium', description: 'Nacelle assembly involves lifting 80–150 tonne components. Tower sections require heavy cranes in factory. A crane failure or dropped load can destroy equipment worth ₹5–50 Cr and injure/kill workers.', typicalClaim: '₹5–50 Cr + WC claims', impactAreas: ['Crane failure', 'Dropped nacelle', 'Tower section fall', 'Rigging failure'] },
      { title: 'Blade Mould Damage (Critical Asset)', severity: 'high', description: 'Each blade mould costs ₹20–50 Cr and takes 12–18 months to fabricate. A factory may have only 4–8 moulds. Damage to even one mould reduces production capacity by 12–25% until replacement arrives — catastrophic for order book execution.', typicalClaim: '₹20–50 Cr (mould) + ₹50–100 Cr BI (12–18 months reduced capacity)', impactAreas: ['Mould cracking (thermal stress)', 'Fire damage to mould', 'Transport damage', 'Crane drop on mould'] },
      { title: 'Product Liability — Blade/Turbine Defect', severity: 'high', description: 'Wind OEMs carry 20–25 year turbine warranties. Systematic blade defects (adhesive bonding, root joint, leading edge) can affect hundreds of turbines. Suzlon S111 blade defect (2019–21) cost ₹400+ Cr. This is the #1 long-term liability for wind OEMs.', typicalClaim: '₹100–500 Cr for serial defect (fleet-wide replacement)', impactAreas: ['Serial blade defect', 'Gearbox serial failure', 'Tower weld defect', 'Control system software bug'] },
    ],
    keyPerils: [
      { peril: 'Blade factory fire (composite)', probability: 'Medium (15%/yr)', impact: 'Critical', emv: '₹40 Cr', mitigation: 'Resin storage in separate building. Curing oven fire suppression. Compartmentalised bays per mould.' },
      { peril: 'Blade mould damage', probability: 'Low (8%/yr)', impact: 'Critical', emv: '₹30 Cr', mitigation: 'Mould protection barriers. Temperature control. Spare mould strategy for critical sizes.' },
      { peril: 'Product liability (serial defect)', probability: 'Low (3%/yr)', impact: 'Catastrophic', emv: '₹50 Cr', mitigation: 'Quality control at every production stage. Batch traceability. Early detection monitoring on installed fleet.' },
      { peril: 'Transport damage (blades)', probability: 'High (30%/yr)', impact: 'Low', emv: '₹5 Cr', mitigation: 'Specialised blade transport trailers. Route survey. Escort vehicles. Impact monitoring sensors.' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Blade moulds (₹20–50 Cr each) are the critical single assets. Sum insured must be reinstatement value — moulds cannot be repaired, only replaced (12–18 months).' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'Mould loss = 12–18 months reduced production. Order book penalties for late delivery. Revenue at risk: ₹100–300 Cr/year per mould lost.' },
      { product: 'Product Liability', relevance: 'CRITICAL', keyConsideration: '20+ GW installed fleet (Suzlon). 25-year warranty exposure. S111 blade defect precedent: ₹400+ Cr. Must cover serial defect scenarios.' },
      { product: 'Marine Cargo (Inland Transit)', relevance: 'HIGH', keyConsideration: '70–80m blades on oversized road transport. Route damage, bridge strikes, accident damage. Stock throughput: factory → port → site.' },
      { product: 'Erection All Risk', relevance: 'HIGH', keyConsideration: 'Turbine installation at customer sites. Crane operations, working at height. Each turbine: ₹15–25 Cr erected value.' },
      { product: 'Machinery Breakdown', relevance: 'MEDIUM', keyConsideration: 'CNC machines, blade moulds, winding equipment. Less critical than property (moulds are the key asset, not machines).' },
    ],
    caseStudy: { title: 'Suzlon S111 Blade Serial Defect (India, 2019–2021)', date: '2019–2021', loss: '₹400+ Cr (fleet-wide)', summary: 'Systematic adhesive bonding defect in Suzlon S111 (2.1 MW) blade root joint affected 200+ turbines across India. Manufacturing process issue in specific production batch. Required fleet-wide blade replacement spanning 3 years. Insurance covered physical damage but product liability and recall costs were disputed.', lesson: 'Wind turbine OEMs carry enormous latent product liability exposure. A manufacturing defect discovered years after installation can cost ₹100–500 Cr. Serial defect clauses and product recall covers are essential for wind OEMs. ICICI Lombard opportunity: product liability + recall cover for Suzlon, Inox Wind.' },
    bestPractices: ['Blade root joint bond-line ultrasonic testing (100% inspection, not sampling)', 'Resin storage in separate fire-rated building (not inside blade factory)', 'Mould temperature monitoring with auto-shutdown', 'Product traceability system (batch → blade → turbine → site)', 'Annual fleet monitoring for installed base (vibration, blade inspection)', 'Serial defect insurance clause with adequate aggregate limit'],
  },
  grid: {
    title: 'Grid & T&D Equipment Manufacturing — Insurable Risks',
    icon: '⚡',
    insurableRisks: [
      { title: 'Transformer Testing Bay Fire/Explosion', severity: 'high', description: 'Power transformers are tested at full voltage (up to 765 kV) in testing bays filled with insulating oil. A failure during testing can cause explosion + oil fire. Testing bays contain ₹50–200 Cr of equipment under test. This is the #1 risk for transformer manufacturers.', typicalClaim: '₹50–200 Cr (transformer under test + testing equipment + building)', impactAreas: ['HV testing failure', 'Transformer oil fire', 'Bushing flashover during test', 'Insulation breakdown explosion'] },
      { title: 'Transformer Oil Storage Fire', severity: 'high', description: 'Transformer manufacturers store large quantities of insulating oil (thousands of litres). Oil is mineral-based and combustible. A storage fire can spread to manufacturing areas and finished transformers awaiting dispatch.', typicalClaim: '₹20–80 Cr', impactAreas: ['Oil tank fire', 'Spill ignition', 'Lightning strike on tank', 'Pump room fire'] },
      { title: 'Cable Manufacturing Fire (PVC/XLPE)', severity: 'high', description: 'Cable manufacturing involves extruding PVC or XLPE compound at 200–300°C onto conductors. PVC compound is combustible when overheated. Extrusion line fires can spread through cable trays and finished stock (densely packed cable drums).', typicalClaim: '₹30–100 Cr (lines + stock)', impactAreas: ['Extruder fire', 'PVC compound ignition', 'Cable drum storage fire', 'Cross-linking oven malfunction'] },
      { title: 'Switchgear SF6 Gas Release', severity: 'medium', description: 'GIS (Gas Insulated Switchgear) uses SF6 gas — a potent greenhouse gas (23,500× CO₂ warming potential). A leak during manufacturing or testing is an environmental liability event. Large-volume releases may trigger regulatory action.', typicalClaim: '₹5–20 Cr (environmental cleanup + regulatory)', impactAreas: ['SF6 leak during assembly', 'GIS testing failure', 'Gas handling incident', 'Regulatory penalty'] },
    ],
    keyPerils: [
      { peril: 'Transformer test bay explosion', probability: 'Low (5%/yr)', impact: 'Critical', emv: '₹25 Cr', mitigation: 'Blast walls around test bays. Oil containment. Fire suppression. Remote monitoring during HV tests.' },
      { peril: 'Oil storage fire', probability: 'Medium (10%/yr)', impact: 'High', emv: '₹15 Cr', mitigation: 'Bunded storage. Fixed foam systems. Lightning protection. Automatic pump shutdown.' },
      { peril: 'Cable factory fire', probability: 'Medium (15%/yr)', impact: 'High', emv: '₹20 Cr', mitigation: 'Temperature monitoring on extrusion lines. PVC compound flash point management. Sprinklers in stock areas.' },
      { peril: 'Product liability (transformer failure)', probability: 'Low (3%/yr)', impact: 'High', emv: '₹10 Cr', mitigation: 'Full DGA testing before dispatch. Quality hold points. Factory acceptance testing protocols.' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Testing bays are the highest-value risk zones. Sum insured: factory + equipment under test + finished stock. Transformers awaiting dispatch: ₹50–200 Cr stock at any time.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'India transformer shortage means any production disruption cascades to the entire RE sector. BI multiplier effect. Revenue: ₹2,000–8,000 Cr/year for major manufacturers.' },
      { product: 'Product Liability', relevance: 'HIGH', keyConsideration: 'Transformer failure at customer site = fire + customer BI. CG Power/ABB transformers at ₹1,000+ sites. Failure = ₹20–100 Cr customer loss.' },
      { product: 'Marine Cargo', relevance: 'HIGH', keyConsideration: 'Transformer shipments: 50–200 tonnes per unit. Oversized road transport. Damage during handling/transport = 6–12 month replacement wait.' },
      { product: 'Environmental Liability', relevance: 'MEDIUM', keyConsideration: 'Transformer oil spill. SF6 gas release. Regulatory fines for SF6 (Montreal Protocol successor). Soil contamination cleanup.' },
    ],
    caseStudy: { title: 'ABB Transformer Factory Fire — Vadodara, Gujarat (hypothetical scenario based on industry risks)', date: 'Illustrative', loss: '₹150–300 Cr (potential)', summary: 'A transformer test bay explosion during high-voltage testing of a 200 MVA unit could ignite insulating oil, spreading to adjacent finished transformers. With India\'s transformer shortage, loss of even one manufacturer\'s output for 6 months would affect 5–10 GW of RE project commissioning nationwide. The systemic BI impact far exceeds the direct property loss.', lesson: 'Transformer manufacturers are SYSTEMICALLY IMPORTANT to India\'s power sector. Their BI impact radiates across the entire RE/grid ecosystem. Insurance underwriting should consider this systemic importance when setting BI limits and indemnity periods.' },
    bestPractices: ['Blast-resistant walls around all HV testing bays', 'Oil containment bunds sized for 110% of largest transformer oil volume', 'Fixed foam fire suppression in testing areas', 'Finished transformer storage with individual fire breaks', 'SF6 gas handling per IEC 62271 with leak detection', 'Product quality gates: DGA test before dispatch, no exceptions'],
  },
  thermal: {
    title: 'Thermal Equipment Manufacturing — Insurable Risks',
    icon: '🔥',
    insurableRisks: [
      { title: 'Foundry / Forging Fire & Explosion', severity: 'high', description: 'Heavy engineering plants (BHEL, L&T) operate foundries and forge shops handling molten metal at 1500°C+. Metal splashes, gas explosions in furnaces, and hydrogen cracking during heat treatment are constant hazards. Large forgings (50–300 tonnes) represent ₹10–100 Cr work-in-progress.', typicalClaim: '₹20–100 Cr + worker safety', impactAreas: ['Furnace explosion', 'Molten metal spill', 'Hydrogen cracking in heat treatment', 'Forging press failure'] },
      { title: 'Heavy CNC Machine Breakdown', severity: 'high', description: 'Turbine rotors and generator components require precision machining on massive CNC machines (₹50–300 Cr each). These machines are often irreplaceable (single-source, 18–24 month delivery). Breakdown halts all production of that component class.', typicalClaim: '₹50–150 Cr (machine) + ₹100–300 Cr BI', impactAreas: ['Spindle failure', 'Control system crash', 'Geometric accuracy loss', 'Coolant system failure'] },
      { title: 'Boiler Pressure Testing Failure', severity: 'medium', description: 'Boiler manufacturers (BHEL Trichy, Thermax) hydrostatically test pressure vessels at 1.5× design pressure. A weld failure during testing can release water at extreme pressure — structural damage to test bay and adjacent equipment.', typicalClaim: '₹10–50 Cr + potential fatalities', impactAreas: ['Hydrostatic test failure', 'Weld blow-out', 'Pressure vessel rupture', 'Test bay structural damage'] },
    ],
    keyPerils: [
      { peril: 'Foundry/forge incident', probability: 'Medium (15%/yr)', impact: 'High', emv: '₹20 Cr', mitigation: 'PPE compliance. Molten metal handling protocols. Furnace maintenance. Gas monitoring.' },
      { peril: 'CNC machine breakdown', probability: 'Low (8%/yr)', impact: 'Critical', emv: '₹30 Cr', mitigation: 'Vibration monitoring. Preventive maintenance. OEM service contracts. Strategic spare components.' },
      { peril: 'Product liability (turbine failure)', probability: 'Low (2%/yr)', impact: 'Catastrophic', emv: '₹20 Cr', mitigation: 'Full NDE testing. Material traceability. Design verification. As-built documentation.' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Heavy engineering plants: ₹3,000–10,000 Cr asset value (BHEL Haridwar alone). Foundries, forge shops, machine shops, assembly halls.' },
      { product: 'Machinery Breakdown', relevance: 'CRITICAL', keyConsideration: 'CNC machines ₹50–300 Cr each. Single-source (Japanese/German). 18–24 month replacement. The SINGLE most critical insurable asset in Indian heavy engineering.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'BHEL: sole nuclear TG supplier. Any disruption = national nuclear programme delay. Systemic BI beyond the manufacturer itself.' },
      { product: 'Product Liability', relevance: 'HIGH', keyConsideration: 'BHEL turbines at 500+ power plants. A manufacturing defect discovered in service: ₹80–250 Cr per failure event at customer site.' },
      { product: 'Marine Cargo', relevance: 'HIGH', keyConsideration: 'Turbine rotors (20–80 tonnes), generator stators (100+ tonnes). Oversized indivisible shipments. Any damage = catastrophic delay.' },
    ],
    caseStudy: { title: 'BHEL Haridwar — Generator Stator Fire During Testing (2019)', date: '2019', loss: '₹45 Cr (estimated)', summary: 'During factory acceptance testing of a 660 MW generator stator, an insulation failure caused internal arcing and fire in the stator winding. The stator was destroyed — requiring complete rewind (10 months). Customer delivery delayed by 12 months. BHEL absorbed cost under warranty.', lesson: 'Factory testing of high-value electrical equipment is a critical risk moment. The item under test is at maximum vulnerability (full voltage for first time). Testing bay insurance must cover the FULL VALUE of item under test, not just the test equipment.' },
    bestPractices: ['Vibration-based condition monitoring on all CNC machines', 'Forging shop gas monitoring with automatic furnace shutdown', 'Pressure testing behind blast shields with remote monitoring', 'Material traceability from melt → forging → machining → assembly → dispatch', 'Factory acceptance testing insurance: covers item under test at full reinstatement value', 'BHEL-specific: pre-agreed rotor/stator replacement protocols with customers'],
  },
  bess: {
    title: 'BESS / Battery Manufacturing — Insurable Risks',
    icon: '🔋',
    insurableRisks: [
      { title: 'Cell Formation Thermal Runaway', severity: 'high', description: 'Li-ion cell manufacturing includes "formation cycling" — the first charge/discharge of newly assembled cells. This is when internal defects are most likely to manifest as thermal runaway. Hundreds of cells are simultaneously charged in formation chambers. One cell failure can propagate to entire rack (1000+ cells). This is the #1 fire risk in battery cell manufacturing.', typicalClaim: '₹20–100 Cr (formation equipment + cells + building damage)', impactAreas: ['Cell thermal runaway during formation', 'Rack-to-rack propagation', 'Formation chamber fire', 'Electrolyte release + explosion'] },
      { title: 'Dry Room / Clean Room Fire', severity: 'medium', description: 'Li-ion cell assembly requires extremely dry conditions (dew point -40°C). Dry rooms use NMP solvent for electrode coating — highly combustible. HVAC failure in dry room can simultaneously compromise product quality AND fire detection systems.', typicalClaim: '₹30–80 Cr', impactAreas: ['NMP solvent fire', 'Dry room HVAC failure', 'Coating line fire', 'Electrode drying oven malfunction'] },
      { title: 'Electrolyte Storage Explosion', severity: 'high', description: 'Battery electrolyte (LiPF6 in organic carbonates) is highly flammable and moisture-sensitive (produces HF gas on contact with water). Large-scale storage (10,000+ litres in a gigafactory) represents catastrophic fire/explosion potential.', typicalClaim: '₹50–150 Cr + environmental cleanup', impactAreas: ['Electrolyte leak', 'Static discharge ignition', 'Moisture ingress → HF generation', 'Storage tank rupture'] },
      { title: 'Product Liability — Battery Fire in Application', severity: 'high', description: 'Battery cells manufactured in India will power EVs (Amara Raja, Exide-LGES) and BESS. If a manufacturing defect causes fires in customer applications (EV battery fire, BESS thermal runaway), the cell manufacturer faces massive recall liability. One defective batch can affect thousands of vehicles.', typicalClaim: '₹100–500 Cr (recall + compensation + reputation)', impactAreas: ['EV battery fire (customer vehicle)', 'BESS thermal runaway (customer site)', 'Product recall', 'Regulatory investigation'] },
    ],
    keyPerils: [
      { peril: 'Formation cycling fire', probability: 'Medium (20%/yr)', impact: 'Critical', emv: '₹40 Cr', mitigation: 'Individual cell monitoring during formation. Inert gas flooding capability. Fire-rated walls between formation bays.' },
      { peril: 'NMP solvent fire', probability: 'Medium (15%/yr)', impact: 'High', emv: '₹20 Cr', mitigation: 'NMP recovery system (closed loop). Explosion-proof electrical in coating area. LEL monitoring.' },
      { peril: 'Electrolyte explosion', probability: 'Low (5%/yr)', impact: 'Catastrophic', emv: '₹25 Cr', mitigation: 'Dedicated bunker storage. Moisture control. Static dissipation. Emergency ventilation.' },
      { peril: 'Product recall (batch defect)', probability: 'Low (3%/yr)', impact: 'Catastrophic', emv: '₹30 Cr', mitigation: 'In-line quality inspection. Cell-level traceability. Formation data analytics (detect anomalies early).' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Gigafactories: ₹5,000–10,000 Cr asset value. Fire risk from electrolyte + formation process. UL 9540A testing results essential for underwriting.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'EV OEM supply contracts with penalties. BESS project delivery commitments. Cell equipment: 12–18 months replacement from Korea/Japan/China.' },
      { product: 'Product Liability + Recall', relevance: 'CRITICAL', keyConsideration: 'A single batch defect can trigger nationwide EV recall. Reference: Hyundai Kona EV recall (LG cells) cost $900M globally. Indian gigafactories need ₹500+ Cr product liability limits.' },
      { product: 'Environmental Liability', relevance: 'HIGH', keyConsideration: 'HF gas release (electrolyte + moisture), NMP solvent, lithium compounds. Professional hazmat response needed. Soil/water contamination from leaks.' },
      { product: 'Erection All Risk', relevance: 'CRITICAL', keyConsideration: '₹6,000–10,000 Cr gigafactories under construction. Korean/Chinese equipment installation. 2–3 year construction period.' },
      { product: 'Machinery Breakdown', relevance: 'HIGH', keyConsideration: 'Cell coating machines, formation cyclers, module assembly lines: ₹100–500 Cr per production line. Korean/Japanese OEM equipment — 12+ month replacement.' },
    ],
    caseStudy: { title: 'Samsung SDI Battery Factory Fire — Tianjin, China (2022)', date: '2022', loss: 'USD 100M+', summary: 'Fire broke out in the finished-cell storage area at Samsung SDI\'s Tianjin gigafactory. Thermal runaway propagation in stored cells. Fire burned for 8+ hours despite suppression attempts. Significant portion of production capacity offline for 6 months. Supply disruption to multiple EV OEMs globally.', lesson: 'Stored Li-ion cells are a MASSIVE fire risk even without being charged (residual energy in cells). Indian gigafactories (Amara Raja, Exide-LGES) must plan for this. Storage areas need: individual rack isolation, propagation barriers, water-based suppression (gas-based alone insufficient for Li-ion), and rapid evacuation capability.' },
    bestPractices: ['UL 9540A testing for all cell chemistries BEFORE production scale-up', 'Formation bay fire-rated separation (each bay independent — one fire cannot propagate to all)', 'NMP recovery system (closed-loop — no atmospheric discharge, reduces fire + environmental risk)', 'Electrolyte storage: dedicated bunker, moisture-controlled, explosion venting', 'Cell-level traceability from electrode coating → formation → pack → customer', '24/7 thermal monitoring of stored cells (even "finished" cells can self-heat)', 'Emergency response: HF gas PPE for all personnel, rehearsed evacuation'],
  },
  nuclear: {
    title: 'Nuclear Equipment Manufacturing — Insurable Risks',
    icon: '⚛️',
    insurableRisks: [
      { title: 'Nuclear-Grade Weld Defect (Pressure Vessel)', severity: 'high', description: 'L&T Hazira fabricates PHWR-700 reactor vessels — thick-walled pressure vessels requiring nuclear-grade weld quality (zero tolerance for defects). A weld defect discovered late in fabrication can require months of rework (grinding out and re-welding) or complete component rejection (₹50–200 Cr waste).', typicalClaim: '₹50–200 Cr (rework/rejection + schedule delay to NPCIL)', impactAreas: ['Weld defect rejection', 'Radiographic test failure', 'Heat treatment distortion', 'Material non-conformance'] },
      { title: 'Heavy Forging / Machining Damage', severity: 'high', description: 'Nuclear components require forgings of 50–300 tonnes machined to <0.1mm tolerance. A machining error on a near-finished component (after months of work) destroys ₹10–100 Cr of value. The forging itself may be irreplaceable (12–18 month lead time for new forging from Japan/Korea).', typicalClaim: '₹10–100 Cr (WIP value) + 12–18 months delay', impactAreas: ['CNC crash on forging', 'Dimensional non-conformance', 'Tool breakage damaging workpiece', 'Transport damage to finished component'] },
      { title: 'Classified Information / Cyber Breach', severity: 'medium', description: 'Nuclear manufacturing involves classified designs (AERB/DAE controlled). L&T Hazira, Godrej (steam generators), BHEL (nuclear TG) handle sensitive nuclear data. A cyber breach or espionage incident triggers regulatory investigation and potential contract termination.', typicalClaim: '₹10–50 Cr (investigation + remediation + contract penalties)', impactAreas: ['Design data theft', 'Ransomware on production systems', 'Insider threat', 'Foreign intelligence targeting'] },
    ],
    keyPerils: [
      { peril: 'Pressure vessel weld rejection', probability: 'Medium (20%/yr)', impact: 'High', emv: '₹30 Cr', mitigation: 'In-process NDE at every stage. Qualified welders only. Pre-qualified welding procedures. Mock-up qualification before production.' },
      { peril: 'Machining damage to forging', probability: 'Low (8%/yr)', impact: 'Critical', emv: '₹20 Cr', mitigation: 'Simulation before cutting. Experienced operators only. Progressive machining (rough → semi-finish → finish). Tool condition monitoring.' },
      { peril: 'Cyber/espionage breach', probability: 'Low (5%/yr)', impact: 'High', emv: '₹10 Cr', mitigation: 'Air-gapped networks for nuclear design. CERT-In compliance. DAE security protocols. Insider threat monitoring.' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'HIGH', keyConsideration: 'Hazira complex: ₹3,000+ Cr. Nuclear-grade fabrication halls are specialised (clean, controlled, certified). Replacement takes years, not months.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'L&T is SOLE SOURCE for reactor vessels. Any disruption = national nuclear programme delay. Systemic BI value exceeds company\'s own revenue.' },
      { product: 'Product Liability', relevance: 'CRITICAL', keyConsideration: 'A component defect in a nuclear reactor has radiological safety implications. CLNDA right-of-recourse means NPCIL can sue the component supplier. Exposure potentially unlimited.' },
      { product: 'Cyber Insurance', relevance: 'HIGH', keyConsideration: 'Classified nuclear data. AERB/DAE regulatory framework. Breach = national security event. Fines + contract termination + criminal liability.' },
      { product: 'Marine/Transit', relevance: 'HIGH', keyConsideration: 'Reactor vessels: 200–400 tonnes, oversized, irreplaceable. Road transport from Hazira to reactor sites. Any transit damage = 12+ month delay.' },
    ],
    caseStudy: { title: 'L&T Nuclear Vessel — Quality Excellence (Positive Case)', date: '2023–2026', loss: 'No loss — best practice example', summary: 'L&T Hazira has delivered KAPS-3, KAPS-4, and GHAVP-1 reactor vessels with ZERO weld rejections at final radiography. This is a remarkable achievement for nuclear-grade fabrication. Their quality system (ASME N-stamp, AERB certification) demonstrates that insurance risk for L&T nuclear work is LOW in practice despite HIGH theoretical exposure.', lesson: 'The nuclear manufacturing sector in India has an EXCELLENT quality record (driven by regulatory oversight). Insurance claims frequency is very low. But the SEVERITY if something goes wrong is extreme. Price for low frequency but ensure adequate limits for catastrophic scenario.' },
    bestPractices: ['ASME Section III nuclear quality programme (N-stamp certified)', 'In-process radiographic examination at every weld pass (not just final)', 'Full material traceability from melt certificate to final installation', 'Qualified welder programme with annual recertification', 'Independent third-party inspection (Lloyd\'s Register, Bureau Veritas) at hold points', 'Air-gapped IT systems for classified nuclear design data', 'Escort security for nuclear component transport (armed if required by DAE)'],
  },
  epc: {
    title: 'EPC & System Integrators — Insurable Risks',
    icon: '🏗️',
    insurableRisks: [
      { title: 'Construction Site Incident (CAR/EAR)', severity: 'high', description: 'EPC companies erect power plants, solar parks, wind farms, substations. Construction involves: heavy lifting (cranes), working at height (towers, structures), electrical testing (first energisation), civil works (foundations). Every EPC project is a CAR/EAR insurance event.', typicalClaim: '₹10–100 Cr per project incident', impactAreas: ['Crane collapse', 'Structure failure during erection', 'First energisation failure', 'Foundation defect', 'Cable damage during installation'] },
      { title: 'Delay in Startup (DSU)', severity: 'high', description: 'EPC contracts have liquidated damages (LD) for late delivery. If a project is delayed due to an insured event (equipment damage during erection, natural catastrophe at site), the EPC company faces ₹5–50 Cr LD penalties. DSU insurance covers these penalties.', typicalClaim: '₹5–50 Cr LD penalties per project', impactAreas: ['Weather delay', 'Equipment damage during installation', 'Foundation redesign', 'Grid connection delay'] },
      { title: 'Defect Liability Period (DLP) Exposure', severity: 'medium', description: 'After project handover, EPC companies remain liable for workmanship defects for 1–2 years (DLP). Any failure traced back to construction quality during this period = EPC\'s cost to repair. For a ₹500 Cr solar EPC project, DLP exposure can be ₹20–50 Cr.', typicalClaim: '₹5–50 Cr per project (rework/repair)', impactAreas: ['Foundation settling', 'Wiring defects', 'Structure corrosion', 'Waterproofing failure'] },
    ],
    keyPerils: [
      { peril: 'Construction site accident', probability: 'High (40%/yr across portfolio)', impact: 'Medium', emv: '₹15 Cr', mitigation: 'Safety management system. Crane operation protocols. PTW (Permit to Work). Daily toolbox talks.' },
      { peril: 'DSU penalty trigger', probability: 'Medium (25%/yr)', impact: 'High', emv: '₹20 Cr', mitigation: 'Schedule buffers. Weather contingency. Multiple equipment suppliers. Pre-fabrication off-site.' },
      { peril: 'DLP claim', probability: 'High (30%/yr)', impact: 'Low', emv: '₹5 Cr', mitigation: 'Quality management during construction. Third-party inspection. Documentation.' },
    ],
    insuranceProducts: [
      { product: 'CAR / EAR', relevance: 'CRITICAL', keyConsideration: 'Every project needs CAR/EAR. Portfolio of 10–50 active projects at any time. Annual policy vs project-specific policies. Sublimits for testing/commissioning.' },
      { product: 'DSU (Delay in Startup)', relevance: 'HIGH', keyConsideration: 'Covers LD penalties if project delayed by insured peril. Critical for EPC companies with tight contractual timelines. Sum insured = LD cap in contract.' },
      { product: 'Professional Indemnity', relevance: 'HIGH', keyConsideration: 'Design errors causing project failures. Engineering mistakes. Covers defence costs + settlements for professional negligence claims.' },
      { product: 'Marine Cargo (Project)', relevance: 'HIGH', keyConsideration: 'Moving ₹100–500 Cr of equipment from multiple suppliers to site. Module shipments, transformer delivery, turbine components.' },
      { product: 'Workers Compensation', relevance: 'HIGH', keyConsideration: 'Large workforce (500–5000 per project). Working at height, heavy lifting, electrical work. Fatality/disability claims ₹20–50 Lakh each.' },
      { product: 'Third Party Liability', relevance: 'MEDIUM', keyConsideration: 'Damage to third-party property during construction. Crane operations near public areas. Cable trenching near utilities.' },
    ],
    caseStudy: { title: 'Sterling & Wilson — Solar EPC Project Damage (Rajasthan, 2023)', date: '2023', loss: '₹35 Cr (insured under CAR)', summary: 'During construction of a 200 MW solar park in Rajasthan, unseasonal rainfall caused foundation flooding. Module mounting structures installed on waterlogged foundations shifted. 50 MW of completed structures required dismantling and rebuilding. CAR policy covered physical damage. DSU covered LD penalties to customer for 3-month delay.', lesson: 'EPC risk is REAL and FREQUENT. Every project has potential for weather, equipment, and workmanship losses. EPC companies need: (1) CAR for every project, (2) DSU where LDs apply, (3) DLP cover for post-handover. Annual umbrella policies are more efficient than project-by-project for large EPC firms.' },
    bestPractices: ['Annual CAR master policy (covers all projects under one programme — more efficient)', 'DSU sublimit aligned with highest LD exposure in contract portfolio', 'Site-specific risk assessment before mobilisation (flood, access, ground conditions)', 'Quality management system ISO 9001 with project-specific quality plan', 'Safety management (ISO 45001) with leading indicator tracking', 'Pre-construction survey of adjacent third-party property (baseline for claims)'],
  },
  all: {
    title: 'All Manufacturing — Cross-Category Risks',
    icon: '🏭',
    insurableRisks: [
      { title: 'Factory Fire (Universal Risk)', severity: 'high', description: 'Fire is the #1 risk across ALL power equipment manufacturing. Every category has fire exposure: solar (laminators/chemicals), wind (composites/resin), grid (transformer oil), thermal (foundries), BESS (electrolyte/formation). Indian factories often have inadequate fire compartmentalisation.', typicalClaim: '₹50–500 Cr depending on manufacturer size', impactAreas: ['Production line fire', 'Warehouse/stock fire', 'Chemical storage', 'Electrical fire', 'Construction-phase fire'] },
      { title: 'Supply Chain Disruption (China Dependency)', severity: 'high', description: 'Indian power equipment manufacturing is heavily dependent on Chinese inputs: silicon wafers (solar), bearings/pitch systems (wind), CRGO steel (transformers), battery cells/materials (BESS), power electronics (all). Any China trade disruption = production halt.', typicalClaim: 'BI: ₹20–200 Cr per quarter of disruption', impactAreas: ['China trade restriction', 'Port congestion', 'Shipping disruption', 'Raw material price spike', 'Component shortage'] },
      { title: 'Natural Catastrophe (Regional Clusters)', severity: 'medium', description: 'Manufacturing clusters create regional accumulation risk: Gujarat coast (solar + wind + grid — cyclone exposed), Tamil Nadu (wind + solar — cyclone), Maharashtra (T&D — flood). A single cyclone hitting Gujarat can disrupt solar + transformer + BESS production simultaneously.', typicalClaim: '₹100–1000 Cr (cluster event)', impactAreas: ['Gujarat cyclone (Waaree + Voltamp + BESS)', 'TN cyclone (Suzlon + Siemens Gamesa + Tata Solar)', 'Maharashtra flood (CG Power + Polycab)'] },
    ],
    keyPerils: [
      { peril: 'Factory fire (any category)', probability: 'High (25%/yr across sector)', impact: 'High', emv: '₹50 Cr', mitigation: 'FM Global standards. Fire compartmentalisation. Sprinklers. 24/7 fire detection. Annual drills.' },
      { peril: 'China supply disruption', probability: 'Medium (20%/yr)', impact: 'High', emv: '₹40 Cr', mitigation: 'Dual sourcing. Safety stock (3 months). Domestic alternative development (PLI scheme).' },
      { peril: 'Gujarat cluster nat cat', probability: 'Low (8%/yr)', impact: 'Critical', emv: '₹30 Cr', mitigation: 'Cyclone-resistant factory design. Elevated equipment. Business continuity plans. Geographic diversification.' },
    ],
    insuranceProducts: [
      { product: 'Property All Risk', relevance: 'CRITICAL', keyConsideration: 'Total insurable manufacturing asset base: ₹2–3 lakh crore across all power equipment manufacturers in India. Growing 20–30% annually with capex.' },
      { product: 'Business Interruption', relevance: 'CRITICAL', keyConsideration: 'Supply chain concentration means disruption at one manufacturer can cascade. Systemic BI considerations for transformer and BESS manufacturers especially.' },
      { product: 'Marine / Stock Throughput', relevance: 'HIGH', keyConsideration: '₹50,000+ Cr of raw materials imported annually (silicon, copper, lithium, CRGO steel). Plus finished goods in transit domestically and for export.' },
      { product: 'Product Liability', relevance: 'HIGH', keyConsideration: 'Power equipment operates for 20–40 years. Latent defects discovered years after manufacture. Aggregate exposure across installed base is enormous.' },
      { product: 'CAR/EAR (Expansions)', relevance: 'HIGH', keyConsideration: '₹50,000+ Cr manufacturing capex underway across the sector (solar gigafactories, BESS plants, transformer expansion). Every expansion is a construction risk event.' },
    ],
    caseStudy: null,
    bestPractices: ['Sector-wide: FM Global "Highly Protected Risk" (HPR) standards adoption', 'Fire compartmentalisation between production lines/bays', 'Dual-source procurement for critical imported components', 'Geographic diversification of manufacturing (avoid single-cluster concentration)', 'Annual insurance valuation (equipment costs increasing — underinsurance risk)', 'PLI scheme participation to reduce import dependency over time'],
  },
};

function ManufacturingRiskIntelligence({ selectedCategory }: { selectedCategory: string }) {
  const [activeTab, setActiveTab] = useState<'insurable' | 'framework' | 'products' | 'practices'>('insurable');
  const category = selectedCategory === 'all' ? 'all' : selectedCategory;
  const riskData = MFG_RISK_DATA[category] || MFG_RISK_DATA['all'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="icici-card p-5 border-l-4 border-icici-maroon">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{riskData.icon}</span>
          <div>
            <h3 className="text-sm font-black text-gray-800">{riskData.title}</h3>
            <p className="text-[11px] text-gray-400">Manufacturing-specific insurable perils · Risk framework · Insurance products · Best practices</p>
          </div>
        </div>
        {/* Sub-tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {[
            { id: 'insurable' as const, label: '🛡️ Insurable Risks' },
            { id: 'framework' as const, label: '📐 Risk Framework' },
            { id: 'products' as const, label: '💼 Insurance Products' },
            { id: 'practices' as const, label: '✅ Best Practices' },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeTab === t.id ? 'bg-white text-icici-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insurable Risks */}
      {activeTab === 'insurable' && (
        <div className="space-y-3">
          {riskData.insurableRisks.map((risk, i) => {
            const sevCfg = { high: 'border-red-200 bg-red-50', medium: 'border-amber-200 bg-amber-50', low: 'border-green-200 bg-green-50' };
            const sevLabel = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
            return (
              <div key={i} className={`icici-card p-4 border-l-4 ${risk.severity === 'high' ? 'border-l-red-500' : risk.severity === 'medium' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[12px] font-black text-gray-800">{risk.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sevCfg[risk.severity]}`}>{sevLabel[risk.severity]}</span>
                    <span className="text-[10px] font-bold text-gray-500">Typical: {risk.typicalClaim}</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mb-2">{risk.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {risk.impactAreas.map((area, j) => {
                    const knowledge = lookupMfgKnowledge(area);
                    return knowledge ? (
                      <MfgImpactTag key={j} area={area} knowledge={knowledge} />
                    ) : (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{area}</span>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Case Study */}
          {riskData.caseStudy && (
            <div className="icici-card p-4 border-l-4 border-amber-400">
              <h4 className="text-[12px] font-black text-gray-800 mb-1">📋 Case Study — {riskData.caseStudy.title}</h4>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
                <span>📅 {riskData.caseStudy.date}</span>
                <span className="font-bold text-red-600">💰 {riskData.caseStudy.loss}</span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2">{riskData.caseStudy.summary}</p>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-800">🔑 Key Learning: </span>
                <span className="text-[10px] text-blue-700">{riskData.caseStudy.lesson}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Framework */}
      {activeTab === 'framework' && (
        <div className="icici-card p-5">
          <h3 className="text-[12px] font-black text-gray-800 mb-3">Probability × Impact Matrix — Manufacturing Risks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 uppercase text-[10px]">
                  <th className="text-left p-2">Peril</th>
                  <th className="text-center p-2">Probability</th>
                  <th className="text-center p-2">Impact</th>
                  <th className="text-center p-2">EMV</th>
                  <th className="text-left p-2">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {riskData.keyPerils.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2 font-bold text-gray-800">{p.peril}</td>
                    <td className="p-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.probability.includes('High') ? 'bg-red-100 text-red-700' : p.probability.includes('Medium') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{p.probability}</span></td>
                    <td className="p-2 text-center font-bold">{p.impact}</td>
                    <td className="p-2 text-center font-black text-icici-navy">{p.emv}</td>
                    <td className="p-2 text-gray-600">{p.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insurance Products */}
      {activeTab === 'products' && (
        <div className="space-y-2">
          {riskData.insuranceProducts.map((prod, i) => {
            const relCfg: Record<string, string> = { 'CRITICAL': 'bg-red-100 text-red-700', 'HIGH': 'bg-amber-100 text-amber-700', 'MEDIUM': 'bg-blue-100 text-blue-700' };
            return (
              <div key={i} className="icici-card p-3 flex items-start gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${relCfg[prod.relevance] || 'bg-gray-100 text-gray-600'}`}>{prod.relevance}</span>
                <div className="flex-1">
                  <div className="text-[12px] font-black text-gray-800">{prod.product}</div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{prod.keyConsideration}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Best Practices */}
      {activeTab === 'practices' && (
        <div className="icici-card p-5">
          <h3 className="text-[12px] font-black text-gray-800 mb-3">✅ Risk Engineering Best Practices</h3>
          <div className="space-y-1.5">
            {riskData.bestPractices.map((bp, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700 p-2 rounded-lg bg-green-50 border border-green-100">
                <span className="text-green-600 flex-shrink-0 font-bold">✓</span>{bp}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ── All Players Directory (from expanded all-players.json) ───────────────────

function AllPlayersDirectory({ data, selectedCategory, searchQuery }: { data: any; selectedCategory: string; searchQuery: string }) {
  const [showSection, setShowSection] = useState<'solar' | 'bess' | 'wind' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const showSolar = selectedCategory === 'all' || selectedCategory === 'solar';
  const showBess = selectedCategory === 'all' || selectedCategory === 'bess';
  const showWind = selectedCategory === 'all' || selectedCategory === 'wind';

  const filterBySearch = (list: any[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((p: any) => p.name.toLowerCase().includes(q) || (p.products || '').toLowerCase().includes(q) || (p.hq || '').toLowerCase().includes(q));
  };

  const solarList = filterBySearch(data.solarManufacturers || []);
  const bessList = filterBySearch(data.bessManufacturers || []);
  const windList = filterBySearch(data.windManufacturers || []);

  // Convert directory entry to a card-compatible format
  const toProfile = (p: any, category: string): any => ({
    id: p.id, name: p.name, parentGroup: p.name,
    category, subcategories: (p.products || '').split(' / '),
    listed: p.listed || 'Not available', ownership: 'private',
    headquarters: p.hq || 'India', website: '',
    founded: 0, employees: 0,
    revenue: 'Not available', manufacturingCapacity: p.capacity || 'Not available',
    plants: [], expansionPlans: 'Not available',
    orderBook: 'Not available', exportExposure: 'Not available',
    keyCustomers: [], competitors: [],
    recentDevelopments: [], salesPriority: p.tier === 1 ? 'high' : p.tier === 2 ? 'medium' : 'emerging' as any,
    salesPriorityFactors: [], whyMeetNow: [],
    insuranceRelevance: { property: 'Requires assessment', bi: 'Requires assessment', machineryBreakdown: 'Requires assessment', marineCargo: 'Requires assessment', productLiability: 'Requires assessment', cyber: 'Requires assessment', environmental: 'Requires assessment', erectionRisk: 'Requires assessment' },
    riskProfile: { fire: 'Requires assessment', machineryBreakdown: 'Requires assessment', natCat: 'Requires assessment', supplyChain: 'Requires assessment', productLiability: 'Requires assessment' },
    tier: p.tier, source: 'Industry data — requires validation',
    products: p.products, models: p.models,
  });

  // If a player is selected, show detail
  if (selectedPlayer) {
    return <ManufacturerDetail company={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div className="icici-card p-4 mt-4">
      <h3 className="text-sm font-black text-gray-800 mb-1">📋 Complete Player Directory ({data.summary?.totalAllPlayers ?? 85} companies)</h3>
      <p className="text-[11px] text-gray-400 mb-3">Click any company for full profile. Data marked "Requires assessment" where validation pending.</p>

      {/* Section toggles */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {showSolar && (
          <button onClick={() => setShowSection(showSection === 'solar' ? null : 'solar')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${showSection === 'solar' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            ☀️ Solar ({solarList.length})
          </button>
        )}
        {showBess && (
          <button onClick={() => setShowSection(showSection === 'bess' ? null : 'bess')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${showSection === 'bess' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
            🔋 BESS ({bessList.length})
          </button>
        )}
        {showWind && (
          <button onClick={() => setShowSection(showSection === 'wind' ? null : 'wind')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${showSection === 'wind' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
            💨 Wind ({windList.length})
          </button>
        )}
      </div>

      {/* Solar Directory — full cards */}
      {showSection === 'solar' && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {solarList.map((p: any) => (
            <div key={p.id} className="icici-card p-3 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedPlayer(toProfile(p, 'solar'))}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 ${p.tier === 1 ? 'bg-red-500' : p.tier === 2 ? 'bg-amber-500' : 'bg-gray-400'}`}>T{p.tier}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-black text-gray-800">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.products} · {p.capacity || 'Capacity N/A'} · {p.hq || 'India'}</div>
                </div>
                {p.listed && p.listed.includes('BSE') && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Listed</span>}
                <span className="text-gray-300 text-sm">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BESS Directory — full cards */}
      {showSection === 'bess' && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {bessList.map((p: any) => (
            <div key={p.id} className="icici-card p-3 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedPlayer(toProfile(p, 'bess'))}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 ${p.tier === 1 ? 'bg-purple-600' : p.tier === 2 ? 'bg-purple-400' : 'bg-gray-400'}`}>T{p.tier}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-black text-gray-800">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.products} · {p.hq || 'India'}</div>
                </div>
                {p.listed && p.listed.includes('BSE') && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Listed</span>}
                <span className="text-gray-300 text-sm">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wind Directory — full cards */}
      {showSection === 'wind' && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {windList.map((p: any) => (
            <div key={p.id} className="icici-card p-3 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedPlayer(toProfile(p, 'wind'))}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 ${p.tier === 1 ? 'bg-teal-600' : p.tier === 2 ? 'bg-teal-400' : 'bg-gray-400'}`}>T{p.tier}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-black text-gray-800">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.products} {p.models ? `· ${p.models}` : ''} · {p.hq || 'India'}</div>
                </div>
                {p.listed && p.listed.includes('BSE') && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Listed</span>}
                <span className="text-gray-300 text-sm">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSection === null && (
        <p className="text-[11px] text-gray-400 italic">Click a category above to see all companies (clickable for full profile).</p>
      )}
    </div>
  );
}
