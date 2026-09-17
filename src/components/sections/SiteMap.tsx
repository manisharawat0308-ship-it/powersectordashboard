import { useFilterStore } from '@/store/filterStore';

const SITE_STRUCTURE = [
  {
    id: 'industry-overview',
    title: 'Industry Overview',
    icon: '🏭',
    description: 'Executive dashboard with KPIs, What Changed insights, source breakdown, growth journey',
    children: ['Total Capacity KPIs (10 cards)', 'What Changed? Panel', 'Source-wise Breakdown', 'Fossil vs Non-Fossil Split', 'Sector Story', 'Timeline & Projections'],
  },
  {
    id: 'generation',
    title: 'Generation',
    icon: '⚡',
    description: 'Generation data by source, PLF/CUF analysis, Capacity vs Generation comparison',
    children: ['Total Generation (BU)', 'Generation Share Donut', 'Source-wise Bar Chart', 'PLF/CUF Gauges', 'Capacity vs Generation Comparison'],
  },
  {
    id: 'ownership',
    title: 'Ownership',
    icon: '🏛️',
    description: 'Ownership structure — Central PSU, State PSU, Private sector split',
    children: ['Ownership Split', 'By Source × Ownership', 'Historical Ownership Trend'],
  },
  {
    id: 'nuclear',
    title: 'Nuclear Deep Dive',
    icon: '⚛️',
    description: 'Complete nuclear power analysis — plants, pipeline, new entrants, state analysis',
    children: ['Nuclear KPIs (8 metrics)', 'Capacity & Generation Trends', 'Nuclear in the Mix (comparison)', 'Plants & Reactors (searchable)', 'Pipeline (Operating → UC → Approved → Planned)', 'New Entrants & Private Players (10 companies)', 'Nuclear News (12 items)', 'State-wise Analysis'],
  },
  {
    id: 'risks',
    title: 'Risk Analysis',
    icon: '📋',
    description: 'Insurance-focused risk analysis by power source — insurable perils, framework, case studies, best practices',
    children: ['Source Selector (Coal / Hydro / Wind / Solar / Nuclear)', 'Insurable Risks (AOG + Non-AOG + BI)', 'Risk Framework (Probability × Impact Matrix)', 'Emerging Technologies (3 per source)', 'Non-Insurable Risks', 'Best Practices (Indian + International)', 'Claims Learnings & Benchmarks', 'Case Studies', 'Insurance Products & Add-ons', 'Technical Glossary (26 terms, 3-level tooltips)'],
  },
  {
    id: 'bess',
    title: 'BESS Deep Dive',
    icon: '🔋',
    description: 'Battery Energy Storage Systems — technology, chemistry, risks, insurance, transformer crisis',
    children: ['Market Overview & Key Players', 'Chemistry Comparison (LFP vs NMC vs Sodium-Ion)', 'System Components (7 detailed)', 'Primary Risks (Thermal Runaway, Degradation, Transformer)', 'Insurance Framework (Coverage, Exclusions, Underwriting)', 'Transformer Availability Crisis (Manufacturers, Backlogs)'],
  },
  {
    id: 'market-players',
    title: 'Market Players',
    icon: '🏢',
    description: 'Operators by sector with plant-level detail, unit configs, OEM equipment data',
    children: ['Thermal Power (23 operators, BHEL/Doosan/GE turbines)', 'Hydro Power (7 operators, BHEL/Andritz/Toshiba turbines)', 'Nuclear Power (NPCIL/BHAVINI + supply chain)', 'Renewable Energy (44 companies)', 'OEM Slicer & Detail Panel (7 OEMs with turbine models)', 'Excel Download (CSV export per tab)'],
  },
  {
    id: 'geography',
    title: 'Geography',
    icon: '🗺️',
    description: 'Interactive India map with state-wise capacity, source filter, nuclear plant markers',
    children: ['India State Map (color by dominant source)', 'Source Filter (Coal/Solar/Wind/Hydro/Gas/Nuclear/Biomass)', 'Nuclear Plant Markers (operating + UC)', 'State Detail Panel (capacity, generation, by source, by ownership)', 'Top States Ranking', 'State Projects List'],
  },
  {
    id: 'news',
    title: 'News',
    icon: '📰',
    description: 'Power sector news filtered by region, category, and energy source',
    children: ['Region Filter (North/South/East/West/All)', 'Category Filter (Business Wins/Accidents/Industry/Commissioning/Tender/Policy)', 'Source Filter (Coal/Solar/Wind/Hydro/Nuclear/Biomass)', 'News Cards with source attribution', 'Reload button for data refresh'],
  },
  {
    id: 'downloads',
    title: 'Downloads & Reports Library',
    icon: '📥',
    description: 'Catalogued reports, presentations, and documents organized by segment',
    children: ['Segment Filter (Thermal/Solar/Wind/Nuclear/Hydro/BESS/General)', 'Search by title/description', 'Document Cards with download links', 'Admin Upload Panel (add new documents)'],
  },
  {
    id: 'data-methodology',
    title: 'Data & Methodology',
    icon: '📖',
    description: 'Data sources, coverage, KPI definitions, risk methodology, missing data register',
    children: ['Data Sources (7 sources with availability status)', 'KPI Definitions (8 formulas)', 'Risk Scoring Methodology', 'Missing Data Register', 'Dataset Freshness'],
  },
];

export function SiteMap() {
  const setActiveSection = useFilterStore((s) => s.setActiveSection);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="icici-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-xl bg-gradient-to-r from-icici-maroon via-icici-navy to-green-600" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-icici-navy flex items-center justify-center text-xl">🗺️</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Site Map — Dashboard Navigation</h2>
            <p className="text-[12px] text-gray-400">Complete overview of all sections, content, and data available in this dashboard. Click any section to navigate.</p>
          </div>
        </div>
      </div>

      {/* Structure Grid */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
        {SITE_STRUCTURE.map((section) => (
          <div
            key={section.id}
            className="icici-card p-4 cursor-pointer hover:shadow-lg hover:border-icici-navy/30 transition-all group"
            onClick={() => setActiveSection(section.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">{section.icon}</span>
              <div className="flex-1">
                <h3 className="text-[13px] font-black text-gray-800 group-hover:text-icici-navy transition-colors">{section.title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 mb-2">{section.description}</p>
                <div className="flex flex-wrap gap-1">
                  {section.children.map((child, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                      {child}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-icici-navy transition-colors text-sm">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="icici-card p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Dashboard Coverage</h3>
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-lg bg-gray-50">
            <div className="text-lg font-black text-icici-maroon">11</div>
            <div className="text-[10px] text-gray-500">Main Sections</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50">
            <div className="text-lg font-black text-icici-navy">450+ GW</div>
            <div className="text-[10px] text-gray-500">Capacity Covered</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50">
            <div className="text-lg font-black text-purple-700">67+</div>
            <div className="text-[10px] text-gray-500">Operators/Players</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50">
            <div className="text-lg font-black text-green-700">7</div>
            <div className="text-[10px] text-gray-500">OEMs Profiled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
