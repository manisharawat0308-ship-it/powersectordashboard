import { useState } from 'react';

// ─── Claims Case Studies (Consolidated Reference) ────────────────────────────
// A single organised library of every claim/incident case study collected across
// the Risk Analysis section, grouped by energy source and searchable. Shown as a
// standalone top-level section — it always shows ALL case studies for easy reference.

type ClaimSource = 'coal' | 'wind' | 'solar' | 'nuclear' | 'hydro';

interface ClaimCaseStudy {
  title: string;
  source: ClaimSource;
  location?: string;
  date: string;
  loss: string;
  category: string;        // e.g. 'Boiler / Thermal', 'Cyclone (AOG)', 'Hail (AOG)'
  summary: string;         // root cause + impact narrative
  keyLearning: string;     // the insurance / underwriting takeaway
  lessons?: string[];      // optional detailed lessons (from the flagship studies)
  benchmark?: string;      // optional industry benchmark note
  url?: string | null;
}

const SOURCE_META: Record<ClaimSource, { label: string; icon: string; color: string }> = {
  coal:    { label: 'Coal / Thermal', icon: '🏭', color: '#B02A30' },
  wind:    { label: 'Wind',           icon: '💨', color: '#005B75' },
  solar:   { label: 'Solar',          icon: '☀️', color: '#F99D27' },
  nuclear: { label: 'Nuclear',        icon: '⚛️', color: '#7B1FA2' },
  hydro:   { label: 'Hydro',          icon: '💧', color: '#003D50' },
};

// Full consolidated library — mirrors the case studies shown across the Risk
// Analysis section so everything lives in one reference-friendly place.
const CLAIMS_LIBRARY: ClaimCaseStudy[] = [
  // ── Coal / Thermal ──────────────────────────────────────────────────────
  {
    title: 'NTPC Unchahar Unit-6 Boiler Explosion', source: 'coal', location: 'Unchahar, Uttar Pradesh',
    date: 'November 2017', loss: '₹150+ Cr (MD + BI) · 38 fatalities', category: 'Boiler / Thermal',
    summary: 'High-pressure steam line rupture due to tube erosion; accumulated ash deposits caused localized overheating beyond design limits. Flue gas and steam escaped from a duct at 20m elevation. 500 MW unit offline for 8 months. Triggered an industry-wide boiler inspection mandate.',
    keyLearning: 'Condition-based maintenance with regular tube-thickness mapping is critical. Post-overhaul startup is the highest-risk period. BI indemnity of 12+ months proved adequate.',
    lessons: [
      'Condition-based maintenance (CBM) with regular tube thickness mapping is critical',
      'Ash blower maintenance schedule directly correlates with tube life',
      'BI indemnity period of 12 months proved adequate for this loss',
      'Pre-agreed repair methodology with OEM (BHEL) accelerated restoration',
    ],
    benchmark: 'Post-event, NTPC invested ₹2,400 Cr in fleet-wide boiler health monitoring. FM Global recommends annual tube thickness surveys for units > 15 years old.',
    url: 'https://indianexpress.com/article/india/ntpc-blast-raebareli-uttar-pradesh-early-probe-show-safety-norms-violated-boiler-ops-went-wrong-4920144/',
  },
  {
    title: 'Vedanta Singhitarai Boiler Blast', source: 'coal', location: 'Chhattisgarh',
    date: 'April 2025', loss: '₹200+ Cr · 25 fatalities', category: 'Boiler / Thermal',
    summary: 'Boiler pressure fluctuation due to maintenance negligence caused a catastrophic explosion. FIR filed against company chairman. Industrial safety overhaul mandated across all Vedanta plants.',
    keyLearning: 'Maintenance audit compliance must be a pre-condition for cover. Lack of CBM systems increases moral hazard.',
    url: 'https://www.business-standard.com/india-news/industrial-accidents-claimed-196-lives-in-17-months-chhattisgarh-govt-126071700126_1.html',
  },
  {
    title: 'Sipat STPS Generator Winding Failure', source: 'coal',
    date: '2020', loss: '₹180 Cr (incl. 14 months BI)', category: 'Generator / Machinery Breakdown',
    summary: 'Stator winding insulation breakdown in a 660 MW unit. Root cause: moisture ingress during monsoon maintenance outage. Generator rewinding took 14 months due to COVID supply-chain delays.',
    keyLearning: 'Maintenance-period exposures (outage/turnaround risks) need specific cover. COVID-era claims highlighted supply-chain BI exposure.',
    url: null,
  },
  // ── Wind ────────────────────────────────────────────────────────────────
  {
    title: 'Cyclone Tauktae — Gujarat Wind Farm Portfolio', source: 'wind', location: 'Kutch & Jamnagar, Gujarat',
    date: 'May 2021', loss: '₹180 Cr (multiple developers)', category: 'Cyclone (AOG)',
    summary: 'Extremely severe cyclonic storm with 185 kmph sustained winds — beyond design wind speed (Class IIA: 52 m/s) for most installed turbines. 78 WTGs damaged (blade failures, tower buckling, nacelle rotation). 450 MW offline 4–12 months; crane mobilisation delayed by damaged access roads.',
    keyLearning: 'Coastal Gujarat sites need Class IA turbines (70 m/s). Crane pre-booking contracts are essential — 6-month wait post-event. Named-storm sublimits must be adequate.',
    lessons: [
      'Coastal Gujarat sites need Class IA turbines (designed for 70 m/s)',
      'Crane pre-booking contracts essential — 6-month wait post-event',
      'Portfolio-level insurance with named storm sublimits required adequate reinstatement',
      'Blade inventory at regional depots reduced restoration time by 2 months for prepared operators',
    ],
    benchmark: 'GCube reported 2021 as the costliest cyclone year for Indian wind (>₹500 Cr). IEC 61400-1 Class IA now recommended for all Indian coastal sites.',
    url: null,
  },
  {
    title: 'Suzlon S111 Blade Serial Defect — Pan-India', source: 'wind',
    date: '2019–2021', loss: '₹400+ Cr (fleet-wide)', category: 'Serial Defect',
    summary: 'Systematic root-joint debonding in Suzlon S111 (2.1 MW) blades across 200+ turbines — a manufacturing defect in adhesive bonding. Required a blade replacement programme spanning 3 years.',
    keyLearning: 'Serial-defect clauses are critical for fleet operators. OEM warranty alone was insufficient to cover full replacement cost + BI.',
    url: null,
  },
  {
    title: 'Cyclone Amphan — West Bengal Wind Damage', source: 'wind', location: 'Digha-Contai, West Bengal',
    date: 'May 2020', loss: '₹60 Cr', category: 'Cyclone (AOG)',
    summary: 'Category 5 cyclone damaged 22 WTGs — tower buckling (3), blade root failures (15), yaw failures (4). Destroyed access roads delayed crane arrival by 4 months.',
    keyLearning: 'Road damage is an invisible BI multiplier. Pre-event logistics planning (crane staging, road repair budget) should be part of ERM.',
    url: null,
  },
  {
    title: 'ReNew Energy Gearbox Campaign — Rajasthan', source: 'wind', location: 'Rajasthan',
    date: '2022', loss: '₹45 Cr (25 units)', category: 'Gearbox / Machinery Breakdown',
    summary: '25 gearboxes failed within 6 months on the same turbine model (Gamesa G97) at the same site. Oil contamination from a supplier batch defect required complete gearbox fleet replacement.',
    keyLearning: 'Oil analysis reports are the "blood test" for gearboxes. Monthly sampling with trend analysis catches contamination before failure.',
    url: null,
  },
  // ── Solar ───────────────────────────────────────────────────────────────
  {
    title: 'Rajasthan Hailstorm — Bhadla / Fatehgarh Solar Parks', source: 'solar', location: 'Jaisalmer & Jodhpur, Rajasthan',
    date: 'March 2023', loss: '₹350+ Cr (5 developers, 600+ MW)', category: 'Hail (AOG)',
    summary: 'Unusually large hailstones (40–60 mm) with wind-driven impact shattered modules despite IEC 61215 qualification (25 mm at 23 m/s). 30–80% module replacement needed per site; BCD import restrictions constrained supply. Developers included Adani, ACME, Azure, SB Energy.',
    keyLearning: 'IEC hail test (25 mm) is inadequate for Indian conditions — need 40 mm+ qualification. Tracker auto-stow cut damage by 40%. EL imaging is essential to find hidden micro-cracks.',
    lessons: [
      'IEC hail test (25 mm) is inadequate for Indian conditions — need 40 mm+ qualification',
      'Tracker auto-stow systems reduced damage by 40% where deployed',
      'BCD made module replacement 40% costlier and 2 months slower',
      'Electroluminescence (EL) imaging essential to detect hidden micro-cracks (visual inspection misses 30%)',
    ],
    benchmark: 'Munich Re classified Indian solar hail as an emerging "secondary peril" (2024 NatCat). Swiss Re now offers parametric hail covers paying within 72 hours.',
    url: 'https://www.pv-magazine.com/2025/12/22/building-resilience-amid-intensifying-weather-events/',
  },
  {
    title: 'Gujarat Solar Park — Tracker Stow Failure in Cyclone Biparjoy', source: 'solar', location: 'Gujarat',
    date: 'June 2023', loss: '₹80 Cr', category: 'Cyclone (AOG)',
    summary: 'Tracker software failed to execute the stow command during cyclone approach (communication tower was damaged). Modules facing upward took full wind load; a 200 MW array was extensively damaged.',
    keyLearning: 'Tracker stow reliability is a critical control. Manual override and redundant communication are essential — now a key survey focus area.',
    url: null,
  },
  {
    title: 'Tamil Nadu Solar — DC Arc Flash Fire', source: 'solar', location: 'Tamil Nadu',
    date: 'February 2024', loss: '₹25 Cr', category: 'Fire',
    summary: 'An MC4 connector failure on a 50 MW plant caused a DC arc flash. Fire spread through dry scrubland to adjacent module strings — 8 MW destroyed in 90 minutes before the fire service arrived.',
    keyLearning: 'Vegetation management (fire breaks) is as important as electrical maintenance. String-level monitoring can detect resistance anomalies that precede arc faults.',
    url: 'https://energiesmedia.com/india-solar-industry-storm-damage-energy/',
  },
  // ── Nuclear ─────────────────────────────────────────────────────────────
  {
    title: 'NAPS-1 Turbine Hall Fire — Narora', source: 'nuclear', location: 'Narora, Uttar Pradesh',
    date: 'March 1993', loss: '~₹30 Cr (1993) + ~2 years offline', category: 'Fire (Turbine Island)',
    summary: 'Hydrogen leak from the generator seal system ignited in the turbine hall; fire spread through lubricant oil and severed control-room cables. The reactor shut down safely with no core damage. AERB mandated safety retrofits across all PHWR plants.',
    keyLearning: 'Turbine-hall fire is the primary insurable peril at nuclear plants — identical to conventional thermal. Turbine island is commercially insurable (reactor island excluded). BI must cover AERB-mandated restart delay (≥24 months).',
    lessons: [
      'Turbine hall hydrogen fire is the primary insurable peril — identical to conventional thermal',
      'Turbine island damage is commercially insurable even at nuclear sites (reactor island excluded)',
      'NPCIL retrofitted all PHWR turbine halls with enhanced fire detection and CO₂ suppression',
      'AERB mandated physical separation between turbine hall and control-room cable routes',
      'BI indemnity must account for AERB investigation + mandatory restart approval — minimum 24 months',
    ],
    benchmark: 'NPCIL fleet has operated >600 reactor-years since 1993 with no INES ≥3 event. Kaiga-1 holds the world record for continuous operation (962 days).',
    url: null,
  },
  {
    title: 'KAPS-1 Heavy Water Leak — Kakrapar', source: 'nuclear', location: 'Kakrapar, Gujarat',
    date: 'March 1994', loss: '₹20 Cr + 6 months regulatory investigation', category: 'Reactor Island (cross-impact)',
    summary: 'A primary coolant system leak triggered an INES Level 3 classification with no off-site release. The reactor was offline for investigation and repair — a reactor-island event that nonetheless caused turbine-island BI.',
    keyLearning: 'Reactor incidents NOT insured under commercial policies still trigger BI on the insured turbine island. Policy wording must clarify the coverage boundary and the waiting period for regulatory shutdowns.',
    url: null,
  },
  {
    title: 'Kaiga-1 — World Record 962 Days Continuous Operation', source: 'nuclear', location: 'Kaiga, Karnataka',
    date: '2018–2021', loss: 'No loss — positive benchmark', category: 'Benchmark',
    summary: 'KGS-1 operated 962 consecutive days without shutdown — a world record for any nuclear reactor — demonstrating NPCIL operational excellence and the inherent reliability of the Indian PHWR fleet.',
    keyLearning: 'Indian nuclear has the strongest CUF (~80%) and lowest forced-outage rate of any technology in the Indian power sector. Low claims frequency makes NCD structures highly relevant for nuclear portfolios.',
    url: null,
  },
  {
    title: 'Fukushima Daiichi — Global Benchmark', source: 'nuclear', location: 'Japan',
    date: 'March 2011', loss: 'USD 200B+ (total economic loss)', category: 'Flood / Tsunami (AOG)',
    summary: 'A 15m tsunami overwhelmed a seawall designed for 5.7m, flooding diesel generators and causing a station blackout and core melt in 3 reactors — the cascade from AOG to nuclear peril. Prompted post-Fukushima reviews of coastal Indian plants (Kudankulam, MAPS).',
    keyLearning: 'Insurance boundary is sharp: physical tsunami damage (insurable) vs radioactive contamination (nuclear pool / government). All Indian plants now require passive heat removal and higher tsunami walls.',
    url: null,
  },
  // ── Hydro ───────────────────────────────────────────────────────────────
  {
    title: 'Chamoli GLOF — Tapovan Vishnugad (NTPC) & Rishiganga HEP', source: 'hydro', location: 'Chamoli, Uttarakhand',
    date: 'February 2021', loss: '₹1,500+ Cr (combined) + 200+ fatalities', category: 'GLOF / Flood (AOG)',
    summary: 'A glacial collapse on Nanda Devi triggered a debris-laden flood down the Rishiganga/Dhauliganga valleys. The NTPC 520 MW project headrace tunnel was flooded with 2+ km of debris; the 13.2 MW Rishiganga plant was destroyed; workers were trapped underground. Project delayed 2+ years.',
    keyLearning: 'GLOF/glacial collapse is an emerging climate peril not historically modelled. CAR policies covered construction damage, but BI during the 2-year restoration was the dominant loss. Remote access amplified the timeline.',
    lessons: [
      'GLOF/glacial collapse is an emerging peril for Himalayan hydro — not historically priced',
      'Underground powerhouse survived (below flood level), but the long headrace tunnel was completely silted',
      'CAR policies paid for damage — but 2-year reconstruction BI was the largest component',
      'Access road destroyed in the same event; debris removal alone took 6 months',
      'Govt reviewed all Himalayan hydro projects for GLOF vulnerability post-event',
    ],
    benchmark: 'Post-Chamoli, CWC/GSI mandate glacial-lake monitoring for hydro projects within 50 km of glacial systems. Munich Re flagged climate-driven glacial instability as an emerging secondary peril.',
    url: null,
  },
  {
    title: 'Uttarakhand Floods 2013 — Multiple Hydro Projects', source: 'hydro', location: 'Uttarakhand',
    date: 'June 2013', loss: '₹3,000+ Cr (sector-wide) + 5,700 fatalities', category: 'Flood (AOG) / Accumulation',
    summary: 'Extreme rainfall plus glacial-lake overflow caused catastrophic flooding. 70+ small hydro projects were damaged or destroyed; Vishnuprayag (400 MW) and Srinagar (330 MW) were severely damaged; the Kedarnath area was devastated.',
    keyLearning: 'Correlated portfolio exposure — multiple projects in one river basin can all be hit by a single event. Accumulation-risk management is critical for insurers. Post-event: Supreme Court ordered environmental reassessment of all Himalayan hydro.',
    url: null,
  },
  {
    title: 'Nathpa Jhakri — Silt Damage Campaign (Annual)', source: 'hydro', location: 'Himachal Pradesh',
    date: 'Every monsoon', loss: '₹15–30 Cr per monsoon (maintenance)', category: 'Silt Erosion / Machinery',
    summary: 'SJVN Nathpa Jhakri (1500 MW) faces extreme silt during monsoon (up to 10,000 ppm). Runners erode every 2–3 monsoons despite desilting chambers; HVOF coatings extend life but do not eliminate the problem.',
    keyLearning: 'Silt abrasion is a maintenance issue (not insurable), but sudden runner-blade fracture FROM cavitation pitting (accelerated by silt) IS insurable as machinery breakdown. Pre-loss condition surveys and threshold definitions are key.',
    url: null,
  },
];

export function ClaimsCaseStudies() {
  const [sourceFilter, setSourceFilter] = useState<ClaimSource | 'all'>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = CLAIMS_LIBRARY.filter((c) => {
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.keyLearning.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.location?.toLowerCase().includes(q) ?? false)
    );
  });

  const counts: Record<string, number> = { all: CLAIMS_LIBRARY.length };
  (Object.keys(SOURCE_META) as ClaimSource[]).forEach((s) => {
    counts[s] = CLAIMS_LIBRARY.filter((c) => c.source === s).length;
  });

  const chips: { id: ClaimSource | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Sources', icon: '📂' },
    ...(Object.keys(SOURCE_META) as ClaimSource[]).map((s) => ({ id: s, label: SOURCE_META[s].label, icon: SOURCE_META[s].icon })),
  ];

  return (
    <div className="space-y-4">
      {/* Intro / controls */}
      <div className="icici-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-icici-maroon flex items-center justify-center text-xl flex-shrink-0">📂</div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-gray-800">Claims Case Studies — Consolidated Library</h3>
            <p className="text-[14px] text-gray-400">Every notable loss, incident and claim collected across the power sector — organised by energy source for quick reference. {CLAIMS_LIBRARY.length} case studies.</p>
          </div>
        </div>

        {/* Source filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map((chip) => {
            const active = sourceFilter === chip.id;
            const color = chip.id === 'all' ? '#B02A30' : SOURCE_META[chip.id as ClaimSource].color;
            return (
              <button
                key={chip.id}
                onClick={() => setSourceFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-bold transition-all border ${active ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                style={active ? { backgroundColor: color } : {}}
              >
                {chip.icon} {chip.label} ({counts[chip.id]})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search by title, peril, location, or key learning…"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-icici-maroon/30 focus:border-icici-maroon"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="icici-card p-6 text-center">
          <p className="text-sm text-gray-500">No case studies match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const meta = SOURCE_META[c.source];
            return (
              <div key={i} className="icici-card p-5 border-l-4" style={{ borderLeftColor: meta.color }}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-black text-white" style={{ backgroundColor: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">{c.category}</span>
                    </div>
                    <h4 className="text-xs font-black text-gray-800">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-icici-maroon hover:underline">{c.title} ↗</a>
                      ) : c.title}
                    </h4>
                    {c.location && <div className="text-[13px] text-gray-500 mt-0.5">📍 {c.location}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[13px] text-gray-500">📅 {c.date}</div>
                    <div className="text-[13px] font-black text-red-600">💰 {c.loss}</div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-[14px] text-gray-600 leading-relaxed mb-2">{c.summary}</p>

                {/* Lessons (if flagship) */}
                {c.lessons && c.lessons.length > 0 && (
                  <ul className="mb-2 space-y-0.5">
                    {c.lessons.map((l, j) => (
                      <li key={j} className="text-[13px] text-gray-700 flex items-start gap-1.5">
                        <span className="text-icici-maroon flex-shrink-0 mt-0.5">▸</span>{l}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Key learning */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-[13px] font-bold text-blue-800">🔑 Key Learning: </span>
                  <span className="text-[13px] text-blue-700">{c.keyLearning}</span>
                </div>

                {/* Benchmark (if present) */}
                {c.benchmark && (
                  <div className="mt-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                    <span className="text-[13px] font-bold text-green-800">📊 Industry Benchmark: </span>
                    <span className="text-[13px] text-green-700">{c.benchmark}</span>
                  </div>
                )}

                {c.url && (
                  <div className="mt-2 text-right">
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-icici-maroon hover:underline">Read Full Article →</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
