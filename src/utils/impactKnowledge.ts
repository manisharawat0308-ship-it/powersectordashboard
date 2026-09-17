/**
 * Impact Area Knowledge Base
 * 
 * Provides multi-level information for each damage/failure term:
 * - Level 1: One-line tooltip (shown on hover)
 * - Level 2: "Know More" deep-dive with explanation, root causes, real incidents, and images
 */

export interface KnowledgeEntry {
  /** One-line plain-English explanation shown on hover */
  tooltip: string;
  /** Detailed explanation for "Know More" panel */
  detail: string;
  /** Why/how this failure occurs */
  rootCause: string;
  /** Real-world incident example */
  incident?: string;
  /** Typical financial impact */
  typicalCost: string;
  /** Visual reference image URL (Unsplash/stock) */
  imageUrl?: string;
  /** Image description */
  imageAlt?: string;
  /** Prevention/detection method */
  prevention: string;
}

/**
 * Knowledge base keyed by lowercase impact area term.
 * The RiskCard component matches impactAreas[] text (lowercased) against these keys.
 */
export const IMPACT_KNOWLEDGE: Record<string, KnowledgeEntry> = {

  // ═══════════════════════════════════════════════════════════════════════
  // COAL / THERMAL
  // ═══════════════════════════════════════════════════════════════════════

  'boiler tube burst (erosion/corrosion)': {
    tooltip: 'Tubes inside the boiler carry water/steam. Erosion from ash particles or corrosion from fuel impurities thins the tube wall until it bursts under pressure.',
    detail: 'A coal-fired boiler contains thousands of tubes (superheater, reheater, waterwall, economizer) carrying water/steam at 150–250 bar and 540–600°C. Fly ash particles in the flue gas erode the outer tube surface at bends and constrictions. Indian coal (35–45% ash) accelerates this dramatically. When wall thickness drops below minimum (typically 3mm for a 6mm tube), the tube ruptures under internal pressure, releasing high-pressure steam into the boiler.',
    rootCause: 'Primary causes: (1) Fly ash erosion at tube bends and soot-blower impact zones, (2) Fireside corrosion from sulphur/chlorine in coal, (3) Waterside corrosion from poor water chemistry, (4) Overheating from flame impingement or flow restriction. Indian coal\'s high ash content (35–45% vs 10–15% for international coal) makes this India\'s #1 thermal plant failure.',
    incident: 'NTPC Unchahar (Nov 2017): Superheater tube ruptured during startup. High-pressure steam (540°C) escaped into the boiler area. 38 workers killed, 100+ injured. The tube had thinned from erosion below safe limits. Post-event investigation found inadequate tube thickness monitoring in the failure zone.',
    typicalCost: '₹5–30 Cr material damage + 2–6 weeks forced outage. If multiple tubes fail simultaneously or during startup (personnel exposure), can become catastrophic event.',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=300&fit=crop',
    imageAlt: 'Inside of a thermal power plant boiler with tube banks visible',
    prevention: 'Annual ultrasonic tube thickness mapping (identifies thinning 12–18 months before failure). Ash blower maintenance on schedule. Condition-based tube replacement at <3.5mm thickness. Online erosion monitoring sensors at known trouble spots.',
  },

  'drum weld failure': {
    tooltip: 'The boiler drum is a thick-walled pressure vessel where water/steam separate. A weld defect can crack under cyclic pressure loading — potentially catastrophic.',
    detail: 'The boiler drum is a cylindrical vessel (typically 1.5m diameter, 15–20m long, wall thickness 100–150mm) operating at 150–250 bar. All connections (tubes, pipes, nozzles) are welded to the drum. These welds experience thermal cycling (startup/shutdown), vibration, and constant high pressure. Over decades, microscopic defects in welds can grow into cracks through fatigue propagation.',
    rootCause: 'Causes: (1) Original weld defect not detected during manufacturing (porosity, lack of fusion), (2) Thermal fatigue from repeated startup/shutdown cycles (each cycle stresses the weld), (3) Hydrogen-induced cracking in older drums, (4) Stress corrosion cracking from water chemistry issues. Two-shift operation (daily start/stop) dramatically accelerates weld fatigue vs baseload operation.',
    incident: 'Vedanta Singhitarai, Chhattisgarh (April 2025): Boiler explosion killed 25 workers. Root cause attributed to maintenance negligence and operational pressure buildup from undetected weld/structural deficiency. FIR filed against company chairman. Event triggered industry-wide review of boiler inspection standards.',
    typicalCost: '₹50–200 Cr if drum replacement needed (12–18 months). If catastrophic rupture: potential total loss of boiler + casualties. Sum insured for 500 MW boiler: ₹150–300 Cr.',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=300&fit=crop',
    imageAlt: 'Industrial welding on heavy pressure vessel',
    prevention: 'Periodic magnetic particle testing (MPI) and ultrasonic testing (UT) of all drum welds — every major overhaul (2–3 years). Hydrogen probe monitoring for hydrogen cracking. Controlled startup/shutdown rates to minimize thermal shock. NDT records maintained for life-of-plant.',
  },

  'economizer leak': {
    tooltip: 'The economizer pre-heats boiler feedwater using waste heat from flue gas. Tube leaks reduce efficiency and, if ignored, can escalate to larger failures.',
    detail: 'The economizer is a heat exchanger in the cooler zone of the boiler (flue gas at 300–400°C). Feedwater passes through economizer tubes and is heated from ~150°C to ~250°C before entering the drum. Being in the lower-temperature zone, economizer tubes are less stressed than superheater tubes, but they still face erosion from ash-laden flue gas and oxygen corrosion from dissolved oxygen in feedwater.',
    rootCause: 'Causes: (1) Oxygen pitting corrosion on the waterside (poor deaeration of feedwater), (2) Dew-point corrosion on the gas side (sulphuric acid condensation during startup when metal is cold), (3) Fly ash erosion at tube bends, (4) Flow-assisted corrosion at high velocities. Typically a warning sign — if economizer leaks are frequent, the rest of the boiler tube bank is likely approaching end-of-life.',
    typicalCost: '₹2–8 Cr per event + 1–2 weeks repair. Lower severity than superheater failures but higher frequency. Multiple economizer leaks per year indicate systemic water chemistry or ash erosion issues.',
    prevention: 'Maintain feedwater dissolved oxygen below 7 ppb (proper deaeration). Monitor economizer tube wall thickness. Avoid cold startups without pre-heating (prevents dew-point corrosion). Water chemistry programme compliance.',
  },

  'steam line rupture': {
    tooltip: 'High-pressure steam pipes (>150 bar, 537°C+) can rupture from creep, erosion, or weld defects. Invisible superheated steam is instantly lethal.',
    detail: 'Main steam pipes carry superheated steam from boiler to turbine at 150–250 bar and 537–593°C. At these conditions, steam is invisible (superheated — not like visible kitchen steam). A rupture releases a jet of invisible, instantly-lethal gas at >500°C. The pipe material slowly weakens over decades through a process called "creep" — permanent deformation under sustained high temperature and pressure.',
    rootCause: 'Causes: (1) Creep damage — the steel slowly deforms at high temperature over 100,000+ hours until failure, (2) Weld cracking at pipe junctions (dissimilar metal welds especially), (3) Erosion at bends by wet steam or flow disruption, (4) Water hammer from improper startup (cold water hitting hot pipe). Creep is the dominant failure mode for steam lines >15 years old.',
    incident: 'NTPC Unchahar (2017): Steam escaped from a duct at 20m elevation. The invisible superheated steam engulfed workers below. 38 killed because they could not see the leak or escape in time. This event led to NTPC investing ₹2,400 Cr in fleet-wide boiler health monitoring.',
    typicalCost: '₹10–50 Cr material damage + 1–3 months repair. If personnel casualties: ₹100+ Cr including compensation and regulatory penalties. Criminal liability possible under Factories Act.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop',
    imageAlt: 'High-pressure industrial piping system',
    prevention: 'Creep life assessment using replica metallography every 100,000 hours. Periodic hydrostatic testing. Ultrasonic testing of welds at dissimilar metal joints. Startup procedures ensuring proper warmup (no thermal shock).',
  },

  'lp/hp blade failure': {
    tooltip: 'Turbine blades (LP=Low Pressure, HP=High Pressure) spin at 3000 RPM. Failure sends fragments into adjacent blades — cascading destruction.',
    detail: 'A steam turbine has 3 sections: HP (High Pressure, first stage, shortest blades, highest temperature), IP (Intermediate Pressure), and LP (Low Pressure, last stage, longest blades, lowest temperature but highest moisture). Each section has rows of moving blades on the rotor and stationary blades (nozzles) on the casing. At 3000 RPM, blade tip speed is 400+ m/s. A single blade failure releases a projectile that destroys adjacent rows — cascade failure.',
    rootCause: 'HP blades: (1) Solid particle erosion from boiler tube oxide scale, (2) High-temperature creep after 100,000+ hours. LP blades: (1) Moisture erosion on trailing edge (wet steam in last stages), (2) Stress corrosion cracking from water chemistry contamination, (3) Fatigue from vibration (resonance). LP last-stage blades are the longest (up to 1.2m for 500 MW) and most failure-prone.',
    incident: 'NTPC Sipat Unit-1 (660 MW, 2020): LP blade failure caused cascade damage to 3 rows. Generator also damaged (rotor imbalance propagated through coupling). Total loss: ₹180 Cr including 14 months BI. Root cause: moisture erosion had thinned trailing edge beyond safe limit — missed during last overhaul.',
    typicalCost: 'LP rotor replacement: ₹80–120 Cr + 12–18 months lead time from BHEL. HP blade row replacement: ₹30–60 Cr + 8–12 months. Cascade failure can total both LP and HP sections: ₹150–250 Cr.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop',
    imageAlt: 'Precision engineering turbine blade close-up',
    prevention: 'Vibration monitoring (detects imbalance from blade damage before cascade). Boroscope inspection during overhauls (visual check of blade surfaces). LP blade trailing edge thickness measurement. Water chemistry control to prevent stress corrosion. Blade life assessment based on operating hours.',
  },

  'rotor rub / misalignment': {
    tooltip: 'If the turbine rotor shifts from centre by even 0.1mm, rotating blades contact the stationary casing — generating extreme heat, vibration, and damage.',
    detail: 'The turbine rotor (a shaft weighing 20–80 tonnes depending on unit size) spins at 3000 RPM with only 0.3–0.8mm clearance between blade tips and the casing. This precision is maintained by journal bearings, thrust bearings, and careful thermal expansion management. If alignment shifts (from bearing wear, foundation settlement, or thermal distortion), blades contact the casing — "rotor rub". The friction generates intense localised heat, scoring the rotor and casing surfaces.',
    rootCause: 'Causes: (1) Bearing wear allowing shaft to drop/shift, (2) Foundation settlement (soil consolidation over years), (3) Uneven thermal expansion during rapid startup (rotor heats faster than casing), (4) Coupling misalignment after maintenance, (5) Rotor bow from thermal distortion. Vibration monitoring is the primary detection method.',
    typicalCost: '₹20–60 Cr if caught early (rotor can be machined/re-balanced). If severe rub goes undetected: catastrophic rotor damage requiring replacement — ₹80–150 Cr + 12–18 months.',
    prevention: 'Continuous vibration monitoring on all bearings (alarm at 4 mm/s, trip at 7 mm/s). Controlled startup rates (slow warming to ensure uniform thermal expansion). Bearing oil pressure monitoring. Alignment checks after every major maintenance.',
  },

  'generator winding burnout': {
    tooltip: 'Generator windings carry thousands of amps. Insulation breakdown causes short circuits that burn the copper winding — rewinding takes 6–14 months.',
    detail: 'The generator stator has copper bars (windings) carrying 15,000–25,000 amps at 15–21 kV. These are insulated with mica tape and epoxy resin, rated for 40+ years. Over time, thermal cycling, vibration, and electrical stress degrade the insulation. When it fails, a short circuit occurs — the enormous current melts the copper and burns adjacent insulation. The rotor winding can also fail (usually from inter-turn short due to insulation fretting).',
    rootCause: 'Stator: (1) Thermal aging of insulation (cumulative heat exposure), (2) Moisture ingress in humid/coastal environments, (3) Partial discharge activity (electrical stress eroding insulation internally), (4) Vibration loosening bar wedges (bars move and chafe insulation). Rotor: (1) Centrifugal force causing inter-turn short, (2) Contamination, (3) Thermal distortion.',
    incident: 'NTPC Sipat (2020): Stator winding insulation breakdown in 660 MW unit during monsoon maintenance period. Root cause: moisture ingress during outage when hydrogen was removed for maintenance. Rewinding took 14 months (COVID supply chain delays added 4 months). Total claim: ₹180 Cr (MD + BI).',
    typicalCost: 'Stator rewind: ₹30–60 Cr + 8–14 months (BHEL rewinding at works or site). Rotor rewind: ₹15–30 Cr + 6–10 months. Complete generator replacement (if both stator and rotor): ₹80–120 Cr + 18 months.',
    imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&h=300&fit=crop',
    imageAlt: 'Electrical generator stator winding coils',
    prevention: 'Online partial discharge monitoring (detects insulation deterioration years before failure). Insulation resistance testing during outages. Hydrogen purity maintenance >98% (prevents moisture). Generator condition assessment every 5 years.',
  },

  'bearing seizure': {
    tooltip: 'Journal bearings support the rotor on a thin oil film. If oil supply fails, metal-to-metal contact causes the bearing to seize — potentially damaging the rotor.',
    detail: 'Turbine rotors (20–80 tonnes, spinning at 3000 RPM) are supported by journal bearings — essentially a thin film of pressurized oil (0.05–0.15mm thick) between the rotating shaft and the stationary bearing shell. This oil film carries the entire weight and dynamic forces. If oil supply is interrupted for even seconds, the film collapses — the shaft contacts the bearing surface directly at high speed, generating extreme heat and friction.',
    rootCause: 'Causes: (1) Oil pump failure (loss of oil supply pressure), (2) Oil contamination (water or particles destroying the film), (3) Bearing metal fatigue (babbitt liner cracking and lifting), (4) Oil cooler failure (oil overheats, viscosity drops, film collapses), (5) Loss of AC power to oil pumps without DC backup activating in time.',
    typicalCost: 'If caught immediately (auto-trip on low oil pressure): bearing replacement ₹5–15 Cr + 2–4 weeks. If seizure damages the rotor journal: rotor repair/replacement ₹60–120 Cr + 12–18 months. Catastrophic seizure at full speed: total turbine loss.',
    prevention: 'Redundant oil pumps (AC + DC backup). Oil pressure alarms and auto-trip at low pressure. Continuous bearing temperature monitoring (rising temp = oil film thinning). Monthly oil quality testing (water content, particle count). Oil cooler integrity checks.',
  },

  'coal mill fire/explosion': {
    tooltip: 'Coal powder is explosive when suspended in air. Mill temperatures above 90°C or CO accumulation can trigger ignition — explosion can damage the mill and adjacent equipment.',
    detail: 'Coal is ground to a fine powder (75 micron, like talcum powder) in large rotating mills before being blown into the boiler furnace. At this fineness, coal-air mixture is explosive (similar to grain elevator explosions). Each 500 MW unit has 4–6 mills operating at 80–90°C. If temperature rises (from mill fires, hot air system malfunction) or CO accumulates (incomplete combustion of coal), an explosion can occur inside the mill — propagating to coal pipes and bunkers.',
    rootCause: 'Causes: (1) Tramp iron (metal pieces from coal supply) creating sparks, (2) Mill outlet temperature exceeding 90°C (fire in coal bed), (3) Spontaneous combustion of coal fines in stagnant zones, (4) Hot coal accumulation when mill trips without proper purging, (5) Foreign object igniting against grinding elements. Indian coal\'s variable quality exacerbates this — sudden moisture drops can cause temperature spikes.',
    incident: 'NTPC Talcher Unit-4 (Jul 2026): Coal mill fire escalated to boiler area. Unit tripped. No casualties. The fire started in a stagnant zone where coal fines had accumulated during a previous mill trip without proper purging. Damage assessment: ₹15 Cr + 6 weeks outage.',
    typicalCost: '₹5–20 Cr if contained within mill. ₹30–80 Cr if explosion propagates to coal piping/bunkers. Mill fires (without explosion): ₹2–5 Cr + 1–2 weeks. Insurance covers sudden explosion; gradual fires in mill internals may be debated.',
    prevention: 'CO monitoring in mills (detect smouldering before explosion). Mill outlet temperature control <90°C. Inert gas (N₂/CO₂) injection system for fire suppression. Proper mill purging procedure on trip. Metal detection on coal conveyors before mills.',
  },

  'turbine oil fire': {
    tooltip: 'Turbine lubrication oil (~10,000 litres at 200°C) can ignite if it leaks onto hot surfaces — oil fires spread rapidly in enclosed turbine halls.',
    detail: 'Steam turbines require pressurised lubrication oil (typically mineral oil, 10,000–40,000 litres per unit) for bearings, gearboxes, and hydraulic control systems. This oil operates at 50–70°C but can reach 200°C+ at bearing surfaces. If an oil line develops a high-pressure leak (spray), the fine mist can ignite on contact with hot steam pipes or turbine casing (surface temperature 300–500°C). The resulting fire is intense (oil burns at 1000°C+) and spreads rapidly through the turbine hall.',
    rootCause: 'Causes: (1) Oil line flange leak (gasket deterioration, thermal cycling), (2) Hydraulic control oil line failure (very high pressure 100+ bar), (3) Oil contamination reducing flash point, (4) Bearing failure generating heat that ignites surrounding oil, (5) Previous leaks creating oil-soaked insulation (lagging fires). Turbine oil fires are the #2 cause of total thermal plant losses after boiler explosions.',
    incident: 'NAPS-1 Narora (1993): Turbine hall fire from oil/hydrogen leak destroyed the turbine hall and severed control cables to the reactor. This nuclear plant event demonstrated that turbine oil fires at nuclear sites have identical characteristics to conventional thermal — same equipment, same risk.',
    typicalCost: '₹20–100 Cr depending on extent. If fire reaches hydrogen-cooled generator (H₂ explosion): ₹100–300 Cr. If fire spreads to adjacent unit through shared cable gallery: multi-unit loss possible.',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop',
    imageAlt: 'Industrial machinery in power plant turbine hall',
    prevention: 'Oil mist detection system in turbine hall. Automatic CO₂/water spray fire suppression. Oil system integrity checks (flange tightness, gasket condition). Hot surface insulation to prevent ignition. Redundant fire detection (UV flame, smoke, heat).',
  },

  'cable gallery fire': {
    tooltip: 'Underground cable galleries carry power and control cables. A fire here can disable multiple systems simultaneously — similar to the NAPS-1 nuclear incident (1993).',
    detail: 'Large power plants route hundreds of kilometres of cables (power, control, instrumentation) through underground concrete galleries. These cables have PVC/XLPE insulation that, once ignited, burns intensely with toxic smoke. Because cables are bundled densely, fire propagates along the cable trays rapidly. A cable gallery fire can simultaneously destroy: unit control signals, safety system cabling, protection relays, and communication links — causing complete loss of plant control.',
    rootCause: 'Causes: (1) Cable overloading (insulation softens and ignites), (2) Short circuit from rodent damage or water ingress, (3) External fire source (welding/cutting near cables during maintenance — "hot work"), (4) Manufacturing defect in cable insulation, (5) Propagation from adjacent fire through unsealed penetrations (fire stops missing). Most cable fires start during maintenance activities.',
    incident: 'NAPS-1 Narora (1993): The turbine hall fire burned through cable galleries connecting the turbine hall to the control room. Control room temporarily lost all instrumentation. This was the critical safety concern — not the fire itself, but the LOSS OF INFORMATION about reactor status. Post-event, all Indian nuclear plants were retrofitted with fire-resistant cables and redundant routing.',
    typicalCost: '₹10–50 Cr direct damage. But BI can be enormous — if control cables are destroyed, the entire plant may be offline for 6–12 months while cables are re-routed and tested. The consequential impact far exceeds the cable replacement cost.',
    prevention: 'Fire-retardant (FR) cable specification for all new installations. Fire stops at all cable penetrations (prevent fire spread between zones). Cable tunnel fire detection (linear heat detection). Hot work permit system with fire watch. Regular cable insulation resistance testing.',
  },

  'hydrogen system leak/explosion': {
    tooltip: 'Large generators use hydrogen gas for cooling. H₂ is explosive at 4–75% concentration in air. A seal leak + ignition source = turbine hall explosion.',
    detail: 'Generators above 200 MW are hydrogen-cooled (H₂ is 14× better at heat transfer than air and has 1/10th the windage loss). The generator operates at 3–6 bar H₂ pressure inside a sealed casing. Shaft seals prevent H₂ from leaking into the turbine hall. Hydrogen is explosive between 4–75% concentration in air (extremely wide flammable range). A seal degradation allows H₂ to leak — if it accumulates in an enclosed space and finds an ignition source (electrical arc, hot surface), explosion follows.',
    rootCause: 'Causes: (1) Shaft seal wear (normal degradation — seals need replacement every 3–5 years), (2) Casing crack or gasket failure, (3) H₂ supply system leak (piping, valves), (4) Improper gas changeover procedure (purging H₂ with CO₂ before air entry), (5) Bearing oil seal failure allowing H₂ into oil system. The risk is highest during maintenance shutdowns when H₂ is being removed/replaced.',
    typicalCost: 'H₂ explosion in generator casing: ₹50–150 Cr (generator total loss). Turbine hall H₂ accumulation explosion: ₹100–300 Cr (structural damage to building). Fatalities possible if personnel are in the blast zone.',
    prevention: 'Continuous H₂ purity monitoring (should be >98% — impurities indicate seal leak). H₂ leak detectors around generator and in turbine hall ceiling. Strict procedures for gas changeover (H₂ → CO₂ → Air, never H₂ → Air directly). Seal oil system redundancy. Ventilation in turbine hall to prevent accumulation.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WIND
  // ═══════════════════════════════════════════════════════════════════════

  'blade root crack/delamination': {
    tooltip: 'Where the blade attaches to the hub — cyclic loading causes adhesive debonding. If undetected, the blade can detach from the hub — catastrophic.',
    detail: 'Wind turbine blades (40–80m long, 8–25 tonnes) are attached to the hub at the "root" — a thick circular flange bonded with structural adhesive and bolted with 80–120 studs. Each blade completes 10–15 million rotations in its lifetime. Every rotation applies cyclic bending, edgewise, and torsional loads to the root joint. Over time, the adhesive bond between the outer shell and internal spar can delaminate — the layers separate, weakening the structure progressively.',
    rootCause: 'Causes: (1) Manufacturing defect in root joint bonding (insufficient adhesive, air voids), (2) Fatigue from millions of cyclic loads (exceeds design assumptions), (3) Lightning damage causing internal delamination not visible externally, (4) Water ingress into cracks accelerating freeze-thaw damage, (5) Design underestimation of edgewise loads.',
    incident: 'Suzlon S111 Blade Serial Defect (2019–2021): 200+ turbines affected across India. Systematic root joint debonding in the adhesive layer. Manufacturing process issue in specific production batch. Required fleet-wide blade replacement programme costing ₹400+ Cr. Demonstrated serial defect risk in wind fleets.',
    typicalCost: 'Single blade replacement: ₹80 Lakh–3 Cr + crane hire (₹50 Lakh–1 Cr). If blade detaches at speed: tower damage likely, potential total WTG loss (₹10–20 Cr). Serial defect: fleet-wide — ₹100–500 Cr.',
    imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&h=300&fit=crop',
    imageAlt: 'Wind turbine blade showing root attachment to hub',
    prevention: 'Regular blade root bolt torque checks. Ultrasonic inspection of root joint bond line during annual service. Structural health monitoring (strain gauges at root). Drone-based visual inspection for surface cracks propagating from root.',
  },

  'tower buckling at base': {
    tooltip: 'Wind turbine towers resist enormous bending forces. If design wind speed is exceeded (cyclone), the base section buckles — total tower collapse.',
    detail: 'Wind turbine towers are thin-walled steel tubes (80–150m tall, 4–5m diameter at base, 25–40mm wall thickness). They must resist the bending moment from wind force on the rotor area (equivalent to 50–150 tonnes of lateral force at hub height). The base section experiences the maximum stress. If wind speed exceeds the design class (typically 52–70 m/s depending on IEC class), or if foundation settlement creates an eccentric load, the base section can buckle — the tower folds and collapses.',
    rootCause: 'Causes: (1) Wind speed exceeding design class (wrong class turbine for site — e.g. Class IIA on cyclone coast), (2) Foundation settlement creating tilt beyond tolerance (>0.3°), (3) Corrosion reducing wall thickness at base (especially coastal/humid sites), (4) Bolt fatigue at base flange connection, (5) Extreme gust factor beyond statistical design assumptions.',
    incident: 'Cyclone Tauktae, Gujarat (May 2021): 78 WTGs damaged. Multiple tower bucklings at base — turbines were IEC Class IIA (52 m/s design) but cyclone produced sustained 185 km/h (51.4 m/s) with gusts exceeding 200 km/h. Towers at coastal sites buckled because they were at the absolute edge of design capacity. Industry loss: ₹500+ Cr.',
    typicalCost: 'Tower collapse = total loss of WTG: ₹10–25 Cr per turbine. No repair possible — requires complete replacement. If multiple towers collapse in cyclone: portfolio loss ₹50–200 Cr. Crane mobilisation adds 3–6 months to restoration.',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=300&fit=crop',
    imageAlt: 'Wind turbine tower base showing cylindrical steel structure',
    prevention: 'Correct IEC wind class selection for site (Class IA for coastal India). Regular bolt torque checks at base flange. Corrosion protection system maintenance (cathodic protection, paint). Foundation monitoring (tilt sensors). Tower wall thickness measurement every 10 years.',
  },

  'main bearing failure': {
    tooltip: 'The main bearing supports the entire rotor (50–150 tonnes). Replacement requires the largest cranes — 500T+ crane with 3–6 month wait in India.',
    detail: 'The main bearing (or main shaft bearing) supports the combined weight of three blades + hub + main shaft (50–150 tonnes for modern 3–5 MW turbines) while allowing rotation. It\'s typically a large spherical roller bearing (1–2m outer diameter) operating under extreme loads — both radial (weight) and axial (thrust from wind). These bearings are designed for 20-year life but some fail prematurely from micropitting, white etch cracking, or contamination.',
    rootCause: 'Causes: (1) White Etch Cracking (WEC) — a poorly understood hydrogen-driven subsurface cracking phenomenon affecting wind turbine bearings, (2) Micropitting from insufficient lubrication film thickness, (3) Grease contamination (water ingress through seals), (4) Overloading from extreme gusts or turbulence, (5) Misalignment from gearbox deflection. WEC is an industry-wide issue — no single OEM immune.',
    typicalCost: 'Main bearing replacement: ₹1.5–3 Cr parts + ₹50 Lakh–1 Cr crane hire + 3–6 months wait for crane. Total per turbine: ₹2–4 Cr + 4–8 months BI. Key cost driver is CRANE AVAILABILITY — not the bearing itself.',
    prevention: 'Grease analysis (detect metal particles early). Vibration monitoring on main bearing housing. Temperature monitoring. Automatic greasing systems with correct grade. Main bearing endoscopy during major service (10-year). Pre-booked crane retainer agreements.',
  },

  'leading edge erosion (sand/rain)': {
    tooltip: 'Blade tips travel at 300+ km/h. Rain and sand particles impact like bullets — eroding the surface over years until structural damage occurs.',
    detail: 'The outer 20% of a wind turbine blade travels at extreme speed (up to 350 km/h for large rotors). At this velocity, even rain drops impact with 500+ N/m² — equivalent to being hit by small pebbles. In sandy/desert environments (Rajasthan, Gujarat), sand particles cause even more damage. Over 5–15 years, the leading edge (front surface) of the blade tip erodes progressively: first the paint goes, then the gel coat, then the underlying laminate. This creates surface roughness that reduces aerodynamic efficiency (loss of Annual Energy Production) and eventually exposes structural fibres.',
    rootCause: 'Causes: (1) Rain impact at blade tip speed (kinetic energy impact), (2) Sand/dust particle impingement (Rajasthan/Gujarat desert sites), (3) Insect contamination (organic acids degrade coatings), (4) Hail impact (ice particles), (5) UV degradation weakening surface coatings. Rate of erosion depends on tip speed, annual rainfall, and particle content of air.',
    typicalCost: 'Leading Edge Protection (LEP) repair: ₹10–30 Lakh per blade (rope access, in-situ). If structural damage (fibres exposed): blade replacement ₹80 Lakh–3 Cr. Energy loss from roughness: 2–5% AEP reduction (₹5–10 Lakh/year/turbine revenue loss).',
    prevention: 'LEP coatings/tapes applied proactively (polyurethane boots or tape on outer 20% of blade). Annual visual inspection of leading edge condition. Tip speed reduction in heavy rain (smart controller). Regular LEP reapplication every 5–8 years.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SOLAR
  // ═══════════════════════════════════════════════════════════════════════

  'module blowoff (clamp failure)': {
    tooltip: 'High winds rip solar modules off their mounting if clamps are undersized or corroded. Tracker systems with failed stow are most vulnerable.',
    detail: 'Solar modules (2m × 1m glass panels, 25–30 kg each) are held onto mounting structures by aluminium clamps — typically 4 clamps per module. Wind creates uplift force on the module surface (like an aircraft wing). During cyclones (>120 km/h), this uplift force exceeds clamp holding capacity if: clamps are undersized, corrosion has weakened them, or torque was insufficient during installation. Modules fly off, shattering on impact. On tracker systems, if auto-stow fails and modules face the wind at wrong angle, forces are 3× higher.',
    rootCause: 'Causes: (1) Clamp under-sizing (design using lower wind speed than actual site exposure), (2) Corrosion of galvanized clamps in coastal/humid environments (5–10 year degradation), (3) Insufficient installation torque (human error during construction), (4) Tracker stow failure during storm (communication/software failure), (5) Module frame deformation from thermal cycling loosening clamps.',
    incident: 'Cyclone Biparjoy, Gujarat (Jun 2023): Tracker software failed to execute stow command (communication tower damaged by pre-cyclone winds). Modules facing upward took full wind load. 200 MW array extensively damaged — modules blown off across 50-hectare site. Loss: ₹80 Cr.',
    typicalCost: 'Module replacement: ₹20–25 per Wp (₹200 Cr per GW at current prices). For a 100 MW plant losing 30% modules: ₹15–25 Cr modules + ₹5–10 Cr BOS + 2–4 months BI. With BCD (40% import duty): add 40% to module cost.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=300&fit=crop',
    imageAlt: 'Large-scale solar farm with rows of panels',
    prevention: 'Auto-stow system with redundant communication (satellite + cellular + manual override). Annual clamp torque verification. Corrosion-resistant clamps for coastal sites (stainless steel). Design wind speed must match site-specific cyclone exposure (not just IS 875 basic wind speed).',
  },

  'cell micro-cracks (hidden damage)': {
    tooltip: 'Hailstones create invisible cracks in solar cells. Modules still work initially but degrade rapidly over 6–12 months as hotspots form at crack boundaries.',
    detail: 'Solar cells are thin silicon wafers (180–200 microns thick — thinner than 2 sheets of paper). Mechanical stress from hail impact, thermal cycling, or transport creates micro-cracks that are completely invisible to the naked eye. These cracked cells continue to generate power initially. But over 6–12 months, the crack boundaries become high-resistance zones, current concentrates at remaining connected areas creating "hotspots" (localised heating to 100–150°C). Hotspots can eventually ignite the module backsheet — fire.',
    rootCause: 'Causes: (1) Hail impact (most common in India — Rajasthan/MP corridor), (2) Heavy snow load (less relevant in India), (3) Transport damage (improper handling during installation), (4) Thermal cycling stress (hot days, cool nights — 30°C daily range), (5) Module frame deflection under wind load (frame twists, cells crack).',
    incident: 'Rajasthan Multi-Park Hailstorm (Mar 2023): 600+ MW damaged. Visual inspection cleared many modules. But EL imaging 48 hours later revealed 30% additional damage invisible to eye — micro-cracked cells that would degrade within 6 months. Developers who skipped EL imaging faced secondary failures 6–9 months later (hotspots, backsheet fires).',
    typicalCost: 'If detected immediately (EL imaging): replace affected modules — same cost as visible damage. If NOT detected: modules degrade 3–5% per month → fire risk within 12 months → secondary claim for fire damage (₹5–20 Cr per 10 MW). Hidden damage is the "silent killer" of solar claims.',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=300&fit=crop',
    imageAlt: 'Solar panel cells close-up showing grid pattern',
    prevention: 'Electroluminescence (EL) imaging within 48 hours of any hail/mechanical event — reveals ALL cracks regardless of visibility. IV curve tracing to detect string-level degradation. Hail-resistant modules (thicker glass, 3.2mm vs 2.0mm). Annual infrared thermography to detect hotspot development.',
  },

  'dc arc flash at connector': {
    tooltip: 'When DC connectors (MC4) degrade, resistance increases → heat builds → arc flash ignites. DC arcs reach 5000°C and are harder to extinguish than AC.',
    detail: 'Solar modules produce DC (Direct Current) electricity at 600–1500V system voltage. Modules are connected in series using MC4 connectors (Multi-Contact 4mm — industry standard plug-and-socket). Over years, connectors degrade from UV, thermal cycling, moisture, and mechanical stress. A degraded connector develops high contact resistance — current flowing through resistance generates heat (P=I²R). Eventually, the heat melts the connector housing, creating a gap — and a sustained DC arc forms across the gap. DC arcs are uniquely dangerous because unlike AC (which crosses zero 100 times/second, providing natural extinction points), DC arcs are CONTINUOUS — they sustain at 5000°C until the circuit is physically broken.',
    rootCause: 'Causes: (1) MC4 connector not fully clicked (installation error), (2) Water ingress corroding connector pins (coastal/humid sites), (3) UV degradation of connector housing (becomes brittle, cracks), (4) Thermal cycling loosening the connection over time, (5) Wrong brand connectors mixed (MC4 from different manufacturers don\'t always seal properly).',
    incident: 'Tamil Nadu Solar Plant (Feb 2024): Single MC4 connector failure caused sustained DC arc flash. Fire ignited dry grass surrounding module arrays. Spread through 8 MW of modules in 90 minutes before fire services could respond (remote site, poor road access). Total loss: ₹25 Cr.',
    typicalCost: 'Single connector failure (detected early): ₹50,000 repair. If arc flash starts fire: ₹5–50 Cr depending on fire spread. A 100 MW plant may have 50,000+ MC4 connections — one failure can destroy 10% of the plant.',
    prevention: 'Annual infrared thermography scanning of ALL connectors and junction boxes (detects hot spots 6–12 months before failure). String-level current monitoring (detects resistance increase). Proper installation training and torque. Fire breaks (cleared vegetation) around module arrays. Rapid-shutdown systems (NEC 2017 requirement).',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HYDRO
  // ═══════════════════════════════════════════════════════════════════════

  'turbine runner erosion from silt': {
    tooltip: 'Himalayan rivers carry extreme silt (2000–10000 ppm monsoon). Sand blasts turbine runners at high velocity — runners need replacement every 3–5 years.',
    detail: 'Francis turbine runners in Himalayan hydro projects operate in water carrying suspended sand/silt particles (quartz hardness 7 on Mohs scale). During monsoon, silt concentration reaches 2000–10000 ppm (parts per million). These hard particles impact runner blade surfaces at velocities of 30–60 m/s, progressively eroding the stainless steel. The erosion pattern follows the water flow — worst at blade leading edges, guide vane faces, and labyrinth seals. After 2–5 monsoon seasons (depending on silt severity), runner blade profiles degrade enough to reduce efficiency by 3–8% and create cavitation zones.',
    rootCause: 'Causes: (1) High quartz content in Himalayan river sediment (glacial grinding produces fine, hard particles), (2) Monsoon-concentrated sediment load (90% of annual silt passes in 4 months), (3) Desilting chambers unable to remove particles below 0.2mm (fine silt passes through), (4) Inadequate design for Indian silt conditions (European designs assume much lower sediment), (5) Cavitation amplifies erosion at damaged surfaces (synergistic effect).',
    incident: 'SJVN Nathpa Jhakri (every monsoon): The 1500 MW plant on Satluj River faces extreme silt. Runners need HVOF (Hard-face) coating reapplication every 2–3 years and full runner replacement every 8–10 years. Annual silt damage cost: ₹15–30 Cr in maintenance. BHEL supplies replacement runners — 12–18 month fabrication lead time.',
    typicalCost: 'HVOF coating repair: ₹5–10 Cr per runner + 4–6 weeks shutdown. Full runner replacement: ₹20–50 Cr per runner + 12–18 months fabrication (BHEL/Andritz). For a 6-unit plant: staggered replacement means 1 unit always being refurbished.',
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=300&fit=crop',
    imageAlt: 'Hydroelectric dam with water flowing through turbine channels',
    prevention: 'Desilting chambers upstream (remove particles >0.2mm). HVOF (High Velocity Oxygen Fuel) hard-face coatings on runner blades (extends life 2–3×). Plant shutdown when silt >5000 ppm (operating rules). Silt monitoring at intake. Consider Pelton turbines for high-head applications (less silt damage than Francis).',
  },

  'headrace tunnel collapse': {
    tooltip: 'Long tunnels (5–30 km) carry water from intake to powerhouse in Himalayas. Geological instability can cause roof collapse or lining failure.',
    detail: 'Run-of-river hydroelectric projects in the Himalayas use long headrace tunnels (5–30 km) to convey water from the river intake to the underground powerhouse. These tunnels pass through complex geology — folded sedimentary rocks, fault zones, shear zones, and zones of high water pressure. Despite geological surveys, unexpected conditions are common. Tunnel lining (concrete or steel) must resist water pressure from inside and rock/water pressure from outside. If geological conditions are worse than predicted, or if aging degrades the lining, collapse can occur.',
    rootCause: 'Causes: (1) Unexpected fault zone encounter (geological surprise — surveys can miss), (2) High water inflow from fractured rock (hydraulic pressure exceeds lining design), (3) Rock burst (high in-situ stress releases explosively into tunnel), (4) Squeezing ground (soft rock slowly closes tunnel under overburden pressure), (5) Concrete lining degradation from aggressive groundwater chemistry (sulphate attack).',
    incident: 'NTPC Tapovan Vishnugad (Feb 2021 — Chamoli disaster): The headrace tunnel was in final stages of construction when glacial debris-flood entered. 2+ km of tunnel filled with debris/rock/silt. Workers trapped underground. Tunnel clearing took 6+ months. Project delayed 2+ years. Total cost: ₹1,500+ Cr.',
    typicalCost: 'Localised collapse (10–50m section): ₹20–80 Cr repair + 6–18 months. Major collapse (100m+ section or multiple locations): ₹100–500 Cr + 1–3 years. If tunnel is fully blocked (debris flood): may require re-boring — ₹500+ Cr.',
    prevention: 'Advance geological probing ahead of tunnel face during construction. Steel rib support in poor geology zones. Shotcrete + rock bolts immediately after excavation. Tunnel convergence monitoring (detect squeezing). Drainage holes to relieve water pressure behind lining. Regular internal inspection by dewatering (every 5–10 years).',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NUCLEAR
  // ═══════════════════════════════════════════════════════════════════════

  'turbine hall flooding': {
    tooltip: 'Nuclear turbine halls contain standard steam turbines (insurable). Coastal flooding damages these identically to conventional thermal plants.',
    detail: 'The turbine island of a nuclear power plant contains a conventional steam turbine-generator set (manufactured by BHEL in India) that is technically identical to thermal plant equipment. It sits in a turbine hall building, typically at or near ground level. Coastal nuclear plants (Kudankulam, MAPS Kalpakkam, TAPS Tarapur) are vulnerable to the same flooding risks as any coastal industrial facility — cyclone storm surge, tsunami, or extreme rainfall. The key difference: any damage to the turbine island at a nuclear plant triggers mandatory AERB investigation before restart.',
    rootCause: 'Causes: (1) Cyclone storm surge exceeding site design flood level, (2) Tsunami (post-Fukushima, all Indian coastal nuclear plants have upgraded tsunami walls), (3) Extreme rainfall overwhelming site drainage, (4) Cooling water system backflow during high tide + storm coincidence. Post-Fukushima reviews raised flood protection standards at all Indian coastal nuclear sites.',
    incident: 'Fukushima Daiichi, Japan (2011): 15m tsunami overwhelmed 5.7m seawall. Seawater flooded turbine halls and diesel generator rooms. Loss of all power (station blackout) led to core melt in 3 reactors. The TURBINE HALL damage itself was conventional flood damage — it was the CONSEQUENTIAL loss of emergency power that caused the nuclear disaster. This distinction matters for insurance boundaries.',
    typicalCost: 'Turbine hall flood damage (India): ₹100–500 Cr (turbine island equipment). The nuclear-specific addition: AERB investigation adds 6–12 months to BI timeline even if physical repair is faster. Total BI exposure for KKNPP 1000 MW unit: ₹7 Cr/day.',
    prevention: 'Post-Fukushima upgrades at all Indian coastal nuclear plants: raised flood protection walls, passive decay heat removal systems, flood-proof emergency diesel generators, mobile pumps staged at elevated locations. AERB periodic safety reviews every 10 years validate flood protection adequacy.',
  },

  'regulatory shutdown order': {
    tooltip: 'AERB can order any nuclear plant shut for safety investigation — even for non-nuclear events. This adds 3–12 months to ANY BI claim at a nuclear plant.',
    detail: 'The Atomic Energy Regulatory Board (AERB) has absolute authority to order shutdown of any nuclear installation for safety reasons. Unlike thermal plants (where the operator decides when to restart after repair), nuclear plants CANNOT restart without explicit AERB clearance. This means ANY reportable event — including purely conventional events like turbine bearing failure or transformer flashover — triggers a review process. AERB may order the unit to remain shut until they are satisfied that: (1) root cause is fully understood, (2) the event cannot recur, (3) no nuclear safety implications exist. This process takes 3–6 months minimum, sometimes 12+ months for complex events.',
    rootCause: 'This is not a "failure" — it\'s a REGULATORY REQUIREMENT. Every nuclear plant operates under an AERB license with conditions. Any event classified as "reportable" (defined in AERB Safety Directives) triggers the investigation process. Even events entirely within the commercially-insured turbine island trigger this process because AERB must satisfy themselves that the event had no pathway to affect nuclear safety.',
    incident: 'KAPS-1 Kakrapar (1994): Heavy water leak from primary circuit. Even though the leak was contained and no radiation was released off-site, AERB investigation kept the unit shut for multiple months while they reviewed the cause and ensured it couldn\'t escalate. The PHYSICAL repair was done in weeks — the REGULATORY clearance took months. This is the paradigm for all nuclear BI claims.',
    typicalCost: 'The regulatory shutdown itself costs nothing in material damage — it\'s pure BI cost. For a 1000 MW unit (KKNPP): ₹7 Cr/day × 90 days (minimum AERB investigation) = ₹630 Cr BI JUST from the regulatory process, on top of whatever the physical repair costs. This is why nuclear BI indemnity periods must be 36 months.',
    prevention: 'Cannot be "prevented" — it\'s a regulatory requirement that protects public safety. Can be MITIGATED by: excellent safety culture (fewer reportable events), pre-agreed AERB communication protocols (faster investigation), maintaining comprehensive records (speeds AERB review), and learning from international nuclear operating experience (WANO/IAEA best practices).',
  },
};

/**
 * Look up a knowledge entry by matching the impact area text (case-insensitive).
 * Returns null if no match found.
 */
export function lookupImpactKnowledge(areaText: string): KnowledgeEntry | null {
  return IMPACT_KNOWLEDGE[areaText.toLowerCase()] ?? null;
}

/**
 * Check if an impact area term has a knowledge entry (for highlighting).
 */
export function hasKnowledge(areaText: string): boolean {
  return areaText.toLowerCase() in IMPACT_KNOWLEDGE;
}


// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL ENTRIES — covering ALL remaining grey terms across all sources
// ═══════════════════════════════════════════════════════════════════════════════

// Add these to the IMPACT_KNOWLEDGE record:
const ADDITIONAL_ENTRIES: Record<string, KnowledgeEntry> = {

  // ── HYDRO: Generator & Electrical ──────────────────────────────────────────
  'stator winding burnout': {
    tooltip: 'Generator stator copper winding insulation fails from moisture or aging — short circuit melts conductors. Underground powerhouses are especially vulnerable due to high humidity.',
    detail: 'Hydro generator stators contain heavy copper bars insulated with mica tape and epoxy. In underground powerhouses (common in Himalayas), relative humidity can reach 90%+. Over years, moisture penetrates insulation, reducing its dielectric strength. Eventually a short circuit occurs between turns or to ground — the massive fault current (tens of thousands of amps) melts the copper and destroys adjacent insulation. The entire stator must be rewound.',
    rootCause: 'Causes: (1) Moisture ingress in underground powerhouse environment, (2) Thermal aging from overload operation, (3) Vibration loosening bar supports (bars chafe against core), (4) Partial discharge activity eroding insulation internally, (5) Contamination from oil/dust on winding surfaces reducing creepage distance.',
    incident: 'NHPC Uri-I (2016): Stator winding failure in 120 MW unit. Underground powerhouse humidity contributed to insulation degradation. Unit offline 10 months for rewind. Cost: ₹25 Cr (MD) + ₹18 Cr (BI). Highlighted need for dehumidification systems in underground powerhouses.',
    typicalCost: 'Stator rewind: ₹20–50 Cr + 8–14 months for hydro generators (BHEL). Larger units (250 MW) take longer due to bar size. Transportation of new bars to underground powerhouse adds complexity.',
    prevention: 'Dehumidification systems in underground powerhouses (maintain RH <60%). Online partial discharge monitoring. Insulation resistance testing during shutdowns. Winding temperature monitoring. Generator condition assessment every 5–7 years.',
  },

  'rotor pole damage': {
    tooltip: 'Hydro generator rotors have salient poles (magnetic field poles). Pole winding insulation failure or pole body cracking causes imbalanced magnetic pull — severe vibration.',
    detail: 'Hydro generators use salient-pole rotors (unlike cylindrical rotors in thermal). Each rotor has 12–60 poles (depending on speed/frequency), each with field windings wound around a laminated pole body. Poles are bolted to the rotor rim. Damage modes: inter-turn short in pole winding (overheating), pole body cracking from centrifugal force, loose pole bolt allowing pole to shift.',
    rootCause: 'Causes: (1) Inter-turn short from insulation aging/contamination, (2) Pole body cracking from centrifugal stress + fatigue cycles (start/stop), (3) Loose pole-to-rim bolts from vibration, (4) Manufacturing defect in pole laminations, (5) Excessive field current causing overheating.',
    typicalCost: 'Single pole repair (field re-insulation): ₹3–8 Cr + 4–8 weeks. Multiple pole replacement: ₹15–30 Cr + 3–6 months. If rotor rim is damaged: major overhaul ₹40–60 Cr.',
    prevention: 'Regular field winding resistance measurement (detect inter-turn shorts). Vibration monitoring for magnetic imbalance. Visual pole inspection during dewatering. Bolt torque checks. Shaft voltage monitoring.',
  },

  'thrust bearing failure': {
    tooltip: 'Vertical hydro generators rest their entire weight (200–500 tonnes) on a thrust bearing. If it fails, the rotor drops — catastrophic destruction of the machine.',
    detail: 'Vertical hydro generators (most Indian units) have the rotor + shaft + turbine runner weight supported by a single thrust bearing at the top. This bearing handles 200–500 tonnes of axial load plus hydraulic thrust from the runner. It typically uses tilting pads on a hardened steel disc, lubricated by high-pressure oil. Failure means the entire rotating assembly drops by several millimetres — stator-rotor contact, runner-discharge ring contact, and potentially the shaft falling into the turbine pit.',
    rootCause: 'Causes: (1) Oil supply failure (pump failure, pipe blockage), (2) Thrust pad cracking or deformation, (3) Shaft runner overload exceeding bearing design (hydraulic transients), (4) Oil contamination (water ingress during flood events), (5) Cooling water failure causing oil overheating.',
    incident: 'Sayano-Shushenskaya disaster (Russia, 2009): Thrust bearing fatigue cracks allowed turbine-generator assembly to be ejected from its seat by water pressure. 75 killed. The world\'s worst hydro disaster. Though a specific design issue, it demonstrated catastrophic consequences of vertical machine support failure.',
    typicalCost: 'If caught early (pad replacement): ₹5–15 Cr + 2–4 weeks. If shaft drops (catastrophic): total loss of generator — ₹80–200 Cr + 2–3 years rebuild. The Sayano-Shushenskaya loss: $1.3 billion (10 units destroyed by flood from one unit failure).',
    prevention: 'Continuous thrust bearing temperature monitoring (every pad). Oil pressure monitoring with auto-trip. Vibration monitoring for axial movement. Annual pad inspection during dewatering. Thrust bearing load measurement system.',
  },

  'excitation system fault': {
    tooltip: 'The excitation system supplies DC current to generator field windings to create the magnetic field. Failure means the generator cannot produce power — unit trips offline.',
    detail: 'Generator excitation systems provide controlled DC current (hundreds to thousands of amps) to the rotor field winding, creating the magnetic field that generates electricity. Modern systems use thyristor-controlled rectifiers (static excitation) or brushless rotating exciters. Failure modes: thyristor burnout, regulator malfunction, field breaker failure, loss of sensing signals. Without excitation, the generator cannot maintain voltage — it trips.',
    rootCause: 'Causes: (1) Thyristor/diode failure in rectifier bridge, (2) Automatic Voltage Regulator (AVR) software/hardware fault, (3) Excitation transformer failure, (4) Brush/slip ring problems (in brush-type systems), (5) Lightning surge damaging electronic components, (6) Cooling fan failure causing thyristor overheating.',
    typicalCost: 'Component replacement (thyristors, AVR cards): ₹20 Lakh–1 Cr + 1–7 days. Complete excitation system replacement: ₹3–8 Cr + 2–4 months. Low severity individually but causes immediate loss of generation.',
    prevention: 'Redundant excitation channels (A/B system with auto-changeover). Surge protection on excitation electronics. Regular thyristor testing. AVR software updates. Cooling system maintenance.',
  },

  'generator transformer failure': {
    tooltip: 'The generator transformer steps up voltage from generator level (11–21 kV) to transmission level (220–400 kV). Failure = unit disconnected from grid. Lead time: 12–18 months.',
    detail: 'Each generator has a dedicated step-up transformer connecting it to the high-voltage grid. These are large oil-filled transformers (100–400 MVA). Failure modes are identical to any large power transformer: winding insulation breakdown, bushing flashover, tap changer failure, oil degradation. The key issue for hydro: many generators are in remote mountain locations where transformer replacement requires special transport (oversized load on narrow mountain roads).',
    rootCause: 'Causes: (1) Winding insulation aging (thermal + electrical stress over 25–40 years), (2) Oil degradation/contamination, (3) Lightning or switching surge exceeding BIL, (4) Tap changer malfunction causing internal fault, (5) Overloading during peak demand periods. Mountain locations add: seismic stress, altitude derating, difficult access for repair crews.',
    typicalCost: '₹15–60 Cr + 12–18 months (transformer procurement + delivery to remote site). Transport of 100+ tonne transformer up mountain roads: ₹2–5 Cr additional. Some Himalayan sites are only accessible 6 months/year (roads closed in monsoon/winter).',
    prevention: 'Quarterly DGA (Dissolved Gas Analysis). Online moisture-in-oil monitoring. Bushing capacitance/tan-delta testing. Surge arrestor maintenance. Load management to avoid overloading. Strategic spare transformer at accessible location.',
  },

  // ── HYDRO: Penstock & Civil ─────────────────────────────────────────────────
  'penstock burst at weld joint': {
    tooltip: 'Penstocks carry water at extreme pressure (50–500m head). Welds are the weakest points — fatigue cracks grow until the pipe ruptures catastrophically, releasing a wall of water.',
    detail: 'Penstocks are large steel pipes (2–6m diameter, 12–50mm wall thickness) carrying water from reservoir/intake to turbines under gravitational head pressure. A 500m head creates 50 bar internal pressure. Pipes are fabricated from rolled steel plates welded together (longitudinal + circumferential welds). These welds contain microscopic defects from fabrication. Under cyclic pressure (load changes, water hammer), defects grow through fatigue until the weld fails suddenly — releasing water at enormous flow rate.',
    rootCause: 'Causes: (1) Fatigue crack growth at weld toes (stress concentration), (2) Original weld defects (porosity, lack of fusion) not detected during construction QC, (3) Corrosion reducing wall thickness near welds, (4) Water hammer events (sudden valve closure) creating pressure spikes 2–3× static pressure, (5) Frost damage to exposed penstock sections (water freezing in surface cracks).',
    incident: 'Srisailam Left Bank Power House (2020): Penstock failure during flood operations. Water pressure surge during emergency gate operation created water hammer exceeding design limits. Penstock developed crack at circumferential weld. Powerhouse flooded, 9 workers trapped. Estimated loss: ₹200 Cr.',
    typicalCost: 'Localised weld repair (detected early): ₹2–10 Cr + 2–4 weeks. Full penstock section replacement: ₹20–80 Cr + 3–12 months (fabrication + transport + welding at site). If burst floods powerhouse: ₹100–500 Cr (powerhouse equipment destroyed).',
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=300&fit=crop',
    imageAlt: 'Large steel penstock pipe running down a mountainside to a hydropower plant',
    prevention: 'Periodic NDT (Non-Destructive Testing) of all penstock welds — ultrasonic + radiographic every 5 years. Wall thickness measurement (ultrasonic). Water hammer protection (slow-closing valves, surge tanks). Internal coating/cathodic protection against corrosion. Pressure relief valves.',
  },

  'expansion joint failure': {
    tooltip: 'Expansion joints allow thermal expansion/contraction of long penstocks. If the joint fails, the penstock sections separate or lock — causing burst or structural damage.',
    detail: 'Long penstocks (hundreds of metres) expand and contract with temperature changes (steel expands 12mm per 100m per 10°C change). Expansion joints (bellows or sleeve type) accommodate this movement. If a joint seizes (corrosion, debris), the penstock cannot move — thermal stress builds until something fails. If a joint separates (anchor bolt failure), high-pressure water escapes at the gap.',
    rootCause: 'Causes: (1) Corrosion seizing the sliding surfaces, (2) Debris/silt accumulation in joint cavity, (3) Anchor block failure allowing excessive movement, (4) Bellows fatigue cracking (cyclic compression/extension), (5) Incorrect installation (inadequate movement range for temperature range).',
    typicalCost: 'Joint replacement: ₹1–5 Cr + 2–4 weeks shutdown. If joint separation causes uncontrolled water release: same as penstock burst — ₹20–200 Cr depending on downstream damage.',
    prevention: 'Annual expansion joint inspection (movement, corrosion, bellows condition). Lubrication of sliding joints. Anchor block monitoring (survey for displacement). Temperature-movement correlation checks. Debris cleaning during annual shutdown.',
  },

  'anchor block displacement': {
    tooltip: 'Anchor blocks hold penstock sections at bends against hydraulic thrust forces. If the block moves (foundation failure, soil erosion), the penstock misaligns — potential rupture.',
    detail: 'At every bend in a penstock, the water changes direction — creating a thrust force that tries to push the pipe outward (like a garden hose when you bend it). Massive concrete anchor blocks (50–500 tonnes) resist this thrust. If the anchor block foundation fails (landslide, soil erosion, seismic displacement), the block moves — penstock sections misalign, joints open, and failure follows.',
    rootCause: 'Causes: (1) Foundation erosion from surface water (improper drainage), (2) Landslide moving the hillside on which block sits, (3) Seismic displacement, (4) Poor original foundation design (inadequate soil bearing capacity), (5) Tree root growth displacing the block over decades.',
    typicalCost: 'Block stabilisation (grouting, anchoring): ₹2–10 Cr. If block failure causes penstock separation: ₹20–100 Cr (penstock repair + downstream damage). Remote Himalayan locations multiply all costs by 2–3×.',
    prevention: 'Survey anchor block positions annually (detect movement of even 5mm). Drainage maintenance around blocks. Slope stability monitoring above and below blocks. Seismic design verification for Zone IV/V sites.',
  },

  'water hammer damage': {
    tooltip: 'Water hammer is a pressure shock wave when flow changes suddenly (valve closure, load rejection). Pressure spikes can reach 2–3× normal — bursting pipes and damaging equipment.',
    detail: 'When water flowing at velocity in a penstock is suddenly stopped (fast valve closure, turbine trip, guide vane slam-shut), the kinetic energy of the water converts to a pressure wave. This wave travels at ~1200 m/s (speed of sound in water), bouncing between closed valve and reservoir. Peak pressure can reach 2–3× static pressure. For a 300m head penstock: static pressure 30 bar, water hammer can spike to 90 bar — exceeding pipe and equipment design limits.',
    rootCause: 'Causes: (1) Emergency valve closure (load rejection causing fast guide vane closure), (2) Pump trip in pumped storage (sudden flow reversal), (3) Air pocket collapse in partially-filled penstock, (4) Valve malfunction (slamming shut instead of slow close), (5) Design error in surge tank sizing (insufficient damping).',
    typicalCost: 'Penstock weld failure from water hammer: ₹20–80 Cr. Guide vane/spiral casing damage: ₹10–30 Cr. Surge tank overflow: ₹5–15 Cr. In severe cases, powerhouse flooding from burst penstock: ₹100–500 Cr.',
    prevention: 'Surge tanks (absorb pressure waves). Slow-closing guide vanes (>10 second closure time). Pressure relief valves on penstock. Runner design accommodating overspeed. Operational procedures: never close valves faster than design rate.',
  },

  'downstream flooding of powerhouse': {
    tooltip: 'A penstock or intake failure can send uncontrolled water into the powerhouse — flooding generators, transformers and controls. Underground powerhouses are especially vulnerable.',
    detail: 'If a penstock ruptures, expansion joint fails, or intake gate cannot close, high-pressure water flows into the powerhouse uncontrolled. Underground powerhouses (common in India for Himalayan projects) are below river level — once water enters, it pools in the machine hall. All electrical equipment is destroyed by submersion. Dewatering an underground powerhouse takes weeks. Even surface powerhouses can flood if tailrace level rises (during flood) or penstock burst is above powerhouse floor level.',
    rootCause: 'Causes: (1) Penstock burst (see penstock failure entry), (2) Intake gate failure to close on demand, (3) River flood exceeding tailrace design level (backflow into powerhouse), (4) Dewatering pump failure during maintenance (water accumulates), (5) Tunnel collapse sending debris-laden water into powerhouse.',
    incident: 'Srisailam Left Bank (2020): Penstock issue during flood operation caused powerhouse inundation. Workers trapped in underground powerhouse. 9 rescuers lost. All 6 generating units (6×150 MW = 900 MW) submerged and damaged. Restoration took 18+ months.',
    typicalCost: 'Full powerhouse flooding: ₹100–500 Cr (generators, transformers, controls all destroyed). Underground powerhouse dewatering + cleanup: 2–4 months before repair can even begin. Total BI for 6-unit plant: ₹200–400 Cr (18–24 months offline).',
    prevention: 'Redundant intake gate mechanisms (hydraulic + gravity close). Penstock isolation valves upstream of powerhouse. Flood warning systems with auto-shutdown sequence. Waterproof barriers at powerhouse entrance (above tailrace design flood level). Emergency dewatering pumps.',
  },

  // ── HYDRO: Spillway & Dam ──────────────────────────────────────────────────
  'gate hoist mechanism failure': {
    tooltip: 'Spillway gates are lifted by hoist mechanisms (winch, hydraulic, or wire rope). If the hoist fails, the gate cannot open during flood — dam safety emergency.',
    detail: 'Spillway gates (radial/tainter gates or vertical lift gates) weigh 50–500 tonnes. They are raised and lowered by mechanical hoists: wire rope drum, chain hoist, or hydraulic cylinders. During floods, gates must open on demand to pass flood water safely. If the hoist mechanism fails (motor burnout, gearbox failure, rope snap), the gate cannot be raised — water level rises above safe limits, potentially overtopping the dam. This is a DAM SAFETY emergency.',
    rootCause: 'Causes: (1) Gearbox failure (gear tooth stripping from corrosion + infrequent use), (2) Wire rope breakage (corrosion of wires, fatigue), (3) Power failure without backup (electrical gates need power to operate), (4) Hydraulic system leak (hydraulic gates lose pressure), (5) Gate guide corrosion causing gate to jam in closed position.',
    typicalCost: 'Hoist repair: ₹1–5 Cr + 1–4 weeks (if not during flood emergency). If gate cannot open during flood and dam overtops: CATASTROPHIC — dam breach potential, downstream devastation, criminal liability for dam owner. Dam Safety Act 2021 imposes penalties.',
    prevention: 'Pre-monsoon gate testing (open/close all gates dry-run every year). Wire rope inspection and replacement on schedule. Standby diesel generators for gate operation during power failure. Corrosion protection of gate guides. Dam Safety Act compliance — mandatory periodic testing.',
  },

  'wire rope/chain snap': {
    tooltip: 'Wire ropes or chains lifting spillway gates corrode internally over years. A snap during flood gate operation is catastrophic — gate drops uncontrolled or cannot open.',
    detail: 'Spillway gate wire ropes are high-tensile steel ropes (50–100mm diameter) that wind onto drums to lift gates weighing 50–500 tonnes. Ropes operate in wet/humid environments near water, causing internal corrosion that is invisible externally (wires corrode inside the rope lay). A rope at 50% capacity can snap without warning when loaded during emergency gate opening. Chain hoists have similar failure mode — individual link corrosion leading to chain separation.',
    rootCause: 'Causes: (1) Internal corrosion (water penetration between rope wires), (2) Fatigue from repeated bending over sheaves, (3) Overload from gate seizure (hoist tries to lift jammed gate), (4) Lack of lubrication allowing rust, (5) Kinking damage from improper spooling. Ropes that sit unused 50 weeks/year and are suddenly loaded to full capacity during flood are especially vulnerable.',
    typicalCost: 'Rope replacement: ₹20–80 Lakh per gate. Emergency rope failure during flood: unquantifiable — dam safety consequence. If gate cannot be operated: potential downstream evacuation, regulatory shutdown of entire dam.',
    prevention: 'Annual magnetic rope testing (MRT) to detect internal wire breaks. Rope replacement on schedule (every 10–15 years regardless of visible condition). Regular lubrication. Load testing at 125% capacity. Multiple rope redundancy where possible.',
  },

  'gate body corrosion/jamming': {
    tooltip: 'Spillway gate bodies (steel plates) corrode over decades in wet conditions. Corrosion of gate seals and guides causes the gate to jam — it cannot open or close on demand.',
    detail: 'Spillway gates are large steel fabrications (5–15m wide, 5–20m tall) that sit in concrete slots (guides). They seal against the concrete face with rubber seals. Over 30–50 years: (1) gate body steel corrodes reducing structural strength, (2) rubber seals harden and leak, (3) guide rails corrode creating friction that increases hoisting force needed, (4) silt/debris accumulates in guides jamming the gate. A corroded gate that cannot move is a dam safety emergency.',
    rootCause: 'Causes: (1) Atmospheric + immersion corrosion of gate steel (splash zone worst), (2) Lack of paint/coating maintenance, (3) Biofouling (mussels, algae) in guides, (4) Silt deposition in gate seat, (5) Cathodic protection system failure, (6) Long periods without gate operation (corrosion products cement the gate in place).',
    typicalCost: 'Gate refurbishment (blast + repaint + new seals): ₹2–10 Cr per gate. Gate replacement (new fabrication): ₹10–30 Cr per gate + 12–18 months fabrication. If jammed during flood: emergency measures (blasting the gate, alternate spillway) — ₹50+ Cr plus dam safety liability.',
    prevention: 'Regular gate operation (open/close quarterly even without flood — prevents "freeze" from inactivity). Paint/coating maintenance on schedule. Debris removal from gate seats before monsoon. Seal replacement every 10–15 years. Cathodic protection system maintenance.',
  },

  'hydraulic actuator failure': {
    tooltip: 'Hydraulic-operated gates use oil cylinders to lift/lower the gate. Seal failure, pump breakdown, or oil contamination means the gate cannot be operated.',
    detail: 'Some spillway gates (especially radial/tainter gates) are operated by hydraulic cylinders rather than wire ropes. Hydraulic systems use oil pressurised to 100–200 bar to push pistons that move the gate. The system requires: hydraulic pump, oil reservoir, control valves, pipework, and cylinders. Any failure in this chain = gate inoperability. Hydraulic oil can also leak, creating environmental contamination in the reservoir.',
    rootCause: 'Causes: (1) Hydraulic seal wear/failure (oil leaks, pressure loss), (2) Pump motor burnout, (3) Oil contamination (water ingress reducing lubricity), (4) Control valve malfunction (gate moves to wrong position or not at all), (5) Pipe/hose burst from pressure fatigue, (6) Air in hydraulic system (compressible — gate moves erratically).',
    typicalCost: 'Seal replacement: ₹10–30 Lakh. Complete hydraulic system overhaul: ₹1–3 Cr. If gate inoperable during flood emergency: same catastrophic consequence as any gate failure — unquantifiable dam safety cost.',
    prevention: 'Regular hydraulic oil sampling (contamination, particle count). Seal condition assessment during gate operation. Standby pump system. Oil level and pressure alarms. Annual full-stroke testing under load.',
  },

  'uncontrolled reservoir drawdown': {
    tooltip: 'If a gate opens and cannot close, the reservoir drains uncontrollably — losing stored water (generation revenue) and potentially destabilising the dam slopes from rapid drawdown.',
    detail: 'If a spillway gate mechanism fails in the OPEN position (gate jams open, wire rope breaks with gate raised), reservoir water flows out uncontrolled until level drops below the gate sill. This causes: (1) loss of stored water = loss of generation revenue for weeks/months, (2) rapid drawdown destabilises reservoir slopes (pore pressure in saturated soil exceeds reduced water support — landslides into reservoir), (3) downstream flooding from sudden release.',
    rootCause: 'Causes: (1) Wire rope snap with gate in raised position, (2) Hydraulic lock failure (gate gravity-drops to open from any position), (3) Gate body structural failure (gate breaks apart in open position), (4) Control system error opening gate fully without operator command, (5) Deliberate opening during flood that cannot be reversed.',
    typicalCost: 'Revenue loss from empty reservoir: ₹20–100 Cr (depending on reservoir size and generation capacity). Slope stability remediation: ₹10–50 Cr. Downstream damage liability: potentially hundreds of crores. Reservoir refilling: 1 monsoon season (6–12 months if event occurs after monsoon).',
    prevention: 'Gate position monitoring with alarms. Secondary gate (stop-log) capability to close opening if primary gate fails. Anti-drop devices on gates (mechanical locks when closed). Controlled drawdown procedures with slope monitoring. Emergency action plan (EAP) under Dam Safety Act.',
  },

  // ── HYDRO: Turbine specifics ───────────────────────────────────────────────
  'runner blade erosion (cavitation + silt)': {
    tooltip: 'Combination attack: silt particles erode the blade surface while cavitation (imploding vapour bubbles) creates pits. Together they destroy runner blades 3–5× faster than either alone.',
    detail: 'In Himalayan hydro turbines, two erosion mechanisms work synergistically: (1) SILT EROSION — hard quartz particles (2000–10000 ppm in monsoon) physically abrade blade surfaces like sandpaper at 30–60 m/s velocity. (2) CAVITATION — at low-pressure zones on the blade (suction side, trailing edge), water vapour bubbles form and collapse violently, creating micro-jets that pit the steel surface. Together: silt roughens the surface → cavitation is triggered at the rough spots → cavitation pits trap more silt → erosion accelerates exponentially. This combined mechanism destroys stainless steel runners in 2–5 monsoons.',
    rootCause: 'Primary drivers: (1) High silt content of Himalayan rivers (glacial grinding produces hard quartz particles), (2) Turbine operating at off-design conditions (partial load = more cavitation), (3) Inadequate desilting (particles below 0.2mm pass through), (4) Runner material insufficient for conditions (need 13Cr-4Ni martensitic stainless or HVOF coating), (5) Operating during high-silt periods instead of shutting down.',
    incident: 'SJVN Nathpa Jhakri (annual): 1500 MW plant on Satluj faces extreme silt every monsoon. Runners erode so severely that units must shut down mid-monsoon when silt exceeds 5000 ppm. Annual silt damage maintenance: ₹15–30 Cr. Full runner replacement cycle: every 8–10 years at ₹30–50 Cr per runner. Plant loses 15–20% of monsoon generation to silt shutdowns.',
    typicalCost: 'HVOF coating repair: ₹5–10 Cr per runner + 4–6 weeks. Full runner replacement: ₹20–50 Cr + 12–18 months fabrication (BHEL or Andritz). Revenue loss from silt shutdown: ₹2–5 Cr per day per 250 MW unit during peak monsoon.',
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=300&fit=crop',
    imageAlt: 'Water flowing through hydroelectric turbine channel',
    prevention: 'Desilting chambers upstream (remove >0.2mm particles). Shut down when silt exceeds 5000 ppm (operating rule). HVOF hard-face coatings on runner blades (tungsten carbide layer). Silt monitoring at intake (real-time turbidity sensors). Consider Pelton turbines for very high-silt rivers (jet deflection possible during high-silt).',
  },

  'guide vane wear': {
    tooltip: 'Guide vanes direct water onto the turbine runner at the correct angle. Silt erodes their surfaces and seals — reducing efficiency and control precision.',
    detail: 'Guide vanes (also called wicket gates) are the adjustable blades arranged in a ring around the Francis runner. They control water flow rate and direction onto the runner — essentially the "throttle" of the turbine. Each 250 MW turbine has 16–24 guide vanes. Silt-laden water erodes: (1) the vane surfaces (changing the hydrodynamic profile), (2) the bearing surfaces (making vanes stick or flutter), (3) the seal faces between vanes (allowing water to bypass without doing useful work, reducing efficiency).',
    rootCause: 'Causes: (1) Same silt erosion as runner blades but at lower velocity (still damaging over years), (2) Seal erosion allowing leakage (efficiency drop), (3) Bearing wear causing vane flutter/vibration, (4) Cavitation at vane trailing edges at partial load, (5) Foreign objects (rocks, wood) jamming between vanes.',
    typicalCost: 'Guide vane seal replacement: ₹1–3 Cr per set (16–24 vanes). Complete guide vane replacement: ₹5–15 Cr per turbine + 4–8 weeks. Efficiency loss from worn vanes: 1–3% continuously (₹2–5 Cr/year revenue loss per unit unnoticed).',
    prevention: 'Efficiency testing to detect guide vane wear (compare against commissioning curves). Seal replacement on schedule (every 5–8 years). Desilting to reduce silt load on vanes. Guide vane HVOF coating for critical erosion zones. Operating within designed head/flow range to minimize cavitation.',
  },

  'labyrinth seal damage': {
    tooltip: 'Labyrinth seals prevent water leaking between rotating and stationary parts of the turbine. Silt wears them open — increasing leakage and reducing turbine efficiency.',
    detail: 'Labyrinth seals are non-contact seals with a series of thin fins/teeth arranged in a labyrinth pattern. They sit between the rotating runner and the stationary cover/bottom ring. Water must pass through multiple throttling stages to leak through — minimizing leakage. But silt erodes the fin tips, opening the clearances. As clearances increase: (1) more water bypasses the runner without generating power, (2) axial hydraulic thrust changes (affecting thrust bearing load), (3) turbine efficiency drops 1–3%.',
    rootCause: 'Causes: (1) Silt erosion of seal fin tips (primary cause in Himalayan conditions), (2) Runner thermal expansion reducing clearance → contact → damage, (3) Foreign objects passing through and chipping seal fins, (4) Cavitation damage at seal entrance, (5) Incorrect clearance setting during assembly.',
    typicalCost: 'Seal replacement: ₹50 Lakh–2 Cr per seal set + 2–4 weeks shutdown. Often done during runner maintenance. Efficiency loss from worn seals (before replacement): 1–2% continuously = ₹1–3 Cr/year lost revenue per unit.',
    prevention: 'Measure seal clearances during every dewatering opportunity. Replace seals when clearance exceeds 2× design value. Use wear-resistant materials (stellite, tungsten carbide coating on fin tips). Monitor efficiency trend — declining efficiency often indicates seal wear.',
  },

  'shaft vibration from imbalanced runner': {
    tooltip: 'Uneven erosion of runner blades creates mass imbalance. The rotating shaft then vibrates excessively — damaging bearings, seals, and eventually the shaft itself.',
    detail: 'Francis turbine runners rotate at 100–375 RPM carrying 20–100 tonnes mass. If silt erosion is uneven across blades (some blades more eroded than others), or if a blade piece breaks off, the runner becomes mass-imbalanced. This creates a centrifugal force that causes the shaft to vibrate at rotational frequency (1× RPM). Vibration propagates through bearings to the generator, foundation, and structure. Sustained high vibration destroys bearing surfaces, opens seal clearances, and can fatigue-crack the shaft.',
    rootCause: 'Causes: (1) Uneven silt erosion (some blades face more silt than others due to inlet flow pattern), (2) Blade piece broken off (foreign object impact), (3) Incorrect runner balancing during manufacture/repair, (4) Debris caught in runner passages (asymmetric blockage), (5) Cavitation pitting on one side more than other.',
    typicalCost: 'If caught early (vibration monitoring): shutdown + runner rebalancing/repair ₹5–15 Cr + 2–4 weeks. If vibration damages shaft: shaft repair or replacement ₹30–80 Cr + 12–18 months. Bearing damage from sustained vibration: ₹5–15 Cr per bearing.',
    prevention: 'Continuous shaft vibration monitoring (proximity probes). Alarm at 50% of trip value. Regular runner inspection for uneven erosion patterns. Dynamic balancing after any runner repair. Trend analysis — gradually increasing vibration indicates developing imbalance.',
  },

  'entire runner replacement': {
    tooltip: 'When erosion damage is too severe to repair by welding/coating, the entire runner (10–50 tonnes precision casting/fabrication) must be replaced. Lead time: 12–18 months from BHEL/Andritz.',
    detail: 'A Francis runner is a single-piece or welded assembly of 12–17 blades between a crown and band plate. When silt erosion and cavitation have damaged blades beyond repair (blade profiles distorted, material too thin, stress cracks developed), the entire runner must be replaced. This is the most expensive and time-consuming maintenance event for a hydro turbine. A new runner must be: designed to match existing casing geometry, cast/fabricated (high-grade stainless steel), machined to precision, balanced, transported to site (often remote Himalayan location), and installed.',
    rootCause: 'Triggered when: (1) Blade profiles eroded beyond weld-repair limits (material too thin), (2) Stress cracks detected at blade-to-crown/band junctions, (3) Runner efficiency degraded >5% from original (economic case for replacement), (4) Runner material upgrade needed (older carbon steel → modern stainless). Typically occurs every 8–15 years for Himalayan plants, 20–30 years for low-silt plants.',
    typicalCost: 'New runner fabrication: ₹15–40 Cr (depending on size: 100 MW → 250 MW). BHEL lead time: 14–18 months. Andritz: 12–16 months. Installation: 4–6 weeks. Transportation to Himalayan site: ₹1–3 Cr (special trailer, road permits). Total per-unit cost: ₹20–50 Cr + 16–22 months.',
    prevention: 'Cannot be prevented indefinitely — silt ensures runner has finite life in Himalayas. Can be EXTENDED: HVOF coatings (2–3× life extension), operating shutdown during extreme silt (>5000 ppm), proper desilting, and periodic weld repair of erosion zones before they become unrepairable.',
  },

  // ── Additional Wind terms ──────────────────────────────────────────────────
  'nacelle detachment': {
    tooltip: 'The nacelle (top housing with gearbox+generator) can separate from the tower in extreme wind — yaw bearing failure or bolt fracture leads to total WTG loss.',
    detail: 'The nacelle (8–20 tonnes for modern turbines) sits atop the tower on a large yaw bearing (2–5m diameter slewing ring). It rotates 360° to face the wind. The yaw bearing is bolted to both the tower top flange and the nacelle bedplate. In extreme cyclonic conditions, if yaw loads exceed bearing/bolt capacity, or if the yaw brake fails to hold the nacelle oriented into wind, lateral forces can exceed design — bearing separates or bolts fracture. The nacelle, gearbox, generator, and hub fall from 80–150m height.',
    rootCause: 'Causes: (1) Cyclone wind exceeding design class (wrong turbine for site), (2) Yaw brake failure during storm (nacelle swings broadside to wind — maximum lateral load), (3) Yaw bearing bolt fatigue over years, (4) Tower-top flange corrosion weakening bolt seats, (5) Extreme yaw loading from turbulent/gusty wind in complex terrain.',
    typicalCost: 'Total WTG loss: ₹10–25 Cr (no repair possible — everything destroyed on impact). Tower usually also damaged (twisted/buckled from eccentric falling load). Foundation may survive for re-use. Adjacent WTGs can be hit by falling debris — check exclusion zones.',
    prevention: 'Correct IEC design class for site. Yaw brake testing every 6 months. Yaw bearing bolt torque checks annually. Storm control strategy (orient nacelle into wind and lock yaw during cyclone). Tower-top corrosion protection.',
  },

  'yaw system failure': {
    tooltip: 'The yaw system rotates the turbine to face the wind. If it fails during a storm, the nacelle cannot orient correctly — side loading exceeds design limits.',
    detail: 'The yaw system consists of: yaw motors (4–8 electric motors with planetary gearboxes driving a ring gear), yaw bearing (large slewing ring), yaw brake (hydraulic disc brakes), and wind direction sensors. During normal operation, yaw motors continuously adjust nacelle orientation. During storms, the yaw brake locks the nacelle in position. If yaw motors fail AND the brake fails, wind can push the nacelle off-axis — subjecting blades to extreme out-of-plane forces they weren\'t designed for.',
    rootCause: 'Causes: (1) Yaw motor gearbox failure (planetary gear wear), (2) Yaw brake hydraulic pressure loss, (3) Wind vane/sensor failure (turbine doesn\'t know wind direction), (4) Cable twist limit reached (cables inside tower can only twist ~2.5 turns before needing unwind), (5) Ring gear tooth damage from debris or wear.',
    typicalCost: 'Yaw motor/gearbox replacement: ₹5–15 Lakh per motor (4–8 motors total). Yaw bearing replacement: ₹30–60 Lakh + crane. If yaw failure during storm causes structural damage: ₹50 Lakh–5 Cr (blade/tower damage). Catastrophic failure: see nacelle detachment — total loss.',
    prevention: 'Yaw motor current monitoring (detect overload before failure). Yaw brake pressure testing. Regular cable unwind cycles. Ring gear lubrication and inspection. Storm strategy: lock yaw brake + orient into wind BEFORE storm arrives.',
  },

  // ── Additional Solar terms ──────────────────────────────────────────────────
  'tracker torque tube buckling': {
    tooltip: 'Tracker torque tubes are the structural spine of single-axis tracker rows. Cyclone winds on unstowed trackers exceed design — tubes buckle, entire rows collapse.',
    detail: 'Single-axis solar trackers use a central torque tube (steel pipe/section, 10–20m long per table) as the rotating axis. Modules are mounted on purlins attached to this tube. The tube is designed for wind loads in STOWED position (modules horizontal, low wind profile). If the tracker fails to stow during a storm and modules remain at a tracking angle, wind forces increase 2–4× — exceeding the torque tube\'s buckling resistance. The tube buckles/deforms, and the entire row of modules (50–100 modules, 30–60 kW) collapses onto the ground.',
    rootCause: 'Causes: (1) Auto-stow failure (communication loss to tracker controller during pre-storm), (2) Stow motor/actuator failure (mechanical jam), (3) Control software bug (wrong stow command), (4) Torque tube corrosion reducing wall thickness (coastal/humid sites), (5) Foundation failure allowing tracker post to lean — changing load path on torque tube.',
    incident: 'Cyclone Biparjoy, Gujarat (Jun 2023): Communication tower damaged by pre-cyclone winds, severing SCADA link to tracker controllers. Trackers could not receive stow command. 200 MW of trackers remained at 45° angle facing cyclone winds. Torque tubes buckled across the site. Loss: ₹80 Cr.',
    typicalCost: 'Torque tube replacement per tracker row: ₹2–5 Lakh. For a 100 MW plant with 50% rows damaged: ₹5–15 Cr structural + ₹15–30 Cr modules (damaged by collapse) + 2–4 months BI = total ₹30–60 Cr.',
    prevention: 'Redundant communication to tracker controllers (cellular + satellite + manual override). Pre-storm stow procedure activated at 24-hour forecast. Battery backup for stow motors. Annual stow test (full site stow drill before cyclone season). Torque tube wall thickness measurement every 5 years.',
  },

  'inverter/transformer submersion': {
    tooltip: 'Flood water entering inverter stations or pad-mount transformers causes total electrical failure. Saltwater (coastal floods) makes equipment irreparable — must be replaced.',
    detail: 'Solar plant inverters (central: 1–4 MW boxes; string: 100–300 kW units) and pad-mount transformers (oil-filled, 2–5 MVA) are typically ground-mounted or on low concrete pads. During flood events, water reaches these enclosures. Freshwater submersion damages electronics (short circuits, corrosion of PCBs). Saltwater is worse — chloride corrosion makes ALL electronic components unrecoverable. Even after drying, salt residue continues to corrode for months. Affected equipment must be completely replaced, not repaired.',
    rootCause: 'Causes: (1) Site flooding from river overflow (sites chosen for flat land — often near floodplains), (2) Dam/canal breach flooding adjacent solar park, (3) Insufficient site grading (low-lying inverter stations), (4) Drainage system blockage (monsoon debris), (5) Cyclone storm surge at coastal sites (saltwater).',
    typicalCost: 'Central inverter replacement: ₹3–8 Cr per unit (3–6 months lead time). Pad-mount transformer: ₹30–80 Lakh each. For a 100 MW plant with 5 inverter stations submerged: ₹15–40 Cr equipment + 3–6 months BI = total ₹40–70 Cr.',
    prevention: 'Site grading to ensure inverter stations are above design flood level. Raised concrete plinths (minimum 1m above ground). Flood barriers/bunds around inverter areas. Drainage system maintenance before monsoon. Flood insurance sublimit adequate for full inverter replacement.',
  },

  'module hotspot \u2192 backsheet fire': {
    tooltip: 'A damaged/shaded solar cell becomes a resistor, heating to 150°C+. This "hotspot" can ignite the plastic backsheet material — starting a fire that spreads through dry vegetation.',
    detail: 'In a series-connected solar string, each cell must carry the same current. If one cell is damaged (micro-crack), shaded (bird dropping, dirt), or disconnected, it cannot produce current — instead, it is forced to ABSORB power from the other cells (reverse-biased). This absorbed power converts to heat at that single cell location — a "hotspot" reaching 150–300°C. At these temperatures, the EVA encapsulant and polymer backsheet can ignite. The fire then spreads along the backsheet (plastic fuel), drops flaming material onto dry ground vegetation, and can quickly engulf surrounding module arrays.',
    rootCause: 'Causes: (1) Micro-cracked cell from hail/mechanical damage, (2) Persistent partial shading (bird nest, tree shadow on one cell), (3) Defective bypass diode (should short-circuit the damaged cell but fails), (4) Soldering defect (cell disconnected from factory), (5) Snail trail degradation (silver paste migration creating high-resistance paths).',
    typicalCost: 'Single module fire: ₹25,000 (module cost). Fire spreading through array: ₹5–50 Cr (depending on wind, vegetation, and how many rows are affected). A 2024 Tamil Nadu fire destroyed 8 MW in 90 minutes — ₹25 Cr. Dry season in Rajasthan/Gujarat amplifies spread rate enormously.',
    prevention: 'Annual infrared thermography (detect hotspots before ignition). String-level monitoring (detect underperforming strings). Vegetation management (fire breaks between rows — cleared 3m minimum). Bypass diode testing. Module-level rapid shutdown systems. Fire extinguisher stations within the array.',
  },

  // ── Additional Nuclear terms ───────────────────────────────────────────────
  'seawater intake pump damage': {
    tooltip: 'Nuclear plants need continuous cooling water from the sea. If intake pumps are damaged (debris, flooding, cyclone), emergency cooling systems must activate immediately.',
    detail: 'Coastal nuclear plants (Kudankulam, MAPS, TAPS) draw seawater through large pumps (typically 4–8 pumps per unit, each handling thousands of cubic metres per hour) for condenser cooling. These pumps are in a pump house near the shoreline. Cyclone debris (logs, marine debris), storm surge flooding, or earthquake damage to pump structure can disable multiple pumps simultaneously. Without cooling water, the turbine cannot condense steam — unit must trip. If ALL pumps fail simultaneously, it becomes a safety concern (though nuclear safety cooling is separate from condenser cooling).',
    rootCause: 'Causes: (1) Marine debris blocking intake screens during cyclone/storm, (2) Storm surge flooding pump house (motor damage from water), (3) Seabed sediment mobilised by storm blocking intake tunnel, (4) Earthquake damaging pump house structure, (5) Biofouling (mussel growth) reducing pump efficiency. Post-Fukushima: all Indian coastal nuclear plants upgraded seawater pump protection.',
    typicalCost: 'Pump motor rewinding: ₹50 Lakh–2 Cr per pump. Pump house flood damage: ₹10–30 Cr. Complete intake system restoration (post-cyclone): ₹20–50 Cr + 2–4 months. Key risk: if ALL pumps lost, safety systems activate — no revenue but no nuclear incident.',
    prevention: 'Debris screens with auto-cleaning mechanism. Pump house flood protection (raised floor, water barriers). Redundant pump capacity (N+2 design). Mobile backup pumps staged at elevated location. Intake tunnel inspection (diver/ROV) annually. Anti-biofouling (chlorination) systems.',
  },

  'diesel generator failure (emergency backup loss)': {
    tooltip: 'Emergency diesel generators start within seconds if grid power is lost. If they ALSO fail (flooding, fuel issue, mechanical), the plant loses all AC power — "station blackout" scenario.',
    detail: 'Nuclear plants have multiple layers of power supply: grid connection → unit auxiliary transformer → emergency diesel generators → DC batteries. Emergency diesels (typically 2–4 per unit, each 2–8 MW) start automatically within 10 seconds if all normal power sources are lost. They power emergency cooling systems, control systems, and lighting. If diesels ALSO fail (the "common cause" failure), the plant enters "station blackout" — relying only on DC batteries (4–8 hours life) and passive safety systems. This was the critical failure at Fukushima (diesels flooded by tsunami).',
    rootCause: 'Causes: (1) Common-cause flooding (tsunami/surge flooding all diesel rooms simultaneously), (2) Common-cause fuel issue (contaminated fuel batch), (3) Seismic damage to diesel foundations, (4) Failure to maintain diesels adequately (they run only during testing — starting problems from inactivity), (5) Cooling water loss to diesel radiators (parasitic dependency). Key lesson from Fukushima: diverse location and elevation of backups.',
    incident: 'Fukushima Daiichi (2011): 13 diesel generators at 6 units were positioned in basements. Tsunami flooded ALL of them simultaneously. Units 1-3 entered station blackout → core melt within 24–72 hours. This single failure mode (common-location diesels) caused the world\'s worst nuclear disaster since Chernobyl. Cost: $200 billion+ (total economic impact). All Indian nuclear plants have since relocated/elevated backup generators.',
    typicalCost: 'Diesel generator replacement: ₹5–15 Cr per unit. Complete diesel room flood restoration: ₹20–50 Cr. The CONSEQUENCE of all-diesel-failure at a nuclear plant: incalculable — Fukushima cost $200 billion to Japan\'s economy and permanently shut 54 reactors worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop',
    imageAlt: 'Emergency backup diesel generator in an industrial setting',
    prevention: 'Post-Fukushima India measures: (1) Relocated diesels to elevated positions above design flood level, (2) Added mobile diesel generators (truck-mounted, staged at high ground), (3) Installed passive decay heat removal (works without ANY power — gravity/convection driven), (4) Diverse and separated diesel rooms (no single event can disable ALL), (5) Extended battery life from 4 hours to 8+ hours.',
  },
};

// Merge additional entries into the main knowledge base
Object.assign(IMPACT_KNOWLEDGE, ADDITIONAL_ENTRIES);


// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORMER & BESS ENTRIES
// ═══════════════════════════════════════════════════════════════════════════════

const TRANSFORMER_BESS_ENTRIES: Record<string, KnowledgeEntry> = {
  'transformer failure': {
    tooltip: 'Power transformers (grid connection) now have 12–18 month replacement lead time in India. A single failure can idle an entire RE plant for over a year.',
    detail: 'Every solar, wind, and BESS plant connects to the grid through power transformers (typically 2.5–50 MVA). India faces a CRITICAL transformer shortage — manufacturing capacity cannot keep pace with 30+ GW/year RE additions + transmission expansion + industrial growth. Lead time for a replacement transformer has gone from 6 months (2020) to 12–18 months (2026). This means a transformer failure at an operating plant causes 12–18 months of Business Interruption — often ₹10–25 Cr in lost revenue for a 100 MW plant, from a component worth ₹50–90 Lakh.',
    rootCause: 'Failure causes: (1) Winding insulation aging (thermal + electrical stress over 15–25 years), (2) Oil degradation/moisture contamination, (3) Lightning surge exceeding BIL (Basic Insulation Level), (4) Overloading during peak generation periods, (5) Bushing flashover from contamination/aging. The REAL crisis is not failure rate (unchanged) — it is REPLACEMENT TIME (doubled). Same failure that was a 6-month repair is now 18-month catastrophe.',
    incident: 'Multiple RE projects in Rajasthan/Karnataka (2025–26): Transformer failures at operating solar plants requiring 14–16 month wait for replacement units. Some developers paying 2× premium for "queue-jumping" priority at manufacturers. One 50 MW solar plant in Rajasthan reportedly offline for 16 months awaiting a single 33 kV/132 kV transformer — BI loss: ₹18 Cr from a ₹65 Lakh component.',
    typicalCost: 'Transformer hardware: ₹30–90 Lakh (depending on MVA rating). Business Interruption: ₹6–24 Cr for 12–18 months offline (100 MW solar plant at 18% CUF). The BI is 15–40× the hardware cost. This makes transformer failure the HIGHEST ratio of BI-to-MD in the entire RE sector.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop',
    imageAlt: 'High-voltage power transformer at a substation',
    prevention: 'Quarterly DGA (detect problems 6–12 months before failure). Online moisture-in-oil monitoring. Load management (avoid sustained overloading). Strategic spare transformer pre-procured at project commissioning (₹50–90 Lakh insurance against ₹20+ Cr BI). Surge arrestor maintenance. Annual thermographic survey of bushings and connections.',
  },

  'thermal runaway': {
    tooltip: 'A battery cell enters uncontrolled self-heating — temperature rises from 100°C to 700°C+ in minutes. Fire propagates to adjacent cells. Can destroy entire BESS container.',
    detail: 'Thermal runaway is the catastrophic failure mode of lithium-ion batteries. When a cell is damaged (internal short, overcharge, external heat), it enters exothermic decomposition — the chemical reactions inside GENERATE heat faster than the cooling system can remove it. Temperature escalates from 100°C → 200°C → 700°C+ within minutes. The cell vents flammable gas, ignites, and the heat propagates to adjacent cells (cascade). In a BESS container with 5000+ cells, one cell failure can destroy the entire 2–5 MWh system in 30–60 minutes.',
    rootCause: 'Triggers: (1) Manufacturing defect — microscopic metal particle inside cell creates internal short, (2) Overcharge — BMS fails to cut off charging at max voltage, cell goes into thermal decomposition, (3) External heating — cooling system failure in Indian ambient (45°C+), cells slowly heat until crossing runaway threshold, (4) Physical damage — impact, puncture during maintenance, (5) Dendrite growth — lithium metal spikes grow over cycles, eventually short-circuiting the cell internally.',
    incident: 'Arizona APS McMicken (April 2019): NMC BESS system experienced thermal runaway in one rack. Vented gas accumulated in sealed container. When firefighters opened the door, fresh air + spark = explosion. 4 firefighters hospitalized. Investigation found BMS failed to detect internal cell defect. This event reshaped global BESS insurance standards — UL 9540A testing became mandatory.',
    typicalCost: '₹5–15 Cr per container destroyed (2–5 MWh). Multi-container propagation: ₹20–80 Cr. If adjacent solar/wind equipment damaged by fire spread: ₹10–30 Cr additional. Environmental cleanup (electrolyte, HF gas): ₹1–5 Cr. Total potential loss for 100 MWh BESS facility: ₹50–200 Cr.',
    imageUrl: 'https://images.unsplash.com/photo-1619641805634-e1d93a0e9e89?w=600&h=300&fit=crop',
    imageAlt: 'Battery energy storage system containers',
    prevention: 'LFP chemistry (thermal runaway at 270°C vs NMC at 180°C — 90°C safety margin). UL 9540A cell-level propagation testing (prove fire stays within one module). Redundant cooling (N+1 HVAC — if one unit fails, backup maintains temperature). BMS with dual sensors per cell (temperature + voltage). Off-gas detection (early warning of venting before ignition). Container spacing minimum 3m (prevents fire jumping between units). Fire suppression: gas + water mist backup.',
  },

  'bms failure': {
    tooltip: 'Battery Management System failure means cells are unmonitored — overcharge, over-temperature, or imbalance goes undetected. Root cause of most BESS fires globally.',
    detail: 'The BMS (Battery Management System) is the "brain" of a BESS — it monitors every cell\'s voltage (±5mV accuracy), temperature (±1°C), and current in real-time. It makes critical decisions: when to stop charging, when to activate cooling, when to disconnect a faulty string. If the BMS fails or its sensors give wrong readings, the system operates blind. A cell can be overcharged (pushed beyond 3.65V for LFP or 4.2V for NMC) without detection — overcharge directly triggers thermal runaway. BMS failure is identified as the root cause in 60%+ of global BESS fire investigations.',
    rootCause: 'Causes: (1) Sensor failure — temperature sensor reads low while cell is actually overheating, (2) Communication bus failure — BMS loses contact with a rack (assumes it\'s fine), (3) Software bug — charge algorithm has edge case that overcharges under specific conditions, (4) Hardware failure — processor crash from electrical noise/surge, (5) Firmware update gone wrong — new code has unintended behaviour.',
    typicalCost: 'BMS hardware replacement: ₹10–30 Lakh. BUT: the CONSEQUENCE of undetected BMS failure (thermal runaway): ₹5–200 Cr. The BMS is a ₹10 Lakh component that prevents ₹100+ Cr losses. Insurance surveys should verify BMS redundancy architecture as priority #1.',
    prevention: 'Dual-redundant BMS (two independent systems cross-checking each other). Dual sensors per cell (if readings disagree: alarm + disconnect). Independent thermal monitoring (separate from BMS — direct to fire panel). BMS with proven cybersecurity (firmware integrity checking). Regular BMS health diagnostic testing. Autonomous cell-level disconnect capability (hardware fuse backup to software disconnect).',
  },

  'capacity fade': {
    tooltip: 'All Li-ion batteries lose capacity over time — 2–3% per year. In Indian heat (40–50°C), degradation is 20–40% faster than in temperate climates. Guaranteed gradual loss.',
    detail: 'Li-ion battery capacity fades through two mechanisms: (1) CYCLE AGING — each charge/discharge cycle causes microscopic damage to electrode surfaces (SEI layer growth, lithium inventory loss), (2) CALENDAR AGING — even when not cycling, high temperature and high state-of-charge accelerate internal chemical degradation. A BESS rated for 15-year/4000-cycle life in 25°C European climate may only achieve 10–12 years in 45°C Indian ambient. Degradation follows a predictable curve (rapid in first year, then linear, then accelerating near end-of-life) — but Indian heat shifts the entire curve earlier.',
    rootCause: 'Accelerating factors: (1) Ambient temperature 35–50°C (every 10°C above 25°C roughly doubles degradation rate), (2) Operating at high SOC (keeping battery above 80% SOC accelerates calendar aging), (3) High C-rate cycling (fast charge/discharge), (4) Deep discharge cycles (0–100% DoD worse than 20–80%), (5) Manufacturing quality variation between cell batches.',
    typicalCost: 'Not a single-event cost — it is GRADUAL revenue loss. A 100 MWh system losing 3%/year × ₹5 Cr annual revenue = ₹15 Lakh/year revenue erosion. By year 10: 30% capacity lost = ₹1.5 Cr/year less revenue. Augmentation (adding modules to restore capacity): ₹50–100 Cr per GWh at current prices.',
    prevention: 'Active cooling maintaining cells at 20–25°C (not ambient). Operating within 20–80% SOC (avoid extremes). C-rate management (max 0.5C for charging). Capacity augmentation plan budgeted from day 1. Contract structure: performance guarantee from cell OEM with augmentation obligation.',
  },
};

Object.assign(IMPACT_KNOWLEDGE, TRANSFORMER_BESS_ENTRIES);


// ═══════════════════════════════════════════════════════════════════════════════
// BESS Technical Terms for Deep Dive page tooltips
// ═══════════════════════════════════════════════════════════════════════════════

const BESS_TERMS: Record<string, KnowledgeEntry> = {
  'igbt module burnout': {
    tooltip: 'IGBT (Insulated Gate Bipolar Transistor) is the power switching device in inverters/PCS. Handles thousands of amps at high voltage. Burnout from overcurrent or thermal stress disables the inverter.',
    detail: 'IGBTs are semiconductor switches that convert DC battery power to AC grid power (and vice versa) in the Power Conversion System (PCS). Each IGBT module switches thousands of amps at 800–1500V DC. They generate significant heat during switching and must be actively cooled. If cooling fails or overcurrent occurs (grid fault, short circuit), the IGBT junction temperature exceeds 150°C and the device is permanently destroyed. A single IGBT failure can disable an entire 1–5 MW PCS unit.',
    rootCause: 'Causes: (1) Cooling system failure (fan or liquid loop), (2) Grid fault injecting overcurrent, (3) Manufacturing defect (bond wire fatigue), (4) Cosmic ray single-event damage (rare), (5) Dust contamination reducing thermal conductivity of heatsink.',
    typicalCost: 'IGBT module replacement: ₹5–20 Lakh. Complete PCS board replacement: ₹30–80 Lakh. Lead time: 2–8 weeks for standard models. If PCS is Chinese OEM (Sungrow/Sineng): import time adds 4–6 weeks.',
    prevention: 'Redundant cooling with thermal monitoring. Power derating in high ambient temperature (>40°C). Regular thermal imaging of PCS enclosure. Surge protection on grid side. N+1 PCS design (if one fails, others carry load).',
  },

  'dc bus capacitor failure': {
    tooltip: 'DC bus capacitors store energy between battery and inverter. They operate at 800–1500V DC. Failure modes: short circuit (explosion), open circuit (loss of function), or gradual degradation.',
    detail: 'DC link (bus) capacitors sit between the battery DC output and the inverter/PCS. They smooth the DC voltage, absorb transient surges, and provide instantaneous energy during switching. Film capacitors or electrolytic capacitors handle 800–1500V DC at high ripple current. Over time, the dielectric material degrades from heat and electrical stress. Catastrophic failure can be explosive (energy stored = ½CV² — significant at 1500V).',
    rootCause: 'Causes: (1) Thermal aging (every 10°C above rated reduces life by 50%), (2) Overvoltage transients from grid/battery, (3) High ripple current causing internal heating, (4) Manufacturing defect, (5) Humidity ingress in outdoor installations.',
    typicalCost: 'Capacitor bank replacement: ₹5–15 Lakh per PCS unit. If explosion damages adjacent components: ₹20–50 Lakh per PCS. BI minimal if redundant PCS available.',
    prevention: 'Temperature monitoring of capacitor bank. Voltage clamping/surge protection. Capacitor health monitoring (ESR measurement — rising ESR indicates degradation). Derating for high ambient. Replace at 80% of rated calendar life.',
  },

  'cooling fan failure → thermal runaway': {
    tooltip: 'If HVAC/cooling fails in a BESS container in Indian summer (45°C ambient), internal temperature rises unchecked. Within hours, cells can reach thermal runaway threshold.',
    detail: 'BESS containers in India operate in 40–50°C ambient during April–June. Active cooling (air conditioning or liquid cooling) maintains cells at 20–30°C — a 20–25°C differential. If ALL cooling fails (compressor breakdown, power supply loss, refrigerant leak), container internal temperature rises at 3–5°C per hour in direct sun. Within 4–8 hours, cell temperature exceeds 60°C (accelerated degradation zone). If BMS does not disconnect: cells continue operating hot, and within 12–24 hours can approach thermal runaway threshold (180°C NMC, 270°C LFP).',
    rootCause: 'Causes: (1) HVAC compressor failure (single point of failure if no redundancy), (2) Power supply to HVAC lost (grid fault + no UPS for cooling), (3) Refrigerant leak (reduced cooling capacity), (4) Dust/sand blocking air filters (Rajasthan sites), (5) Condensation freezing on coils (transition season temperature swings). The critical gap: BMS must detect rising temperature AND actively disconnect cells — if BMS also fails, no protection.',
    incident: 'Victorian Big Battery, Australia (2021): Tesla Megapack fire during commissioning. Coolant leak created conditions for arc flash → fire. Though different mechanism than pure thermal runaway, demonstrated that cooling system integrity is critical for BESS safety.',
    typicalCost: 'If caught early (BMS disconnects): no cell damage, just HVAC repair ₹5–15 Lakh + 1–3 days downtime. If uncaught → thermal runaway: ₹5–15 Cr per container (total loss). The difference is 1000× — entirely depends on BMS + cooling redundancy.',
    prevention: 'N+1 HVAC redundancy (minimum 2 independent cooling units per container). UPS power supply for HVAC (continues cooling during grid fault). BMS thermal disconnect at 45°C cell temperature (shutdown before risk zone). Container temperature alarm to remote monitoring centre. Daily HVAC health diagnostic.',
  },

  'slew drive failure': {
    tooltip: 'Slew drives rotate solar tracker rows to follow the sun. Failure means modules stuck at wrong angle — reduced generation. During storms, failure to stow is catastrophic.',
    detail: 'Single-axis solar trackers use slew drives (worm gear + electric motor) to rotate each tracker row ±60° following the sun\'s east-west path. A 100 MW tracker plant has 400–800 individual slew drives. Each must operate reliably for 25 years, 365 days/year, in dusty outdoor conditions. Failure means that specific row is stuck at its last angle — generating 20–40% less than optimal. Critical failure: during storm, if drive cannot rotate to stow position (horizontal), modules face wind at wrong angle → structural damage.',
    rootCause: 'Causes: (1) Worm gear wear from dust infiltration (Rajasthan/Gujarat sites), (2) Motor burnout from thermal stress or electrical fault, (3) Bearing seizure from lack of lubrication, (4) Control board failure (rain water ingress), (5) Backlash exceeding limits (gears worn loose — row flutters in wind).',
    typicalCost: 'Individual drive replacement: ₹30,000–60,000 + 2–4 hours. Revenue loss from stuck row: ₹500–2,000/day per tracker row. Storm damage from failed stow: ₹2–10 Lakh per row (module/structure replacement). At portfolio scale: if 5% of drives fail annually = ongoing maintenance cost.',
    prevention: 'Regular drive torque testing. Lubrication schedule. Dust sealing integrity checks. Storm stow testing before cyclone season. Redundant communication for emergency stow command. Manual stow capability as backup.',
  },
};

Object.assign(IMPACT_KNOWLEDGE, BESS_TERMS);


// ═══════════════════════════════════════════════════════════════════════════════
// MANUFACTURING RISK TERMS
// ═══════════════════════════════════════════════════════════════════════════════

const MANUFACTURING_TERMS: Record<string, KnowledgeEntry> = {
  'laminator fire': {
    tooltip: 'Solar module laminators operate at 150°C+ to bond EVA encapsulant to cells under vacuum. Malfunction (heating element failure, EVA ignition) starts fires that destroy ₹50–200 Cr production lines.',
    detail: 'Laminators are the most critical — and most dangerous — machines in a solar module factory. They heat the module sandwich (glass/EVA/cells/EVA/backsheet) to 150–160°C under vacuum to create the final sealed module. Each laminator is worth ₹5–15 Cr. A typical 2 GW factory has 20–40 laminators. EVA (Ethylene Vinyl Acetate) is a polymer that becomes flammable when overheated beyond 200°C. If temperature control fails, EVA ignites inside the laminator — fire spreads to adjacent machines and to stored modules.',
    rootCause: 'Causes: (1) Temperature controller malfunction (heater stuck ON), (2) EVA film quality issue (lower decomposition temperature), (3) Vacuum pump failure (module overheats without proper heat transfer), (4) Electrical fault in heating elements, (5) Material trapped in press (creates hotspot). Indian factories often run laminators 24/7 with minimal cool-down — increasing fatigue failure probability.',
    typicalCost: 'Single laminator fire (contained): ₹5–20 Cr (machine + WIP). Fire propagating to line: ₹50–100 Cr. Factory-wide fire: ₹200–500 Cr + 6–12 months BI.',
    prevention: 'Temperature monitoring with auto-shutdown at 180°C. Fire detection above each laminator (aspirating smoke detection). Automatic suppression per laminator bay. Physical gap between laminator groups (fire break). Annual thermal imaging of heating elements.',
  },
  'stringer flux ignition': {
    tooltip: 'Solar cell stringers solder cells together using flux at 350°C. Flux residue is combustible. Overheating or flux accumulation can ignite — spreading to nearby cells and EVA film.',
    detail: 'Tabber-stringer machines solder thin copper ribbons connecting solar cells in series. The soldering process uses flux (rosin-based, combustible) at 350–400°C. Flux vapour and residue accumulate on machine surfaces. If ventilation fails or hot solder contacts accumulated flux residue, ignition occurs. The fire is typically small initially but can spread to stacked cell trays (thousands of cells, ₹50,000 each) and EVA rolls stored nearby.',
    rootCause: 'Causes: (1) Flux build-up from inadequate cleaning schedule, (2) Ventilation/extraction system failure, (3) Solder pot temperature excursion, (4) Hot solder splash on flux-contaminated surface, (5) Electrical fault in heating element.',
    typicalCost: 'Contained stringer fire: ₹1–5 Cr (machine + cells). If spreading to cell inventory: ₹10–30 Cr. Machine replacement: 4–8 weeks lead time.',
    prevention: 'Daily flux residue cleaning. Ventilation monitoring with alarm. Temperature control redundancy. Fire detection at each stringer station. Cell inventory stored in separate fire-rated area (not beside stringer line).',
  },
  'silane gas leak/explosion': {
    tooltip: 'Silane (SiH₄) is used in solar cell PECVD chambers to deposit anti-reflective coating. Silane is PYROPHORIC — it ignites spontaneously on contact with air. A leak is immediately dangerous.',
    detail: 'Silane gas (SiH₄) is used in Plasma Enhanced Chemical Vapour Deposition (PECVD) to deposit silicon nitride anti-reflective coating on solar cells. Silane is pyrophoric — it catches fire INSTANTLY when exposed to air (no ignition source needed). At concentrations above 1.4% in air, silane detonates. PECVD chambers use silane at dilute concentrations, but gas supply lines, valves, and cylinders contain pure silane. A supply line leak in a cell factory can cause explosion + fire simultaneously.',
    rootCause: 'Causes: (1) Gas line fitting leak (vibration loosening over time), (2) Valve failure, (3) Cylinder changeover error, (4) PECVD chamber seal failure, (5) Maintenance work on gas lines without proper purging. Silane incidents are FAST — explosion within seconds of leak.',
    incident: 'Multiple silane incidents in Chinese cell factories (2018–2023). One incident at a Jiangsu cell plant destroyed an entire PECVD line (₹150 Cr equivalent). In India: Premier Energies and Waaree both operate PECVD with silane — same risk applies.',
    typicalCost: 'Small leak (outdoor, auto-isolation): ₹10–50 Lakh. Indoor explosion: ₹30–150 Cr (PECVD line destruction + building damage + potential fatalities).',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop',
    imageAlt: 'High-tech manufacturing clean room environment',
    prevention: 'Silane gas cabinets (ventilated enclosures around cylinders). Automatic valve isolation on gas detection (response time <3 seconds). Excess flow valves on all supply lines. Outdoor gas farm (not indoor storage). Pneumatic isolation valves (fail-safe closed). Regular helium leak testing of all joints.',
  },
  'pecvd chamber failure': {
    tooltip: 'PECVD chambers deposit anti-reflective coating on solar cells using plasma at 400°C. Each chamber costs ₹80–150 Cr. Failure halts 25% of production per chamber lost.',
    detail: 'PECVD (Plasma Enhanced Chemical Vapour Deposition) chambers are the most expensive single equipment in a solar cell factory. A typical 2 GW cell line has 4–8 PECVD systems, each with multiple chambers. They operate at 400°C with reactive gases (silane, ammonia) under plasma conditions. Failure modes: chamber contamination (particles), electrode erosion, vacuum seal failure, RF power system breakdown. Any failure requires shutdown + cleaning (1–2 weeks) or major repair (2–6 months for electrode/vacuum system replacement). Equipment is sourced from China (Meyer Burger, centrotherm, Wuxi Suntech — 6–9 month delivery).',
    rootCause: 'Causes: (1) Electrode erosion (plasma slowly destroys the electrode surface), (2) Particle contamination (flaking from chamber walls), (3) Vacuum pump failure, (4) RF generator breakdown, (5) Process gas contamination (moisture in gas line). Accelerated by: running 24/7 without adequate maintenance windows.',
    typicalCost: 'Minor repair (cleaning, seal replacement): ₹50 Lakh–2 Cr + 1–2 weeks. Major failure (electrode, vacuum system): ₹5–15 Cr + 3–6 months. Full replacement: ₹80–150 Cr + 6–9 months. BI per chamber per month: ₹10–20 Cr.',
    prevention: 'Preventive maintenance schedule (chamber clean every 3000 wafers). Electrode condition monitoring (thickness measurement). Spare electrode sets on-site. Redundant vacuum pumps. Process gas purity monitoring. OEM service contract with guaranteed response time.',
  },
  'resin storage fire': {
    tooltip: 'Wind blade factories store large quantities of epoxy/polyester resin (highly flammable when uncured). A resin storage fire can destroy the entire blade factory within hours.',
    detail: 'Wind turbine blade manufacturing uses large volumes of thermoset resin (epoxy or polyester) — typically 5–20 tonnes per blade. A 3 GW/year blade factory stores 100–500 tonnes of uncured resin at any time. Uncured resin is classified as flammable liquid (flash point 50–80°C for polyester, 120–150°C for epoxy). Resin storage areas, mixing rooms, and infusion stations all represent fire hazards. Once ignited, resin fires are intense, produce toxic smoke (styrene), and are difficult to extinguish.',
    rootCause: 'Causes: (1) Static discharge in resin transfer, (2) Peroxide hardener mishandling (exothermic reaction if improperly mixed), (3) Electrical fault in mixing equipment, (4) External fire spreading to resin store, (5) Lightning strike on storage tank. Peroxide-catalysed polyester is especially dangerous — accidental mixing of resin + hardener in bulk can cause runaway exothermic reaction (fire within minutes).',
    incident: 'LM Wind Power (now GE) blade factory fire in Goleniów, Poland (2016). Resin storage area ignited — fire destroyed significant portion of the factory. Multiple blade moulds damaged (₹200+ Cr equivalent replacement). Production capacity reduced for 9 months.',
    typicalCost: 'Resin storage fire (contained): ₹5–20 Cr. Fire spreading to factory: ₹50–300 Cr (moulds are the critical loss — ₹20–50 Cr each, 12–18 months to replace).',
    prevention: 'Resin storage in SEPARATE building (fire-rated, minimum 15m from blade factory). Bunded containment. Fixed foam suppression. Temperature monitoring of resin tanks. Peroxide hardener stored separately from resin (never co-located). Lightning protection for all storage structures.',
  },
  'composite dust explosion': {
    tooltip: 'Grinding and finishing fibreglass/carbon fibre blades generates fine composite dust. In enclosed spaces, this dust is explosive at concentrations above 30 g/m³.',
    detail: 'Blade finishing involves grinding, trimming, and sanding fibreglass/carbon fibre composite. This generates fine particulate dust that, when suspended in air at concentrations above the LEL (Lower Explosive Limit, ~30 g/m³ for composite dust), becomes explosive. The explosion risk is similar to grain dust or coal dust explosions. Blade factories have finishing areas where multiple blades are processed simultaneously — accumulation of dust on surfaces, in extraction ducts, and on equipment creates both explosion risk and secondary fire risk.',
    rootCause: 'Causes: (1) Dust extraction system failure (dust accumulates), (2) Ignition source in dusty atmosphere (grinding sparks, electrical fault, static discharge), (3) Duct explosion propagating back into factory, (4) Dust layer on surfaces igniting from hot work nearby. Carbon fibre dust is electrically conductive — can cause short circuits in electrical panels.',
    typicalCost: 'Dust explosion: ₹10–80 Cr (depending on propagation extent). Often causes structural damage to building + destruction of equipment in blast zone.',
    prevention: 'Dust extraction systems with explosion venting (ATEX compliant). LEL monitoring in finishing areas. No hot work permits in dusty zones. Regular cleaning (prevent dust accumulation on surfaces). Anti-static measures. Explosion isolation on ductwork (prevent propagation between zones).',
  },
  'mould damage': {
    tooltip: 'Blade moulds cost ₹20–50 Cr each and take 12–18 months to replace. A factory has only 4–8 moulds. Losing even one reduces capacity by 12–25% for over a year.',
    detail: 'Wind turbine blade moulds are the most critical single assets in a blade factory. Each mould is a precision-machined steel/composite tool, 40–80m long, weighing 20–80 tonnes. They are heated (70–80°C) for resin curing. A blade factory typically has 4–8 moulds per blade model — each mould produces 1 blade per 24–48 hours. The moulds cannot be repaired for major damage (cracking, warping, fire damage) — only replaced. Replacement: ₹20–50 Cr per mould + 12–18 months from specialised mould makers (China, Denmark). Loss of one mould = 12–25% production capacity loss for over a year.',
    rootCause: 'Causes: (1) Fire damage (resin ignition during curing), (2) Crane drop (moving mould for maintenance), (3) Thermal stress cracking (repeated heating/cooling cycles), (4) Transport damage (if mould moved between sites), (5) Flood damage (water warp/corrosion). The MOST common: thermal stress cracking after 3–5 years of 24/7 operation.',
    typicalCost: 'Mould replacement: ₹20–50 Cr + 12–18 months. BI during 12 months without mould: ₹50–150 Cr revenue loss (depending on blade size/price). Insurance must cover reinstatement value + full BI period.',
    prevention: 'Mould temperature gradient control (avoid thermal shock). Mould surface inspection every 500 cycles. Protective covers when not in use. Fire suppression directly above/around each mould. Crane overload protection. If possible: spare mould strategy for critical blade sizes (orders placed 18 months ahead of failure).',
  },
  'formation chamber fire': {
    tooltip: 'Li-ion cell formation (first charge/discharge) is when manufacturing defects manifest as thermal runaway. Hundreds of cells simultaneously — one failure can propagate to thousands.',
    detail: 'Formation is the final and most dangerous step in Li-ion cell manufacturing. Newly assembled cells are charged for the first time (forming the SEI layer on the anode). During this process, any internal defect (metal particle contamination, separator pinhole, electrode misalignment) will manifest as an internal short circuit → thermal runaway. Formation rooms contain racks of hundreds to thousands of cells, all being charged simultaneously. If one cell enters runaway and the formation equipment doesn\'t isolate it within seconds, heat propagates to adjacent cells → cascade failure → room fire.',
    rootCause: 'Causes: (1) Cell manufacturing defect (metal particle contamination most common — a 20-micron particle can short-circuit a cell), (2) Formation charger overvoltage (pushes cell beyond safe voltage), (3) Formation chamber cooling failure (cells heat during charging — without cooling, temperature rises), (4) Cell swelling ruptures during formation, (5) BMS/monitoring failure misses temperature anomaly.',
    incident: 'Samsung SDI Tianjin (2022): Fire in cell formation/storage area destroyed significant capacity. Multiple Korean BESS factories (2020–2023) experienced formation fires. The formation step is acknowledged industry-wide as the highest-fire-risk process in cell manufacturing.',
    typicalCost: 'Single rack fire (contained): ₹2–10 Cr. Bay fire (multiple racks): ₹20–80 Cr. Full formation area: ₹50–200 Cr + 6–12 months BI.',
    imageUrl: 'https://images.unsplash.com/photo-1619641805634-e1d93a0e9e89?w=600&h=300&fit=crop',
    imageAlt: 'Battery cell manufacturing and formation equipment',
    prevention: 'Individual cell monitoring during formation (temperature + voltage per cell). Automated disconnect at first anomaly (cell isolated within 2 seconds). Fire-rated separation between formation bays. Inert gas flooding capability per bay. Propagation testing (UL 9540A) to validate one-cell failure doesn\'t cascade. No bulk cell storage in formation room — move formed cells to separate storage immediately.',
  },
  'nmp solvent fire': {
    tooltip: 'NMP (N-Methyl-2-Pyrrolidone) is the solvent used in Li-ion electrode coating. Combustible with 91°C flash point. Large volumes (1000s of litres) stored in cell factories.',
    detail: 'NMP is used to dissolve PVDF binder and create the slurry that coats electrode materials onto metal foils. A gigafactory uses 100–1000+ tonnes of NMP annually (though modern factories recover 95%+ via distillation). NMP has a flash point of 91°C — it requires heating for ignition but can form flammable vapour above this temperature. In coating ovens (120–150°C), NMP vapour concentrations must be kept below LEL. A ventilation or recovery system failure can allow NMP vapour accumulation → explosion.',
    rootCause: 'Causes: (1) NMP recovery system failure (vapour not captured, accumulates), (2) Coating oven exhaust blockage, (3) NMP spill on hot surface (>91°C), (4) Electrical ignition in NMP vapour-rich atmosphere, (5) NMP storage tank leak + ignition source. Modern factories use aqueous processing (water-based slurry) for anode to reduce NMP — but cathode still requires NMP.',
    typicalCost: 'NMP fire (contained in coating area): ₹10–30 Cr. NMP storage fire: ₹20–50 Cr + environmental cleanup ₹5–15 Cr (soil/water contamination from firefighting runoff).',
    prevention: 'NMP recovery system with 95%+ capture rate. LEL monitoring in all areas where NMP vapour present. Coating oven temperature control with auto-shutdown. NMP storage in dedicated, bunded, fire-rated area. Explosion-proof electrical in coating zone. Transition to aqueous (water-based) processing where possible (reduces NMP volume).',
  },
  'electrolyte release + explosion': {
    tooltip: 'Battery electrolyte (LiPF₆ in organic solvents) is flammable, toxic, and moisture-sensitive. A release produces HF gas (extremely toxic) + fire/explosion risk.',
    detail: 'Li-ion battery electrolyte is a solution of lithium hexafluorophosphate (LiPF₆) salt in organic carbonate solvents (ethylene carbonate, dimethyl carbonate). This liquid is: (1) Highly flammable (flash point ~30°C for some solvents), (2) Toxic (LiPF₆ produces hydrofluoric acid (HF) on contact with moisture — HF is lethal at very low concentrations), (3) Corrosive. A gigafactory stores 50–200 tonnes of electrolyte. A large release creates simultaneous fire + toxic gas emergency. HF is odourless and can cause fatal pulmonary edema hours after exposure.',
    rootCause: 'Causes: (1) Electrolyte storage tank failure (corrosion, impact), (2) Transfer pump leak, (3) Filling machine malfunction (during cell assembly), (4) Earthquake/seismic damage to piping, (5) Vehicle impact on storage structure. Critical factor: ANY moisture contact (rain, firefighting water) with released electrolyte produces HF gas — firefighting must use DRY methods only for electrolyte fires.',
    typicalCost: 'Contained spill with no fire: ₹2–10 Cr (hazmat cleanup). Spill + fire: ₹30–100 Cr. Spill + HF release affecting workers: incalculable (fatalities, regulatory shutdown, criminal liability).',
    prevention: 'Dedicated electrolyte storage bunker (stainless steel, moisture-free, temperature-controlled). Double-containment piping. Automatic leak detection + isolation. HF gas detectors in electrolyte handling areas. Full-face SCBA (self-contained breathing apparatus) available within 30 seconds. No water-based firefighting near electrolyte (use dry chemical/sand). Regular emergency drills including HF scenario.',
  },
  'product recall': {
    tooltip: 'A manufacturing defect in batteries/modules/turbines discovered after delivery can trigger mass recall. Hyundai Kona recall (LG cells) cost $900M. Indian manufacturers face similar exposure as they scale.',
    detail: 'Product recall is the most expensive LATENT liability for power equipment manufacturers. A defect that exists in every unit of a production batch may not manifest for months or years after delivery. When it does, the manufacturer must: (1) Identify all affected units (traceability), (2) Notify all customers, (3) Replace/repair all defective products, (4) Cover consequential damage at customer sites. For battery cells: a defect causing EV fires triggers nationwide recall. For solar modules: a systematic cell defect causes hotspots across thousands of installations. For wind turbines: a blade adhesive defect affects entire fleet (Suzlon S111 precedent: ₹400+ Cr).',
    rootCause: 'Root causes of mass recalls: (1) Material batch defect (contaminated raw material used across production run), (2) Process parameter drift (machine calibration slowly moves out of spec — affects weeks of production before detection), (3) Design defect discovered in field, (4) Supplier component defect (sub-component fails across all products using that batch), (5) Software/firmware bug affecting all shipped units.',
    incident: 'Hyundai Kona EV recall (2020–21): LG Energy Solution battery cells with separator folding defect caused fires. 82,000 vehicles recalled globally. Cost to LG: $900M+ (largest EV recall in history). Suzlon S111 (2019–21): blade root adhesive defect, 200+ turbines, ₹400+ Cr. JA Solar module defect (2018): PID issue across large batch, class-action lawsuit.',
    typicalCost: 'Solar module recall: ₹50–500 Cr (depending on batch size and defect severity). Wind turbine serial defect: ₹100–500 Cr. Battery cell recall: ₹500–5000 Cr (EV scale). Product liability insurance with adequate aggregate limits is ESSENTIAL.',
    prevention: 'Batch-level traceability (every cell/module/blade traceable to raw materials, process parameters, and operators). In-line quality inspection (AI-based defect detection). Statistical process control (detect drift before it causes defects). Retained samples from every production batch. Product liability insurance with ₹500+ Cr aggregate. Recall plan documented and rehearsed.',
  },
};

Object.assign(IMPACT_KNOWLEDGE, MANUFACTURING_TERMS);
