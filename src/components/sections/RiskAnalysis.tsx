import { useState } from 'react';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { useFilterStore } from '@/store/filterStore';
import { lookupImpactKnowledge, KnowledgeEntry } from '@/utils/impactKnowledge';
import { ManufacturingDashboard } from '@/components/sections/ManufacturingDashboard';

type RiskSource = 'coal' | 'wind' | 'solar' | 'nuclear' | 'hydro' | 'manufacturing';

// Power sources that use the tabular risk data below. Manufacturing is handled
// by a separate component (ManufacturingDashboard) and never indexes these
// records, so its key is intentionally excluded to avoid requiring empty data.
type PowerRiskSource = Exclude<RiskSource, 'manufacturing'>;

export function RiskAnalysis() {
  const { sectorView } = useSectorFilter();
  const powerSource = useFilterStore((s) => s.powerSource);

  // Default based on powerSource slicer
  const defaultSource: RiskSource = powerSource === 'nuclear' ? 'nuclear' : powerSource === 'hydro' ? 'hydro' : 'coal';
  const [activeSource, setActiveSource] = useState<RiskSource>(defaultSource);
  const [activeTab, setActiveTab] = useState<'insurable' | 'framework' | 'emerging-tech' | 'non-insurable' | 'best-practices'>('insurable');

  // Determine available sources based on sector view
  const sources: { id: RiskSource; label: string; icon: string; color: string }[] = [];
  if (sectorView === 'all' || sectorView === 'fossil') {
    sources.push({ id: 'coal', label: 'Coal / Thermal', icon: '🏭', color: '#B02A30' });
  }
  if (sectorView === 'all' || sectorView === 'non_fossil') {
    sources.push({ id: 'hydro', label: 'Hydro', icon: '💧', color: '#003D50' });
    sources.push({ id: 'wind', label: 'Wind', icon: '💨', color: '#005B75' });
    sources.push({ id: 'solar', label: 'Solar', icon: '☀️', color: '#F99D27' });
    sources.push({ id: 'nuclear', label: 'Nuclear', icon: '⚛️', color: '#7B1FA2' });
  }
  if (sectorView === 'fossil' && !sources.find(s => s.id === 'nuclear')) {
    if (powerSource === 'nuclear') {
      sources.push({ id: 'nuclear', label: 'Nuclear', icon: '⚛️', color: '#7B1FA2' });
    }
    if (powerSource === 'hydro') {
      sources.push({ id: 'hydro', label: 'Hydro', icon: '💧', color: '#003D50' });
    }
  }
  // Manufacturing always visible — separate risk category
  sources.push({ id: 'manufacturing', label: 'Manufacturing', icon: '🏭', color: '#E65100' });

  // Reset active source if not in current view
  if (!sources.find(s => s.id === activeSource) && sources.length > 0) {
    setActiveSource(sources[0].id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="icici-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">🛡️</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Risk Analysis — Power Sector</h2>
            <p className="text-[14px] text-gray-400">Insurable & Non-Insurable risks • Material Damage (AOG & Non-AOG) • Best Practices</p>
          </div>
        </div>

        {/* Source Selector */}
        <div className="flex gap-2 mb-4">
          {sources.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSource(s.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSource === s.id ? 'text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeSource === s.id ? { backgroundColor: s.color } : {}}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Visual Banner Image */}
        <div className="mb-4 rounded-xl overflow-hidden h-32 relative">
          {activeSource === 'coal' && <img src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=900&h=200&fit=crop" alt="Thermal Power Plant" className="w-full h-full object-cover" />}
          {activeSource === 'hydro' && <img src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&h=200&fit=crop" alt="Hydroelectric Dam" className="w-full h-full object-cover" />}
          {activeSource === 'wind' && <img src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=900&h=200&fit=crop" alt="Wind Turbines" className="w-full h-full object-cover" />}
          {activeSource === 'solar' && <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&h=200&fit=crop" alt="Solar Panels" className="w-full h-full object-cover" />}
          {activeSource === 'nuclear' && <img src="https://images.unsplash.com/photo-1626268168700-22cfdac12ef8?w=900&h=200&fit=crop" alt="Nuclear Power Plant" className="w-full h-full object-cover" />}
          {activeSource === 'manufacturing' && <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&h=200&fit=crop" alt="Manufacturing Plant" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
            <div>
              <p className="text-white text-sm font-black">
                {activeSource === 'coal' ? '🏭 Coal / Thermal Power Risk Profile' :
                 activeSource === 'hydro' ? '💧 Hydro Power Risk Profile' :
                 activeSource === 'wind' ? '💨 Wind Energy Risk Profile' :
                 activeSource === 'nuclear' ? '⚛️ Nuclear Power Risk Profile' :
                 activeSource === 'manufacturing' ? '🏭 Power Equipment Manufacturing Risk Profile' :
                 '☀️ Solar Energy Risk Profile'}
              </p>
              <p className="text-white/70 text-[14px] mt-1">
                {activeSource === 'coal'    ? 'Boilers, turbines, transformers — high value, long lead times' :
                 activeSource === 'hydro'   ? 'Turbines, penstocks, dams, spillways — flood/silt/seismic exposure' :
                 activeSource === 'wind'    ? 'Blades, gearboxes, towers — exposed to weather extremes' :
                 activeSource === 'nuclear' ? 'Reactor, turbine island, steam generators — single-operator, regulated' :
                 activeSource === 'manufacturing' ? 'Factory fire, product liability, supply chain, machinery breakdown — OEM/manufacturer risks' :
                 'Modules, inverters, trackers — hail & storm vulnerability'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector — hidden when manufacturing selected (has own tabs) */}
        {activeSource !== 'manufacturing' && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {[
            { id: 'insurable' as const, label: '🛡️ Insurable Risks' },
            { id: 'framework' as const, label: '📐 Risk Framework' },
            ...[{ id: 'emerging-tech' as const, label: '🔬 Emerging Tech' }],
            { id: 'non-insurable' as const, label: '⚠️ Non-Insurable' },
            { id: 'best-practices' as const, label: '✅ Best Practices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-icici-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Content */}
      {activeSource === 'manufacturing' ? (
        <ManufacturingDashboard mode="risk" />
      ) : (
        <>
          {activeTab === 'insurable' && <InsurableRisks source={activeSource} />}
          {activeTab === 'framework' && <RiskFramework source={activeSource as PowerRiskSource} />}
          {activeTab === 'emerging-tech' && <EmergingTechRisks source={activeSource as PowerRiskSource} />}
          {activeTab === 'non-insurable' && <NonInsurableRisks source={activeSource as PowerRiskSource} />}
          {activeTab === 'best-practices' && <BestPractices source={activeSource as PowerRiskSource} />}
        </>
      )}
    </div>
  );
}

function InsurableRisks({ source }: { source: RiskSource }) {
  if (source === 'coal') return <CoalInsurableRisks />;
  if (source === 'wind') return <WindInsurableRisks />;
  if (source === 'nuclear') return <NuclearInsurableRisks />;
  if (source === 'hydro') return <HydroInsurableRisks />;
  return <SolarInsurableRisks />;
}

function NuclearInsurableRisks() {
  return (
    <div className="space-y-4">
      {/* AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — Nuclear Turbine Island</h3>
        <p className="text-[14px] text-gray-400 mb-4">Natural catastrophes affecting the insurable (non-nuclear) portion of nuclear plants</p>
        <div className="space-y-3">
          <RiskCard
            title="Flood / Tsunami (Coastal Sites)"
            severity="high"
            description="Kudankulam (TN), MAPS Kalpakkam (TN) and TAPS Tarapur (MH) — all coastal. Flooding of turbine hall, switchyard and cooling water systems. Fukushima (2011) demonstrated catastrophic tsunami risk."
            impactAreas={['Turbine hall flooding', 'Seawater intake pump damage', 'Switchyard equipment submersion', 'Diesel generator failure (emergency backup loss)', 'Regulatory shutdown order']}
            typicalClaim="₹200–500 Cr (turbine island only) + multi-year BI"
          />
          <RiskCard
            title="Cyclone (Coastal Plants)"
            severity="high"
            description="KKNPP Kudankulam in Tirunelveli has experienced cyclone passes (Ockhi 2017, Mandous 2022). MAPS Kalpakkam similarly exposed. Cooling tower structures, transmission lines most vulnerable."
            impactAreas={['Cooling tower structural damage', 'Overhead transmission line failure', 'Turbine hall roof damage', 'Saltwater corrosion of external equipment', 'Access road damage delaying recovery']}
            typicalClaim="₹50–200 Cr (turbine island)"
          />
          <RiskCard
            title="Earthquake (Seismic Zones)"
            severity="medium"
            description="KAPS Kakrapar (Gujarat) and RAPS Rawatbhata (Rajasthan) in moderate seismic zones. KAIGA (Karnataka) near Western Ghats fault system. Nuclear plants are seismically designed to higher standards."
            impactAreas={['Foundation damage to turbine island', 'Piping displacement', 'Transformer/switchyard damage', 'Mandatory regulatory shutdown for inspection', 'Extended BI while regulator clears restart']}
            typicalClaim="₹100–300 Cr + 6–18 months BI"
          />
        </div>
      </div>

      {/* Non-AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-orange-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Turbine Island & Balance of Plant</h3>
        <p className="text-[14px] text-gray-400 mb-4">Operational failures in the commercially-insurable turbine island of nuclear plants</p>
        <div className="space-y-3">
          <RiskCard
            title="Steam Turbine / Generator Failure"
            severity="high"
            description="BHEL-supplied 220 MWe / 540 MWe / 700 MWe turbine-generators at all Indian nuclear plants. Blade failure, generator winding burnout, bearing seizure. Long BHEL lead time — only domestic supplier."
            impactAreas={['HP/LP turbine blade failure', 'Generator stator winding burnout', 'Main transformer failure', 'Bearing seizure / rotor damage', 'No foreign alternative — BHEL monopoly extends lead time']}
            typicalClaim="₹80–250 Cr (turbine island) + 12–18 months BI"
          />
          <RiskCard
            title="Main Transformer Failure"
            severity="high"
            description="Step-up transformer connecting generator to grid. Internal fault, winding failure, bushing failure. BHEL/Siemens-supplied. Long lead time (12–18 months). Single point of failure per unit."
            impactAreas={['Winding insulation breakdown', 'Bushing flashover', 'Oil fire/explosion', 'Grid disconnection forcing regulatory shutdown']}
            typicalClaim="₹30–80 Cr + 12–18 months BI"
          />
          <RiskCard
            title="Turbine Hall Fire"
            severity="medium"
            description="Hydrogen-cooled generators and lubricating oil systems create fire risk in turbine hall. NAPS-1 turbine hall fire (1993) demonstrates this risk. Regulated area but turbine hall is standard industrial territory."
            impactAreas={['Oil fire from bearing lubrication system', 'Hydrogen system leak + ignition', 'Control cable trays', 'Fire spreading to adjacent unit']}
            typicalClaim="₹50–200 Cr"
          />
          <RiskCard
            title="Steam Generator Tube Failure (PHWR)"
            severity="medium"
            description="Steam generator (SG) tube degradation from corrosion, stress corrosion cracking. Affects PHWR plants. SG replacement is a major outage — 6–12 months. Godrej & Boyce / BHEL supply replacement SGs."
            impactAreas={['Primary-to-secondary leakage', 'Forced outage for inspection', 'SG tube plugging (reduces capacity)', 'Full SG replacement (rare but high cost)']}
            typicalClaim="₹50–150 Cr + 6–12 months BI per unit"
          />
        </div>
      </div>

      {/* Nuclear Liability */}
      <div className="icici-card p-5 border-l-4 border-red-500">
        <h3 className="text-sm font-black text-gray-800 mb-1">⚠️ Nuclear Liability Framework (India)</h3>
        <p className="text-[14px] text-gray-400 mb-4">Special legal regime under Civil Liability for Nuclear Damage Act 2010 (CLNDA)</p>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <h4 className="text-xs font-bold text-purple-800 uppercase mb-2">CLNDA Structure</h4>
            <ul className="space-y-1.5 text-[12px] text-gray-700">
              <li><span className="font-bold">Operator Liability Cap:</span> ₹1,500 Crore (NPCIL)</li>
              <li><span className="font-bold">India's State Liability:</span> SDR 300 million (~₹3,400 Cr)</li>
              <li><span className="font-bold">Channelling:</span> Liability channelled exclusively to operator (NPCIL)</li>
              <li><span className="font-bold">Right of Recourse:</span> Operator can sue supplier if nuclear incident caused by equipment defect — deters foreign OEMs</li>
              <li><span className="font-bold">Indian Nuclear Insurance Pool (INIP):</span> Covers liability above operator limit</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">What Is / Isn't Commercially Insurable</h4>
            <ul className="space-y-1.5 text-[12px] text-gray-700">
              <li className="flex items-start gap-1"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Turbine island: steam turbines, generators, transformers, BOP</li>
              <li className="flex items-start gap-1"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Construction All Risk during civil/mechanical erection (pre-commissioning)</li>
              <li className="flex items-start gap-1"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Business Interruption for turbine island losses</li>
              <li className="flex items-start gap-1"><span className="text-red-600 font-bold flex-shrink-0">✗</span> Reactor island: reactor vessel, core, fuel — excluded by nuclear pools/specialist only</li>
              <li className="flex items-start gap-1"><span className="text-red-600 font-bold flex-shrink-0">✗</span> Radioactive contamination / decontamination (nuclear peril)</li>
              <li className="flex items-start gap-1"><span className="text-red-600 font-bold flex-shrink-0">✗</span> Third-party nuclear liability (separate INIP)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Business Interruption */}
      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📉 Business Interruption — Nuclear Plants</h3>
        <p className="text-[14px] text-gray-400 mb-4">Revenue loss following insured material damage to turbine island</p>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-[12px] text-gray-700">
          <p className="font-bold mb-2">Key Factors — More Complex Than Conventional Thermal:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Any material damage → mandatory AERB inspection before restart → minimum 3-6 months additional BI</li>
            <li>BHEL monopoly on TG sets — rotor lead time 18–24 months vs 12–18 months for conventional thermal</li>
            <li>Daily revenue per 220 MW unit: ₹1.5–2 Cr; per 1000 MW (KKNPP): ₹7–8 Cr</li>
            <li>Indemnity period recommendation: 36 months for KKNPP-class units; 24 months for PHWRs</li>
            <li>Regulatory shutdown trigger: even a non-nuclear event can trigger precautionary reactor shutdown</li>
            <li>Staffing continuity: NPCIL maintains on-site teams — no demobilisation risk</li>
            <li>Grid commitment: nuclear base-load PPAs — revenue impact more predictable than RE</li>
          </ul>
        </div>
      </div>

      {/* Case Studies */}
      <div className="icici-card p-5 border-l-4 border-amber-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📋 Notable Nuclear Incidents — India & Global</h3>
        <div className="space-y-3">
          {[
            {
              title: 'NAPS-1 Turbine Hall Fire — Narora, UP',
              date: 'March 1993',
              loss: '~₹30 Cr (1993 values) + 8 months offline',
              summary: 'Fire in turbine hall due to hydrogen leak from generator. Emergency cooling systems worked correctly preventing nuclear incident. Unit shut down 8 months for repairs. AERB initiated safety review of all PHWR turbine halls.',
              keyLearning: 'Turbine hall hydrogen fire is a real and insurable risk at nuclear plants. Demonstrates that turbine island and reactor island risks are separable.',
            },
            {
              title: 'KAPS-1 Heavy Water Leak — Kakrapar, Gujarat',
              date: 'March 1994',
              loss: '~₹20 Cr + regulatory delays',
              summary: 'Heavy water leak from primary coolant system. INES Level 3 (serious incident). Reactor shut down for months. Heavy water recovery and decontamination required. No off-site radiation release.',
              keyLearning: 'Primary circuit leaks trigger mandatory AERB investigation. Turbine island BI begins even though reactor island is the cause — cross-impact of reactor on insurable turbine island.',
            },
            {
              title: 'Fukushima Daiichi — Japan (Global Benchmark)',
              date: 'March 2011',
              loss: 'USD 200B+ (total economic loss)',
              summary: 'Tsunami (15m) overwhelmed seawall designed for 5.7m. Diesel generators flooded. Station blackout for 3 reactors → core melt. Demonstrates coastal nuclear vulnerability and the cascade from AOG → nuclear peril.',
              keyLearning: 'Coastal Indian nuclear plants (Kudankulam, MAPS) reviewed post-Fukushima. All Indian plants required to install passive heat removal and higher tsunami walls. Insurance boundary: physical tsunami damage (insurable) vs radioactive contamination (nuclear pool/government).',
            },
          ].map((c, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 className="text-xs font-bold text-gray-800">{c.title}</h4>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-500">📅 {c.date}</span>
                  <span className="font-bold text-red-600">💰 {c.loss}</span>
                </div>
              </div>
              <p className="text-[12px] text-gray-600 mb-2">{c.summary}</p>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-[12px] font-bold text-blue-800">🔑 Key Learning: </span>
                <span className="text-[12px] text-blue-700">{c.keyLearning}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HydroInsurableRisks() {
  return (
    <div className="space-y-4">
      {/* AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-blue-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — Hydroelectric Plants</h3>
        <p className="text-[14px] text-gray-400 mb-4">Natural catastrophes causing physical damage to dams, powerhouses, and civil works</p>
        <div className="space-y-3">
          <RiskCard
            title="Flood / Glacial Lake Outburst Flood (GLOF)"
            severity="high"
            description="Himalayan hydro projects face extreme flood risk — Chenab/Beas/Satluj catchments. Flash floods from cloudbursts. GLOF events (Chamoli 2021) can destroy entire installations. Silt-laden flood water damages turbine runners."
            impactAreas={['Powerhouse inundation', 'Penstock/intake structure damage', 'Turbine runner erosion from silt', 'Dam spillway overwhelm', 'Access road destruction', 'Desilting chamber collapse']}
            typicalClaim="₹100–1,000 Cr per event"
          />
          <RiskCard
            title="Landslide / Rockfall"
            severity="high"
            description="Himalayan terrain is geologically active. Landslides block rivers (forming dammed lakes), damage headrace tunnels, bury powerhouses. Particularly affects run-of-river projects with long headrace tunnels."
            impactAreas={['Headrace tunnel collapse', 'Powerhouse burial', 'Surge shaft damage', 'Diversion tunnel blockage', 'Reservoir sedimentation (sudden)']}
            typicalClaim="₹50–500 Cr + 12–36 months BI"
          />
          <RiskCard
            title="Earthquake (Seismic Zone IV/V)"
            severity="high"
            description="Most Himalayan hydro projects are in Seismic Zone IV/V. Dam safety is paramount — concrete/RCC dams designed to resist MCE. Embankment dams (rare in India) more vulnerable. Aftershock-induced landslides compound damage."
            impactAreas={['Dam body cracking', 'Foundation displacement', 'Penstock rupture', 'Turbine bearing misalignment', 'Tunnel lining failure', 'Spillway gate mechanism damage']}
            typicalClaim="₹200–2,000 Cr (dam damage scenario)"
          />
          <RiskCard
            title="Cloudburst / Extreme Rainfall"
            severity="medium"
            description="Uttarakhand/HP/J&K projects experience extreme precipitation events. Kedarnath 2013 demonstrated catastrophic potential. Overwhelms dam flood-handling capacity, erodes foundations."
            impactAreas={['Spillway capacity exceedance', 'Erosion of dam toe/apron', 'Flood gate mechanism failure', 'Upstream debris reaching intake', 'Bridge/road access loss']}
            typicalClaim="₹50–300 Cr"
          />
        </div>
      </div>

      {/* Non-AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-orange-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Operational/mechanical failures in hydro plant equipment</p>
        <div className="space-y-3">
          <RiskCard
            title="Turbine Runner Erosion / Failure"
            severity="high"
            description="Himalayan rivers carry heavy silt (2000–10000 ppm during monsoon). Abrasive silt erodes Francis/Pelton runners within 2–5 years. Runner replacement is a major overhaul — BHEL/Andritz lead time 12–18 months."
            impactAreas={['Runner blade erosion (cavitation + silt)', 'Guide vane wear', 'Labyrinth seal damage', 'Shaft vibration from imbalanced runner', 'Entire runner replacement']}
            typicalClaim="₹20–80 Cr per unit (runner replacement + BI)"
          />
          <RiskCard
            title="Generator Failure"
            severity="high"
            description="Generator stator/rotor failure. Winding insulation breakdown from moisture ingress (underground powerhouses are humid). Bearing failure. BHEL-supplied generators at most NHPC/SJVN plants."
            impactAreas={['Stator winding burnout', 'Rotor pole damage', 'Thrust bearing failure', 'Excitation system fault', 'Generator transformer failure']}
            typicalClaim="₹30–100 Cr + 12–18 months BI"
          />
          <RiskCard
            title="Penstock Rupture"
            severity="medium"
            description="High-pressure penstock (50–500m head) failure — weld defect, corrosion, fatigue cracking, overhydrostatic event. Catastrophic water release. Affects downstream powerhouse."
            impactAreas={['Penstock burst at weld joint', 'Expansion joint failure', 'Anchor block displacement', 'Water hammer damage', 'Downstream flooding of powerhouse']}
            typicalClaim="₹30–150 Cr"
          />
          <RiskCard
            title="Spillway Gate Failure"
            severity="medium"
            description="Radial/crest gates stuck open or closed. Gear mechanism failure, wire rope snap, hydraulic system leak. Dam safety critical — regulatory shutdown until repaired."
            impactAreas={['Gate hoist mechanism failure', 'Wire rope/chain snap', 'Gate body corrosion/jamming', 'Hydraulic actuator failure', 'Uncontrolled reservoir drawdown']}
            typicalClaim="₹10–50 Cr + regulatory shutdown"
          />
          <RiskCard
            title="Tunnel Collapse / Lining Failure"
            severity="medium"
            description="Long headrace tunnels (5–30 km) in Himalayan geology face rock burst, lining collapse, seepage. Tunnel boring through fault zones is high-risk during construction and operation."
            impactAreas={['Rock burst in tunnel', 'Concrete lining collapse', 'Excessive seepage/leakage', 'Steel liner buckling', 'Desilting chamber structural failure']}
            typicalClaim="₹50–200 Cr + 6–24 months repair"
          />
        </div>
      </div>

      {/* Business Interruption */}
      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📉 Business Interruption — Hydro Plants</h3>
        <p className="text-[14px] text-gray-400 mb-4">Revenue loss following insured damage</p>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-[12px] text-gray-700">
          <p className="font-bold mb-2">Key Factors — Hydro BI is Seasonal:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Hydro generation is monsoon-dependent — damage before/during monsoon loses peak revenue</li>
            <li>Runner replacement: 12–18 months (BHEL/Andritz fabrication + transport to remote site)</li>
            <li>Access roads in Himalayas: damaged in monsoon → repair window only Oct–May</li>
            <li>Daily revenue: ₹1.5–3 Cr per 250 MW unit (at 40% CUF)</li>
            <li>Indemnity period: 24–36 months recommended for Himalayan projects</li>
            <li>Seasonal loss amplification: if unit lost during Jun–Sep, lose 60% of annual generation</li>
            <li>Spillage loss: water spilled during outage cannot be recovered (unlike stored fuel)</li>
          </ul>
        </div>
      </div>

      {/* Hydro-specific insurance note */}
      <div className="icici-card p-5 border-l-4 border-blue-500">
        <h3 className="text-sm font-black text-gray-800 mb-1">🏗️ Dam Safety & Regulatory Framework</h3>
        <p className="text-[14px] text-gray-400 mb-4">Dam Safety Act 2021 — new regulatory requirements</p>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Dam Safety Act 2021</h4>
            <ul className="space-y-1.5 text-[12px] text-gray-700">
              <li>• National Dam Safety Authority (NDSA) — oversight of all large dams</li>
              <li>• Mandatory Emergency Action Plans (EAP) for all large dams</li>
              <li>• Periodic safety inspections mandated — every 5 years</li>
              <li>• Dam break analysis required for all storage dams</li>
              <li>• Instrumentation and monitoring requirements strengthened</li>
              <li>• Penalties for non-compliance — criminal liability for dam owner/operator</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Insurance Implications</h4>
            <ul className="space-y-1.5 text-[12px] text-gray-700">
              <li>• Dam failure/overtopping: typically excluded from standard PAR (catastrophic flood peril)</li>
              <li>• Turbine island + powerhouse: insurable under PAR/MB/BI</li>
              <li>• Silt abrasion: standard maintenance vs insurable peril debate — wording critical</li>
              <li>• Civil works (tunnel, penstock, dam body): CAR during construction, limited cover in operation</li>
              <li>• Third-party liability: dam breach downstream damage — separate liability cover required</li>
              <li>• CWC (Central Water Commission) reports critical for underwriting assessment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskFramework({ source }: { source: PowerRiskSource }) {
  const sourceLabel = source === 'coal' ? 'Coal/Thermal' : source === 'wind' ? 'Wind' : source === 'nuclear' ? 'Nuclear' : source === 'hydro' ? 'Hydro' : 'Solar';

  // Probability-Impact Matrix Data per source
  const riskMatrix: Record<PowerRiskSource, { risk: string; prob: string; impact: string; score: string; emv: string; strategy: string; strategyUrl: string; strategyTooltip: string; owner: string; trigger: string }[]> = {
    coal: [
      { risk: 'Boiler Tube Failure', prob: 'High (70%)', impact: 'High', score: '9/9', emv: '₹84 Cr', strategy: 'Mitigate', strategyUrl: 'https://www.power-eng.com/coal/boiler-tube-failure-root-cause-analysis/', strategyTooltip: 'Regular ultrasonic tube thickness mapping + condition-based replacement of eroded sections before failure occurs. Reduces tube burst frequency by 60%.', owner: 'Plant Head', trigger: 'Tube wall thickness < 3mm' },
      { risk: 'Turbine Blade Failure', prob: 'Low (15%)', impact: 'Critical', score: '5/9', emv: '₹52 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.fmglobal.com/research-and-resources/research-and-testing/research-technical-reports', strategyTooltip: 'Transfer residual risk to insurer via Machinery Breakdown + BI cover. Ensure sum insured covers full rotor replacement cost + 18 months lost revenue.', owner: 'CRO', trigger: 'Vibration exceeds 4mm/s' },
      { risk: 'Cyclone / Flood (Coastal)', prob: 'Medium (30%)', impact: 'High', score: '6/9', emv: '₹75 Cr', strategy: 'Mitigate + Transfer', strategyUrl: 'https://mausam.imd.gov.in/imd_latest/contents/cyclone.php', strategyTooltip: 'Install flood protection barriers + elevate critical equipment. Transfer residual exposure via Property All Risk policy with adequate flood sublimit.', owner: 'O&M Head', trigger: 'IMD cyclone warning' },
      { risk: 'Transformer Explosion', prob: 'Medium (25%)', impact: 'High', score: '6/9', emv: '₹20 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://electrical-engineering-portal.com/dissolved-gas-analysis-dga-of-transformer-oil', strategyTooltip: 'DGA (Dissolved Gas Analysis) — monthly oil sampling detects incipient faults by measuring gases like hydrogen & acetylene. Predicts 90% of failures 6-12 months in advance.', owner: 'Electrical Head', trigger: 'DGA values exceeding norms' },
      { risk: 'Coal Mill Fire', prob: 'High (50%)', impact: 'Medium', score: '6/9', emv: '₹15 Cr', strategy: 'Mitigate', strategyUrl: 'https://www.power-eng.com/coal/preventing-coal-fires-in-power-plants/', strategyTooltip: 'Install CO monitoring in coal mills + maintain mill outlet temperature below 90°C. Inert gas suppression system for early-stage fire containment.', owner: 'Fuel Mgmt', trigger: 'Mill outlet temp > 90°C' },
      { risk: 'Regulatory (Emission Norms)', prob: 'High (80%)', impact: 'Medium', score: '6/9', emv: '₹200 Cr (FGD capex)', strategy: 'Acceptance', strategyUrl: 'https://cpcb.nic.in/', strategyTooltip: 'FGD (Flue Gas Desulphurization) installation mandated by CPCB. Budget ₹200 Cr capex per unit. Accept regulatory timeline risk and plan compliance schedule.', owner: 'CEO/Board', trigger: 'CPCB compliance deadline' },
    ],
    wind: [
      { risk: 'Cyclone Blade Damage', prob: 'Medium (25%)', impact: 'Critical', score: '7/9', emv: '₹45 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.gcube-insurance.com/news/insights/', strategyTooltip: 'Property All Risk policy with named storm sublimit. Ensure adequate reinstatement cover for multiple WTG losses in single cyclone event. GCube specialist wind cover recommended.', owner: 'Asset Manager', trigger: 'IMD wind warning > 120 kmph' },
      { risk: 'Lightning Strike', prob: 'High (60%)', impact: 'Medium', score: '6/9', emv: '₹8 Cr', strategy: 'Mitigate (LPS upgrade)', strategyUrl: 'https://www.windpowerengineering.com/lightning-protection-for-wind-turbines-a-complete-guide/', strategyTooltip: 'LPS (Lightning Protection System) upgrade — install enhanced blade tip receptors + down-conductors that safely channel lightning current to ground. Reduces blade damage claims by 70%.', owner: 'O&M Head', trigger: 'Monsoon onset / thunderstorm alert' },
      { risk: 'Gearbox Failure', prob: 'Medium (35%)', impact: 'High', score: '6/9', emv: '₹12 Cr', strategy: 'Mitigate + Transfer', strategyUrl: 'https://www.nrel.gov/wind/gearbox-reliability.html', strategyTooltip: 'Monthly oil particle analysis to detect bearing wear early. Transfer residual risk via Machinery Breakdown cover with agreed gearbox replacement methodology.', owner: 'Technical Head', trigger: 'Oil particle count > threshold' },
      { risk: 'Blade Fatigue/Erosion', prob: 'High (50%)', impact: 'Medium', score: '6/9', emv: '₹6 Cr', strategy: 'Mitigate (LEP coatings)', strategyUrl: 'https://www.compositesworld.com/articles/leading-edge-protection-for-wind-turbine-blades', strategyTooltip: 'LEP (Leading Edge Protection) — apply erosion-resistant coatings/tapes to blade tips. Prevents rain/sand erosion that leads to structural delamination. Extends blade life by 5-8 years.', owner: 'O&M Head', trigger: 'Blade inspection report findings' },
      { risk: 'Crane Unavailability (BI)', prob: 'High (70%)', impact: 'High', score: '9/9', emv: '₹18 Cr', strategy: 'Mitigate (pre-booking)', strategyUrl: 'https://www.windpowermonthly.com/article/1525419/crane-logistics-key-reducing-downtime', strategyTooltip: 'Pre-book crane through annual retainer agreement. In India, large cranes (500T+) have 3-6 month wait. Pre-booking reduces BI claim duration by 50%.', owner: 'Procurement', trigger: 'Any major component failure' },
      { risk: 'Grid Curtailment', prob: 'Medium (40%)', impact: 'Medium', score: '4/9', emv: '₹5 Cr/yr', strategy: 'Acceptance', strategyUrl: 'https://posoco.in/reports/monthly-reports/', strategyTooltip: 'Grid curtailment is a regulatory/commercial risk not covered by insurance. Accept with contingency budget. Monitor POSOCO/SLDC dispatch orders for pattern analysis.', owner: 'Commercial', trigger: 'SLDC curtailment order' },
    ],
    solar: [
      { risk: 'Hailstorm Module Damage', prob: 'Medium (30%)', impact: 'Critical', score: '7/9', emv: '₹60 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.pv-magazine.com/2025/12/22/building-resilience-amid-intensifying-weather-events/', strategyTooltip: 'Transfer via Property All Risk with adequate hail sublimit. Consider parametric hail cover (Swiss Re model) triggered by radar data for faster payout within 72 hours.', owner: 'Asset Manager', trigger: 'IMD hail warning / radar alert' },
      { risk: 'Cyclone/Windstorm', prob: 'Medium (25%)', impact: 'High', score: '6/9', emv: '₹35 Cr', strategy: 'Mitigate (stow) + Transfer', strategyUrl: 'https://www.solarpowerworldonline.com/2023/06/how-solar-trackers-protect-against-high-winds/', strategyTooltip: 'Auto-stow system rotates tracker modules to face ground during storm warnings. Reduces cyclone damage by 40%. Requires redundant communication + manual override capability.', owner: 'O&M Head', trigger: 'Wind speed > 100 kmph forecast' },
      { risk: 'Inverter Failure', prob: 'High (45%)', impact: 'Medium', score: '6/9', emv: '₹8 Cr', strategy: 'Mitigate (redundancy)', strategyUrl: 'https://www.solarpowerworldonline.com/2022/09/string-inverters-vs-central-inverters/', strategyTooltip: 'Use string inverters instead of single central inverter — distributes failure risk. If one string inverter fails, only 100kW affected vs 1-4 MW for central inverter failure.', owner: 'Electrical Head', trigger: 'Inverter efficiency drop > 2%' },
      { risk: 'DC Arc Flash / Fire', prob: 'Low (15%)', impact: 'High', score: '4/9', emv: '₹12 Cr', strategy: 'Mitigate (IR scanning)', strategyUrl: 'https://www.solarpowerworldonline.com/2021/07/prevent-arc-flash-fires-at-solar-installations/', strategyTooltip: 'Annual infrared thermography scanning of all DC connectors and junction boxes. Detects hot spots (resistance anomalies) before they escalate to arc flash fires.', owner: 'O&M Head', trigger: 'Thermal scan hotspot > 20°C delta' },
      { risk: 'Module Supply (BCD/ALMM)', prob: 'Medium (40%)', impact: 'Medium', score: '4/9', emv: '₹10 Cr (schedule delay)', strategy: 'Avoidance (domestic sourcing)', strategyUrl: 'https://mnre.gov.in/en/physical-progress/', strategyTooltip: 'Avoid import dependency by sourcing ALMM-listed domestic modules. Eliminates 40% BCD cost and 2-month import delay that extends BI claims.', owner: 'Procurement', trigger: 'Policy gazette notification' },
      { risk: 'DISCOM Payment Delay', prob: 'High (60%)', impact: 'Medium', score: '6/9', emv: '₹25 Cr (working capital)', strategy: 'Acceptance + Hedge', strategyUrl: 'https://www.praapti.in/', strategyTooltip: 'DISCOM payment delays (60-180 days common) are a commercial risk. Accept with working capital buffer. Monitor via PRAAPTI portal. Consider payment security mechanisms (LC/escrow) in PPA.', owner: 'CFO', trigger: 'Payment > 90 days overdue' },
    ],
    nuclear: [
      { risk: 'Steam Turbine Blade Failure', prob: 'Low (10%)', impact: 'Critical', score: '5/9', emv: '₹90 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.iaea.org/publications/nuclear-power-plant-operating-experience', strategyTooltip: 'BHEL-supplied nuclear TG sets have 18–24 month rotor replacement lead time vs 12–18 for conventional thermal. Insure turbine island under Machinery Breakdown + BI. Indemnity period: 36 months minimum for KKNPP-class 1000 MW units.', owner: 'CRO / NPCIL', trigger: 'Vibration > 4mm/s or blade inspection findings' },
      { risk: 'Main Transformer Failure', prob: 'Medium (20%)', impact: 'High', score: '6/9', emv: '₹40 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.iaea.org/topics/nuclear-power-plant-life-management', strategyTooltip: 'Step-up transformer is insurable under PAR + MB. DGA monitoring monthly. Pre-agreed replacement methodology with BHEL/Siemens essential to control lead time.', owner: 'Electrical Head', trigger: 'DGA hydrogen/acetylene rise' },
      { risk: 'Coastal Flood / Tsunami', prob: 'Low (5%)', impact: 'Critical', score: '4/9', emv: '₹200 Cr', strategy: 'Mitigate + Transfer', strategyUrl: 'https://www.aerb.gov.in/english/siting-and-safety/operational-safety', strategyTooltip: 'Post-Fukushima: AERB mandated passive cooling systems and higher flood protection walls at all coastal Indian nuclear plants. Insure turbine island AOG perils. Reactor island nuclear peril — separate nuclear pool/government coverage.', owner: 'AERB / Plant Head', trigger: 'IMD tsunami/cyclone warning' },
      { risk: 'AERB-Mandated Shutdown (Non-nuclear trigger)', prob: 'Medium (30%)', impact: 'High', score: '6/9', emv: '₹45 Cr (BI)', strategy: 'Transfer (BI)', strategyUrl: 'https://www.aerb.gov.in/english/regulatory-framework', strategyTooltip: 'Any material damage incident (including turbine island) triggers AERB investigation and may lead to precautionary reactor shutdown. BI cover must include regulatory-delay extension clause. This is the single most important nuclear-specific BI provision.', owner: 'CRO / NPCIL', trigger: 'Any reportable event per AERB guidelines' },
      { risk: 'Heavy Water Leak (PHWR)', prob: 'Low (8%)', impact: 'Medium', score: '3/9', emv: '₹25 Cr', strategy: 'Mitigate + Accept', strategyUrl: 'https://www.npcil.nic.in/content/441_1_SafetyRecords.aspx', strategyTooltip: 'Heavy water is recovered and re-used — no financial write-off. Risk is the downtime during recovery + AERB investigation. Accept residual risk with working capital. Heavy water inventory kept on-site.', owner: 'O&M Head', trigger: 'HWS tritium monitors' },
      { risk: 'Fuel Supply Disruption (VVER)', prob: 'Low (5%)', impact: 'High', score: '3/9', emv: '₹30 Cr', strategy: 'Acceptance', strategyUrl: 'https://www.dae.gov.in/', strategyTooltip: 'Kudankulam VVER fuel (TVEL, Russia) has 18-month strategic reserve at site. India-Russia nuclear agreement provides supply security. Sanctions scenario: 18-month buffer + India exploring alternative fuel suppliers (France, USA). Uninsurable commercial risk.', owner: 'DAE / NPCIL', trigger: 'Geopolitical event affecting Russia supply' },
    ],
    hydro: [
      { risk: 'Flash Flood / GLOF', prob: 'Medium (25%)', impact: 'Critical', score: '7/9', emv: '₹200 Cr', strategy: 'Mitigate + Transfer', strategyUrl: 'https://cwc.gov.in/', strategyTooltip: 'Real-time flood monitoring via CWC/FMIS. Early warning systems (2-hour lead time for Himalayan projects). Insure turbine island and powerhouse under PAR. Dam body damage typically excluded.', owner: 'Dam Safety Officer', trigger: 'CWC extreme flood alert' },
      { risk: 'Turbine Runner Erosion (Silt)', prob: 'High (70%)', impact: 'Medium', score: '6/9', emv: '₹35 Cr', strategy: 'Mitigate (coatings + desilting)', strategyUrl: 'https://www.andritz.com/hydro-en', strategyTooltip: 'HVOF (High Velocity Oxygen Fuel) hard-face coatings on runner blades extend life by 3–5 years. Desilting chambers upstream reduce silt load to <2000 ppm. Insurance covers sudden failure, not gradual wear.', owner: 'O&M Head', trigger: 'Silt concentration > 5000 ppm' },
      { risk: 'Landslide / Rockfall', prob: 'Medium (30%)', impact: 'High', score: '6/9', emv: '₹100 Cr', strategy: 'Mitigate + Transfer', strategyUrl: 'https://www.gsi.gov.in/', strategyTooltip: 'GSI landslide hazard mapping for all Himalayan hydro sites. Slope monitoring instrumentation (inclinometers, piezometers). Insurance covers damage from landslide to insured property.', owner: 'Civil Head', trigger: 'Slope movement sensors / rainfall >200mm/day' },
      { risk: 'Generator Winding Failure', prob: 'Low (15%)', impact: 'High', score: '4/9', emv: '₹50 Cr', strategy: 'Transfer (Insurance)', strategyUrl: 'https://www.bhel.com/', strategyTooltip: 'BHEL hydro generators at most NHPC/SJVN plants. Insure under Machinery Breakdown. Moisture management critical in underground powerhouses — dehumidification systems required.', owner: 'Electrical Head', trigger: 'Winding insulation resistance drop' },
      { risk: 'Penstock Rupture', prob: 'Low (10%)', impact: 'Critical', score: '5/9', emv: '₹80 Cr', strategy: 'Mitigate (NDT) + Transfer', strategyUrl: 'https://www.nhpc.nic.in/', strategyTooltip: 'Non-destructive testing (ultrasonic + radiographic) of penstock welds every 3 years. Thickness mapping. Insurance covers sudden penstock failure — gradual corrosion excluded.', owner: 'Mechanical Head', trigger: 'Wall thickness below minimum / weld defect detected' },
      { risk: 'Spillway Gate Failure', prob: 'Low (10%)', impact: 'High', score: '4/9', emv: '₹25 Cr', strategy: 'Mitigate (maintenance)', strategyUrl: 'https://damsafety.in/', strategyTooltip: 'Annual gate testing protocol mandated under Dam Safety Act 2021. Pre-monsoon dry run of all gates. Insurance covers sudden mechanical failure — not gradual corrosion.', owner: 'Dam Safety Officer', trigger: 'Annual pre-monsoon gate test failure' },
    ],
  };

  // Case studies per source
  const caseStudies: Record<PowerRiskSource, { title: string; location: string; date: string; loss: string; rootCause: string; impact: string; lessons: string[]; benchmark: string }> = {
    coal: {
      title: 'NTPC Unchahar Unit-6 Boiler Explosion',
      location: 'Unchahar, Uttar Pradesh',
      date: 'November 2017',
      loss: '₹150+ Cr (MD + BI combined)',
      rootCause: 'High-pressure steam line rupture due to tube erosion. Accumulated ash deposits caused localized overheating beyond design limits.',
      impact: '500 MW unit offline for 8 months. 26 fatalities. Regulatory scrutiny triggered industry-wide boiler inspection mandate.',
      lessons: [
        'Condition-based maintenance (CBM) with regular tube thickness mapping is critical',
        'Ash blower maintenance schedule directly correlates with tube life',
        'BI indemnity period of 12 months proved adequate for this loss',
        'Pre-agreed repair methodology with OEM (BHEL) accelerated restoration',
      ],
      benchmark: 'Post-event, NTPC invested ₹2,400 Cr in fleet-wide boiler health monitoring systems. Industry benchmark: FM Global recommends annual tube thickness surveys for units > 15 years old.',
    },
    wind: {
      title: 'Cyclone Tauktae — Gujarat Wind Farm Portfolio Damage',
      location: 'Kutch & Jamnagar, Gujarat',
      date: 'May 2021',
      loss: '₹180 Cr (across multiple developers)',
      rootCause: 'Extremely severe cyclonic storm with sustained winds of 185 kmph — beyond design wind speed (Class IIA: 52 m/s) for most installed turbines.',
      impact: '78 WTGs damaged (blade failures, tower buckling, nacelle rotation). 450 MW offline for 4–12 months. Crane mobilization delayed due to damaged access roads.',
      lessons: [
        'Coastal Gujarat sites need Class IA turbines (designed for 70 m/s)',
        'Crane pre-booking contracts essential — 6-month wait post-event',
        'Portfolio-level insurance with named storm sublimits required adequate reinstatement',
        'Blade inventory at regional depots reduced restoration time by 2 months for prepared operators',
      ],
      benchmark: 'GCube (specialist wind insurer) reported 2021 as the costliest cyclone year for Indian wind, with industry losses exceeding ₹500 Cr. Global benchmark: IEC 61400-1 Class IA design standard now recommended for all Indian coastal sites.',
    },
    solar: {
      title: 'Rajasthan Hailstorm — Bhadla/Fatehgarh Solar Parks',
      location: 'Jaisalmer & Jodhpur, Rajasthan',
      date: 'March 2023',
      loss: '₹350+ Cr (multi-developer, 600+ MW affected)',
      rootCause: 'Unusually large hailstones (40–60 mm diameter) with wind-driven impact. Modules shattered despite meeting IEC 61215 hail test (25 mm at 23 m/s).',
      impact: '600+ MW capacity damaged across 5 developers. 30–80% module replacement needed per site. Module supply constrained due to BCD import restrictions. Full restoration took 6–9 months.',
      lessons: [
        'IEC hail test (25 mm) is inadequate for Indian conditions — need 40 mm+ qualification',
        'Tracker auto-stow systems reduced damage by 40% where deployed (modules face ground during storm)',
        'BCD made module replacement 40% costlier and 2 months slower than pre-BCD era',
        'Electroluminescence (EL) imaging essential to detect hidden micro-cracks post-hail (visual inspection misses 30% of damage)',
      ],
      benchmark: 'Munich Re classified Indian solar hail as an emerging "secondary peril" in their 2024 NatCat report. Industry benchmark: Swiss Re now offers parametric hail covers triggered by radar data, paying within 72 hours of event confirmation.',
    },
    nuclear: {
      title: 'NAPS-1 Turbine Hall Fire — Narora, India',
      location: 'Narora, Uttar Pradesh',
      date: 'March 1993',
      loss: '~₹30 Cr (1993 values) + 8 months BI',
      rootCause: 'Hydrogen leak from generator seal system ignited in turbine hall. Fire spread through lubricant oil on turbine floor. Turbine hall extensively damaged. Secondary cables to control room severed — briefly lost instrumentation.',
      impact: 'Unit-1 offline for ~2 years (repair + AERB-mandated review). Significant reputational impact on India\'s nuclear programme. Safety systems functioned correctly — reactor shut down safely without core damage.',
      lessons: [
        'Turbine hall hydrogen fire is the primary insurable peril at nuclear plants — identical to conventional thermal',
        'Turbine island damage is commercially insurable even at nuclear sites (reactor island excluded)',
        'Post-event, NPCIL retrofitted all PHWR turbine halls with enhanced fire detection and CO₂ suppression',
        'AERB mandated physical separation between turbine hall and control room cable routes at all plants',
        'BI indemnity period must account for AERB investigation + mandatory restart approval — minimum 24 months',
      ],
      benchmark: 'Post-Narora and post-Fukushima, AERB nuclear safety standards are among the most stringent globally. NPCIL fleet has operated >600 reactor-years since 1993 without any INES ≥3 event. Kaiga-1 holds world record for continuous nuclear operation (962 days).',
    },
    hydro: {
      title: 'Chamoli Disaster — Tapovan Vishnugad Hydro Project',
      location: 'Chamoli, Uttarakhand',
      date: 'February 2021',
      loss: '₹1,500+ Cr (total destruction) + 200+ fatalities',
      rootCause: 'Glacial collapse on Nanda Devi triggered a massive debris-laden flood down the Rishiganga/Dhauliganga valleys. The NTPC Tapovan Vishnugad project (520 MW) was in final stages of construction when the flood hit.',
      impact: 'Headrace tunnel flooded with debris to 2+ km depth. Workers trapped. Civil works extensively damaged. Project delayed 2+ years for restoration. 13.2 MW Rishiganga plant completely destroyed.',
      lessons: [
        'GLOF/glacial collapse is an emerging peril for Himalayan hydro — not historically modelled in insurance pricing',
        'Underground powerhouse survived (below flood level), but headrace tunnel was completely silted — demonstrated vulnerability of long tunnels',
        'CAR (Construction All Risk) policies paid for the damage — but BI during 2-year reconstruction was the largest component',
        'Remote location meant debris removal alone took 6 months — access road was destroyed in the same event',
        'Indian govt reviewed all Himalayan hydro projects post-event for GLOF vulnerability assessment',
      ],
      benchmark: 'Post-Chamoli, CWC/GSI now mandate glacial lake monitoring for all hydro projects within 50 km of glacial systems. Insurance industry re-priced Himalayan hydro risk. Munich Re flagged climate-driven glacial instability as emerging secondary peril for Indian hydro.',
    },
  };

  const matrix = riskMatrix[source];
  const cs = caseStudies[source];

  return (
    <div className="space-y-5">
      {/* Framework Header */}
      <div className="icici-card p-5 border-l-4 border-icici-navy">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">📐</span>
          <div>
            <h3 className="text-sm font-black text-gray-800">Risk Assessment Framework — ISO 31000 Aligned</h3>
            <p className="text-[14px] text-gray-400">Systematic identification, analysis, evaluation & treatment of risks • {sourceLabel}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[14px]">
          {['Identify', 'Analyze', 'Evaluate', 'Treat', 'Monitor'].map((step, i) => (
            <div key={step} className="p-2 rounded-lg bg-icici-navy/5 border border-icici-navy/20">
              <div className="font-black text-icici-navy">{i + 1}. {step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Probability-Impact Matrix */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">Probability × Impact Matrix — {sourceLabel}</h3>
        <p className="text-[14px] text-gray-400 mb-4">Quantitative assessment with Expected Monetary Value (EMV) = Probability × Financial Impact</p>

        {/* Visual 3x3 Matrix */}
        <div className="mb-4 grid grid-cols-4 gap-0 text-[14px] font-bold text-center" style={{ width: '280px' }}>
          <div className="p-1" />
          <div className="p-2 bg-green-50 border border-green-200 rounded-tl">Low Impact</div>
          <div className="p-2 bg-amber-50 border border-amber-200">Med Impact</div>
          <div className="p-2 bg-red-50 border border-red-200 rounded-tr">High Impact</div>
          <div className="p-2 bg-red-50 border border-red-200 rounded-tl text-red-700">High Prob</div>
          <div className="p-2 bg-amber-100 border border-amber-200">3</div>
          <div className="p-2 bg-orange-100 border border-orange-200">6</div>
          <div className="p-2 bg-red-200 border border-red-300 text-red-800">9</div>
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700">Med Prob</div>
          <div className="p-2 bg-green-100 border border-green-200">2</div>
          <div className="p-2 bg-amber-100 border border-amber-200">4</div>
          <div className="p-2 bg-orange-100 border border-orange-200">6</div>
          <div className="p-2 bg-green-50 border border-green-200 rounded-bl text-green-700">Low Prob</div>
          <div className="p-2 bg-green-50 border border-green-200">1</div>
          <div className="p-2 bg-green-100 border border-green-200">2</div>
          <div className="p-2 bg-amber-100 border border-amber-200 rounded-br">3</div>
        </div>

        {/* Risk Register Table */}
        <div className="">
          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left p-2 font-bold text-gray-600">Risk Event</th>
                <th className="text-center p-2 font-bold text-gray-600">Probability</th>
                <th className="text-center p-2 font-bold text-gray-600">Impact</th>
                <th className="text-center p-2 font-bold text-gray-600">Score</th>
                <th className="text-center p-2 font-bold text-gray-600">EMV</th>
                <th className="text-center p-2 font-bold text-gray-600">Strategy</th>
                <th className="text-left p-2 font-bold text-gray-600">Owner</th>
                <th className="text-left p-2 font-bold text-gray-600">Trigger Event</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2 font-bold text-gray-800">{r.risk}</td>
                  <td className="p-2 text-center relative group/prob"><span className={`px-1.5 py-0.5 rounded text-[14px] font-bold cursor-help ${r.prob.includes('High') ? 'bg-red-100 text-red-700' : r.prob.includes('Medium') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{r.prob}</span><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover/prob:opacity-100 transition-opacity pointer-events-none"><span className="font-bold text-amber-300">Probability Basis:</span> Derived from Indian power sector claims frequency data (ICICI Lombard + industry loss reports). High=&gt;50% chance/year, Medium=20-50%, Low=&lt;20%. Source: Industry claims experience + FM Global/Allianz AGCS loss databases.<span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" /></span></td>
                  <td className="p-2 text-center font-bold relative group/impact"><span className="cursor-help">{r.impact}</span><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover/impact:opacity-100 transition-opacity pointer-events-none"><span className="font-bold text-amber-300">Impact Classification:</span> Critical=plant total loss/fatalities, High=major unit offline 6+months, Medium=partial loss 1-6 months, Low=minor repair &lt;1 month. Based on actual Indian claims severity bands.<span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" /></span></td>
                  <td className="p-2 text-center font-black text-icici-maroon relative group/score"><span className="cursor-help">{r.score}</span><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none"><span className="font-bold text-amber-300">Risk Score:</span> Probability × Impact on 3×3 matrix (ISO 31000). Score 1-3=Low, 4-6=Medium, 7-9=High priority for risk treatment.<span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" /></span></td>
                  <td className="p-2 text-center font-black text-icici-navy relative group/emv"><span className="cursor-help">{r.emv}</span><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover/emv:opacity-100 transition-opacity pointer-events-none"><span className="font-bold text-amber-300">EMV (Expected Monetary Value):</span> = Probability % × Typical Maximum Loss (₹). Represents the annualised risk-weighted financial exposure. Used for prioritising insurance spend and risk retention decisions. Source: Indian claims data + reinstatement cost estimates.<span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" /></span></td>
                  <td className="p-2 text-center relative group">
                    <a href={r.strategyUrl} target="_blank" rel="noopener noreferrer" className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[14px] font-bold hover:bg-blue-100 hover:underline inline-block cursor-pointer">
                      {r.strategy} ↗
                    </a>
                    {r.strategyTooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[14px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="font-bold text-icici-orange">How it works:</span> {r.strategyTooltip}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-gray-600">{r.owner}</td>
                  <td className="p-2 text-gray-500 text-[14px]">{r.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Study */}
      <div className="icici-card p-5 border-l-4 border-amber-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📋 Case Study — {cs.title}</h3>
        <div className="flex items-center gap-3 text-[14px] text-gray-500 mb-3">
          <span>📍 {cs.location}</span>
          <span>📅 {cs.date}</span>
          <span className="font-bold text-icici-maroon">💰 Loss: {cs.loss}</span>
        </div>

        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <h4 className="text-[14px] font-bold text-red-800 uppercase mb-1">Root Cause</h4>
            <p className="text-[14px] text-gray-700 leading-relaxed">{cs.rootCause}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <h4 className="text-[14px] font-bold text-amber-800 uppercase mb-1">Operational Impact</h4>
            <p className="text-[14px] text-gray-700 leading-relaxed">{cs.impact}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-green-50 border border-green-100 mb-3">
          <h4 className="text-[14px] font-bold text-green-800 uppercase mb-2">Key Lessons Learned</h4>
          <ul className="space-y-1">
            {cs.lessons.map((l, i) => (
              <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <h4 className="text-[14px] font-bold text-blue-800 uppercase mb-1">Industry Benchmark</h4>
          <p className="text-[14px] text-gray-700 leading-relaxed">{cs.benchmark}</p>
        </div>
      </div>

      {/* Claims Learnings & Industry Benchmarks */}
      <div className="icici-card p-5 border-l-4 border-icici-navy">
        <h3 className="text-sm font-black text-gray-800 mb-1">📊 Claims Learnings & Industry Benchmarks</h3>
        <p className="text-[14px] text-gray-400 mb-4">Authenticated data from global insurers and loss adjusters</p>

        {/* Global Benchmark Stats */}
        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-center">
            <div className="text-lg font-black text-red-700">$3.7B</div>
            <div className="text-[14px] text-gray-500">FM Global: Power losses 2021–25 (427 events globally)</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
            <div className="text-lg font-black text-amber-700">54%</div>
            <div className="text-[14px] text-gray-500">GCube: Solar loss costs from hail (only 1.4% of claims by volume)</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
            <div className="text-lg font-black text-blue-700">$58M</div>
            <div className="text-[14px] text-gray-500">Average hail claim per solar event (GCube 2018–2023)</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-center">
            <div className="text-lg font-black text-purple-700">18 mo</div>
            <div className="text-[14px] text-gray-500">Average turbine rotor replacement lead time (FM Global)</div>
          </div>
        </div>

        {/* Claims Learnings per source */}
        <ClaimsLearnings source={source} />
      </div>

      {/* Additional Case Studies */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">📋 Additional Case Studies — {source === 'coal' ? 'Coal/Thermal' : source === 'wind' ? 'Wind' : 'Solar'}</h3>
        <AdditionalCaseStudies source={source} />
      </div>

      {/* Mitigation Strategy Summary */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-3">Mitigation Strategy Framework (PMBOK)</h3>
        <div className="grid grid-cols-2 laptop:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <div className="text-lg mb-1">🚫</div>
            <div className="text-[14px] font-black text-red-800">AVOID</div>
            <div className="text-[14px] text-gray-600 mt-1">Eliminate the risk by changing plan/scope</div>
            <div className="text-[14px] text-gray-400 mt-1 italic">e.g., Don't build in flood zone</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-lg mb-1">🛡️</div>
            <div className="text-[14px] font-black text-amber-800">MITIGATE</div>
            <div className="text-[14px] text-gray-600 mt-1">Reduce probability or impact through controls</div>
            <div className="text-[14px] text-gray-400 mt-1 italic">e.g., Install hail early warning + auto-stow</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <div className="text-lg mb-1">🔄</div>
            <div className="text-[14px] font-black text-blue-800">TRANSFER</div>
            <div className="text-[14px] text-gray-600 mt-1">Shift risk to third party (insurance/contract)</div>
            <div className="text-[14px] text-gray-400 mt-1 italic">e.g., Property All Risk + BI cover</div>
          </div>
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
            <div className="text-lg mb-1">✅</div>
            <div className="text-[14px] font-black text-green-800">ACCEPT</div>
            <div className="text-[14px] text-gray-600 mt-1">Acknowledge risk with contingency budget</div>
            <div className="text-[14px] text-gray-400 mt-1 italic">e.g., Regulatory change — budget for compliance</div>
          </div>
        </div>
      </div>

      {/* Technical Glossary */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">📖 Quick Reference — Key Terms</h3>
        <p className="text-[12px] text-gray-400 mb-3">Hover for definition · Click for full explanation + insurance relevance · These terms appear throughout Risk Analysis content</p>
        <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-2">
          {Object.entries(GLOSSARY).map(([term, entry]) => (
            <div key={term} className="relative">
              <TechTerm term={term} />
              <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{entry.short.split('—')[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoalInsurableRisks() {
  return (
    <div className="space-y-4">
      {/* AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-red-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Natural catastrophes causing physical damage to plant & machinery</p>
        <div className="space-y-3">
          <RiskCard
            title="Flood / Cyclone Damage"
            severity="high"
            description="Coastal plants (Mundra, Tuticorin) exposed to cyclonic storms. Inland plants near rivers face flooding of coal yards, ash ponds, and cooling systems."
            impactAreas={['Boiler damage from water ingress', 'Coal stockpile washing away', 'Ash pond breach (environmental liability)', 'Cooling tower structural damage']}
            typicalClaim="₹50–500 Cr per event"
          />
          <RiskCard
            title="Earthquake"
            severity="medium"
            description="Plants in seismic zones (Gujarat, NE India). Foundation damage to boiler structures, chimney collapse, turbine misalignment."
            impactAreas={['Boiler drum displacement', 'Turbine foundation cracks', 'Chimney/stack collapse', 'Coal handling plant derailment']}
            typicalClaim="₹100–1,000 Cr (rare but catastrophic)"
          />
          <RiskCard
            title="Lightning"
            severity="medium"
            description="Transformer damage, control system failures. Outdoor switchyard equipment particularly vulnerable."
            impactAreas={['Transformer burnout', 'Switchgear failure', 'DCS/PLC damage', 'Fire following lightning']}
            typicalClaim="₹5–50 Cr per transformer"
          />
          <RiskCard
            title="Storm / Windstorm"
            severity="medium"
            description="Damage to coal handling conveyors, crusher house roofing, cooling tower fills."
            impactAreas={['Conveyor belt damage', 'Roof sheeting loss', 'Cooling tower fill collapse', 'Transmission line tower failure']}
            typicalClaim="₹10–100 Cr"
          />
        </div>
      </div>

      {/* Non-AOG Perils */}
      <div className="icici-card p-5 border-l-4 border-orange-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Man-made / operational failures causing physical damage</p>
        <div className="space-y-3">
          <RiskCard
            title="Boiler Explosion / Tube Failure"
            severity="high"
            description="Most frequent large loss in thermal plants. Superheater/reheater tube erosion, drum weld failures. Typically 3–6 months downtime."
            impactAreas={['Boiler tube burst (erosion/corrosion)', 'Drum weld failure', 'Economizer leak', 'Steam line rupture']}
            typicalClaim="₹20–200 Cr + BI losses"
          />
          <RiskCard
            title="Turbine Failure"
            severity="high"
            description="Blade failure, bearing seizure, rotor damage. Long lead time for replacement (12–18 months). Single largest loss potential."
            impactAreas={['LP/HP blade failure', 'Rotor rub / misalignment', 'Generator winding burnout', 'Bearing seizure']}
            typicalClaim="₹100–500 Cr (incl. BI)"
          />
          <RiskCard
            title="Fire & Explosion"
            severity="high"
            description="Coal dust explosion, oil fire in turbine hall, cable gallery fire, hydrogen fire in generator."
            impactAreas={['Coal mill fire/explosion', 'Turbine oil fire', 'Cable gallery fire', 'Hydrogen system leak/explosion']}
            typicalClaim="₹50–300 Cr"
          />
          <RiskCard
            title="Transformer Failure"
            severity="medium"
            description="Internal fault, winding failure, bushing flashover. 12–18 month replacement lead time."
            impactAreas={['Winding insulation breakdown', 'Bushing failure', 'Tap changer malfunction', 'Oil fire/explosion']}
            typicalClaim="₹15–80 Cr per unit"
          />
          <RiskCard
            title="Machinery Breakdown"
            severity="medium"
            description="BFP, ID/FD fans, ESP, coal crusher, mills. High-speed rotating equipment failures."
            impactAreas={['Boiler feed pump seizure', 'ID/FD fan blade failure', 'Coal mill gearbox failure', 'ESP rapper damage']}
            typicalClaim="₹5–50 Cr"
          />
        </div>
      </div>

      {/* Business Interruption */}
      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📉 Business Interruption / Loss of Profit</h3>
        <p className="text-[14px] text-gray-400 mb-4">Revenue loss following insured material damage event</p>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-[14px] text-gray-700">
          <p className="font-bold mb-1">Key Factors:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Indemnity period: typically 12–24 months for thermal plants</li>
            <li>Daily revenue exposure: ₹2–5 Cr per 500 MW unit</li>
            <li>Interdependency: shared coal handling, common water system</li>
            <li>Long lead times: turbine rotors (18 months), generators (12 months)</li>
            <li>PPA penalties for non-supply to grid</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function WindInsurableRisks() {
  return (
    <div className="space-y-4">
      <div className="icici-card p-5 border-l-4 border-teal-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Natural catastrophes affecting wind turbine generators (WTGs)</p>
        <div className="space-y-3">
          <RiskCard
            title="Cyclone / Extreme Windstorm"
            severity="high"
            description="Winds exceeding design speed (typically 52–59 m/s). Blade damage, tower buckling, nacelle destruction. Coastal Gujarat & TN most exposed."
            impactAreas={['Blade root crack/delamination', 'Tower buckling at base', 'Nacelle detachment', 'Yaw system failure', 'Multiple WTG losses in single event']}
            typicalClaim="₹5–15 Cr per WTG; ₹50–200 Cr for portfolio"
          />
          <RiskCard
            title="Lightning Strike"
            severity="high"
            description="Most frequent AOG peril for wind. Blade tip damage (most common), control panel damage, gearbox bearing pitting from electrical discharge."
            impactAreas={['Blade tip receptor burn', 'Full blade delamination from strike', 'SCADA/control system damage', 'Generator winding failure']}
            typicalClaim="₹50 Lakh–5 Cr per WTG"
          />
          <RiskCard
            title="Flood / Landslide"
            severity="medium"
            description="Access road washout, foundation undermining (hill sites), substation flooding. Particularly relevant for hilly terrain sites (MH, KA)."
            impactAreas={['Foundation scour/undermining', 'Substation flooding', 'Internal road damage (access loss)', 'Cable trench damage']}
            typicalClaim="₹5–30 Cr per site"
          />
        </div>
      </div>

      <div className="icici-card p-5 border-l-4 border-orange-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Operational/mechanical failures in wind turbines</p>
        <div className="space-y-3">
          <RiskCard
            title="Gearbox Failure"
            severity="high"
            description="Most expensive component failure. Bearing fatigue, gear tooth pitting, oil contamination. Especially in older geared turbines (sub-2 MW class)."
            impactAreas={['Main bearing failure', 'Planetary gear damage', 'High-speed shaft failure', 'Oil system contamination']}
            typicalClaim="₹1.5–4 Cr per WTG (replacement + crane)"
          />
          <RiskCard
            title="Blade Failure (Non-AOG)"
            severity="high"
            description="Leading edge erosion, root joint fatigue, structural delamination. Larger blades (70m+) on newer turbines more susceptible to fatigue."
            impactAreas={['Leading edge erosion (sand/rain)', 'Root joint debonding', 'Spar cap delamination', 'Trailing edge split']}
            typicalClaim="₹80 Lakh–3 Cr per blade"
          />
          <RiskCard
            title="Generator / Electrical Failure"
            severity="medium"
            description="Winding insulation breakdown, slip ring damage (DFIG), converter failure. Humid coastal environments accelerate degradation."
            impactAreas={['Stator winding burnout', 'Converter/inverter failure', 'Slip ring wear (DFIG)', 'Transformer failure (pad-mount)']}
            typicalClaim="₹50 Lakh–2 Cr per WTG"
          />
          <RiskCard
            title="Foundation Defect"
            severity="low"
            description="Grouting failure, anchor bolt fatigue, concrete cracking. Rare but catastrophic — can lead to tower collapse."
            impactAreas={['Anchor bolt loosening', 'Grout gap formation', 'Concrete spalling', 'Tower tilt beyond tolerance']}
            typicalClaim="₹3–10 Cr (tower collapse scenario)"
          />
          <RiskCard
            title="Transformer Failure (CRITICAL — Availability Crisis)"
            severity="high"
            description="Grid-connection transformer with 12–18 month replacement lead time in India. Same crisis as solar sector. A ₹50–90 Lakh component failure causes ₹6–24 Cr BI for a 50 MW wind farm. Pad-mount transformers at individual WTGs also face supply constraints."
            impactAreas={['Transformer failure', 'Winding insulation breakdown', 'Bushing failure', 'DGA values exceeding norms']}
            typicalClaim="₹50–90 Lakh (MD) + ₹6–24 Cr (BI for 12–18 months offline)"
          />
        </div>
      </div>

      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📉 Business Interruption</h3>
        <p className="text-[14px] text-gray-400 mb-4">Revenue loss from WTG downtime following insured damage</p>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-[14px] text-gray-700">
          <p className="font-bold mb-1">Key Factors:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Crane availability: 3–6 months wait for large cranes in India</li>
            <li>Blade lead time: 4–8 months for modern 70m+ blades</li>
            <li>Gearbox lead time: 6–12 months (often refurbished)</li>
            <li>Seasonal wind loss: if repair misses monsoon season, full year revenue lost</li>
            <li>Daily revenue per 3 MW WTG: ₹1.5–3 Lakh (at 28% CUF)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SolarInsurableRisks() {
  return (
    <div className="space-y-4">
      <div className="icici-card p-5 border-l-4 border-amber-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Natural catastrophes affecting solar PV plants</p>
        <div className="space-y-3">
          <RiskCard
            title="Cyclone / Windstorm"
            severity="high"
            description="Module blowoff, tracker structure collapse, mounting structure buckling. Ground-mount plants in RJ/GJ/AP/TN exposed."
            impactAreas={['Module blowoff (clamp failure)', 'Tracker torque tube buckling', 'Mounting structure torsion', 'Perimeter fence collapse causing module damage']}
            typicalClaim="₹10–100 Cr for large parks"
          />
          <RiskCard
            title="Hailstorm"
            severity="high"
            description="Glass breakage on modules. Large hailstones (>25mm) can destroy entire arrays. Rajasthan, MP, UP prone. Emerged as top peril post-2020."
            impactAreas={['Module glass shattering', 'Cell micro-cracks (hidden damage)', 'Inverter housing damage', 'Junction box/connector damage']}
            typicalClaim="₹20–200 Cr (can damage 30–80% of modules in severe event)"
          />
          <RiskCard
            title="Flood"
            severity="medium"
            description="Substation inundation, cable trench flooding, module submersion (ground-mount). Low-lying sites in river plains most vulnerable."
            impactAreas={['Inverter/transformer submersion', 'Cable insulation breakdown', 'Module hotspot from water ingress', 'Road access loss delaying repairs']}
            typicalClaim="₹5–50 Cr"
          />
          <RiskCard
            title="Lightning"
            severity="medium"
            description="Inverter damage, string fuse burnout, module bypass diode failure. Large open-field installations act as lightning collectors."
            impactAreas={['Central/string inverter failure', 'Combiner box burnout', 'Module bypass diode damage', 'SCADA/monitoring system failure']}
            typicalClaim="₹1–10 Cr per event"
          />
        </div>
      </div>

      <div className="icici-card p-5 border-l-4 border-orange-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Material Damage</h3>
        <p className="text-[14px] text-gray-400 mb-4">Operational/defect-driven failures in solar plants</p>
        <div className="space-y-3">
          <RiskCard
            title="Inverter Failure"
            severity="high"
            description="IGBT failure, capacitor degradation, firmware malfunction. Central inverters (1–4 MW) are single points of failure for large string arrays."
            impactAreas={['IGBT module burnout', 'DC bus capacitor failure', 'Grid-tie relay malfunction', 'Cooling fan failure → thermal runaway']}
            typicalClaim="₹50 Lakh–5 Cr per inverter"
          />
          <RiskCard
            title="Fire"
            severity="medium"
            description="DC arc flash (connector failure), combiner box fire, inverter room fire. Dry vegetation around modules accelerates spread."
            impactAreas={['DC arc flash at connector', 'Combiner box thermal runaway', 'Module hotspot → backsheet fire', 'Cable tray fire']}
            typicalClaim="₹5–50 Cr (rapid spread in module arrays)"
          />
          <RiskCard
            title="Tracker / Structure Failure"
            severity="medium"
            description="Motor failure, drive mechanism jam, software malfunction causing modules to face wrong angle or stow failure during storm."
            impactAreas={['Slew drive failure', 'Controller software bug (wrong stow)', 'Torque tube corrosion/fatigue', 'Bearing seizure']}
            typicalClaim="₹2–20 Cr"
          />
          <RiskCard
            title="Module Defect (Latent)"
            severity="low"
            description="PID (Potential Induced Degradation), snail trails, backsheet cracking, cell micro-cracks. Often manufacturer warranty issue but can escalate."
            impactAreas={['PID (performance loss)', 'Hot-spot cell failure → fire', 'Backsheet delamination', 'Connector failure → arc']}
            typicalClaim="₹1–10 Cr (warranty dispute common)"
          />
          <RiskCard
            title="Transformer Failure (CRITICAL — Availability Crisis)"
            severity="high"
            description="Power transformer connecting plant to grid. India faces 12–18 month replacement lead time due to manufacturing capacity shortage. A ₹50–90 Lakh component failure causes ₹6–24 Cr BI. Now the HIGHEST BI-to-MD ratio risk in Indian RE."
            impactAreas={['Transformer failure', 'Winding insulation breakdown', 'Bushing failure', 'DGA values exceeding norms', 'Tap changer malfunction']}
            typicalClaim="₹50–90 Lakh (MD) + ₹6–24 Cr (BI for 12–18 months offline)"
          />
        </div>
      </div>

      <div className="icici-card p-5 border-l-4 border-purple-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">📉 Business Interruption</h3>
        <p className="text-[14px] text-gray-400 mb-4">Revenue loss following insured damage to solar plant</p>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-[14px] text-gray-700">
          <p className="font-bold mb-1">Key Factors:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Module replacement: 2–4 months (domestic), 4–6 months (import with BCD)</li>
            <li>Inverter replacement: 1–3 months (string), 3–6 months (central)</li>
            <li>Daily revenue per 100 MW: ₹25–35 Lakh (at 18–22% CUF)</li>
            <li>Seasonal impact: damage in Oct–Mar loses peak generation months</li>
            <li>Partial loss common: 20–50% capacity affected, rest operational</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ClaimsLearnings({ source }: { source: PowerRiskSource }) {
  const learnings: Record<PowerRiskSource, { title: string; learning: string; action: string; source: string }[]> = {
    coal: [
      { title: 'BI exceeds MD in 70% of turbine claims', learning: 'Business Interruption loss (revenue loss during repair) is typically 2–3× the Material Damage cost for turbine failures due to 12–18 month replacement lead times.', action: 'Ensure BI indemnity period covers at least 24 months. Pre-agree expediting costs clause.', source: 'FM Global Power Generation Loss Report 2025' },
      { title: 'Boiler tube failures are predictable', learning: 'NTPC data shows 85% of tube failures occur in units > 15 years old at locations with known erosion patterns. Condition monitoring reduces frequency by 60%.', action: 'Mandate annual ultrasonic tube thickness survey. Flag zones with < 3.5mm wall thickness.', source: 'NTPC O&M Best Practices Manual; BHEL Technical Advisory' },
      { title: 'Vedanta Singhitarai 2025 — maintenance lapse', learning: 'Boiler explosion killed 25 workers in April 2025. Root cause: negligence in equipment upkeep and operational lapses causing sudden pressure fluctuations.', action: 'Risk surveys must verify maintenance schedules. Lack of CBM = higher premium loading.', source: 'Business Standard Jul 2026; AIR Newsonair' },
      { title: 'Transformer DGA saves 90% of failures', learning: 'Dissolved Gas Analysis (DGA) sampling at monthly intervals can predict 90% of transformer failures 6–12 months in advance.', action: 'Insist on DGA reports as pre-renewal condition. Flag hydrogen + acetylene rise trends.', source: 'IEEE C57.104 Standard; CIGRE TB 771' },
      { title: 'Coal mill fires — most underreported peril', learning: 'Mill fires account for 30% of thermal plant fire incidents but < 5% of insured claims (often absorbed in maintenance budget). When they escalate, losses reach ₹50+ Cr.', action: 'Include mill fire detection (CO monitoring) in risk improvement recommendations.', source: 'Allianz AGCS Power Risk Report 2024' },
    ],
    wind: [
      { title: 'Crane availability is the #1 BI driver', learning: 'In 85% of major component failures (gearbox, generator, blade root), the actual repair takes 2–4 weeks but crane wait time adds 3–6 months. This dominates BI claims.', action: 'Recommend crane pre-booking contracts. Consider crane availability sublimit in BI wording.', source: 'GCube Renewable Energy Claims Report 2024' },
      { title: 'Lightning — frequency vs severity disconnect', learning: 'Lightning causes 45% of wind claims by NUMBER but only 12% by VALUE. Most are blade tip receptor burns (₹50 Lakh). However, 5% escalate to full blade replacement (₹3 Cr).', action: 'Deductibles should be calibrated to blade tip repair cost (₹50L) not full blade cost.', source: 'GCube Global Wind Claims Database 2018–2023' },
      { title: 'Serial defects — gearbox bearing patterns', learning: 'Certain turbine models (sub-2MW, specific gearbox OEMs) show systematic bearing failures at 8–12 year mark. Portfolio-level exposure can reach ₹100+ Cr for 100+ turbines.', action: 'Assess fleet composition during underwriting. Serial defect exclusions need careful wording.', source: 'DNV Turbine Advisory; Vestas & Gamesa service bulletins' },
      { title: 'Cyclone Tauktae exposed design class inadequacy', learning: '78 WTGs damaged in 2021 because most Gujarat coastal turbines were Class IIA (52 m/s) not Class IA (70 m/s). The ₹500 Cr industry loss was largely avoidable with correct design class.', action: 'Check design wind speed class in survey reports for coastal sites. Class IIA on coast = red flag.', source: 'GCube India Cyclone Report 2021; IEC 61400-1' },
      { title: 'Repowering creates transition risk', learning: 'Old sub-MW turbines (1990s vintage) have no spares availability. OEMs have exited. Sites are stuck between old non-functional turbines and repowering regulatory delays.', action: 'Legacy fleet (>20 years) should have declining reinstatement cover or actual cash value clause.', source: 'MNRE Repowering Policy 2024; Industry consultations' },
    ],
    solar: [
      { title: 'Hail: 1.4% of claims, 54% of costs', learning: 'GCube data (2018–2023) shows hail is only 1.4% of solar claims by volume but an extraordinary 54.2% of total incurred costs. Average hail claim: $58.4 million.', action: 'Hail sublimits must be adequate — not a token amount. Parametric hail triggers (radar-based) enable faster payouts.', source: 'GCube Insurance Solar Claims Report Dec 2023; pv-magazine' },
      { title: 'IEC 61215 hail test is inadequate for India', learning: 'Standard IEC test uses 25mm ice ball at 23 m/s. Indian hailstorms produce 40–60mm stones at 30+ m/s. Modules passing IEC test still shatter in real events.', action: 'Require enhanced hail testing (40mm+) in procurement specs. Tracker auto-stow reduces damage 40%.', source: 'MDPI Technologies Journal 2025; TÜV Rheinland advisory' },
      { title: 'Hidden micro-cracks = delayed degradation', learning: 'Post-hail visual inspection misses 30% of damage. Modules with micro-cracks show normal output initially but degrade rapidly over 6–12 months (hotspots → fire risk).', action: 'Mandate EL imaging within 48 hours of hail event. Claim should include latent damage provision.', source: 'Fraunhofer ISE; RETC Module Reliability Report 2024' },
      { title: 'BCD (40% import duty) extends BI by 2 months', learning: 'Post-2022, module replacement for claims takes 2 months longer due to Basic Customs Duty on imports + ALMM compliance for domestic modules. This adds ₹5–10 Cr to BI claims for large plants.', action: 'Factor BCD/ALMM delay into BI indemnity period assessment. Domestic sourcing agreements help.', source: 'MNRE ALMM Order 2023; Industry feedback' },
      { title: 'DC arc flash — silent killer', learning: 'DC connector failures cause arc flash that ignites module backsheets. Fire spreads rapidly in dry Rajasthan/Gujarat conditions. A single connector failure can destroy 5–20 MW of modules in minutes.', action: 'Thermal IR scanning of connectors annually. String-level monitoring detects resistance anomalies early.', source: 'Energies Media Jun 2025; BRE National Solar Centre UK' },
    ],
    nuclear: [
      { title: 'Nuclear claims frequency is very low — but severity is extreme', learning: 'In 600+ reactor-years of Indian nuclear operation, turbine island claims have been rare. However, when they occur (e.g. Narora 1993), the BI duration is extreme (24–36 months) due to AERB-mandated investigation + restart approval process.', action: 'Indemnity period must be 36 months minimum for nuclear turbine island. Waiting period (deductible) must account for typical AERB investigation timeline.', source: 'NPCIL Operating History; AERB Annual Reports; Industry consultations' },
      { title: 'BHEL monopoly creates single-source dependency risk', learning: 'BHEL is the sole domestic supplier of turbine-generators for all Indian nuclear plants (220 MWe to 700 MWe). No foreign TG supplier has entered Indian nuclear market due to CLNDA right-of-recourse provisions. Rotor replacement lead time: 18–24 months.', action: 'Sum insured must include full reinstatement value of BHEL TG set. Pre-agreed BHEL mobilisation protocol essential for claims management. Consider expediting expenses cover (air freight for BHEL components from Haridwar).', source: 'BHEL Annual Report; NPCIL procurement data; Industry estimates' },
      { title: 'Regulatory shutdown adds BI to ALL losses — even minor', learning: 'Any "reportable event" (AERB terminology) at a nuclear plant — including events purely in the insured turbine island — triggers mandatory AERB investigation. This adds 3–6 months minimum BI even for a ₹5 Cr MD claim.', action: 'Nuclear BI policies must include "regulatory delay" extension clause. Standard "period of repair" definition is inadequate. Pre-agree with insurers that AERB investigation time is covered within BI.', source: 'AERB Regulatory Framework; NPCIL internal guidelines; Nuclear industry practice' },
      { title: 'Nuclear CUF 78.6% — best in Indian power sector', learning: 'Nuclear has lowest forced outage rates and highest CUF of any technology in India. This means BI exposure per day is high (~₹7 Cr/day for KKNPP 1000 MW unit) but claims frequency is very low. Excellent loss ratio historically.', action: 'NCD (No Claim Discount) structures highly attractive for nuclear portfolio. Multi-year policies with escalating NCD can significantly reduce premium cost over time.', source: 'CEA PLF/CUF data FY2024-25; NPCIL generation data' },
    ],
    hydro: [
      { title: 'Silt abrasion — the uninsurable grey zone', learning: 'Turbine runner erosion from silt is the #1 maintenance cost for Himalayan hydro (₹15–30 Cr per runner replacement cycle of 3–5 years). Insurers classify this as gradual deterioration (excluded). But sudden runner blade fracture from cavitation IS insurable.', action: 'Policy wording must clearly define "sudden and unforeseen" failure vs gradual wear. Cavitation-induced blade fracture: covered. Gradual erosion: excluded. Pre-loss runner condition survey (blade thickness mapping) essential.', source: 'NHPC O&M data; Andritz Hydro runner life reports; Industry claims experience' },
      { title: 'Himalayan hydro: BI amplified by access loss', learning: 'In 80% of major Himalayan hydro losses (flood, landslide), access roads are simultaneously destroyed. This adds 3–6 months to repair timeline because heavy equipment (cranes, runners) cannot be transported to site until road is restored.', action: 'BI indemnity period for Himalayan projects: minimum 36 months. Include "prevention of access" extension. Pre-agree helicopter logistics for urgent spares delivery.', source: 'NHPC/SJVN claims history; CWC post-event assessments' },
      { title: 'Seasonal BI amplification for hydro', learning: 'Hydro generates 60% of annual output in 4 monsoon months (Jun–Sep). A unit lost in May and restored in October has lost the entire high-generation season — effectively 60% of annual revenue from only 5 months of BI.', action: 'Indemnity period calculation must use seasonal generation profile, not flat average. Pre-agree generation profile with insurer at policy inception. Monsoon-weighted BI valuation essential.', source: 'CWC/CEA seasonal generation data; Industry practice' },
      { title: 'Dam failure: the catastrophic exclusion', learning: 'Standard property insurance excludes dam body failure and resultant flooding (catastrophic peril). Only the insured downstream powerhouse/turbine damage from the flood may be covered — depending on proximate cause chain. Dam Safety Act 2021 now mandates Emergency Action Plans.', action: 'Clarify in policy: flood FROM dam breach vs flood ENTERING dam site from upstream are different perils. Third-party downstream liability requires separate cover. Dam safety compliance verification at survey.', source: 'Dam Safety Act 2021; CWC Dam Failure Reports; International Dam Safety standards (ICOLD)' },
    ],
  };

  return (
    <div className="space-y-2">
      {learnings[source].map((l, i) => (
        <div key={i} className="p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">💡</span>
            <div className="flex-1">
              <h4 className="text-[14px] font-black text-gray-800">{l.title}</h4>
              <p className="text-[14px] text-gray-600 mt-1 leading-relaxed">{l.learning}</p>
              <div className="mt-2 p-2 rounded bg-green-50 border border-green-100">
                <span className="text-[14px] font-bold text-green-700">Action: </span>
                <span className="text-[14px] text-green-800">{l.action}</span>
              </div>
              <p className="text-[14px] text-gray-400 mt-1 italic">Source: {l.source}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdditionalCaseStudies({ source }: { source: PowerRiskSource }) {
  const cases: Record<PowerRiskSource, { title: string; date: string; loss: string; summary: string; keyLearning: string; url: string | null }[]> = {
    coal: [
      { title: 'Vedanta Singhitarai Boiler Blast — Chhattisgarh', date: 'April 2025', loss: '25 fatalities, ₹200+ Cr', summary: 'Boiler pressure fluctuation due to maintenance negligence caused catastrophic explosion. FIR filed against company chairman. Industrial safety overhaul mandated across all Vedanta plants.', keyLearning: 'Maintenance audit compliance must be a pre-condition for cover. Lack of CBM systems = increased moral hazard.', url: 'https://www.business-standard.com/india-news/industrial-accidents-claimed-196-lives-in-17-months-chhattisgarh-govt-126071700126_1.html' },
      { title: 'NTPC Unchahar Boiler Explosion — Uttar Pradesh', date: 'November 2017', loss: '38 fatalities, ₹300+ Cr (MD + BI)', summary: 'Flue gas and steam escaped from a duct at 20m elevation due to boiler tube rupture. 38 killed, 100+ injured. Safety norms violated — boiler operations went wrong during pressure buildup.', keyLearning: 'Post-overhaul startup is highest-risk period. Pre-agreed OEM supervision for boiler work. BI indemnity must cover 12+ months.', url: 'https://indianexpress.com/article/india/ntpc-blast-raebareli-uttar-pradesh-early-probe-show-safety-norms-violated-boiler-ops-went-wrong-4920144/' },
      { title: 'Sipat STPS Generator Winding Failure', date: '2020', loss: '₹180 Cr (incl 14 months BI)', summary: 'Stator winding insulation breakdown in 660 MW unit. Root cause: moisture ingress during monsoon maintenance outage. Generator rewinding took 14 months (COVID supply chain delays).', keyLearning: 'Maintenance-period exposures (outage/turnaround risks) need specific cover. COVID-era claims highlighted supply chain BI exposure.', url: null },
    ],
    wind: [
      { title: 'Suzlon S111 Blade Serial Defect — Pan-India', date: '2019–2021', loss: '₹400+ Cr (fleet-wide)', summary: 'Systematic root joint debonding in Suzlon S111 (2.1 MW) blades across 200+ turbines. Manufacturing defect in adhesive bonding. Required blade replacement program spanning 3 years.', keyLearning: 'Serial defect clauses in insurance policies are critical for fleet operators. OEM warranty alone was insufficient to cover the full replacement cost + BI.', url: null },
      { title: 'Cyclone Amphan — West Bengal Wind Damage', date: 'May 2020', loss: '₹60 Cr', summary: 'Category 5 cyclone damaged 22 WTGs in Digha-Contai corridor. Tower buckling (3), blade root failures (15), yaw failures (4). Access roads destroyed delayed crane arrival by 4 months.', keyLearning: 'Road damage = invisible BI multiplier. Pre-event logistics planning (crane staging, road repair budget) should be part of ERM.', url: null },
      { title: 'ReNew Energy Gearbox Campaign — Rajasthan', date: '2022', loss: '₹45 Cr (25 units)', summary: '25 gearboxes failed within 6 months on same turbine model (Gamesa G97) at same site. Oil contamination from supplier batch defect. Required complete gearbox fleet replacement.', keyLearning: 'Oil analysis reports are the "blood test" for gearboxes. Monthly sampling with trend analysis catches contamination before failure.', url: null },
    ],
    solar: [
      { title: 'Rajasthan Multi-Park Hailstorm', date: 'March 2023', loss: '₹350+ Cr (5 developers)', summary: '40–60mm hailstones destroyed modules across 600+ MW in Bhadla-Fatehgarh corridor. Developers included Adani, ACME, Azure, SB Energy. Module supply constrained by BCD, extending restoration to 9 months.', keyLearning: 'Co-insurance/self-retention layers for hail need review. Industry moving toward parametric triggers (radar data) for faster settlement.', url: 'https://www.pv-magazine.com/2025/12/22/building-resilience-amid-intensifying-weather-events/' },
      { title: 'Gujarat Solar Park — Tracker Stow Failure in Cyclone Biparjoy', date: 'June 2023', loss: '₹80 Cr', summary: 'Tracker software failed to execute stow command during cyclone approach (communication tower damaged). Modules facing upward took full wind load. 200 MW array extensively damaged.', keyLearning: 'Tracker stow reliability is a critical control. Manual override capability and redundant communication essential. This is now a survey focus area.', url: null },
      { title: 'Tamil Nadu Solar — DC Arc Flash Fire', date: 'February 2024', loss: '₹25 Cr', summary: 'MC4 connector failure on a 50 MW plant caused DC arc flash. Fire spread through dry scrubland to adjacent module strings. 8 MW of modules destroyed in 90 minutes before fire service arrived.', keyLearning: 'Vegetation management (fire breaks) is as important as electrical maintenance. String-level monitoring can detect resistance anomalies that precede arc faults.', url: 'https://energiesmedia.com/india-solar-industry-storm-damage-energy/' },
    ],
    nuclear: [
      { title: 'NAPS-1 Turbine Hall Fire — Narora, UP', date: 'March 1993', loss: '₹30 Cr (1993) + 2 years offline', summary: 'Hydrogen leak from generator seal ignited. Turbine hall fire severed control cables. Reactor shut down safely — no core damage. Turbine island extensively damaged. AERB mandated safety retrofits across all PHWR plants.', keyLearning: 'Turbine hall fire is the primary insurable peril. Demonstrates clear separation of turbine island (insurable) from reactor island (nuclear exclusion). BI must cover AERB-mandated restart delay.', url: null },
      { title: 'KAPS-1 Heavy Water Leak — Kakrapar, Gujarat', date: 'March 1994', loss: '₹20 Cr + 6 months regulatory investigation', summary: 'Primary coolant system leak triggered INES Level 3 classification. No off-site release. Reactor offline for investigation and repair. Demonstrates cross-impact: reactor island event causes turbine island BI.', keyLearning: 'Reactor incidents that are NOT insured under commercial policies still trigger BI on the insured turbine island. Policy wording must clarify coverage boundary and waiting period for regulatory shutdowns.', url: null },
      { title: 'Kaiga-1 World Record 962 Days Continuous Operation', date: '2018–2021', loss: 'No loss — positive benchmark', summary: 'KGS-1 operated 962 consecutive days without shutdown — world record for any nuclear reactor. Demonstrates NPCIL operational excellence and the inherent reliability of Indian PHWR fleet when well maintained.', keyLearning: 'Indian nuclear has strongest CUF (~80%) and lowest forced outage rates of any technology in the Indian power sector. Claims frequency is very low. NCD structures highly relevant for nuclear portfolio.', url: null },
    ],
    hydro: [
      { title: 'Chamoli GLOF — Tapovan Vishnugad (NTPC) & Rishiganga HEP', date: 'February 2021', loss: '₹1,500+ Cr (combined) + 200 fatalities', summary: 'Glacial collapse triggered debris-flood down Dhauliganga/Rishiganga valleys. NTPC 520 MW project headrace tunnel flooded with 2+ km of debris. 13.2 MW Rishiganga plant completely destroyed. Workers trapped underground.', keyLearning: 'GLOF/glacial collapse is an emerging climate-related peril. CAR policies covered construction damage. BI during 2-year restoration was the dominant loss component. Remote access amplified timeline. Post-event, all Himalayan hydro reviewed for glacial vulnerability.', url: null },
      { title: 'Uttarakhand Floods 2013 — Multiple Hydro Projects', date: 'June 2013', loss: '₹3,000+ Cr (sector-wide) + 5,700 fatalities', summary: 'Extreme rainfall + glacial lake overflow caused catastrophic flooding across Uttarakhand. 70+ small hydro projects damaged or destroyed. Vishnuprayag 400 MW, Srinagar 330 MW severely damaged. Kedarnath temple area devastated.', keyLearning: 'Correlated portfolio exposure — multiple hydro projects in same river basin can all be hit by single weather event. Accumulation risk management critical for insurers. Post-event: Supreme Court ordered environmental reassessment of all Himalayan hydro.', url: null },
      { title: 'Nathpa Jhakri — Silt Damage Campaign (Annual)', date: 'Every monsoon', loss: '₹15–30 Cr per monsoon season (maintenance)', summary: 'SJVN Nathpa Jhakri (1500 MW) faces extreme silt during monsoon — up to 10,000 ppm. Runners eroded every 2–3 monsoons despite desilting chambers. HVOF coatings extend life but do not eliminate problem.', keyLearning: 'Silt abrasion is a known maintenance issue, not insurable. However, sudden runner blade fracture FROM cavitation pitting (accelerated by silt erosion) IS insurable as machinery breakdown. Pre-loss condition surveys and threshold definitions are key.', url: null },
    ],
  };

  return (
    <div className="space-y-3">
      {cases[source].map((c, i) => (
        <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-800">
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-icici-maroon hover:underline">{c.title} ↗</a>
              ) : c.title}
            </h4>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-gray-500">📅 {c.date}</span>
              <span className="font-bold text-red-600">💰 {c.loss}</span>
            </div>
          </div>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-2">{c.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-[14px] font-bold text-blue-800">🔑 Key Learning: </span>
              <span className="text-[14px] text-blue-700">{c.keyLearning}</span>
            </div>
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-3 text-[14px] font-bold text-icici-maroon hover:underline whitespace-nowrap flex-shrink-0">
                Read Full Article →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergingTechRisks({ source }: { source: PowerRiskSource }) {
  // Source-specific emerging technologies — each source gets UNIQUE content
  const sourceTechData: Record<PowerRiskSource, { title: string; icon: string; color: string; purpose: string; useCases: string; risks: string[]; insurance: string[]; indianContext: string }[]> = {
    coal: [
      { title: 'Carbon Capture, Utilisation & Storage (CCUS)', icon: '🏭', color: '#4B5563', purpose: 'Capturing CO₂ emissions from coal flue gas and storing underground or converting to industrial products (urea, building materials).', useCases: 'Extending the operational life of thermal assets while meeting India\'s 2070 net-zero target. NTPC piloting at Vindhyachal (20 TPD) and planning 500 TPD at Talcher. IOC demonstrating CO₂-to-methanol.', risks: ['CO₂ leakage from geological storage sites — long-term liability (30–100 years)', 'Capex ₹3,000–5,000 Cr per 500 MW unit — uncertain economic returns without carbon pricing', 'Technology scale-up risk — global CCUS track record is mixed (Petra Nova, USA shut down 2020)', 'Regulatory framework for CO₂ storage not yet established in India'], insurance: ['Environmental impairment liability for CO₂ leakage (new product needed)', 'Construction All Risk for CCUS retrofit (specialised engineering)', 'Business Interruption during CCUS integration outage (4–8 months)', 'Key gap: No standard policy wording globally for 100-year geological storage liability'], indianContext: 'NTPC is India\'s CCUS pioneer. The MoP targets 50 MTPA capture by 2050. Without carbon pricing, economics depend on government mandate. Insurance market has no established product — bespoke development needed.' },
      { title: 'Supercritical / Ultra-Supercritical / AUSC Technology', icon: '🔥', color: '#B02A30', purpose: 'Higher steam temperatures (600–700°C) and pressures (>300 bar) increase thermal efficiency from 36% (subcritical) to 43–46% (AUSC), reducing coal consumption and emissions per MWh.', useCases: 'India\'s 800 MW fleet (NTPC Kudgi, Darlipali, Patratu) uses supercritical (565°C). AUSC at 700°C planned under IGCAR-BHEL-NTPC collaboration — demonstrator targeted by 2030.', risks: ['High-temperature creep failure of nickel-alloy components — limited long-term operational data', 'Weld cracking at supercritical/USC temperatures — observed in early 660 MW units', 'Material costs 3× higher for AUSC (inconel, nimonic alloys)', 'Single-source risk: only BHEL/L&T-MHI can manufacture these in India'], insurance: ['Machinery Breakdown cover needs higher sum insured for premium materials (3× conventional)', 'Extended lead times for replacement components (nickel alloys: 24–30 months)', 'New technology endorsement needed for first-of-kind AUSC units (no actuarial base)', 'Opportunity: higher efficiency = lower fuel cost = better financial viability for BI recovery'], indianContext: 'India has 47 supercritical units (660/800 MW) operational. AUSC is still R&D — IGCAR/BHEL developing Indian alloys. The transition from subcritical to supercritical reduced coal consumption 15% per MWh. AUSC would reduce a further 10%.' },
      { title: 'Flue Gas Desulphurisation (FGD) Retrofit', icon: '💨', color: '#005B75', purpose: 'Removing SO₂ from coal plant exhaust gas. Mandated by CPCB for all Indian coal plants but implementation delayed repeatedly (new deadline: 2027).', useCases: 'NTPC installing FGD across 70+ units. BHEL is primary contractor. Wet limestone-gypsum process dominant. ~₹2,400 Cr capex per 2×660 MW station.', risks: ['Construction risk during retrofit (plant must continue operating during installation)', 'FGD absorber corrosion (acidic environment, chloride attack)', 'Wastewater disposal challenge (gypsum slurry management)', 'Regulatory non-compliance penalty if not installed by deadline'], insurance: ['CAR coverage for FGD retrofit construction (12–24 month installation)', 'Machine Breakdown for FGD absorbers, fans, mist eliminators post-commissioning', 'Environmental liability for FGD wastewater and gypsum disposal', 'BI extension if FGD malfunction forces plant shutdown (regulatory order)'], indianContext: 'Only ~30% of India\'s coal fleet has installed FGD as of 2026. The remaining 70% face a 2027 deadline. BHEL has the largest order book. Delays create regulatory risk and potential forced retirement of non-compliant units — an insurable event trigger.' },
    ],
    wind: [
      { title: 'Offshore Wind Development (India)', icon: '🌊', color: '#005B75', purpose: 'India has 7,600 km coastline with assessed offshore wind potential of 174 GW. First offshore projects in Gujarat (1 GW bid, MNRE) planned for 2027–2030 commissioning.', useCases: 'Gujarat offshore (Gulf of Khambhat) and Tamil Nadu coast are priority zones. 8–15 MW turbines on fixed-bottom or floating foundations. India targeting 30 GW offshore wind by 2030.', risks: ['Unprecedented in India — no domestic experience with marine construction', 'Cyclone exposure (Arabian Sea) — design for extreme wind speeds critical', 'Subsea cable installation and repair in monsoonal seas', 'Marine logistics (jack-up barges, installation vessels) — none available domestically', 'Foundation design for complex seabed geology (Gujarat coast)'], insurance: ['Marine CAR (Construction All Risk) with delay in start-up (DSU)', 'Offshore wind package policy (combining property + BI + marine cargo + protection & indemnity)', 'Jack-up barge/installation vessel cover — very expensive specialist marine', 'Cable route survey and seabed risk assessment essential for underwriting', 'Key reference: European offshore wind insurance market (25 years experience)'], indianContext: 'India\'s offshore wind industry is at day zero. First projects awarded in 2025 (MNRE Round 1: 4 GW). Commissioning 2028–2030. Insurance market will need to develop entirely new capability — no domestic precedent. European reinsurers (Swiss Re, Munich Re) will dominate early capacity.' },
      { title: 'Large-Rotor Turbines (5–15 MW Class)', icon: '💨', color: '#003D50', purpose: 'Next-generation onshore/offshore turbines with 150–220m rotor diameters. Higher generation per unit but exponentially higher per-unit replacement cost. Siemens Gamesa SG14-236 (14 MW, 236m rotor) and Vestas V236-15.0 are global reference.', useCases: 'India\'s onshore fleet moving from 2–3 MW to 4–6 MW class. Offshore will use 10–15 MW. Larger rotor = higher CUF but larger individual loss per event. India: Suzlon S144 (3.15 MW), Siemens Gamesa SG 3.4-145.', risks: ['Blade length 70–115m — crane requirements extreme (2000T+ cranes, not available in India)', 'Lightning strike area increases with rotor diameter (more blade surface area)', 'Transportation logistics for 80m+ blades on Indian roads (restricted by infrastructure)', 'No repair-in-place option for large blades — full replacement only'], insurance: ['Per-turbine sum insured jumps from ₹15 Cr (3 MW) to ₹60–100 Cr (14 MW offshore)', 'Crane availability risk magnified — only 2–3 cranes globally can handle 15 MW nacelle (400T+ at 150m height)', 'Serial defect exposure amplified — 100 turbines × ₹60 Cr = ₹6,000 Cr portfolio exposure', 'Blade insurance as separate cover (largest single component cost)'], indianContext: 'India currently has no turbine >5 MW installed onshore. Offshore (2028+) will introduce 10–15 MW class. The insurance market needs to prepare for per-unit exposures 4–8× current fleet average. Crane logistics will dominate BI timelines even more than for current fleet.' },
      { title: 'Repowering Old Wind Farms (Sub-MW Replacement)', icon: '🔄', color: '#4CAF50', purpose: 'Replacing old 250 kW–1.5 MW turbines (15,000+ units, 1990s–2005 vintage) with modern 3–5 MW turbines at same locations. Same land, better wind resource utilisation.', useCases: 'MNRE Repowering Policy 2024 incentivises replacement of turbines >20 years old. Gujarat, Tamil Nadu, Maharashtra sites dominant. 10–15 GW of old fleet eligible for repowering.', risks: ['Transition period: old turbines decommissioned before new ones commissioned — revenue gap', 'Land lease renegotiation risk — original leases may not cover larger turbines', 'Grid infrastructure may not support larger capacity at same connection point', 'Old foundation removal and new foundation construction at same site — geotechnical risk'], insurance: ['Decommissioning liability cover for old turbine removal', 'CAR for new turbine installation at brownfield site', 'Revenue gap insurance during transition (6–18 months between demolition and commissioning)', 'Environmental liability for proper disposal of old blades (non-recyclable fibreglass)'], indianContext: 'India has ~15 GW of wind capacity from pre-2005 vintage that is technically obsolete. These turbines have no spares, no OEM support, and operate at <15% CUF. Repowering at the same sites with modern 4–5 MW turbines could triple generation. The insurance transition from old fleet to new fleet creates a unique coverage gap.' },
    ],
    solar: [
      { title: 'TOPCon / HJT / Perovskite — Next-Gen Cell Technology', icon: '🔬', color: '#F99D27', purpose: 'Moving beyond conventional PERC cells (24% efficiency) to TOPCon (25.5%+), HJT (26%+), and perovskite tandems (30%+ potential). Higher efficiency = less land, fewer modules, lower BOS cost.', useCases: 'India\'s domestic manufacturing (Waaree, Vikram, Premier Energies, Adani) transitioning from PERC to TOPCon (2025–26). HJT pilot lines at Reliance. Perovskite research at IITs/NCPRE.', risks: ['Technology transition risk — existing PERC manufacturing lines become obsolete', 'Unknown long-term degradation patterns for TOPCon/HJT in Indian conditions (heat, humidity)', 'Perovskite stability challenge — lab cells degrade in months vs 25-year warranty needed', 'ALMM compliance lag — new technologies take 6–12 months to get ALMM-listed'], insurance: ['Performance warranty insurance may need recalibration for new cell technologies', 'Manufacturing defect clauses — new production lines have higher infant-mortality defect rates', 'Technology obsolescence risk for module replacements during claims (PERC modules may not be available 5 years from now)', 'Degradation guarantee insurance — underwriting 25-year performance with 2 years of field data'], indianContext: 'India manufactured 50 GW of solar cells/modules in FY26 (up from near-zero in 2020). TOPCon transition is live — Waaree, Premier Energies ramping production. For insurance, the key question is: what happens when a 2024-era PERC module needs replacement in 2030 but only TOPCon is available? Technology mismatch in string replacement creates new claims scenarios.' },
      { title: 'Agri-Voltaics (Agri-PV / Dual-Use Solar)', icon: '🌾', color: '#4CAF50', purpose: 'Installing solar panels above agricultural land — elevated structures allowing farming underneath while generating power above. Addresses India\'s land constraint for solar expansion.', useCases: 'MNRE pilot projects in RJ, GJ, MH. Elevated mounting (3–4m height) for crops below. Also floating solar on reservoirs (NHPC Omkareshwar 600 MW, largest in world planned).', risks: ['Higher structural cost (elevated mounting) — wind loading on tall structures', 'Agricultural operations below can damage cables, structures during harvest', 'Water management complexity — irrigation below + panel cleaning above', 'Floating solar: anchoring failure, water body level variation, cable fatigue from wave motion'], insurance: ['Modified property cover for elevated structures (different wind loading calc)', 'Third-party liability for agricultural operations interacting with solar equipment', 'Floating solar: marine-adjacent cover (anchoring, cable, pontoon degradation)', 'Crop damage liability if solar structure fails and falls on agriculture below'], indianContext: 'India needs 500 GW+ solar to meet net-zero targets but faces land constraints. Agri-PV and floating solar allow dual-use of land/water. The insurance market needs to develop new products — elevated agri-PV has different wind, access, and damage patterns than standard ground-mount. Floating solar on reservoirs is a new asset class with no Indian claims history.' },
      { title: 'Battery Energy Storage + Solar Hybrid (BESS)', icon: '🔋', color: '#B02A30', purpose: 'Co-locating battery storage (Li-ion LFP/NMC) with solar plants for round-the-clock power delivery, peak shaving, and grid ancillary services.', useCases: 'SECI RTC (Round-the-Clock) tenders mandate solar+storage. Greenko 5.2 GWh (pumped hydro) + solar. NTPC 500 MWh BESS at Kudgi. India targeting 42 GWh BESS by 2030.', risks: ['Thermal runaway and fire — NMC chemistry higher risk than LFP', 'Performance degradation of Li-ion (cycle-life limits, calendar aging)', 'Technology obsolescence — current BESS may be outdated in 5 years as solid-state/sodium-ion emerges', 'Single-point-of-failure for hybrid contracts (if BESS fails, RTC obligation breaches PPA)'], insurance: ['BESS-specific fire & explosion cover (UL 9540A compliance as prerequisite)', 'Performance guarantee insurance (capacity retention over contract life)', 'Technology replacement clause (if current chemistry fails, cover cost of modern replacement)', 'BI for hybrid projects must cover the REVENUE PENALTY for failing RTC delivery obligation'], indianContext: 'India\'s BESS market went from near-zero to 5 GWh installed in 3 years. Fire incidents globally (Arizona, South Korea, Australia) have made underwriters cautious. Indian market uses primarily LFP (safer but lower density). Key risk: BESS at solar sites in Rajasthan (45°C+ ambient) faces accelerated degradation without adequate cooling.' },
    ],
    nuclear: [
      { title: 'Small Modular Reactors (SMRs)', icon: '⚛️', color: '#7B1FA2', purpose: 'Factory-built nuclear reactors of 50–300 MWe capacity. Modular construction reduces build time from 10–15 years to 3–5 years. Multiple SMRs at one site for scalable capacity.', useCases: 'India\'s BARC developing indigenous AHWR-300 (Advanced Heavy Water Reactor for thorium fuel). NPCIL evaluating collaboration with NuScale (USA), Rolls-Royce (UK). Target: SMR fleet mode by 2035.', risks: ['No commercially operating SMR anywhere in the world yet (NuScale cancelled US project 2023)', 'Regulatory framework (AERB) not yet adapted for SMR licensing — multi-year approval process', 'Economics unproven at scale — cost advantage over large reactors depends on factory standardisation', 'Thorium-cycle AHWR adds fuel-cycle complexity (thorium breeding)'], insurance: ['Novel technology — no claims history, no actuarial base', 'Construction All Risk for first-of-kind (premium loading: 50–100% over conventional)', 'Modular factory risk vs site-specific risk — new risk allocation model needed', 'Key question: does nuclear liability (CLNDA) apply same way to 50 MWe SMR as 1000 MWe VVER?'], indianContext: 'India\'s three-stage nuclear programme positions it uniquely for thorium-based SMRs. BARC\'s AHWR-300 is designed to use thorium — India has 25% of world\'s thorium reserves. However, no timeline for commercial deployment. Insurance market should start developing SMR-specific wordings now for readiness by 2030s.' },
      { title: 'Thorium Fuel Cycle (Stage 3)', icon: '🌍', color: '#003D50', purpose: 'India\'s three-stage nuclear programme: Stage 1 (PHWR, natural uranium) → Stage 2 (FBR, plutonium breeding) → Stage 3 (thorium-based AHWR). India has 11.93 million tonnes of monazite sand containing thorium — the world\'s largest thorium reserve.', useCases: 'PFBR (Stage 2) achieved criticality in 2025. The plutonium produced will feed Stage 3 thorium reactors. BARC\'s 300 MWe AHWR design uses Th-232 → U-233 fuel cycle. Commercial deployment expected 2040+.', risks: ['30+ year technology timeline — policy and funding continuity risk', 'Thorium-uranium-233 fuel fabrication is complex (high radioactivity of fresh fuel)', 'No country has commercially demonstrated thorium fuel cycle at scale', 'Proliferation concerns (U-233 is weapons-usable) — adds regulatory complexity'], insurance: ['Too early for operational insurance — currently in R&D/experimental reactor phase', 'Construction insurance for experimental thorium facilities (BARC Indore, Kalpakkam labs)', 'Long-term R&D liability cover for DAE/BARC research programmes', 'When commercial (2040+): entirely new insurance product will be needed — no global precedent'], indianContext: 'Thorium is India\'s long-term energy security answer — independence from imported uranium. The programme was conceived by Homi Bhabha in the 1950s. After 70 years, Stage 2 (PFBR) is now operational. Stage 3 is still 15–20 years away. For insurance, the relevance is: understand the pipeline, prepare capability, don\'t underwrite risk that doesn\'t yet exist.' },
      { title: 'Nuclear Hydrogen Production', icon: '💧', color: '#005B75', purpose: 'Using nuclear reactor heat (700–950°C from HTGRs) or nuclear electricity for water electrolysis to produce "pink/purple" hydrogen at massive scale with zero carbon emissions.', useCases: 'India exploring nuclear hydrogen as complement to green hydrogen. BARC studying high-temperature steam electrolysis using PFBR heat. Potential: each 700 MW PHWR could produce 100+ tonnes H2/day using off-peak power.', risks: ['High-temperature reactor technology (HTGR) not yet deployed in India', 'Hydrogen explosion risk at production facility — proximity to nuclear plant amplifies consequence', 'Economics depend on nuclear power cost (currently ₹3.5–4/kWh) vs green H2 from solar (falling below ₹3/kWh)', 'Regulatory separation between nuclear facility and hydrogen plant creates boundary complexity'], insurance: ['Separate property cover for H2 production facility (explosion risk) vs nuclear plant (nuclear exclusion)', 'Business Interruption — does nuclear plant BI extend to hydrogen revenue loss?', 'Third-party liability for hydrogen storage/pipeline adjacent to nuclear site', 'Key gap: boundary definition between nuclear-insured and conventionally-insured portions'], indianContext: 'India\'s National Hydrogen Mission targets 5 MMTPA green hydrogen by 2030. Nuclear hydrogen (pink H2) is a complementary path — using reliable baseload nuclear power for electrolysis. The insurance complexity is the proximity of hydrogen facilities to nuclear installations — clear boundary definitions needed between CLNDA-covered and commercially-covered zones.' },
    ],
    hydro: [
      { title: 'Pumped Hydro Energy Storage (PHES)', icon: '⛰️', color: '#003D50', purpose: 'Storing energy by pumping water to upper reservoir during surplus (daytime solar) and generating during deficit (evening peak). India has 96 GW PHES potential identified.', useCases: 'THDC Tehri PSP (1000 MW, operational 2024). Greenko Pinnapuram (1200 MW, 2025–26). India targeting 18.9 GW PHES by 2032 under National Electricity Plan. Key for integrating 500 GW RE by 2030.', risks: ['Very long construction timelines (6–10 years) with geological uncertainty', 'Reversible pump-turbine technology new to India (Andritz supplying, no domestic OEM)', 'Upper reservoir dam safety — creating a new water body at elevation', 'Round-trip efficiency ~78% means 22% energy loss — economic viability depends on price spread'], insurance: ['Construction All Risk for PHES: 6–10 year policies with geological-conditions sublimits', 'Operational cover for reversible pump-turbines (new asset class for Indian insurers — no claims data)', 'Dam safety cover for upper reservoir (new dam at elevation — different from conventional storage dam)', 'BI must account for dual-revenue model (generation revenue + storage service revenue)'], indianContext: 'India needs 42–84 GWh of long-duration storage to integrate its RE target. PHES is the most mature technology. Tehri PSP (THDC, Andritz turbines) is the first large Indian project. Greenko Pinnapuram is the first private-sector PHES. Insurance market needs to develop PHES-specific wordings — the risk profile is between hydro (water, dam) and BESS (storage service, cycling).' },
      { title: 'Run-of-River with Pondage (Climate-Adaptive Hydro)', icon: '🌊', color: '#007A9E', purpose: 'Modified run-of-river designs with small pondage (hours of storage) to manage increasing variability in Himalayan river flows caused by climate change. Avoids large-dam environmental issues while providing some dispatchability.', useCases: 'New NHPC/SJVN projects in Arunachal Pradesh, Sikkim designed with pondage. Allows 4–8 hours of peak-hour generation even with variable river flows.', risks: ['Climate change altering monsoon patterns — historical hydrological data may not predict future flows', 'Glacial recession reducing base flow (non-monsoon) generation over decades', 'Sedimentation of pondage — small reservoirs fill faster than large dams', 'Environmental compliance: even small pondage triggers Environmental Impact Assessment'], insurance: ['Hydrological risk: actual generation below design — not typically insured but affects BI valuation', 'Pondage dam safety: smaller structures but still NDSA-regulated under Dam Safety Act 2021', 'Climate adaptation: may need rolling 5-year design-flow reassessment for sum insured/BI basis', 'Sedimentation: excluded as gradual process, but sudden sedimentation from landslide IS insurable'], indianContext: 'India\'s 23 GW hydro pipeline is mostly run-of-river to avoid large-dam opposition. But climate variability is making run-of-river less predictable. Pondage provides a buffer. The insurance challenge: how do you underwrite BI for a hydro plant whose generation profile is shifting due to climate change? Historical data increasingly unreliable.' },
      { title: 'Fish-Friendly Turbines & Environmental Flows', icon: '🐟', color: '#4CAF50', purpose: 'New turbine designs (Alden, Natel) that allow fish passage without mortality. Combined with mandated environmental flows (minimum river discharge below dams), these reduce ecological impact but also reduce generation.', useCases: 'India\'s National Green Tribunal mandating e-flows at all new hydro projects. Chamoli, Teesta projects required to release 20–30% of flow as environmental discharge. Reduces generation by 10–20%.', risks: ['Revenue reduction: e-flow mandates reduce generation by 10–20% from design capacity', 'Fish-friendly turbines have lower efficiency (~90% vs 94% conventional Francis)', 'Retrofitting existing plants for e-flow compliance — capex + lost generation', 'Legal risk: NGT/Supreme Court can impose e-flow requirements retroactively on existing plants'], insurance: ['BI valuation must use NET generation (after e-flow deduction), not installed capacity', 'Regulatory shutdown risk: NGT can order stoppage for non-compliance with e-flow mandate', 'Retrofitting cover: CAR/EAR for modifications to install e-flow gates and monitoring systems', 'Revenue warranty: consider parametric trigger if river flow drops below environmental minimum'], indianContext: 'Post-2013 Uttarakhand and post-2021 Chamoli, Indian courts have become increasingly stringent on environmental flows. The Teesta-III project (Sikkim) was ordered to release 30% of flow — reducing revenue by ₹200 Cr/year. For insurers, the lesson is: BI basis must be calculated on ACTUAL generation potential (after e-flows), not theoretical maximum. Any change in e-flow mandate mid-policy is a material change in risk.' },
    ],
  };

  const relevantTechs = sourceTechData[source] ?? sourceTechData.coal;

  const sharedOwnershipChallenges = [
    { challenge: 'Asset Ownership Ambiguity', description: 'Joint ventures or multi-entity ownership complicates insurable interest and policy structuring.', solution: 'ELP & Legal Review: Develop a risk-based ownership matrix and align insurance contracts accordingly. Cross-Stakeholder Alignment Workshops.' },
    { challenge: 'DSU & BI Exposure', description: 'Delays in one segment can impact revenue across the entire project due to integrated infrastructure.', solution: 'DSPP: Digital Scheduling and Planning of Projects — proactive planning and alert systems to prevent delays and minimize DSU impact.' },
    { challenge: 'Interface Risks', description: 'Multiple contractors/vendors increase coordination complexity and claims potential.', solution: 'Skill Refreshment Program (SRP): Train all contractors/vendors on safety, project protocols. ELP Framework: Map contractor interfaces with clear safety protocols.' },
    { challenge: 'Shared/Common Infrastructure', description: 'Substations, grid connections, and access roads often serve multiple projects or phases.', solution: 'Cross-Stakeholder Risk Allocation Framework: Use tailored insurance clauses clearly defining shared asset responsibilities. Fire Adequacy Check with real-time IoT monitoring.' },
    { challenge: 'Partial Commencement', description: 'Phased commissioning leads to overlapping construction and operational risks.', solution: 'DSPP: Track commissioning phases in real-time, ensuring insurance policies are aligned with dynamic project status. Drone Solutions for rapid surveillance.' },
  ];

  const insuranceProducts: Record<PowerRiskSource, { mdCover: string[]; biCover: string[]; keyProducts: string[]; industrySpecific: string[] }> = {
    coal: {
      mdCover: ['Obsolete Part/equipment clause', 'OEM Clause', 'Waiver of Under Insurance', 'Margin Clause', 'Capital Additions', 'Destruction of Sound Property clause', 'Additional Custom Duty', 'Immediate Repair clause', 'Minor Works', 'Expediting expenses (Air & Express Freight)', 'Accidental Damage', 'Serial Loss clause'],
      biCover: ['Customer Premises Extension', 'Additional Increased Cost of Working', 'Prevention of Access', 'Contingent BI'],
      keyProducts: ['Workers Compensation', 'Comprehensive General Liability', 'Business Interruption Losses', 'Mega Risk Policy', 'Fire & Allied Perils'],
      industrySpecific: ['Inspection and overhauling of boilers', 'Overhauling of steam, water and gas turbines and turbo-generator sets', 'Overhauling of electric motors and generators above 1,000 kW', 'Refractory materials and/or masonry in industrial furnaces and boilers', 'Catalysts, Lining, Refractory and Consumable', 'Components along the hot-gas path of gas turbines', 'Repairs to combustion engines (diesel, gas engines)', 'Rewinding of electric machines (motors, generators, transformers)', 'Shut down/start up costs', 'Flue gas purification plants', 'Land and Water Contaminant Cleanup, Removal and Disposal', 'Fire Extinguishing expenses'],
    },
    wind: {
      mdCover: ['Obsolete Part/equipment clause', 'OEM Clause', 'Waiver of Under Insurance', 'Margin Clause', 'Capital Additions', 'Additional Custom Duty', 'Immediate Repair clause', 'Minor Works', 'Expediting expenses (Air & Express Freight)', 'Temporary Removal for repair/refurbishment', 'Accidental Damage', '72 Hours Clause'],
      biCover: ['Customer Premises Extension', 'Additional Increased Cost of Working', 'Prevention of Access', 'Contingent BI'],
      keyProducts: ['Windmill Package Insurance Policy', 'Product Liability', 'Cyber Insurance', 'Burglary & Theft Policy', 'Workers Compensation', 'Comprehensive General Liability'],
      industrySpecific: ['Blade repair/replacement coverage', 'Crane hire costs for major component replacement', 'Serial defect extension', 'Gearbox and main bearing replacement', 'Lightning Protection System (LPS) damage cover', 'Foundation defect coverage', 'Cable and internal road reinstatement', 'Offshore wind specific: Jack-up barge hire, subsea cable repair'],
    },
    solar: {
      mdCover: ['Obsolete Part/equipment clause', 'OEM Clause', 'Waiver of Under Insurance', 'Margin Clause', 'Capital Additions', 'Additional Custom Duty', 'Immediate Repair clause', 'Minor Works', 'Expediting expenses (Air & Express Freight)', 'Temporary Removal for repair/refurbishment', 'Accidental Damage', '72 Hours Clause'],
      biCover: ['Customer Premises Extension', 'Additional Increased Cost of Working', 'Prevention of Access', 'Contingent BI'],
      keyProducts: ['Photovoltaic Panel Warranty Insurance', 'Cyber Insurance', 'Burglary & Theft Policy', 'Product Liability', 'Workers Compensation', 'Comprehensive General Liability'],
      industrySpecific: ['Module degradation/performance warranty cover', 'Hail damage sublimit (enhanced)', 'Tracker mechanism failure cover', 'Inverter replacement coverage', 'DC arc flash & fire extension', 'Theft of modules/cables', 'EL imaging and IV curve testing post-event costs', 'BCD/ALMM compliance delay cover (schedule impact)', 'Vegetation management and fire break maintenance'],
    },
    nuclear: {
      mdCover: ['OEM Clause (BHEL)', 'Waiver of Under Insurance', 'Capital Additions', 'Additional Custom Duty', 'Immediate Repair clause', 'Expediting expenses (Air & Express Freight from BHEL Haridwar)', 'Accidental Damage', 'Nuclear Exclusion Buyback (turbine island only)', '72 Hours Clause', 'Serial Loss clause'],
      biCover: ['Extended Indemnity Period (36 months)', 'Regulatory Delay Extension clause (AERB investigation time)', 'Additional Increased Cost of Working', 'Prevention of Access', 'Contingent BI'],
      keyProducts: ['Property All Risk (turbine island only)', 'Machinery Breakdown', 'Business Interruption', 'Workers Compensation', 'Public Liability (non-nuclear)', 'Comprehensive General Liability'],
      industrySpecific: ['Nuclear exclusion buyback for turbine hall and BOP equipment', 'AERB regulatory shutdown BI extension', 'BHEL single-source dependency clause (extended lead time provision)', 'Steam generator tube sleeving/replacement cover', 'Heavy water contamination cleanup (limited to turbine hall area)', 'Hydrogen system fire cover (generator cooling)', 'Radioactive contamination exclusion (reactor island — covered under INIP)', 'Decommissioning cost exclusion'],
    },
    hydro: {
      mdCover: ['OEM Clause (BHEL/Andritz)', 'Waiver of Under Insurance', 'Capital Additions', 'Additional Custom Duty', 'Expediting expenses (helicopter transport for remote sites)', 'Accidental Damage', '72 Hours Clause', 'Debris Removal (silt/rock clearance)', 'Prevention of Access extension', 'Civil Works limited cover (penstock, tunnel lining)'],
      biCover: ['Extended Indemnity Period (36 months)', 'Seasonal Generation Profile clause', 'Prevention of Access', 'Contingent BI', 'Additional Increased Cost of Working', 'Loss of Water (spillage during outage)'],
      keyProducts: ['Property All Risk (Hydro)', 'Machinery Breakdown', 'Business Interruption', 'Construction All Risk (CAR) for new projects', 'Third-Party Liability (dam breach downstream)', 'Workers Compensation'],
      industrySpecific: ['Turbine runner replacement cover (erosion-induced failure)', 'Penstock rupture cover', 'GLOF / flash flood sublimit (enhanced)', 'Landslide damage to surface infrastructure', 'Dam body exclusion (catastrophic peril — separate arrangement)', 'Tunnel lining collapse cover', 'Desilting chamber damage', 'Silt abrasion exclusion (gradual wear) with buyback for sudden failure', 'Spillway gate mechanism failure', 'Reservoir sedimentation (sudden landslide-triggered only)', 'Access road reinstatement costs'],
    },
  };

  return (
    <div className="space-y-5">
      {/* Emerging Technologies */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">🔬 Emerging Technologies & Insurance Preparedness — {source === 'coal' ? 'Coal/Thermal' : source === 'wind' ? 'Wind' : source === 'solar' ? 'Solar' : source === 'nuclear' ? 'Nuclear' : source === 'hydro' ? 'Hydro' : 'Sector'}</h3>
        <p className="text-[14px] text-gray-400 mb-4">Technology transitions specific to this sector — risks, insurance gaps, and India context</p>
        <div className="space-y-4">
          {relevantTechs.map((tech) => (
            <div key={tech.title} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{tech.icon}</span>
                <h4 className="text-xs font-black text-gray-800">{tech.title}</h4>
              </div>
              <div className="grid grid-cols-1 laptop:grid-cols-2 gap-3 text-[12px] mb-3">
                <div>
                  <p className="font-bold text-gray-600 mb-1">What it is & Indian Use Cases</p>
                  <p className="text-gray-500">{tech.purpose}</p>
                  <p className="text-gray-500 mt-1">{tech.useCases}</p>
                </div>
                <div>
                  <p className="font-bold text-red-700 mb-1">Key Risks & Challenges</p>
                  <ul className="space-y-0.5">{tech.risks.map((r, i) => <li key={i} className="text-gray-600 flex items-start gap-1"><span className="text-red-500">▸</span>{r}</li>)}</ul>
                </div>
              </div>
              <div className="grid grid-cols-1 laptop:grid-cols-2 gap-3 text-[12px]">
                <div className="p-2 rounded-lg bg-green-50 border border-green-100">
                  <p className="font-bold text-green-700 mb-1">🛡️ Insurance Approach</p>
                  <ul className="space-y-0.5">{tech.insurance.map((r, i) => <li key={i} className="text-gray-600 flex items-start gap-1"><span className="text-green-600">✓</span>{r}</li>)}</ul>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="font-bold text-blue-700 mb-1">🇮🇳 India Context</p>
                  <p className="text-gray-600">{tech.indianContext}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Ownership Challenges — relevant for Wind & Solar (multi-developer parks) */}
      {(source === 'wind' || source === 'solar') && (
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">🏗️ Challenges & Solutions — Shared Ownership & Partial Commencement</h3>
        <p className="text-[14px] text-gray-400 mb-4">Common in large RE parks with multiple developers sharing infrastructure</p>
        <div className="space-y-3">
          {sharedOwnershipChallenges.map((item) => (
            <div key={item.challenge} className="p-3 rounded-xl border border-gray-200 grid grid-cols-1 laptop:grid-cols-3 gap-3">
              <div>
                <span className="text-[14px] font-black text-red-700">{item.challenge}</span>
                <p className="text-[14px] text-gray-500 mt-1">{item.description}</p>
              </div>
              <div className="laptop:col-span-2">
                <span className="text-[14px] font-bold text-green-700">Solution:</span>
                <p className="text-[14px] text-gray-600 mt-0.5">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Insurance Products & Add-ons */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">📋 Insurance Products & Key Add-ons — {source === 'coal' ? 'Thermal Power' : source === 'wind' ? 'Wind Energy' : 'Solar Energy'}</h3>
        <p className="text-[14px] text-gray-400 mb-4">Coverages offered for the {source === 'coal' ? 'thermal power' : 'renewable energy'} sector</p>
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-100">
            <h4 className="text-[14px] font-black text-red-800 mb-2">Material Damage Add-ons</h4>
            <ul className="space-y-1">{insuranceProducts[source].mdCover.map((item, i) => <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1"><span className="text-red-400">•</span>{item}</li>)}</ul>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <h4 className="text-[14px] font-black text-blue-800 mb-2">Business Interruption Add-ons</h4>
            <ul className="space-y-1">{insuranceProducts[source].biCover.map((item, i) => <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1"><span className="text-blue-400">•</span>{item}</li>)}</ul>
            <h4 className="text-[14px] font-black text-blue-800 mb-2 mt-4">Key Products</h4>
            <ul className="space-y-1">{insuranceProducts[source].keyProducts.map((item, i) => <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1"><span className="text-blue-400">•</span>{item}</li>)}</ul>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
          <h4 className="text-[14px] font-black text-amber-800 mb-2">⚙️ Industry-Specific Add-ons — {source === 'coal' ? 'Thermal' : source === 'wind' ? 'Wind' : 'Solar'}</h4>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-x-4">
            {insuranceProducts[source].industrySpecific.map((item, i) => <div key={i} className="text-[14px] text-gray-700 flex items-start gap-1 py-0.5"><span className="text-amber-500">▸</span>{item}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function NonInsurableRisks({ source }: { source: PowerRiskSource }) {
  const risks: Record<PowerRiskSource, { title: string; items: string[] }[]> = {
    coal: [
      { title: 'Regulatory & Policy', items: ['Coal allocation cancellation / auction loss', 'Emission norms tightening (FGD mandate delays)', 'Carbon tax / carbon border adjustment', 'Plant retirement orders by Govt/CERC'] },
      { title: 'Fuel Supply', items: ['Coal India supply shortfall / rake shortage', 'Imported coal price volatility', 'Port congestion / logistics disruption', 'Coal quality deterioration (high ash)'] },
      { title: 'Financial / Market', items: ['PPA renegotiation by DISCOMs', 'Merit order dispatch reduction (RE priority)', 'Stranded asset risk (thermal economics declining)', 'Credit rating downgrade of off-taker DISCOM'] },
      { title: 'Transition Risk', items: ['ESG-driven lending restrictions', 'Investor divestment pressure', 'Carbon disclosure requirements', 'Just Transition mandates'] },
    ],
    wind: [
      { title: 'Resource Risk', items: ['Wind speed variability (below P50 projections)', 'Climate change impact on wind patterns', 'Wake effects from nearby wind farms', 'Turbulence-induced fatigue (uninsurable)'] },
      { title: 'Regulatory & Grid', items: ['Curtailment by SLDC / grid operator', 'Must-run status dilution', 'Change in RE policy / tariff revision', 'Land lease disputes / encroachment'] },
      { title: 'Technology Obsolescence', items: ['Older sub-MW turbines becoming uneconomical', 'Spare parts unavailability for legacy turbines', 'OEM exit from India market', 'Repowering regulatory uncertainty'] },
      { title: 'Counterparty', items: ['DISCOM payment delays (6–12 months common)', 'PPA enforcement challenges', 'Open access regulatory changes', 'Banking/wheeling charge increases'] },
    ],
    solar: [
      { title: 'Resource & Degradation', items: ['Soiling losses (dust, bird droppings)', 'Module degradation beyond warranty (LID, PID)', 'Irradiation variability vs P50 estimates', 'Shading from new construction / vegetation'] },
      { title: 'Regulatory & Trade', items: ['BCD / ALMM policy changes', 'Module import restrictions', 'Land use change / agricultural zoning', 'GST rate changes on components'] },
      { title: 'Counterparty & Grid', items: ['DISCOM payment delays / default', 'Grid curtailment (daytime oversupply)', 'Open access charge escalation', 'C&I customer contract termination'] },
      { title: 'Technology & Supply Chain', items: ['Module supply disruption (China dependency)', 'Inverter OEM bankruptcy / exit', 'Cell technology shift (PERC → TOPCon → HJT)', 'Tracker vendor default'] },
    ],
    nuclear: [
      { title: 'Regulatory & Policy', items: ['Atomic Energy Act restrictions — private sector excluded from nuclear generation', 'AERB regulatory delay for new capacity approvals', 'Radioactive waste disposal policy uncertainty', 'Political opposition to new nuclear sites (Jaitapur, Kovvada)'] },
      { title: 'Fuel Supply', items: ['Uranium import dependency (~65% from Kazakhstan/Russia/Canada)', 'TVEL (Russia) fuel supply for Kudankulam — geopolitical risk', 'Domestic uranium shortfall (UCIL production below demand)', 'Heavy water supply concentration (all from Heavy Water Board)'] },
      { title: 'Nuclear Liability', items: ['CLNDA 2010 right-of-recourse clause deters foreign reactor suppliers', 'Unlimited liability risk if liability cap removed by court', 'No domestic nuclear liability insurance market of adequate depth', 'Delayed commissioning triggers liability exposure without generation revenue'] },
      { title: 'Technology & Pipeline', items: ['Long construction timelines (8–15 years for new plants)', 'Single domestic turbine supplier (BHEL) — no alternative for nuclear TG sets', 'VVER fuel supply risk (Russia sanctions scenario)', 'FBR commercialisation risk — PFBR only Stage 2 demonstrator'] },
    ],
    hydro: [
      { title: 'Hydrological / Resource Risk', items: ['Low rainfall year reduces generation by 30–40%', 'Climate change altering monsoon patterns', 'Glacial recession reducing long-term water availability', 'Upstream dam diversions reducing downstream flow'] },
      { title: 'Regulatory & Environmental', items: ['Environmental clearance delays (MoEFCC)', 'Supreme Court moratorium on new Himalayan projects (post-2013)', 'Forest clearance issues (FRA 2006)', 'Dam Safety Act 2021 compliance costs', 'Fish passage/environmental flow requirements'] },
      { title: 'Social & Political', items: ['Community displacement and R&R (resettlement) issues', 'Local political opposition to new dams', 'Inter-state river water disputes', 'Submergence area compensation escalation'] },
      { title: 'Geological & Construction', items: ['Unexpected geological conditions (fault zones in tunnels)', 'Cost overruns from geological surprises (common: 30–100%)', 'Access challenges in Himalayan terrain', 'Labour availability in remote mountain sites'] },
    ],
  };

  return (
    <div className="icici-card p-5">
      <h3 className="text-sm font-black text-gray-800 mb-1">⚠️ Non-Insurable Risks — {source === 'coal' ? 'Coal/Thermal' : source === 'wind' ? 'Wind' : source === 'nuclear' ? 'Nuclear' : 'Solar'}</h3>
      <p className="text-[14px] text-gray-400 mb-4">Risks not typically covered under standard property/engineering insurance policies</p>
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
        {risks[source].map((category) => (
          <div key={category.title} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 mb-2">{category.title}</h4>
            <ul className="space-y-1">
              {category.items.map((item, i) => (
                <li key={i} className="text-[14px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestPractices({ source }: { source: PowerRiskSource }) {
  const practices: Record<PowerRiskSource, { category: string; indian: string[]; international: string[] }[]> = {
    coal: [
      {
        category: 'Risk Engineering & Loss Prevention',
        indian: ['NTPC\'s Condition Monitoring System for turbines (vibration analysis)', 'Tata Power\'s AI-based boiler tube life prediction', 'Adani\'s drone-based stack inspection program'],
        international: ['Allianz AGCS Thermal Power Plant Risk Assessment Framework', 'FM Global HPR (Highly Protected Risk) standards for power plants', 'Munich Re NatCat modeling for coastal plant flood exposure'],
      },
      {
        category: 'Insurance Structuring',
        indian: ['Multi-year policies for large fleets (NTPC model)', 'Agreed sum insured based on reinstatement value not book value', 'Extended indemnity period (24 months) for critical spares'],
        international: ['Parametric covers for business interruption (UK market)', 'Wrap-up programs for construction-to-operation transition', 'Captive insurance programs for large generators (Enel, RWE model)'],
      },
      {
        category: 'Claims Management',
        indian: ['Pre-agreed OEM repair protocols to expedite claims', 'Independent loss adjuster panels (pre-appointed)', 'Annual asset revaluation to avoid underinsurance'],
        international: ['24/7 major loss response teams (Zurich, AXA XL model)', 'Forensic engineering partnerships (Jensen Hughes, Envista)', 'Pre-loss agreements on repair vs replacement methodology'],
      },
    ],
    wind: [
      {
        category: 'Risk Engineering & Loss Prevention',
        indian: ['Suzlon\'s SCADA-based predictive maintenance (Drive-Train monitoring)', 'Inox Wind\'s LPS (Lightning Protection System) upgrade program', 'ReNew\'s drone blade inspection (annual thermal + visual)'],
        international: ['GCube\'s serial defect cover (for systemic blade/gearbox issues)', 'DNV Turbine Advisory — independent design review', 'Vestas Online SCADA — real-time condition monitoring + risk alerts'],
      },
      {
        category: 'Insurance Structuring',
        indian: ['Portfolio-level covers with NCD (No Claim Discount) structures', 'Operational All Risk (OAR) with dedicated WTG wordings', 'Separate MLOP (Machine Loss of Profit) trigger for seasonal loss'],
        international: ['Named windstorm sublimits with reinstatement (Caribbean model)', 'Extended warranty insurance bridging OEM gaps (GCube, Allianz)', 'Blade failure cover with 72-hr waiting period deductible (not annual)'],
      },
      {
        category: 'Claims Best Practices',
        indian: ['Crane pre-booking agreements (advance reservation for claims)', 'Regional spare blade/gearbox depots', 'Photo/video documentation within 24 hrs of loss event'],
        international: ['Concurrent delay protocols (weather vs repair timeline)', 'Independent met mast data for BI validation', 'Pre-agreed blade repair specifications (repair vs replace threshold)'],
      },
    ],
    solar: [
      {
        category: 'Risk Engineering & Loss Prevention',
        indian: ['Adani Green\'s hail early warning system + auto-stow for trackers', 'Tata Power\'s thermal drone inspection (hotspot detection)', 'Avaada\'s module-level monitoring (string-level inverter data analytics)'],
        international: ['Munich Re Solar Risk Assessment Tool (NatCat exposure scoring)', 'TÜV Rheinland module quality auditing (pre-procurement)', 'RETC (Renewable Energy Test Center) — independent module testing'],
      },
      {
        category: 'Insurance Structuring',
        indian: ['Agreed hail sublimits with co-insurance / self-retention layers', 'Defects Liability Period (DLP) covers during EPC-to-O&M transition', 'Technology-specific deductibles (tracker vs fixed-tilt differentiated)'],
        international: ['Parametric hail covers triggered by radar data (Swiss Re model)', 'Solar Revenue Put (SRP) — guaranteed yield cover (US market)', 'Module warranty insurance (insuring OEM warranty obligation)'],
      },
      {
        category: 'Claims Best Practices',
        indian: ['IV curve tracing within 48 hrs post-event (quantifies hidden damage)', 'Electroluminescence (EL) imaging for micro-crack detection', 'Pre-agreed module replacement specifications (same wattage class)'],
        international: ['Pre-loss engineering surveys with hail vulnerability mapping', 'Rapid loss assessment protocols using satellite imagery', 'Independent energy yield modeling for BI claims (Solargis, Meteonorm)'],
      },
    ],
    nuclear: [
      {
        category: 'Risk Engineering & Loss Prevention',
        indian: [
          'NPCIL Condition Monitoring System — vibration analysis on turbine-generators at all plants',
          'AERB periodic safety reviews (PSR) every 10 years for all operating units',
          'KAIGA-1 world record (962 days continuous operation) validates maintenance culture',
          'BHEL predictive maintenance for 700 MWe TG sets at KAPS-3&4',
          'Pre-agreed turbine overhaul protocols with BHEL reducing outage duration',
        ],
        international: [
          'IAEA Nuclear Safety Standards (NUSS) — Operational Safety Assessment (OSART) missions',
          'WANO (World Association of Nuclear Operators) peer reviews — NPCIL participates',
          'FM Global nuclear property risk survey methodology (HPR standards)',
          'Swiss Re Nuclear Risk Assessment framework (physical risk + liability)',
          'OECD-NEA nuclear safety database — comparative benchmarking',
        ],
      },
      {
        category: 'Insurance Structuring',
        indian: [
          'Nuclear liability under Civil Liability for Nuclear Damage Act 2010 (CLNDA) — ₹1,500 Cr operator liability cap',
          'Indian Nuclear Insurance Pool (INIP) — covers nuclear liability above operator cap',
          'Property All Risk cover for turbine island (non-nuclear equipment insured commercially)',
          'Nuclear-specific exclusions in standard policies — turbine island covered, reactor island excluded',
          'BHEL-supplied TG sets: Machinery Breakdown cover with agreed methodology for rotor replacement',
        ],
        international: [
          'Lloyd\'s Nuclear Pools — specialist nuclear property and liability underwriting',
          'European Mutual Association for Nuclear Insurance (EMANI)',
          'Price-Anderson Act model (USA) — 2-tier liability structure: operator + industry pool',
          'Nuclear Pool International (NPI) — cross-pool reinsurance for large nuclear losses',
          'Agreed reinstatement value policies for long-lead nuclear components (18–36 month replacement)',
        ],
      },
      {
        category: 'Claims Management',
        indian: [
          'AERB mandatory incident reporting — all events including near-misses catalogued',
          'Pre-agreed BHEL repair mobilisation protocols for turbine island losses',
          'L&T and Godrej & Boyce on-call for reactor component damage assessments',
          'NPCIL internal insurance committee — coordinates between insurer and regulator',
        ],
        international: [
          'Nuclear specialist loss adjusters (GRS, Cunningham Lindsey Nuclear) for complex claims',
          'IAEA International Fact Finding Expert Mission (IAEA-MAAE) for major incidents',
          'Pre-loss agreements on nuclear exclusion boundaries (what is/isn\'t covered)',
          'Physical damage valuation by independent nuclear engineers (ERIN/Fauske)',
        ],
      },
    ],
    hydro: [
      {
        category: 'Risk Engineering & Loss Prevention',
        indian: [
          'NHPC silt monitoring and turbine runner condition mapping programme',
          'SJVN HVOF coating application for runner blades at Nathpa Jhakri',
          'THDC dam instrumentation — piezometers, inclinometers, seepage monitoring at Tehri',
          'BBMB pre-monsoon gate testing protocol (all 5 dams)',
          'CWC real-time flood monitoring and inflow forecasting (72-hour lead time)',
        ],
        international: [
          'ICOLD (International Commission on Large Dams) safety standards',
          'Andritz SmartHydro — AI-based turbine condition monitoring',
          'Statkraft (Norway) — predictive maintenance framework for hydro fleet',
          'GE Vernova Digital Hydro — digital twin for turbine efficiency optimization',
          'Swiss Re / Munich Re catastrophe modelling for glacial flood risk',
        ],
      },
      {
        category: 'Insurance Structuring',
        indian: [
          'NHPC fleet policies with per-project sublimits (avoids single-project over-concentration)',
          'Agreed seasonal generation profile for BI valuation (monsoon-weighted)',
          'Prevention of Access clause critical for remote Himalayan sites',
          'Separate dam body cover vs powerhouse/turbine cover (split policy structure)',
          'Construction All Risk for the 15+ hydro projects currently under development',
        ],
        international: [
          'Hydro-specific named perils: flood, landslide, GLOF, debris flow (not standard market form)',
          'Dam failure liability: separate high-limit liability programme (Zurich/AXA XL specialist)',
          'Parametric flood covers triggered by river gauge data (Swiss Re pilot programmes)',
          'Multi-year policies for long-construction hydro projects (CAR 8–12 year policies)',
          'IFC (World Bank) political risk insurance for cross-border hydro (Bhutan-India projects)',
        ],
      },
      {
        category: 'Claims Management',
        indian: [
          'Helicopter logistics pre-agreement for emergency spares delivery to remote sites',
          'Pre-identified BHEL/Andritz runner fabrication slots (advance booking for monsoon losses)',
          'CWC dam safety inspection reports as baseline for pre-loss vs post-loss condition',
          'State Disaster Management Authority coordination for access restoration',
        ],
        international: [
          'Specialist hydro loss adjusters (Cunningham Lindsey, Crawford) with dam engineering capability',
          'Remote sensing / satellite imagery for rapid damage assessment at inaccessible sites',
          'Pre-loss bathymetric surveys for reservoir — baseline for sedimentation claims',
          'Independent hydrological expert assessment for flood return period validation',
        ],
      },
    ],
  };

  return (
    <div className="space-y-4">
      {practices[source].map((section) => (
        <div key={section.category} className="icici-card p-5">
          <h3 className="text-sm font-black text-gray-800 mb-3">✅ {section.category}</h3>
          <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-icici-cream to-white border border-gray-100">
              <h4 className="text-[14px] font-bold text-icici-maroon uppercase mb-2">🇮🇳 Indian Market Practices</h4>
              <ul className="space-y-1.5">
                {section.indian.map((item, i) => (
                  <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
              <h4 className="text-[14px] font-bold text-icici-navy uppercase mb-2">🌍 International Best Practices</h4>
              <ul className="space-y-1.5">
                {section.international.map((item, i) => (
                  <li key={i} className="text-[14px] text-gray-700 flex items-start gap-1.5">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Technical Glossary - layered tooltip system for technical terms
// Level 1: One-line definition (shown on hover)
// Level 2: Why it matters for insurance/risk (shown on click)
// Level 3: External reference link (for deep dive)
interface GlossaryEntry {
  short: string;
  detail: string;
  whyItMatters: string;
  reference?: string;
  referenceLabel?: string;
}

const GLOSSARY: Record<string, GlossaryEntry> = {
  'LPS': { short: 'Lightning Protection System — captures lightning current and conducts it safely to ground.', detail: 'A system of receptors (typically on blade tips for wind turbines), down-conductors, and earthing that provides a controlled path for lightning current. Without LPS, lightning can shatter blade tips, burn electronics, and cause fires.', whyItMatters: 'Lightning is the #1 cause of wind turbine claims by volume (45% of all claims). LPS upgrades reduce blade damage frequency by 70%. Insurers should verify LPS compliance during risk surveys. Blade tip receptor burns (₹50 Lakh) are covered under property policies.', reference: 'https://www.windpowerengineering.com/lightning-protection-for-wind-turbines-a-complete-guide/', referenceLabel: 'Wind Power Engineering — LPS Guide' },
  'CBM': { short: 'Condition-Based Maintenance — maintenance triggered by actual equipment condition rather than fixed schedules.', detail: 'Uses sensors (vibration, temperature, oil particle counts, infrared) to monitor equipment health continuously. Maintenance is performed when indicators show degradation — not at fixed calendar intervals. Example: replacing a bearing when vibration exceeds threshold rather than every 5 years regardless.', whyItMatters: 'Plants with active CBM programmes have 40–60% fewer unexpected failures. For insurers, CBM adoption is a positive risk factor — consider NCD or premium discount for plants demonstrating CBM. NTPC\'s fleet-wide CBM reduced forced outages by 35%.', reference: 'https://www.power-eng.com/coal/condition-based-maintenance/', referenceLabel: 'Power Engineering — CBM in Power Plants' },
  'DGA': { short: 'Dissolved Gas Analysis — oil sampling that detects incipient transformer faults.', detail: 'Insulating oil in transformers absorbs gases produced by internal faults (arcing, overheating, corona). By measuring dissolved hydrogen, methane, ethylene, and acetylene levels, DGA can predict 90% of transformer failures 6–12 months before catastrophic breakdown.', whyItMatters: 'A single transformer failure costs ₹15–80 Cr + 12–18 months BI. DGA is the most cost-effective loss prevention tool (~₹5,000 per test). Insurers should mandate quarterly DGA as a policy condition. Rising hydrogen + acetylene = imminent failure warning.', reference: 'https://electrical-engineering-portal.com/dissolved-gas-analysis-dga-of-transformer-oil', referenceLabel: 'EEP — DGA Explained' },
  'PLF': { short: 'Plant Load Factor — ratio of actual generation to maximum possible, expressed as %.', detail: 'PLF = (Actual Generation in MWh) ÷ (Installed Capacity MW × Hours in Period) × 100. A PLF of 64% means the plant generated 64% of what it theoretically could have if running at full capacity 24/7. India\'s coal fleet average: 64% FY25. NTPC fleet: ~72%.', whyItMatters: 'PLF directly determines BI exposure — a 500 MW unit at 70% PLF generates ₹3.5 Cr/day revenue. Declining PLF (from RE merit-order displacement) reduces BI risk in absolute terms but may make fixed-cost recovery harder for the operator. PLF below 55% signals potential financial distress.', reference: 'https://cea.nic.in/dashboard/?lang=en', referenceLabel: 'CEA — PLF Dashboard' },
  'CUF': { short: 'Capacity Utilisation Factor — equivalent of PLF for renewable sources.', detail: 'Same calculation as PLF but used for solar, wind, hydro, nuclear. Solar CUF of 18% means average generation equals 4.3 hours of full-rated output per day. Wind CUF ~22%. Nuclear CUF ~78.6% (highest). Low CUF doesn\'t mean underperformance — it reflects resource availability (sunlight hours, wind speed).', whyItMatters: 'CUF determines BI valuation for RE assets. Solar at 18% CUF: 100 MW plant generates ~₹25–35 Lakh/day. Nuclear at 78.6%: 1000 MW generates ~₹7 Cr/day. For BI calculation, always use ACTUAL CUF (from historical data), not rated capacity.', reference: 'https://mnre.gov.in/en/physical-progress/', referenceLabel: 'MNRE — Physical Progress (CUF data)' },
  'BI': { short: 'Business Interruption — insurance cover for revenue loss when a plant cannot operate due to insured damage.', detail: 'BI pays the insured\'s lost revenue (or increased cost of working) during the period between an insured material damage event and restoration of operations. Key parameters: indemnity period (max cover duration), waiting period (deductible in days), and revenue basis (gross profit or revenue). For power: BI often exceeds MD (material damage) for major events.', whyItMatters: 'In power sector, BI typically represents 60–80% of total claim value for major losses. A turbine failure (MD: ₹80 Cr) with 14-month repair causes BI of ₹150–200 Cr. Indemnity period MUST cover worst-case repair + supply chain + regulatory approval time. Under-insured BI is the #1 coverage gap in Indian power.', reference: 'https://www.insuranceinstituteofindia.com/', referenceLabel: 'III — Business Interruption Principles' },
  'EMV': { short: 'Expected Monetary Value — risk quantification: Probability × Financial Impact.', detail: 'EMV = P(event) × £(impact if event occurs). Used in ISO 31000 risk assessment to prioritise risks. Example: Turbine failure probability 5%/year × impact ₹200 Cr = EMV ₹10 Cr/year. Helps compare unlike risks on a common monetary scale.', whyItMatters: 'EMV is the foundation of risk-based pricing. Insurers use EMV (adjusted for expenses, profit margin, and reinsurance) to set premium rates. For power plants, highest-EMV events are typically: boiler explosion (thermal), cyclone (wind/solar), and GLOF (hydro).', reference: 'https://www.iso.org/iso-31000-risk-management.html', referenceLabel: 'ISO — 31000 Risk Management Standard' },
  'AOG': { short: 'Act of God — natural catastrophe perils beyond human control.', detail: 'In insurance terms: events caused by nature — flood, cyclone, earthquake, lightning, storm, landslide, tsunami. Distinguished from Non-AOG (man-made/operational) perils like machinery breakdown, fire, explosion. The AOG/Non-AOG distinction matters for deductible structures and policy sections.', whyItMatters: 'In Indian power insurance: AOG section typically covers flood, cyclone, earthquake. Non-AOG section covers machinery breakdown, fire. Different deductibles may apply. Coastal plants (Mundra, Kudankulam, Tuticorin) need higher AOG sublimits. Climate change is increasing AOG frequency for Indian power sector.', reference: 'https://www.irdai.gov.in/', referenceLabel: 'IRDAI — Insurance Regulatory Authority' },
  'FGD': { short: 'Flue Gas Desulphurisation — removes SO₂ from coal plant exhaust.', detail: 'Wet limestone FGD sprays lime slurry into flue gas, absorbing SO₂ to produce gypsum. Mandated by CPCB (Central Pollution Control Board) for ALL Indian coal plants. Deadline extended repeatedly — current: 2027. Capex: ~₹2,400 Cr per 2×660 MW station. BHEL is primary EPC contractor.', whyItMatters: 'Non-compliance with FGD deadline risks regulatory shutdown (a form of BI not covered under standard policies). Plants without FGD face forced retirement. During FGD installation (12–24 months retrofit), the plant operates with additional construction risk. CAR cover needed during retrofit.', reference: 'https://cpcb.nic.in/', referenceLabel: 'CPCB — Emission Standards' },
  'SCADA': { short: 'Supervisory Control and Data Acquisition — remote monitoring system for power assets.', detail: 'SCADA collects real-time data from sensors across a power plant or wind/solar farm (temperatures, pressures, power output, vibration, weather) and presents it to operators for monitoring and control. Modern SCADA includes AI/ML for anomaly detection and predictive maintenance.', whyItMatters: 'For wind farms, SCADA data is ESSENTIAL for BI claims validation — it proves exactly when a turbine stopped and what caused it. Solar SCADA proves curtailment vs equipment failure. Insurers should request SCADA access during claims investigation. Plants without SCADA have longer claims settlement (no objective data).', reference: 'https://www.gevernova.com/software/products/digital-wind-farm', referenceLabel: 'GE Vernova — Digital Wind Solutions' },
  'EL Imaging': { short: 'Electroluminescence Imaging — detects invisible micro-cracks in solar cells.', detail: 'A technique where current is passed through solar modules and the resulting infrared light emission is captured by a camera. Cracked cells appear as dark spots. Detects damage invisible to the naked eye — essential post-hail/cyclone. Must be done in darkness. Cost: ~₹200/module.', whyItMatters: 'Post-hailstorm, visual inspection misses 30% of damaged modules (hidden micro-cracks). These cracked modules show normal output initially but degrade rapidly over 6–12 months (hotspots → fire risk). Insurers should mandate EL imaging within 48 hours of any hail event as a claims condition.', reference: 'https://www.pv-magazine.com/', referenceLabel: 'PV Magazine — EL Imaging Guide' },
  'LEP': { short: 'Leading Edge Protection — coatings on wind turbine blade tips to prevent erosion.', detail: 'The leading edge (front-facing surface) of a wind turbine blade travels at up to 350 km/h at the tip. Rain, sand, and insects erode the surface over time, creating roughness that reduces aerodynamic efficiency and eventually causes structural damage. LEP coatings (polyurethane tapes/paints) protect this surface.', whyItMatters: 'Blade leading edge erosion is insurable only when it causes STRUCTURAL failure (not gradual wear). LEP extends blade life by 5–8 years, reducing the probability of an insurable event. Surveyors should check LEP status during risk inspections. Missing/degraded LEP = higher failure probability.', reference: 'https://www.compositesworld.com/articles/leading-edge-protection-for-wind-turbine-blades', referenceLabel: 'Composites World — LEP Technology' },
  'DFIG': { short: 'Doubly-Fed Induction Generator — most common wind turbine generator.', detail: 'A type of AC generator used in ~70% of geared wind turbines. The "doubly-fed" design connects both stator AND rotor to the grid (through a power converter), allowing variable-speed operation. Has slip rings and brushes that wear — a common maintenance item.', whyItMatters: 'Slip ring failure is a frequent but low-cost event (₹5–15 Lakh, 2–5 days repair). Generator winding burnout is rare but expensive (₹50 Lakh–2 Cr + 3–6 months). Humid coastal environments accelerate insulation degradation. Turbines shifting to permanent magnet generators (PMG) have fewer moving parts but higher cost.', reference: 'https://www.nrel.gov/wind/', referenceLabel: 'NREL — Wind Energy Research' },
  'BCD': { short: 'Basic Customs Duty — 40% import duty on solar modules/cells imposed in April 2022.', detail: 'India imposed 40% BCD on solar module imports and 25% on cell imports from April 2022 to promote domestic manufacturing under "Make in India". Result: module replacement costs increased 30–40% for claims, and lead time extended by 2 months (domestic sourcing required under ALMM).', whyItMatters: 'BCD directly impacts insurance claims cost for solar plants. A ₹100 Cr module replacement pre-BCD now costs ₹130–140 Cr. BI is extended by 2 months due to domestic sourcing constraint. Policy sum insured MUST be revised upward post-BCD. "BCD/ALMM delay clause" now standard in solar insurance.', reference: 'https://mnre.gov.in/', referenceLabel: 'MNRE — Solar Policy Updates' },
  'ALMM': { short: 'Approved List of Models & Manufacturers — only MNRE-listed solar modules allowed.', detail: 'MNRE maintains a list of approved solar module manufacturers and models (ALMM). Government/SECI projects must use ONLY ALMM-listed modules. For claims: replacement modules must also be ALMM-compliant, limiting choices and potentially extending lead time.', whyItMatters: 'During claims, ALMM compliance restricts module replacement options. If the original manufacturer is not ALMM-listed (or has exited), finding a compliant alternative with matching specs (voltage, wattage) can take 4–8 weeks extra. Policy wording should acknowledge ALMM compliance requirement.', reference: 'https://almm.mnre.gov.in/', referenceLabel: 'MNRE — ALMM Database' },
  'MC4': { short: 'Multi-Contact 4mm connector — standard DC connector in solar wiring.', detail: 'The universal connector used between solar modules and to combiner boxes. Rated for 30+ year outdoor life. Failure mode: corrosion/loosening over time creates resistance → heat → arc flash → fire. MC4 connector failure is the #1 cause of DC arc flash fires at solar plants.', whyItMatters: 'Annual infrared thermography of ALL MC4 connectors detects hot spots (resistance anomalies) before they become arc flash fires. A single failed MC4 can destroy 5–20 MW of modules in minutes (dry conditions accelerate fire spread). Insurers should mandate annual IR scanning as risk improvement.', reference: 'https://www.solarpowerworldonline.com/', referenceLabel: 'Solar Power World — Connector Safety' },
  'HPR': { short: 'Highly Protected Risk — FM Global standard for superior loss prevention.', detail: 'FM Global (Factory Mutual) classifies properties as HPR when they meet stringent fire protection, construction, and maintenance standards. HPR-classified plants qualify for lower insurance rates (10–30% premium reduction) because they have demonstrably lower loss probability.', whyItMatters: 'In Indian power sector, very few plants achieve full HPR status (mostly NTPC Tier-1 stations with full fire systems, sprinklers, detection, and management commitment). HPR is aspirational for most state gencos. Gap between HPR standard and actual Indian plant condition = the risk that insurers price.', reference: 'https://www.fmglobal.com/research-and-resources', referenceLabel: 'FM Global — HPR Standards' },
  'OAR': { short: 'Operational All Risk — policy covering all risks during power plant operation.', detail: 'An "all risks" policy that covers physical loss/damage to an operational power plant from ANY cause UNLESS specifically excluded. Broader than named-peril policies. Standard exclusions: wear & tear, gradual deterioration, nuclear perils, war. Covers both AOG and Non-AOG perils in a single policy.', whyItMatters: 'OAR is the standard market form for large Indian power plants. Key advantage: burden of proof is on insurer to prove exclusion applies (vs named-peril where insured must prove covered event). Policyholder benefits from OAR when unusual/novel damage events occur that wouldn\'t fit named perils.', reference: 'https://www.irdai.gov.in/', referenceLabel: 'IRDAI — Policy Guidelines' },
  'MLOP': { short: 'Machine Loss of Profit — BI specifically triggered by machinery breakdown.', detail: 'MLOP covers revenue loss when a machine (turbine, generator, boiler) breaks down — as distinguished from BI triggered by fire or natural perils. Some insurers combine BI + MLOP; others keep them separate. MLOP typically has its own waiting period and indemnity period.', whyItMatters: 'In power sector, machinery breakdown (turbine blade failure, generator winding burnout) is the most common cause of extended BI — not fire or natural catastrophe. MLOP is therefore the most critical BI coverage for thermal and nuclear plants. Ensure MLOP indemnity period matches worst-case repair time (18–24 months for turbine rotors).', reference: 'https://www.swissre.com/', referenceLabel: 'Swiss Re — Engineering Insurance' },
  'NCD': { short: 'No Claim Discount — premium reduction for claim-free years.', detail: 'A cumulative discount on renewal premium for each year without a claim. Typically 5–10% per year, accumulating up to 30–40%. Resets to zero after a claim. Encourages loss prevention and rewards good operators.', whyItMatters: 'Nuclear power plants (highest CUF, lowest claim frequency) are the best NCD candidates in the power sector. A well-maintained PHWR fleet could accumulate 30%+ NCD over 5 years. For insurers, NCD programs build long-term client relationships and reduce churn. State gencos with aging fleets rarely sustain NCD.', reference: 'https://www.insuranceinstituteofindia.com/', referenceLabel: 'III — Discounting Principles' },
  'CLNDA': { short: 'Civil Liability for Nuclear Damage Act 2010 — India\'s nuclear liability law.', detail: 'Caps operator (NPCIL) liability at ₹1,500 Cr per nuclear incident. Government covers up to SDR 300 million (~₹3,400 Cr). Unique "right of recourse" clause allows NPCIL to sue equipment suppliers if their defect caused the incident — this clause deters foreign reactor suppliers.', whyItMatters: 'CLNDA right-of-recourse has blocked Westinghouse (AP1000) and EDF (EPR) from entering India for years. For insurers: nuclear liability is covered by Indian Nuclear Insurance Pool (INIP), not commercial market. The commercially insurable portion is ONLY the turbine island (non-nuclear equipment).', reference: 'https://www.aerb.gov.in/', referenceLabel: 'AERB — Nuclear Regulatory Framework' },
  'AERB': { short: 'Atomic Energy Regulatory Board — India\'s nuclear safety regulator.', detail: 'Established 1983 under Atomic Energy Act 1962. Regulates all nuclear installations in India. Sets safety standards, grants operating licenses, conducts inspections, and can order plant shutdowns. Any reportable event triggers AERB investigation — which adds months to any BI claim timeline.', whyItMatters: 'AERB investigation after ANY incident at a nuclear plant (even non-nuclear turbine island events) adds 3–6 months to restart timeline. This is the single most important nuclear-specific BI consideration. Policy wording MUST include "regulatory delay extension" clause to cover AERB investigation period.', reference: 'https://www.aerb.gov.in/english/regulatory-framework', referenceLabel: 'AERB — Regulatory Framework' },
  'PHWR': { short: 'Pressurised Heavy Water Reactor — India\'s indigenous nuclear reactor design.', detail: 'Uses natural uranium fuel and heavy water (D₂O) as both moderator and coolant. India has 19 PHWR units (220 MWe) + 2 PHWR-700 units. Based on Canadian CANDU design, fully indigenised after 1974 sanctions. BHEL supplies all turbine-generators.', whyItMatters: 'PHWRs are the backbone of India\'s nuclear fleet. Key insurance fact: PHWR coolant is heavy water (D₂O) which is expensive (~₹30,000/litre) but non-radioactive in itself. A D₂O leak is an operational/financial event (D₂O recovery), not a radiation event. PHWR CUF averages 80%+ — excellent operational reliability.', reference: 'https://npcil.nic.in/', referenceLabel: 'NPCIL — Reactor Information' },
  'VVER': { short: 'Water-Water Energetic Reactor — Russian-designed pressurised water reactor.', detail: 'Russian PWR design by Rosatom. India has 2 VVER-1000 units at Kudankulam (TN), with 2 more under construction. Uses low-enriched uranium fuel imported from Russia (TVEL). Light water coolant/moderator. 1000 MWe each — India\'s largest nuclear units.', whyItMatters: 'Key risk: fuel supply dependency on Russia. Strategic reserve of 18 months exists at site. Any disruption to Russia-India nuclear cooperation (sanctions, geopolitics) could affect KKNPP generation within 2 years. For insurers: KKNPP has highest individual-unit BI exposure in Indian nuclear (₹7 Cr/day per unit).', reference: 'https://www.rosatom.ru/en/', referenceLabel: 'Rosatom — VVER Technology' },
  'GLOF': { short: 'Glacial Lake Outburst Flood — catastrophic flood from glacial lake failure.', detail: 'Glacial lakes form behind moraines (natural rock/ice dams) in high mountains. Climate warming causes these dams to fail suddenly, releasing massive volumes of water. The resulting flood carries debris (rocks, sediment, ice) at high velocity down Himalayan valleys — destroying everything in its path.', whyItMatters: 'GLOF is the emerging catastrophic peril for Himalayan hydro. The 2021 Chamoli disaster (₹1,500 Cr) was triggered by a glacial collapse. GLOF events have no warning time (unlike river floods). All Himalayan hydro projects within 50 km of glacial systems should be assessed for GLOF exposure. Insurance: typically covered under flood/AOG section but sublimits may be inadequate.', reference: 'https://cwc.gov.in/', referenceLabel: 'CWC — Flood Monitoring' },
  'HHI': { short: 'Herfindahl-Hirschman Index — measures market/technology concentration.', detail: 'HHI = sum of squared market shares. Ranges from 0 (perfect diversity) to 10,000 (monopoly). In power sector context: measures how concentrated capacity is across technologies or states. HHI < 1500 = diversified, 1500–2500 = moderate concentration, >2500 = high concentration.', whyItMatters: 'Used in Risk Intelligence scoring for Supply and Geographic risk. India\'s technology HHI is ~3200 (coal-dominated) — indicating high concentration risk. If a single technology (coal) fails across the fleet simultaneously (e.g., rail coal supply disruption), it affects 67% of generation. Portfolio-level insurance should reflect HHI-driven accumulation risk.', reference: 'https://www.justice.gov/atr/herfindahl-hirschman-index', referenceLabel: 'US DoJ — HHI Definition' },
  'INIP': { short: 'Indian Nuclear Insurance Pool — covers nuclear liability above operator cap.', detail: 'Established under CLNDA 2010. A pool of Indian insurers that collectively underwrites nuclear third-party liability. Covers liability ABOVE the ₹1,500 Cr operator cap up to the SDR 300 million government limit. Managed by GIC Re (reinsurer).', whyItMatters: 'INIP handles the nuclear-specific liability that commercial insurers cannot cover. The turbine island (non-nuclear) is insured through STANDARD commercial market. The boundary between INIP-covered (reactor island) and commercially-covered (turbine island) is clearly defined by AERB. Insurers writing turbine island cover must have absolute clarity on this boundary.', reference: 'https://www.gicofindia.com/', referenceLabel: 'GIC Re — Indian Nuclear Pool' },
};

function TechTerm({ term }: { term: string }) {
  const [showLevel, setShowLevel] = useState<0 | 1 | 2>(0);
  const entry = GLOSSARY[term];
  if (!entry) return <span className="font-bold">{term}</span>;

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => { if (showLevel === 0) setShowLevel(1); }}
        onMouseLeave={() => { if (showLevel === 1) setShowLevel(0); }}
        onClick={(e) => { e.stopPropagation(); setShowLevel(showLevel === 2 ? 0 : 2); }}
        className="font-bold text-icici-navy underline decoration-dotted underline-offset-2 cursor-help"
        title="Hover for definition. Click for full detail."
      >
        {term} <span className="text-[10px] opacity-60">ℹ️</span>
      </button>
      {showLevel >= 1 && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-900 text-white text-[12px] rounded-xl shadow-2xl z-50 leading-relaxed pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <span className="font-black text-icici-orange text-[13px]">{term}</span>
          <p className="mt-1">{entry.short}</p>
          {showLevel === 2 && (
            <>
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[11px] text-white/70 uppercase font-bold mb-1">Detailed Explanation</p>
                <p className="text-[11px] text-white/90">{entry.detail}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[11px] text-amber-300 uppercase font-bold mb-1">Why It Matters for Insurance</p>
                <p className="text-[11px] text-white/90">{entry.whyItMatters}</p>
              </div>
              {entry.reference && (
                <a href={entry.reference} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-300 hover:text-blue-200 font-bold">
                  📚 Learn more: {entry.referenceLabel ?? 'External Reference'} ↗
                </a>
              )}
            </>
          )}
          {showLevel === 1 && (
            <button onClick={(e) => { e.stopPropagation(); setShowLevel(2); }} className="mt-1 text-[10px] text-blue-300 font-bold hover:text-blue-200">
              ▼ Click for full detail + insurance relevance
            </button>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

// Export TechTerm and GLOSSARY for use in other components
export { TechTerm, GLOSSARY };

// Impact area term explanations — shown inline on hover for layman understanding
const IMPACT_TOOLTIPS: Record<string, string> = {
  // Coal/Thermal
  'boiler tube burst (erosion/corrosion)': 'Tubes inside the boiler carry water/steam. Over time, hot gas erodes them thin. When they burst, high-pressure steam escapes — forcing immediate shutdown. Repair: 2–4 weeks, ₹5–15 Cr.',
  'drum weld failure': 'The boiler drum is a large pressure vessel where water separates from steam. A weld defect can cause it to crack under pressure — catastrophic if not detected early. DGA equivalent for boilers is ultrasonic testing.',
  'economizer leak': 'The economizer pre-heats feedwater using exhaust gas heat. Tube leaks here reduce efficiency and can cascade to larger failures if not addressed. Lower severity than superheater failures.',
  'steam line rupture': 'High-pressure steam pipes (>150 bar, 537°C) can rupture from creep or erosion. Extremely dangerous — steam at this temperature is invisible and lethal. The NTPC Unchahar 2017 explosion was a steam line event.',
  'lp/hp blade failure': 'Turbine blades spin at 3000 RPM inside the turbine. LP (Low Pressure) blades are the longest and most erosion-prone. HP (High Pressure) blades operate at highest temperature. Either failure = major outage.',
  'rotor rub / misalignment': 'If the heavy turbine rotor (20–50 tonnes) shifts even 0.1mm from centre, the blades can rub against the casing — generating extreme heat and vibration. Causes: bearing wear, thermal distortion, foundation settlement.',
  'generator winding burnout': 'Copper windings in the generator carry thousands of amps. Insulation degradation (from moisture, heat, age) causes short circuits that burn out the winding. Rewinding: 6–12 months, ₹30–60 Cr.',
  'bearing seizure': 'Journal bearings support the rotor on an oil film. If oil supply fails or is contaminated, metal-to-metal contact causes the bearing to seize — potentially damaging the rotor journal. Emergency event.',
  'coal mill fire/explosion': 'Coal is ground to fine powder in mills before burning. Fine coal dust is explosive. If mill temperature exceeds ~90°C or CO builds up, ignition can occur. Fire suppression systems (inert gas, CO₂) are critical.',
  'turbine oil fire': 'Turbine lubrication oil (~10,000 litres) at 200°C can ignite if it contacts hot surfaces or leaks onto them. Oil fires spread fast in turbine halls. Hydrogen-cooled generators add explosion risk.',
  'cable gallery fire': 'Power and control cables run in underground galleries. A cable fire can disable multiple systems simultaneously — similar to NAPS-1 (1993) where cable fire severed control room connections.',
  'hydrogen system leak/explosion': 'Large generators use hydrogen gas for cooling (lighter and more efficient than air). H₂ is explosive at 4–75% concentration in air. A seal leak + ignition source = turbine hall explosion.',
  'winding insulation breakdown': 'Transformer windings are insulated with paper and oil. Over decades, heat degrades the paper. Once insulation fails, internal arcing occurs — potentially causing transformer explosion and oil fire.',
  'bushing failure': 'Bushings are the insulated connectors where high-voltage cables enter/exit the transformer. They operate at extreme voltages (400kV). Flashover or cracking causes immediate failure + potential fire.',
  'tap changer malfunction': 'On-Load Tap Changers (OLTC) adjust transformer voltage ratio while energized. They have moving contacts in oil — wear and arcing are normal. Malfunction can cause internal faults.',
  'boiler feed pump seizure': 'BFP pushes water at >200 bar pressure into the boiler. It\'s one of the largest rotating machines in the plant. Seizure (bearing/impeller failure) stops water flow to boiler — immediate unit trip.',
  'id/fd fan blade failure': 'Induced Draft (ID) and Forced Draft (FD) fans move combustion air through the boiler. Fan blades (1–2m long) can crack from fatigue. ID fans handle hot, erosive flue gas — more failure-prone.',
  'coal mill gearbox failure': 'Coal mills use heavy gearboxes to grind coal. Gear tooth pitting, bearing failure, or oil contamination can seize the gearbox. Each 500 MW unit has 4–6 mills — one mill loss reduces capacity 15–20%.',
  'esp rapper damage': 'Electrostatic Precipitators (ESP) use rappers (mechanical hammers) to shake collected ash off plates. Rapper failure means ash builds up → reduced collection efficiency → emission violation.',
  // Wind
  'blade root crack/delamination': 'Where the blade attaches to the hub (root joint). Cyclic loading over millions of rotations can cause adhesive debonding or fibreglass delamination. If undetected, the blade can separate from hub — catastrophic.',
  'tower buckling at base': 'Wind turbine towers (80–150m tall steel tubes) resist enormous bending forces from wind. If design wind speed is exceeded (cyclone), the base section can buckle — tower collapse results.',
  'nacelle detachment': 'The nacelle (housing containing gearbox, generator, controls) sits atop the tower on a yaw bearing. Extreme wind or yaw system failure can cause it to detach — total loss of the WTG.',
  'yaw system failure': 'The yaw system rotates the nacelle to face into the wind. If it fails during a storm, the turbine is loaded from the side (not designed for this) — extreme stress on blades and tower.',
  'main bearing failure': 'The main bearing supports the entire rotor assembly (3 blades + hub = 50–150 tonnes). Replacement requires the largest cranes available — 500T+ crane, 3–6 month wait in India.',
  'planetary gear damage': 'Gearboxes convert slow rotor speed (15 RPM) to fast generator speed (1500 RPM). Planetary gear stages handle enormous torque. Gear tooth pitting from fatigue is the #1 gearbox failure mode.',
  'oil system contamination': 'Gearbox oil must be ultra-clean. Water ingress, metal particles, or wrong oil grade accelerates wear exponentially. Monthly oil particle counting is the early warning system.',
  'leading edge erosion (sand/rain)': 'Blade tips travel at 300+ km/h. Rain drops and sand particles impact like bullets — eroding the surface over years. Creates roughness that reduces power output and eventually structural cracks.',
  'spar cap delamination': 'The spar cap is the structural backbone of the blade (carbon/glass fibre beam). Manufacturing defects or fatigue can cause layers to separate (delaminate) — blade becomes structurally unsafe.',
  'foundation defect': 'WTG foundations must resist millions of cyclic loading events. Grout cracking, anchor bolt loosening, or concrete degradation can cause tower tilt. Rare but catastrophic if tower collapses.',
  // Solar
  'module blowoff (clamp failure)': 'Solar modules are held by clamps to mounting structures. High winds (>120 km/h) can rip modules off if clamps are undersized or corroded. Tracker systems with failed stow are most vulnerable.',
  'tracker torque tube buckling': 'Single-axis trackers use torque tubes to rotate module rows. Cyclone-force winds on unstowed trackers exceed design loads — tubes buckle, collapsing entire rows.',
  'cell micro-cracks (hidden damage)': 'Hailstones create invisible cracks in solar cells. Cells still work initially but degrade rapidly over months (hotspots form at crack boundaries). Only detectable by EL imaging, not visual inspection.',
  'inverter/transformer submersion': 'Flood water entering inverter stations or transformers causes immediate electrical failure. Salt water (coastal floods) is worse — corrosion makes equipment irreparable.',
  'dc arc flash at connector': 'When DC connectors (MC4) degrade, resistance increases → heat builds → arc flash ignites. DC arcs are harder to extinguish than AC (no zero-crossing). Can reach 5000°C in milliseconds.',
  'module hotspot → backsheet fire': 'A damaged cell (cracked, shaded, or disconnected) becomes a resistor instead of a generator. It heats up (hotspot) and can ignite the plastic backsheet — starting a fire that spreads through dry vegetation.',
  // Hydro
  'powerhouse inundation': 'Underground or semi-underground powerhouses can flood if river levels exceed intake design or dam overtops. All electrical equipment (generators, transformers, control systems) is destroyed by water ingress.',
  'penstock/intake structure damage': 'The penstock is a large steel pipe carrying water from reservoir to turbines under high pressure (50–500m head). Debris-laden flood water can dent, block, or rupture the penstock.',
  'turbine runner erosion from silt': 'Himalayan rivers carry 2000–10000 ppm silt during monsoon. This sand blasts the turbine runner blades at high velocity, eroding the stainless steel surface. Runners need replacement every 3–5 years in severe cases.',
  'headrace tunnel collapse': 'Long tunnels (5–30 km) carrying water from intake to powerhouse. Geological instability (fault zones, water pressure) can cause tunnel lining to crack or roof to collapse.',
  'foundation scour/undermining': 'Fast-flowing flood water can erode soil/rock beneath foundations. If a dam or powerhouse foundation is undermined, structural failure can follow. Most dangerous during extreme flood events.',
  // Nuclear
  'turbine hall flooding': 'Nuclear turbine halls contain the same steam turbines as thermal plants (insurable). Coastal flooding (tsunami, cyclone surge) can inundate these — same damage as conventional thermal, but AERB investigation adds months.',
  'seawater intake pump damage': 'Nuclear plants need continuous cooling water. Seawater intake pumps are critical — if all fail simultaneously (Fukushima scenario), emergency cooling must activate. Pump damage from debris/flooding is insurable.',
  'diesel generator failure (emergency backup loss)': 'Emergency diesel generators provide backup power if grid connection is lost. They must start within seconds. Flooding of diesel generators was the key failure at Fukushima (2011).',
  'regulatory shutdown order': 'AERB can order any nuclear plant shut for safety investigation — even for non-nuclear events (turbine fire, transformer failure). This regulatory shutdown adds 3–12 months to any BI claim timeline.',
};

function ImpactTermTag({ area, tooltip, knowledge }: { area: string; tooltip: string; knowledge: KnowledgeEntry | null }) {
  const [showKnowMore, setShowKnowMore] = useState(false);

  return (
    <>
      <span
        className="text-[14px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-medium cursor-help relative group"
        onClick={() => { if (knowledge) setShowKnowMore(!showKnowMore); }}
      >
        {area} {knowledge ? <span className="text-[10px] opacity-60">ℹ️</span> : null}
        {/* Hover tooltip */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-72 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="font-bold text-blue-300">{area}</span>
          <br />{tooltip}
          {knowledge && <><br /><span className="text-blue-300 font-bold mt-1 inline-block">👆 Click for detailed "Know More"</span></>}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      </span>

      {/* Know More Panel */}
      {showKnowMore && knowledge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowKnowMore(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Image header */}
            {knowledge.imageUrl && (
              <div className="h-40 rounded-t-2xl overflow-hidden relative">
                <img src={knowledge.imageUrl} alt={knowledge.imageAlt ?? area} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white text-lg font-black">{area}</h3>
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              {!knowledge.imageUrl && <h3 className="text-lg font-black text-gray-800">{area}</h3>}

              {/* What it is */}
              <div>
                <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1">What is this?</h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">{knowledge.detail}</p>
              </div>

              {/* Why it happens */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <h4 className="text-[12px] font-bold text-amber-800 uppercase tracking-wide mb-1">⚠️ Why does this happen? (Root Causes)</h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">{knowledge.rootCause}</p>
              </div>

              {/* Real incident */}
              {knowledge.incident && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <h4 className="text-[12px] font-bold text-red-800 uppercase tracking-wide mb-1">📋 Real Incident</h4>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{knowledge.incident}</p>
                </div>
              )}

              {/* Cost */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <h4 className="text-[12px] font-bold text-purple-800 uppercase tracking-wide mb-1">💰 Typical Financial Impact</h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">{knowledge.typicalCost}</p>
              </div>

              {/* Prevention */}
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <h4 className="text-[12px] font-bold text-green-800 uppercase tracking-wide mb-1">🛡️ How to Prevent / Detect Early</h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">{knowledge.prevention}</p>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowKnowMore(false)}
                className="w-full py-2.5 rounded-xl bg-icici-navy text-white font-bold text-sm hover:bg-icici-navy/90 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RiskCard({ title, severity, description, impactAreas, typicalClaim }: {
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  impactAreas: string[];
  typicalClaim: string;
}) {
  const severityConfig = {
    high: { label: 'HIGH', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    medium: { label: 'MEDIUM', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    low: { label: 'LOW', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  };
  const sev = severityConfig[severity];

  return (
    <div className={`p-3 rounded-xl border ${sev.border} bg-white`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-800">{title}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-[14px] px-2 py-0.5 rounded-full font-black ${sev.bg} ${sev.text}`}>{sev.label}</span>
          <span className="text-[14px] font-bold text-gray-500">Typical: {typicalClaim}</span>
        </div>
      </div>
      <p className="text-[14px] text-gray-600 mb-2">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {impactAreas.map((area, i) => {
          const knowledge = lookupImpactKnowledge(area);
          const tooltip = knowledge?.tooltip ?? IMPACT_TOOLTIPS[area.toLowerCase()];
          return tooltip ? (
            <ImpactTermTag key={i} area={area} tooltip={tooltip} knowledge={knowledge} />
          ) : (
            <span key={i} className="text-[14px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
              {area}
            </span>
          );
        })}
      </div>
    </div>
  );
}


