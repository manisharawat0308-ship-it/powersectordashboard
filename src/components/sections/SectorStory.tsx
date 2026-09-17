import { useSectorFilter } from '@/hooks/useSectorFilter';

export function SectorStory() {
  const { sectorView } = useSectorFilter();

  if (sectorView === 'fossil') return <FossilStory />;
  if (sectorView === 'non_fossil') return <NonFossilStory />;
  return <PowerSectorStory />;
}

function PowerSectorStory() {
  return (
    <div className="icici-card p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-icici-navy flex items-center justify-center text-xl">⚡</div>
        <div>
          <h2 className="text-base font-black text-gray-800">India's Power Sector — A Transformational Journey</h2>
          <p className="text-[14px] text-gray-400">From state monopoly to a liberalized, multi-source, multi-player ecosystem</p>
        </div>
      </div>

      {/* Timeline Evolution */}
      <div className="grid grid-cols-1 laptop:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="text-xs font-black text-icici-maroon">1947–1990</div>
          <div className="text-[14px] font-bold text-gray-700 mt-1">State-Led Era</div>
          <div className="text-[14px] text-gray-500 mt-1 leading-relaxed">
            Power was a government monopoly. Coal and hydro dominated. SEBs controlled generation, transmission & distribution. Capacity grew from 1.4 GW to 64 GW.
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="text-xs font-black text-icici-orange">1991–2003</div>
          <div className="text-[14px] font-bold text-gray-700 mt-1">Liberalization & Private Entry</div>
          <div className="text-[14px] text-gray-500 mt-1 leading-relaxed">
            Economic reforms opened the sector to IPPs. Enron's Dabhol was the first mega private project. Reliance, Tata entered. The Electricity Act 2003 restructured the entire framework.
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="text-xs font-black text-green-700">2003–2015</div>
          <div className="text-[14px] font-bold text-gray-700 mt-1">Thermal Boom + RE Birth</div>
          <div className="text-[14px] text-gray-500 mt-1 leading-relaxed">
            Ultra Mega Power Projects (UMPPs). Adani, JSW scaled coal capacity. National Solar Mission (2010) planted RE seeds. Wind crossed 20 GW. India became the world's 3rd largest power producer.
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="text-xs font-black text-icici-navy">2015–Present</div>
          <div className="text-[14px] font-bold text-gray-700 mt-1">Renewable Revolution</div>
          <div className="text-[14px] text-gray-500 mt-1 leading-relaxed">
            Solar costs fell 90%. RE became cheaper than coal. Private sector pivoted to green. 500 GW non-fossil target announced. India now adds 50+ GW/year — 75% from renewables.
          </div>
        </div>
      </div>

      {/* Key Numbers */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-icici-cream border border-gray-100">
        <div className="text-center px-4">
          <div className="text-lg font-black text-icici-maroon">450 GW</div>
          <div className="text-[14px] text-gray-500">Total Capacity</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center px-4">
          <div className="text-lg font-black text-icici-navy">54:46</div>
          <div className="text-[14px] text-gray-500">Fossil : Non-Fossil</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center px-4">
          <div className="text-lg font-black text-icici-orange">53.5%</div>
          <div className="text-[14px] text-gray-500">Private Sector Share</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center px-4">
          <div className="text-lg font-black text-green-700">22.5×</div>
          <div className="text-[14px] text-gray-500">Growth Since 1975</div>
        </div>
      </div>
    </div>
  );
}

function FossilStory() {
  return (
    <div className="icici-card p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-maroon to-red-900 flex items-center justify-center text-xl">🔥</div>
        <div>
          <h2 className="text-base font-black text-gray-800">Evolution of Fossil Power in India</h2>
          <p className="text-[14px] text-gray-400">From colonial-era steam plants to Asia's largest thermal fleet</p>
        </div>
      </div>

      {/* Evolution Timeline */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-icici-maroon">1899</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-icici-maroon mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">India's First Power Station</div>
            <div className="text-[14px] text-gray-500">Coal-fired station at Calcutta Electric Supply Corp (CESC). 1 MW capacity. Powered street lights on Harrison Road.</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-icici-maroon">1947–70</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-icici-maroon mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">Five Year Plan Expansion</div>
            <div className="text-[14px] text-gray-500">Coal plants built near coalfields — Bokaro, Korba, Singrauli. All government-owned. Capacity reached 14 GW by 1970.</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-icici-maroon">1975</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-icici-orange mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">NTPC Founded</div>
            <div className="text-[14px] text-gray-500">National Thermal Power Corporation created. Built India's first supercritical plants. Now the world's 3rd largest thermal generator at 72 GW.</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-icici-maroon">1991–2003</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-icici-orange mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">Private Sector Entry</div>
            <div className="text-[14px] text-gray-500">Enron's Dabhol (1993) — India's first private mega project. Gas-based IPPs emerged. Reliance, Lanco, GMR, GVK entered coal generation.</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-icici-maroon">2006–15</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-red-700 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">Ultra Mega Power Projects (UMPP)</div>
            <div className="text-[14px] text-gray-500">4,000 MW coastal plants — Mundra (Adani/Tata), Sasan (Reliance). Imported coal dependency grew. Adani became India's largest private thermal player.</div>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-16 flex-shrink-0 text-right">
            <div className="text-[14px] font-black text-gray-600">2020+</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800">Plateau & Transition</div>
            <div className="text-[14px] text-gray-500">No new coal plants sanctioned post-2022. Focus shifted to retiring old plants, supercritical upgrades. Coal still generates 62% of electricity but capacity share declining (47%). Gas plants running at just 22% PLF.</div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 laptop:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
          <div className="text-lg font-black text-icici-maroon">211.5 GW</div>
          <div className="text-[14px] text-gray-500">Coal Capacity (87% of fossil)</div>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-center">
          <div className="text-lg font-black text-icici-orange">24.9 GW</div>
          <div className="text-[14px] text-gray-500">Gas (mostly stranded)</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
          <div className="text-lg font-black text-amber-700">64.2%</div>
          <div className="text-[14px] text-gray-500">Coal PLF (highest utilization)</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <div className="text-lg font-black text-gray-600">22.8%</div>
          <div className="text-[14px] text-gray-500">Gas PLF (severely underutilized)</div>
        </div>
      </div>
    </div>
  );
}

function NonFossilStory() {
  return (
    <div className="icici-card p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-icici-navy to-green-800 flex items-center justify-center text-xl">🌿</div>
        <div>
          <h2 className="text-base font-black text-gray-800">Evolution of Non-Fossil Energy in India</h2>
          <p className="text-[14px] text-gray-400">From Himalayan hydro to a solar superpower — and beyond</p>
        </div>
      </div>

      {/* Multi-source evolution */}
      <div className="space-y-4 mb-5">
        {/* Wind Evolution */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-white border border-teal-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💨</span>
            <h3 className="text-xs font-black text-teal-800">Wind Energy — India's First RE Source</h3>
          </div>
          <div className="grid grid-cols-1 laptop:grid-cols-3 gap-3 text-[14px]">
            <div>
              <div className="font-bold text-teal-700 mb-1">Technology Evolution</div>
              <div className="text-gray-600 leading-relaxed">
                Turbines grew from <span className="font-bold">0.5 MW (1990s)</span> → 2 MW (2010s) → <span className="font-bold">5.5 MW (2025)</span>. Higher hub heights (120m+) capture stronger winds. Capacity factor improved from 15% to 28%.
              </div>
            </div>
            <div>
              <div className="font-bold text-teal-700 mb-1">Geography Shift</div>
              <div className="text-gray-600 leading-relaxed">
                Started in Tamil Nadu (Muppandal, 1986). Expanded to Gujarat coast, Rajasthan desert, Karnataka plateau. Offshore wind now being explored (Gujarat, TN coast).
              </div>
            </div>
            <div>
              <div className="font-bold text-teal-700 mb-1">Private Sector Dominance</div>
              <div className="text-gray-600 leading-relaxed">
                Suzlon (India's Vestas), Inox Wind led manufacturing. Today 95% privately owned. Adani, ReNew, Greenko are top IPPs.
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[14px] text-teal-600 font-bold">
            <span>1990: 0 GW</span>
            <span>→</span>
            <span>2010: 14 GW</span>
            <span>→</span>
            <span>2025: 57.4 GW</span>
          </div>
        </div>

        {/* Solar Evolution */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-white border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">☀️</span>
            <h3 className="text-xs font-black text-amber-800">Solar Energy — The Fastest Growth Story in History</h3>
          </div>
          <div className="grid grid-cols-1 laptop:grid-cols-3 gap-3 text-[14px]">
            <div>
              <div className="font-bold text-amber-700 mb-1">Cost Revolution</div>
              <div className="text-gray-600 leading-relaxed">
                Tariff fell from <span className="font-bold">₹17/unit (2010)</span> → ₹6 (2015) → <span className="font-bold">₹1.99/unit (2024)</span>. Now cheaper than coal in most states. 90% cost reduction in 14 years.
              </div>
            </div>
            <div>
              <div className="font-bold text-amber-700 mb-1">Scale & Manufacturing</div>
              <div className="text-gray-600 leading-relaxed">
                Projects grew from <span className="font-bold">2 MW rooftops</span> → 100 MW parks → <span className="font-bold">1 GW+ ultra-mega parks</span> (Bhadla, Pavagada). Backward integration: panel mfg → cell mfg → polysilicon (Adani, Avaada, Waaree).
              </div>
            </div>
            <div>
              <div className="font-bold text-amber-700 mb-1">Import to Domestic</div>
              <div className="text-gray-600 leading-relaxed">
                2015: 90% China import. 2026: India has 60+ GW module capacity, 8 GW cell capacity. BCD (40% duty) drove domestic manufacturing. PLI scheme added 40 GW integrated capacity.
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[14px] text-amber-600 font-bold">
            <span>2010: 0.02 GW</span>
            <span>→</span>
            <span>2020: 37 GW</span>
            <span>→</span>
            <span>2026: 162 GW (57× since 2014)</span>
          </div>
        </div>

        {/* Hydro */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💧</span>
            <h3 className="text-xs font-black text-blue-800">Hydropower — India's Original Clean Energy</h3>
          </div>
          <div className="text-[14px] text-gray-600 leading-relaxed">
            India's first hydro plant: <span className="font-bold">Sidrapong, Darjeeling (1897)</span> — 130 kW. The Himalayan belt (HP, UK, JK, SK, AR) holds 145 GW potential — only 36% utilized. Tehri (1,000 MW), Nathpa Jhakri (1,500 MW), Baglihar (900 MW) are landmark projects. Large hydro (52 GW) provides baseload RE + grid balancing.
          </div>
        </div>

        {/* BESS & Pumped Hydro */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-white border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔋</span>
            <h3 className="text-xs font-black text-purple-800">BESS & Pumped Hydro — The Storage Revolution (2023+)</h3>
          </div>
          <div className="grid grid-cols-1 laptop:grid-cols-2 gap-3 text-[14px]">
            <div>
              <div className="font-bold text-purple-700 mb-1">Battery Energy Storage (BESS)</div>
              <div className="text-gray-600 leading-relaxed">
                SECI tendering 10+ GWh annually. Greenko's 5.2 GWh IREP (world's largest integrated RE + storage). Costs fell from $500/kWh (2015) to $120/kWh (2025). Target: 42 GWh by 2030 per National Framework.
              </div>
            </div>
            <div>
              <div className="font-bold text-purple-700 mb-1">Pumped Storage Hydro (PSH)</div>
              <div className="text-gray-600 leading-relaxed">
                India identified 103 GW PSH potential. 4.7 GW operational (Purulia, Kadamparai, Srisailam). 60+ GW in pipeline. Greenko, JSW, NHPC leading development. 8-hour storage duration.
              </div>
            </div>
          </div>
        </div>

        {/* Nuclear */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-white border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚛️</span>
            <h3 className="text-xs font-black text-violet-800">Nuclear — High Load Factor, Strategic Asset</h3>
          </div>
          <div className="text-[14px] text-gray-600 leading-relaxed">
            Started 1969 (Tarapur). Highest CUF at <span className="font-bold">78.6%</span> — runs 24/7. Currently 8.8 GW across 7 sites. Kudankulam (2 GW), Jaitapur (9.9 GW planned with EDF France). Indigenous PHWR technology + imported LWR. Target: 22.5 GW by 2031.
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 laptop:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
          <div className="text-lg font-black text-amber-700">162 GW</div>
          <div className="text-[14px] text-gray-500">☀️ Solar (57× since 2014)</div>
        </div>
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-center">
          <div className="text-lg font-black text-teal-700">57 GW</div>
          <div className="text-[14px] text-gray-500">💨 Wind (5.5 MW turbines)</div>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
          <div className="text-lg font-black text-blue-700">52 GW</div>
          <div className="text-[14px] text-gray-500">💧 Hydro (since 1897)</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
          <div className="text-lg font-black text-purple-700">42 GWh</div>
          <div className="text-[14px] text-gray-500">🔋 BESS Target 2030</div>
        </div>
        <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
          <div className="text-lg font-black text-violet-700">8.8 GW</div>
          <div className="text-[14px] text-gray-500">⚛️ Nuclear (78.6% CUF)</div>
        </div>
      </div>
    </div>
  );
}


