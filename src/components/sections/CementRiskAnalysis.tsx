import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type CementSource = 'kiln' | 'grinding' | 'raw-material' | 'packing' | 'captive-power';

interface RiskEntry {
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  impactAreas: string[];
  typicalClaim: string;
}

interface MatrixEntry {
  risk: string;
  prob: string;
  impact: string;
  score: string;
  emv: string;
  strategy: string;
  owner: string;
  trigger: string;
}

interface CaseStudy {
  title: string;
  location: string;
  date: string;
  loss: string;
  rootCause: string;
  impact: string;
  lessons: string[];
  benchmark: string;
}

// ─── Risk Data ───────────────────────────────────────────────────────────────

const AOG_PERILS: Record<CementSource, RiskEntry[]> = {
  kiln: [
    {
      title: 'Earthquake — Kiln Foundation & Preheater Tower',
      severity: 'high',
      description: 'Rotary kilns are 60-80m long precision cylinders on multiple piers. Differential settlement or seismic shift misaligns kiln axis. Preheater towers (80-120m tall) are vulnerable to lateral forces. Plants in Gujarat, Rajasthan, Himachal fall in Seismic Zones III-V.',
      impactAreas: ['Kiln shell misalignment', 'Preheater tower structural damage', 'Refractory collapse inside kiln', 'Foundation pier cracking', 'Cyclone/riser duct separation'],
      typicalClaim: '₹50–200 Cr + 6-12 months BI',
    },
    {
      title: 'Flood / Heavy Rainfall — Kiln Area',
      severity: 'medium',
      description: 'Cement plants in central India (MP, Chhattisgarh, AP) face monsoon flooding. Kiln drive motors, girth gear lubrication systems, and electrical panels at ground level are vulnerable. Coal yards get waterlogged affecting fuel supply.',
      impactAreas: ['Kiln main drive motor submersion', 'Electrical panel damage', 'Coal yard waterlogging', 'Clinker storage contamination', 'Access road washout'],
      typicalClaim: '₹10–50 Cr + 1-3 months BI',
    },
    {
      title: 'Cyclone — Coastal Plants',
      severity: 'medium',
      description: 'Plants in AP, Tamil Nadu, Gujarat coast (ACC Wadi, Dalmia Ariyalur, Ambuja Mundra) exposed to cyclonic winds. Preheater tower, ESP, and conveyor galleries act as sail areas. Roofing and cladding damage.',
      impactAreas: ['Preheater tower cladding loss', 'ESP (Electrostatic Precipitator) damage', 'Conveyor gallery collapse', 'Raw material stockpile dispersion', 'Power supply disruption'],
      typicalClaim: '₹20–80 Cr + 2-4 months BI',
    },
  ],
  grinding: [
    {
      title: 'Earthquake — Vertical Roller Mill (VRM)',
      severity: 'medium',
      description: 'VRMs weigh 300-500 tonnes with precision-aligned grinding tables and rollers. Seismic movement can damage hydraulic systems, crack grinding tables, and misalign drive shafts. Foundation damage is costly to repair.',
      impactAreas: ['Grinding table cracking', 'Hydraulic cylinder damage', 'Reducer gear damage', 'Foundation bolt shearing', 'Separator housing distortion'],
      typicalClaim: '₹15–60 Cr + 3-6 months BI',
    },
    {
      title: 'Storm / Cyclone — Cement Silos',
      severity: 'low',
      description: 'Cement silos (30-50m tall) are structurally robust but connecting conveyor systems, bag filters, and pneumatic lines are wind-vulnerable. Lightning strikes on silo tops can damage level sensors and aeration systems.',
      impactAreas: ['Silo top equipment damage', 'Bag filter house collapse', 'Pneumatic conveying line rupture', 'Lightning damage to instrumentation'],
      typicalClaim: '₹5–15 Cr + 2-4 weeks BI',
    },
  ],
  'raw-material': [
    {
      title: 'Landslide / Slope Failure — Limestone Quarry',
      severity: 'high',
      description: 'Open-cast limestone quarries with 30-60m bench heights. Monsoon saturation destabilises overburden. Slope failures can bury equipment, block haul roads, and damage crushers at quarry face. Rajasthan, MP, AP quarries most affected.',
      impactAreas: ['Crusher burial under debris', 'Haul road blockage', 'Dumper/excavator burial', 'Overburden removal cost', 'Quarry access loss for weeks'],
      typicalClaim: '₹10–40 Cr + 1-3 months BI',
    },
    {
      title: 'Flash Flood — Quarry & Crusher Area',
      severity: 'medium',
      description: 'Quarry sumps overflow during cloudbursts. Crusher pit at lowest elevation gets flooded. Electrical panels, conveyor drives, and weigh feeders damaged. Plants in Satna (MP), Kurnool (AP) frequently affected.',
      impactAreas: ['Crusher motor submersion', 'Conveyor belt damage', 'Weigh feeder electronics failure', 'Quarry sump pump failure', 'Haul road erosion'],
      typicalClaim: '₹5–20 Cr + 2-6 weeks BI',
    },
  ],
  packing: [
    {
      title: 'Storm — Packing Plant & Dispatch Area',
      severity: 'low',
      description: 'Packing plants with large roof spans (50-80m clear span) vulnerable to wind uplift. Truck loading bays, conveyor galleries from silos, and bulk loading systems exposed.',
      impactAreas: ['Roof sheet uplift/loss', 'Packer machine damage from water ingress', 'Conveyor gallery damage', 'Truck bay structure failure'],
      typicalClaim: '₹3–10 Cr + 2-4 weeks BI',
    },
  ],
  'captive-power': [
    {
      title: 'Flood — WHRS & Captive Power Plant',
      severity: 'medium',
      description: 'Most cement plants operate Waste Heat Recovery Systems (WHRS) and/or captive thermal/solar plants. Ground-level generators, transformers, and switchgear vulnerable to flooding. DG sets critical for kiln emergency cooling.',
      impactAreas: ['WHRS turbine flooding', 'DG set submersion', 'Transformer damage', 'Solar inverter destruction', 'Loss of emergency power for kiln cooling'],
      typicalClaim: '₹10–30 Cr + 1-2 months BI',
    },
    {
      title: 'Lightning — WHRS Boiler & Stack',
      severity: 'low',
      description: 'WHRS boilers and tall stacks attract lightning. Control systems, DCS panels, and instrumentation cables are vulnerable to induced surges even with lightning protection.',
      impactAreas: ['DCS/PLC damage', 'Instrumentation cable burnout', 'WHRS boiler trip', 'Communication system failure'],
      typicalClaim: '₹2–8 Cr + 1-2 weeks BI',
    },
  ],
};

const NON_AOG_PERILS: Record<CementSource, RiskEntry[]> = {
  kiln: [
    {
      title: 'Refractory Failure & Kiln Shell Hot Spot',
      severity: 'high',
      description: 'Kiln refractory lining (200-250mm thick magnesia-chrome/alumina bricks) fails due to thermal cycling, chemical attack from alkalis, or coating loss. Shell temperature exceeds 350°C causing shell distortion. India sees 2-3 major incidents/year across the industry.',
      impactAreas: ['Kiln shell red spot/buckling', 'Unplanned shutdown 4-8 weeks', 'Refractory re-lining (₹5-10 Cr material alone)', 'Shell plate replacement if buckled', 'Clinker quality drop before detection'],
      typicalClaim: '₹20–80 Cr (including BI)',
    },
    {
      title: 'Kiln Girth Gear / Main Drive Failure',
      severity: 'high',
      description: 'Girth gear (6-8m diameter, 40-60 tonne single piece) meshes with pinion driven by 3000-5000 kW motor. Tooth breakage, alignment failure, or bearing seizure stops production. Lead time for new girth gear: 8-12 months (imported). Only 2-3 global suppliers.',
      impactAreas: ['Girth gear tooth fracture', 'Pinion bearing seizure', 'Main reducer failure', 'Kiln support roller damage', 'Single-point-of-failure — no bypass'],
      typicalClaim: '₹30–100 Cr + 8-14 months BI',
    },
    {
      title: 'Preheater Cyclone Collapse / Blockage',
      severity: 'high',
      description: 'Preheater tower has 4-6 stages of cyclones at 80-120m height. Build-up of alkali/sulphur compounds causes blockages. Clearing requires hot work at extreme height. Sudden collapse of compacted material (10-50 tonnes) can rupture cyclone shells.',
      impactAreas: ['Cyclone shell rupture', 'Hot material fall injuring workers', 'Riser duct collapse', 'Complete kiln shutdown', 'Hot work at height — safety risk'],
      typicalClaim: '₹10–40 Cr + 4-8 weeks BI',
    },
    {
      title: 'Kiln Tyre (Riding Ring) Crack / Failure',
      severity: 'medium',
      description: 'Kiln tyres support the entire rotating mass (2000-4000 tonnes). Fatigue cracking from thermal cycling and ovality. Replacement requires complete kiln cooldown and heavy crane mobilisation. Lead time: 4-8 months.',
      impactAreas: ['Kiln tyre cracking', 'Support roller damage', 'Shell ovality increase', 'Emergency kiln stop', 'Heavy lift crane requirement'],
      typicalClaim: '₹15–50 Cr + 4-8 months BI',
    },
    {
      title: 'Coal Mill / Fuel System Fire & Explosion',
      severity: 'high',
      description: 'Vertical/horizontal coal mills grind petcoke/coal to fine powder. Explosive dust-air mixture if mill trips with hot material inside. CO monitoring failure leads to explosions. India has 3-5 coal mill fires/year in cement industry.',
      impactAreas: ['Coal mill explosion', 'Fire in coal storage/feed system', 'Hot gas duct fire', 'Bag filter fire (coal mill bag filter)', 'Adjacent equipment damage from blast'],
      typicalClaim: '₹5–30 Cr + 2-8 weeks BI',
    },
  ],
  grinding: [
    {
      title: 'Vertical Roller Mill (VRM) Grinding Table Crack',
      severity: 'high',
      description: 'VRM grinding tables (4-6m diameter, 80-150 tonne castings) develop fatigue cracks from impact loading. Single-piece casting — cannot be repaired on-site. Only 3-4 global foundries can cast replacements. Lead time: 10-14 months.',
      impactAreas: ['Grinding table fatigue cracking', 'Complete mill shutdown', 'No interim repair possible', 'Import dependency (Denmark/Germany)', 'Production shift to ball mills (50% less efficient)'],
      typicalClaim: '₹25–80 Cr + 10-14 months BI',
    },
    {
      title: 'VRM Reducer / Gearbox Failure',
      severity: 'high',
      description: 'Planetary gear reducers (2000-5000 kW) are the most expensive single component. Internal gear tooth failure, bearing collapse, or oil contamination. Replacement: 8-12 months lead time. Cost: ₹15-25 Cr per reducer.',
      impactAreas: ['Planetary gear tooth failure', 'Thrust bearing collapse', 'Oil system contamination', 'Complete mill stoppage', 'No local repair capability'],
      typicalClaim: '₹20–60 Cr + 8-12 months BI',
    },
    {
      title: 'Ball Mill Liner / Diaphragm Failure',
      severity: 'medium',
      description: 'Ball mills (4-5m diameter × 12-14m long) have replaceable liners and diaphragms. Liner bolt failure allows liner plates to fall, damaging mill internals. Diaphragm slot wear causes product contamination and efficiency loss.',
      impactAreas: ['Liner plate detachment', 'Diaphragm plate cracking', 'Mill trunnion bearing damage', 'Grinding media mixed with product', 'Extended relining shutdown'],
      typicalClaim: '₹5–15 Cr + 3-6 weeks BI',
    },
    {
      title: 'Cement Mill Separator Failure',
      severity: 'medium',
      description: 'High-efficiency separators (static + dynamic) classify cement fineness. Rotor imbalance, bearing failure, or cage wear causes shutdown. Without separator, cement fineness cannot be controlled — entire mill stops.',
      impactAreas: ['Separator rotor bearing failure', 'Cage/blade wear', 'Drive motor burnout', 'Product fineness out-of-spec', 'Mill efficiency drop 30-40%'],
      typicalClaim: '₹3–12 Cr + 2-4 weeks BI',
    },
  ],
  'raw-material': [
    {
      title: 'Crusher Main Shaft / Toggle Plate Failure',
      severity: 'medium',
      description: 'Primary jaw/gyratory crushers handle 1000-4000 TPH of limestone. Main shaft fatigue failure or toggle plate breakage from tramp iron. Replacement shafts: 3-6 months lead time. Stops raw material supply to entire plant.',
      impactAreas: ['Main shaft fracture', 'Toggle plate failure', 'Eccentric bearing seizure', 'Jaw plate detachment', 'Entire plant raw material starvation'],
      typicalClaim: '₹5–20 Cr + 3-6 months BI',
    },
    {
      title: 'Stacker-Reclaimer Structural Failure',
      severity: 'medium',
      description: 'Stacker-reclaimers (50-80m boom length) handle raw material blending. Boom structural fatigue, slew bearing failure, or bucket wheel gearbox failure. Critical for maintaining raw mix homogeneity.',
      impactAreas: ['Boom structural crack', 'Slew bearing failure', 'Bucket wheel gearbox damage', 'Raw mix homogeneity loss', 'Manual reclaiming (10x slower)'],
      typicalClaim: '₹8–25 Cr + 2-4 months BI',
    },
  ],
  packing: [
    {
      title: 'Packer Machine Failure',
      severity: 'low',
      description: 'Rotary packers (8-14 spout) fill 2000-4000 bags/hour. Spout wear, impeller damage, or PLC failure reduces output. Multiple packers provide redundancy but peak-season failure impacts dispatch targets.',
      impactAreas: ['Spout assembly wear', 'Bag filling accuracy drift', 'PLC/automation failure', 'Dispatch delay penalties', 'Customer complaints on bag weight'],
      typicalClaim: '₹1–5 Cr + 1-2 weeks BI',
    },
    {
      title: 'Bulk Loading System Failure',
      severity: 'low',
      description: 'Bulk cement loading (railway wagons/trucks) via telescopic chutes and weighbridges. Chute wear, load cell failure, or wagon tippler malfunction delays dispatches.',
      impactAreas: ['Telescopic chute wear', 'Load cell inaccuracy', 'Wagon tippler failure', 'Demurrage charges from railways', 'Customer supply disruption'],
      typicalClaim: '₹1–3 Cr + 1-2 weeks BI',
    },
  ],
  'captive-power': [
    {
      title: 'WHRS Boiler Tube Failure',
      severity: 'medium',
      description: 'Waste Heat Recovery Systems use preheater/cooler exhaust gases (300-400°C) to generate 7-15 MW per line. Boiler tube erosion from cement dust in gas stream. Tube leak forces WHRS shutdown — plant runs on grid/DG (higher cost).',
      impactAreas: ['Boiler tube erosion/leak', 'WHRS forced outage', 'Grid power dependency (higher cost)', 'Steam drum level trip', 'Economiser tube failure'],
      typicalClaim: '₹3–10 Cr + 2-4 weeks BI',
    },
    {
      title: 'Captive Power Turbine-Generator Failure',
      severity: 'medium',
      description: 'Captive thermal plants (coal-based, 25-50 MW) or WHRS turbines. Blade failure, bearing damage, or generator winding burnout. Forces plant to buy expensive grid power or curtail production.',
      impactAreas: ['Turbine blade failure', 'Generator winding burnout', 'Transformer failure', 'Forced grid power purchase', 'Production curtailment if grid unavailable'],
      typicalClaim: '₹8–25 Cr + 3-6 months BI',
    },
  ],
};

const RISK_MATRIX: Record<CementSource, MatrixEntry[]> = {
  kiln: [
    { risk: 'Refractory Failure / Hot Spot', prob: 'High (60%)', impact: 'High', score: '9/9', emv: '₹48 Cr', strategy: 'Transfer + Prevent', owner: 'Production Head', trigger: 'Shell scanner temp >320°C' },
    { risk: 'Girth Gear Failure', prob: 'Low (10%)', impact: 'Critical', score: '6/9', emv: '₹10 Cr', strategy: 'Transfer + Retain', owner: 'Maintenance Head', trigger: 'Vibration >4.5 mm/s' },
    { risk: 'Coal Mill Explosion', prob: 'Medium (30%)', impact: 'High', score: '6/9', emv: '₹9 Cr', strategy: 'Prevent + Transfer', owner: 'Safety Manager', trigger: 'CO >500 ppm in mill' },
    { risk: 'Preheater Blockage/Collapse', prob: 'High (50%)', impact: 'Medium', score: '6/9', emv: '₹15 Cr', strategy: 'Prevent', owner: 'Process Head', trigger: 'ΔP cyclone >150 mmWG' },
    { risk: 'Kiln Tyre Crack', prob: 'Low (8%)', impact: 'High', score: '3/9', emv: '₹4 Cr', strategy: 'Monitor + Transfer', owner: 'Mechanical Head', trigger: 'NDT crack length >50mm' },
    { risk: 'Kiln Main Motor Failure', prob: 'Medium (20%)', impact: 'Medium', score: '4/9', emv: '₹6 Cr', strategy: 'Transfer', owner: 'Electrical Head', trigger: 'Winding temp >130°C' },
  ],
  grinding: [
    { risk: 'VRM Grinding Table Crack', prob: 'Low (5%)', impact: 'Critical', score: '6/9', emv: '₹4 Cr', strategy: 'Transfer + Inspect', owner: 'Maintenance Head', trigger: 'NDT indication >5mm depth' },
    { risk: 'VRM Reducer Failure', prob: 'Medium (15%)', impact: 'High', score: '6/9', emv: '₹9 Cr', strategy: 'Transfer + Monitor', owner: 'Mechanical Head', trigger: 'Oil particle count >ISO 18/15' },
    { risk: 'Ball Mill Liner Failure', prob: 'High (40%)', impact: 'Low', score: '3/9', emv: '₹4 Cr', strategy: 'Prevent + Plan', owner: 'Production', trigger: 'Liner thickness <25mm' },
    { risk: 'Separator Bearing Failure', prob: 'Medium (25%)', impact: 'Medium', score: '4/9', emv: '₹3 Cr', strategy: 'Monitor + Spare', owner: 'Maintenance', trigger: 'Vibration >5 mm/s' },
  ],
  'raw-material': [
    { risk: 'Crusher Shaft Failure', prob: 'Low (10%)', impact: 'High', score: '3/9', emv: '₹2 Cr', strategy: 'Spare + Transfer', owner: 'Quarry Manager', trigger: 'Vibration anomaly + visual' },
    { risk: 'Landslide / Slope Failure', prob: 'Medium (25%)', impact: 'Medium', score: '4/9', emv: '₹5 Cr', strategy: 'Prevent + Monitor', owner: 'Mining Head', trigger: 'Slope radar >5mm/day movement' },
    { risk: 'Stacker-Reclaimer Failure', prob: 'Medium (20%)', impact: 'Medium', score: '4/9', emv: '₹4 Cr', strategy: 'Monitor + Transfer', owner: 'Mechanical Head', trigger: 'Boom deflection >L/500' },
  ],
  packing: [
    { risk: 'Packer Machine Failure', prob: 'High (40%)', impact: 'Low', score: '3/9', emv: '₹2 Cr', strategy: 'Redundancy', owner: 'Dispatch Head', trigger: 'Bag weight variance >1%' },
    { risk: 'Bulk Loading Failure', prob: 'Medium (20%)', impact: 'Low', score: '2/9', emv: '₹0.5 Cr', strategy: 'Redundancy', owner: 'Logistics', trigger: 'Weighbridge drift >0.5%' },
  ],
  'captive-power': [
    { risk: 'WHRS Tube Failure', prob: 'High (50%)', impact: 'Medium', score: '6/9', emv: '₹5 Cr', strategy: 'Prevent + Transfer', owner: 'Power Plant Head', trigger: 'Wall thinning >30%' },
    { risk: 'Turbine-Generator Failure', prob: 'Low (10%)', impact: 'High', score: '3/9', emv: '₹2.5 Cr', strategy: 'Transfer', owner: 'Power Plant Head', trigger: 'Vibration >4 mm/s' },
  ],
};

const CASE_STUDIES: Record<CementSource, CaseStudy> = {
  kiln: {
    title: 'Refractory Collapse — Major Cement Plant (South India)',
    location: 'Andhra Pradesh',
    date: 'March 2022',
    loss: '₹65 Cr (Property + BI)',
    rootCause: 'Alkali-sulphur ring formation in the kiln burning zone went undetected for 2 weeks. The ring grew to 1.8m thickness, causing localised overheating of the shell behind it. Refractory on the hot side collapsed over a 12m section. Shell temperature reached 480°C causing permanent shell distortion over 8m length.',
    impact: 'Kiln offline for 14 weeks. Required shell plate replacement (6m section), complete refractory relining of burning and transition zones, and realignment of kiln axis. Production loss: 2.8 lakh tonnes of clinker.',
    lessons: [
      'Infrared kiln shell scanners should alarm at 300°C, not 350°C — earlier intervention could have prevented shell damage',
      'Alkali bypass systems (5-10% gas extraction) reduce ring formation — most Indian plants skip this to save fuel',
      'BI loss (₹45 Cr) exceeded property loss (₹20 Cr) — adequate BI indemnity period is critical (minimum 12 months)',
      'Spare shell plates (pre-rolled to kiln diameter) should be kept on-site — reduces repair time by 4 weeks',
      'Coating thickness monitoring via shell temperature trending detects ring formation 2-3 weeks before failure',
    ],
    benchmark: 'Industry average: 1 unplanned kiln stop per 2-3 years due to refractory issues. Best-in-class (UltraTech, Dalmia) achieve 330+ days kiln uptime/year through predictive monitoring. Germany/Japan plants achieve 345+ days.',
  },
  grinding: {
    title: 'VRM Reducer Catastrophic Failure — Western India',
    location: 'Gujarat',
    date: 'August 2023',
    loss: '₹42 Cr (Property + BI)',
    rootCause: 'Planetary gear stage bearing cage failure due to oil contamination (water ingress from gearbox breather during monsoon). Bearing fragments entered gear mesh causing progressive tooth damage over 72 hours before the mill tripped on vibration.',
    impact: 'Complete reducer replacement required. Lead time from Flender/Germany: 11 months. Interim: production shifted to old ball mill (40% less capacity). Revenue loss: ₹28 Cr over 11 months.',
    lessons: [
      'Gearbox breathers must be upgraded to desiccant-type in humid/monsoon climates — standard breathers allow moisture ingress',
      'Online oil condition monitoring (water content + particle count) would have detected contamination 2-3 weeks earlier',
      'Strategic spare reducer (₹20 Cr investment) vs ₹42 Cr loss — payback in single incident',
      'Ball mill backup capability is essential even for VRM-only plants — provides 40-60% production continuity',
      'Insurance should cover air-freight of critical spares — reduces lead time by 2-3 months',
    ],
    benchmark: 'VRM reducer failures occur once per 8-12 years on average. Plants with online oil monitoring and scheduled oil replacement (every 3 years) extend this to 15+ years. Dalmia Cement maintains strategic spare reducers for all VRMs.',
  },
  'raw-material': {
    title: 'Quarry Slope Failure — Central India Limestone Mine',
    location: 'Madhya Pradesh (Satna Belt)',
    date: 'July 2021 (Monsoon)',
    loss: '₹22 Cr (Equipment + Production Loss)',
    rootCause: 'Continuous heavy rainfall (400mm in 72 hours) saturated the overburden layers above the working bench. 80m-wide slope failure brought down ~50,000 cubic metres of material onto the quarry floor, burying one excavator and blocking the haul road for 6 weeks.',
    impact: 'Primary crusher starved of limestone for 6 weeks during cleanup. Plant ran on buffer stock (2 weeks) then curtailed to 60% capacity using purchased limestone from nearby quarries at ₹200/tonne premium.',
    lessons: [
      'Slope stability monitoring (radar/prism) essential for all benches >30m in Seismic Zone III+',
      'Monsoon quarry operating protocols should include bench-wise risk assessment updated weekly',
      'Buffer limestone stock of minimum 15 days (vs typical 7 days) provides critical continuity',
      'Haul road design should include alternative access routes — single-road quarries are single-point-of-failure',
      'BI coverage should explicitly include "quarry inaccessibility" as a covered peril',
    ],
    benchmark: 'Indian Bureau of Mines (IBM) mandates slope stability analysis for all mines >30m depth. Best practice: quarterly slope monitoring reports + automated radar for critical walls. ACC/Ambuja implement real-time slope monitoring at all major quarries.',
  },
  packing: {
    title: 'Packing Plant Roof Collapse — Cyclone Damage',
    location: 'Tamil Nadu (East Coast)',
    date: 'November 2023',
    loss: '₹8 Cr (Property + Dispatch Loss)',
    rootCause: 'Cyclone Michaung brought 130 km/h winds to the plant. Large-span packing plant roof (70m × 40m) experienced wind uplift on the leeward side. 30% of roofing sheets torn off, allowing rain ingress onto packer machines and electrical panels.',
    impact: 'Two of three packer lines damaged by water ingress. Dispatch halted for 3 weeks during peak construction season. Demurrage charges on railway rakes. Customer supply diverted to competing brands.',
    lessons: [
      'Roof cladding fasteners degrade over 10-15 years — periodic pull-out testing essential for coastal plants',
      'Packer machines should have weatherproof enclosures or quick-deploy tarpaulin systems for cyclone warnings',
      'Cement in bags is not water-resistant — even partial roof loss causes product damage in storage areas',
      'Dispatch loss during peak season (Oct-Mar) has 2x financial impact vs lean season — BI valuation must reflect seasonality',
    ],
    benchmark: 'IS 875 Part 3 (Wind Loads) specifies design wind speeds. Coastal cement plants should design for 50-year return period wind speeds (typically 47-55 m/s). Many older plants designed to outdated standards need structural audit.',
  },
  'captive-power': {
    title: 'WHRS Boiler Tube Leak — Clinker Cooler Duct',
    location: 'Rajasthan',
    date: 'January 2024',
    loss: '₹12 Cr (Repair + Grid Power Cost)',
    rootCause: 'Cement kiln dust (CKite) in the cooler exhaust gas eroded boiler tube banks over 18 months. Erosion rate accelerated after process change increased cooler air flow. Tube wall thinned to 1.2mm (from 3.2mm) and ruptured during startup thermal stress.',
    impact: 'WHRS (12 MW) offline for 5 weeks. Plant forced to purchase grid power at ₹7.5/kWh vs WHRS generation cost of ₹1.5/kWh. Additional cost: ₹8 Cr for grid power over 5 weeks. Repair cost: ₹4 Cr for tube replacement + erosion shields.',
    lessons: [
      'Tube thickness monitoring (UT gauging) should be done every 6 months, not annually, especially after process changes',
      'Erosion shields/baffles at gas entry points extend tube life by 3-5x — ₹50 lakh investment prevents ₹12 Cr loss',
      'WHRS design should account for upset conditions (higher dust loading) not just normal operation',
      'Grid power backup contract (open access) should be maintained even with WHRS — negotiated rate vs spot rate saves 30%',
    ],
    benchmark: 'WHRS availability benchmark: 92-95% for well-maintained systems. Indian cement WHRS average: 85-88%. Gap primarily due to dust erosion management. FLSmidth/Kawasaki designs with in-built erosion protection achieve 94%+ in Japan.',
  },
};

const BEST_PRACTICES: Record<CementSource, string[]> = {
  kiln: [
    'Install continuous kiln shell infrared scanner with alarm at 300°C and trip at 380°C — prevents refractory-related shell damage',
    'Maintain kiln shell ovality within 0.1% of diameter — measure every shutdown using laser alignment',
    'Keep 1 set of spare kiln tyre and support rollers on-site — eliminates 4-6 month procurement delay',
    'Implement alkali bypass (5% gas extraction) to prevent ring and coating problems in burning zone',
    'Annual NDT inspection of girth gear teeth (MPI) and kiln shell welds (UT) — catch fatigue cracks early',
    'Coal mill CO monitoring with automatic inerting (N₂/CO₂) at 0.5% CO — prevents explosions',
    'Maintain minimum 2 weeks clinker buffer stock to absorb kiln stops without affecting cement dispatch',
    'Thermal imaging of all kiln electrical panels quarterly — detects loose connections before failure',
  ],
  grinding: [
    'Online oil condition monitoring for VRM reducers — particle count, water content, viscosity trending',
    'Quarterly NDT of VRM grinding table and rollers — ultrasonic thickness and dye penetrant for surface cracks',
    'Replace gearbox oil every 3 years or 20,000 hours regardless of oil condition — prevents cumulative contamination',
    'Maintain ball mill as backup capacity (even if VRM is primary) — provides 40-60% production continuity',
    'Vibration monitoring on all mill bearings with automated alerts — 4-6 weeks lead time for bearing replacement',
    'Separator rotor dynamic balancing annually — prevents premature bearing failure from imbalance forces',
    'Keep critical VRM spares on-site: 1 roller assembly, 1 set hydraulic cylinders, separator bearing sets',
  ],
  'raw-material': [
    'Quarterly slope stability assessment for all quarry faces >20m height using geotechnical consultant',
    'Install slope monitoring radar/prisms on all critical/active faces — automated alarm at 2mm/day movement rate',
    'Maintain 15-day limestone buffer stock (vs typical 7 days) — absorbs quarry access disruptions',
    'Design alternative haul roads — no quarry should have single access point',
    'Pre-monsoon bench maintenance: clear drains, reduce bench heights, pull back from overburden toes',
    'Crusher maintenance scheduling in lean monsoon periods when quarry output is naturally lower',
    'Keep crusher wear parts (jaw plates, mantles, concaves) for 2 replacement cycles on-site',
  ],
  packing: [
    'Annual roof cladding inspection with pull-out testing for all fasteners — replace degraded fixings proactively',
    'Design packing plant roofs for 50-year return period wind loads per IS 875 Part 3 (coastal plants especially)',
    'Weather-seal packer machines with quick-deploy enclosures for cyclone/storm warnings',
    'Maintain minimum 3 packer lines for redundancy — any 2 lines should meet full dispatch requirement',
    'Quarterly calibration of all bag filling and bulk loading weighing systems',
  ],
  'captive-power': [
    'WHRS boiler tube thickness monitoring every 6 months (UT gauging) — replace at 50% wall loss',
    'Install erosion shields at gas entry points of WHRS boiler — extends tube life 3-5x',
    'Maintain grid power open-access contract as WHRS backup — negotiate annual rate vs spot purchase',
    'DG sets: weekly test run under load (minimum 30 minutes) — ensures availability for kiln emergency cooling',
    'WHRS performance monitoring: track actual vs design MW output monthly — declining output indicates fouling/erosion',
    'Lightning protection audit annually for all stacks, WHRS structures, and outdoor switchgear',
  ],
};

const NON_INSURABLE_RISKS: Record<CementSource, { title: string; description: string; mitigation: string }[]> = {
  kiln: [
    { title: 'Regulatory Shutdown — Pollution Control Board', description: 'CPCB/SPCB can order shutdown for emission violations (PM >30 mg/Nm³, SO₂ >100 mg/Nm³). NGT orders have shut cement plants for weeks.', mitigation: 'Continuous Emission Monitoring (CEMS), ESP/bag filter maintenance, proactive compliance audits' },
    { title: 'Fuel Supply Disruption — Coal/Petcoke', description: 'Coal India supply irregularities, port congestion for imported petcoke, or petcoke import ban (as in 2017-18). Forces production curtailment.', mitigation: 'Dual-fuel capability (coal + petcoke + AFR), 30-day fuel buffer, multiple sourcing contracts' },
    { title: 'Limestone Quality Deterioration', description: 'Progressive mining depletes high-grade reserves. Lower CaO content requires process changes, higher fuel consumption. Long-term profitability impact.', mitigation: 'Geological survey every 5 years, quality-based mine planning, limestone beneficiation R&D' },
  ],
  grinding: [
    { title: 'Product Quality Failure — BIS Non-Compliance', description: 'Bureau of Indian Standards (BIS) can revoke cement license if product fails quality testing. Market reputation damage.', mitigation: 'Online quality monitoring (XRD/XRF), statistical process control, 2-hourly testing protocols' },
    { title: 'Clinker Supply Chain Disruption', description: 'Grinding units dependent on clinker transport (rail/road) from integrated plants. Railway disruptions or truck strikes halt production.', mitigation: 'Multi-modal logistics, 15-day clinker buffer, alternate integrated plant sourcing' },
  ],
  'raw-material': [
    { title: 'Mining Lease Renewal Delay', description: 'Mining lease expiry without renewal (state government delays) can halt quarrying. 6-12 month bureaucratic process.', mitigation: 'Apply for renewal 3 years before expiry, maintain political/administrative relationships, alternate quarry development' },
    { title: 'Community / NGO Opposition', description: 'Local community or environmental groups opposing quarry expansion or blasting operations. Court injunctions can halt work.', mitigation: 'CSR programs, community engagement, environmental impact assessment compliance, controlled blasting' },
  ],
  packing: [
    { title: 'Truck Strike / Transport Disruption', description: 'Truck owners/drivers strikes (fuel price hikes, toll issues) halt cement dispatch. Plants produce but cannot deliver — silo overflow forces shutdown.', mitigation: 'Railway dispatch capability, owned fleet (20-30%), long-term transport contracts, silo overflow protocol' },
    { title: 'Competitive Price War', description: 'Regional cement oversupply leading to price collapse. Not insurable but impacts plant economics and maintenance budget allocation.', mitigation: 'Cost leadership through operational efficiency, premium product segments, geographic diversification' },
  ],
  'captive-power': [
    { title: 'Grid Power Tariff Increase', description: 'State electricity board tariff hikes increase power cost when WHRS/captive is offline. Open access charges and cross-subsidy surcharges erode savings.', mitigation: 'WHRS maximisation, solar (25 MW+ installations), group captive structures, power exchange trading' },
    { title: 'Carbon Tax / Emission Trading', description: 'Future carbon pricing (India\'s carbon credit mechanism) will increase cement production costs. Captive coal plants most exposed.', mitigation: 'WHRS expansion, solar/wind procurement, alternative fuels (AFR up to 20% TSR), energy efficiency' },
  ],
};

// ─── Source Config ───────────────────────────────────────────────────────────

const SOURCES: { id: CementSource; label: string; icon: string; color: string }[] = [
  { id: 'kiln', label: 'Kiln & Pyroprocessing', icon: '🔥', color: '#B02A30' },
  { id: 'grinding', label: 'Grinding & Milling', icon: '⚙️', color: '#005B75' },
  { id: 'raw-material', label: 'Raw Material & Quarry', icon: '⛏️', color: '#8B6914' },
  { id: 'packing', label: 'Packing & Dispatch', icon: '📦', color: '#4CAF50' },
  { id: 'captive-power', label: 'Captive Power & WHRS', icon: '⚡', color: '#E65100' },
];

const SOURCE_BANNERS: Record<CementSource, { img: string; title: string; subtitle: string }> = {
  kiln: { img: 'https://images.unsplash.com/photo-1590247813693-5541d1c573a2?w=900&h=200&fit=crop', title: '🔥 Kiln & Pyroprocessing Risk Profile', subtitle: 'Rotary kiln, preheater tower, calciner, cooler — high-value, long lead time equipment' },
  grinding: { img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&h=200&fit=crop', title: '⚙️ Grinding & Milling Risk Profile', subtitle: 'VRM, ball mills, separators, reducers — precision equipment with import dependency' },
  'raw-material': { img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&h=200&fit=crop', title: '⛏️ Raw Material & Quarry Risk Profile', subtitle: 'Limestone quarry, crushers, stackers — exposed to geological and weather risks' },
  packing: { img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&h=200&fit=crop', title: '📦 Packing & Dispatch Risk Profile', subtitle: 'Packer lines, silos, bulk loading — customer-facing operations, seasonal peaks' },
  'captive-power': { img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=200&fit=crop', title: '⚡ Captive Power & WHRS Risk Profile', subtitle: 'Waste heat recovery, captive thermal, DG sets — energy cost and continuity' },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function CementRiskAnalysis() {
  const [activeSource, setActiveSource] = useState<CementSource>('kiln');
  const [activeTab, setActiveTab] = useState<'insurable' | 'framework' | 'non-insurable' | 'best-practices'>('insurable');

  const banner = SOURCE_BANNERS[activeSource];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="icici-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-amber-700 flex items-center justify-center text-xl">🏭</div>
          <div>
            <h2 className="text-base font-black text-gray-800">Risk Analysis — Cement Industry</h2>
            <p className="text-[13px] text-gray-400">Insurable & Non-Insurable risks • Material Damage (AOG & Non-AOG) • Machinery Breakdown • Best Practices</p>
          </div>
        </div>

        {/* Source Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {SOURCES.map((s) => (
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

        {/* Visual Banner */}
        <div className="mb-4 rounded-xl overflow-hidden h-32 relative">
          <img src={banner.img} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
            <div>
              <p className="text-white text-sm font-black">{banner.title}</p>
              <p className="text-white/70 text-[13px] mt-1">{banner.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {[
            { id: 'insurable' as const, label: '🛡️ Insurable Risks' },
            { id: 'framework' as const, label: '📐 Risk Framework' },
            { id: 'non-insurable' as const, label: '⚠️ Non-Insurable' },
            { id: 'best-practices' as const, label: '✅ Best Practices' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'insurable' && <InsurableRisksSection source={activeSource} />}
      {activeTab === 'framework' && <RiskFrameworkSection source={activeSource} />}
      {activeTab === 'non-insurable' && <NonInsurableSection source={activeSource} />}
      {activeTab === 'best-practices' && <BestPracticesSection source={activeSource} />}
    </div>
  );
}

// ─── Insurable Risks ─────────────────────────────────────────────────────────

function InsurableRisksSection({ source }: { source: CementSource }) {
  const aog = AOG_PERILS[source] || [];
  const nonAog = NON_AOG_PERILS[source] || [];
  const sourceLabel = SOURCES.find(s => s.id === source)?.label || source;

  return (
    <div className="space-y-5">
      {/* AOG */}
      {aog.length > 0 && (
        <div className="icici-card p-5 border-l-4 border-blue-400">
          <h3 className="text-sm font-black text-gray-800 mb-1">🌪️ Act of God (AOG) Perils — {sourceLabel}</h3>
          <p className="text-[12px] text-gray-400 mb-4">Natural catastrophes: earthquake, flood, cyclone, lightning, landslide</p>
          <div className="space-y-3">
            {aog.map((r, i) => <RiskCard key={i} risk={r} />)}
          </div>
        </div>
      )}

      {/* Non-AOG */}
      {nonAog.length > 0 && (
        <div className="icici-card p-5 border-l-4 border-orange-400">
          <h3 className="text-sm font-black text-gray-800 mb-1">🔧 Non-AOG Perils — Machinery Breakdown & Fire</h3>
          <p className="text-[12px] text-gray-400 mb-4">Operational failures: mechanical breakdown, fire, explosion, electrical damage</p>
          <div className="space-y-3">
            {nonAog.map((r, i) => <RiskCard key={i} risk={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Risk Framework ──────────────────────────────────────────────────────────

function RiskFrameworkSection({ source }: { source: CementSource }) {
  const matrix = RISK_MATRIX[source] || [];
  const cs = CASE_STUDIES[source];
  const sourceLabel = SOURCES.find(s => s.id === source)?.label || source;

  return (
    <div className="space-y-5">
      {/* ISO Framework */}
      <div className="icici-card p-5 border-l-4 border-blue-600">
        <h3 className="text-sm font-black text-gray-800 mb-2">📐 Risk Assessment Framework — ISO 31000 Aligned</h3>
        <p className="text-[12px] text-gray-400 mb-3">Systematic risk identification, analysis & treatment for {sourceLabel}</p>
        <div className="grid grid-cols-5 gap-2 text-center text-[12px]">
          {['Identify', 'Analyze', 'Evaluate', 'Treat', 'Monitor'].map((step, i) => (
            <div key={step} className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <div className="font-black text-blue-800">{i + 1}. {step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3×3 Matrix Visual */}
      <div className="icici-card p-5">
        <h3 className="text-sm font-black text-gray-800 mb-1">Probability × Impact Matrix — {sourceLabel}</h3>
        <p className="text-[12px] text-gray-400 mb-4">Quantitative risk scoring with Expected Monetary Value (EMV)</p>

        <div className="mb-4 grid grid-cols-4 gap-0 text-[12px] font-bold text-center" style={{ width: '280px' }}>
          <div className="p-1" />
          <div className="p-2 bg-green-50 border border-green-200 rounded-tl">Low</div>
          <div className="p-2 bg-amber-50 border border-amber-200">Medium</div>
          <div className="p-2 bg-red-50 border border-red-200 rounded-tr">High</div>
          <div className="p-2 bg-red-50 border border-red-200 text-red-700">High</div>
          <div className="p-2 bg-amber-100 border border-amber-200">3</div>
          <div className="p-2 bg-orange-100 border border-orange-200">6</div>
          <div className="p-2 bg-red-200 border border-red-300 text-red-800">9</div>
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700">Med</div>
          <div className="p-2 bg-green-100 border border-green-200">2</div>
          <div className="p-2 bg-amber-100 border border-amber-200">4</div>
          <div className="p-2 bg-orange-100 border border-orange-200">6</div>
          <div className="p-2 bg-green-50 border border-green-200 text-green-700">Low</div>
          <div className="p-2 bg-green-50 border border-green-200 rounded-bl">1</div>
          <div className="p-2 bg-green-100 border border-green-200">2</div>
          <div className="p-2 bg-amber-100 border border-amber-200 rounded-br">3</div>
        </div>

        {/* Risk Register Table */}
        <div className="">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left p-2 font-bold text-gray-600">Risk Event</th>
                <th className="text-center p-2 font-bold text-gray-600">Probability</th>
                <th className="text-center p-2 font-bold text-gray-600">Impact</th>
                <th className="text-center p-2 font-bold text-gray-600">Score</th>
                <th className="text-center p-2 font-bold text-gray-600">EMV</th>
                <th className="text-center p-2 font-bold text-gray-600">Strategy</th>
                <th className="text-left p-2 font-bold text-gray-600">Owner</th>
                <th className="text-left p-2 font-bold text-gray-600">Trigger</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2 font-bold text-gray-800">{r.risk}</td>
                  <td className="p-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${r.prob.includes('High') ? 'bg-red-100 text-red-700' : r.prob.includes('Medium') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {r.prob}
                    </span>
                  </td>
                  <td className="p-2 text-center font-bold">{r.impact}</td>
                  <td className="p-2 text-center font-black text-red-700">{r.score}</td>
                  <td className="p-2 text-center font-black text-blue-800">{r.emv}</td>
                  <td className="p-2 text-center text-[11px]">{r.strategy}</td>
                  <td className="p-2 text-[11px] text-gray-600">{r.owner}</td>
                  <td className="p-2 text-[11px] text-gray-500">{r.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Study */}
      {cs && (
        <div className="icici-card p-5 border-l-4 border-amber-400">
          <h3 className="text-sm font-black text-gray-800 mb-1">📋 Case Study — {cs.title}</h3>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-3">
            <span>📍 {cs.location}</span>
            <span>📅 {cs.date}</span>
            <span className="font-bold text-red-600">💰 Loss: {cs.loss}</span>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Root Cause</h4>
              <p className="text-[12px] text-gray-700">{cs.rootCause}</p>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Impact</h4>
              <p className="text-[12px] text-gray-700">{cs.impact}</p>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Key Lessons</h4>
              <div className="space-y-1.5">
                {cs.lessons.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700 p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-amber-600 font-bold flex-shrink-0">⚡</span>{l}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-800">📊 Industry Benchmark: </span>
              <span className="text-[11px] text-blue-700">{cs.benchmark}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Non-Insurable Risks ─────────────────────────────────────────────────────

function NonInsurableSection({ source }: { source: CementSource }) {
  const risks = NON_INSURABLE_RISKS[source] || [];
  const sourceLabel = SOURCES.find(s => s.id === source)?.label || source;

  return (
    <div className="space-y-4">
      <div className="icici-card p-5 border-l-4 border-gray-400">
        <h3 className="text-sm font-black text-gray-800 mb-1">⚠️ Non-Insurable Risks — {sourceLabel}</h3>
        <p className="text-[12px] text-gray-400 mb-4">Risks that cannot be transferred through traditional insurance — require operational/strategic mitigation</p>
        <div className="space-y-3">
          {risks.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <h4 className="text-[13px] font-black text-gray-800 mb-1">{r.title}</h4>
              <p className="text-[12px] text-gray-600 mb-2">{r.description}</p>
              <div className="flex items-start gap-2 text-[11px] text-green-700 bg-green-50 border border-green-100 rounded-lg p-2">
                <span className="font-bold flex-shrink-0">✅ Mitigation:</span>
                <span>{r.mitigation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Best Practices ──────────────────────────────────────────────────────────

function BestPracticesSection({ source }: { source: CementSource }) {
  const practices = BEST_PRACTICES[source] || [];
  const sourceLabel = SOURCES.find(s => s.id === source)?.label || source;

  return (
    <div className="icici-card p-5 border-l-4 border-green-500">
      <h3 className="text-sm font-black text-gray-800 mb-1">✅ Risk Engineering Best Practices — {sourceLabel}</h3>
      <p className="text-[12px] text-gray-400 mb-4">Proven measures to reduce risk severity and frequency — source: FM Global, ECRA, industry loss experience</p>
      <div className="space-y-2">
        {practices.map((bp, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700 p-2.5 rounded-lg bg-green-50 border border-green-100">
            <span className="text-green-600 font-bold flex-shrink-0">✓</span>{bp}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Risk Card ────────────────────────────────────────────────────────

function RiskCard({ risk }: { risk: RiskEntry }) {
  const sevConfig = {
    high: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', label: 'HIGH' },
    medium: { border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'MEDIUM' },
    low: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', label: 'LOW' },
  };
  const cfg = sevConfig[risk.severity];

  return (
    <div className={`icici-card p-4 border-l-4 ${cfg.border}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-black text-gray-800">{risk.title}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          <span className="text-[10px] font-bold text-gray-500">Typical: {risk.typicalClaim}</span>
        </div>
      </div>
      <p className="text-[12px] text-gray-600 mb-2">{risk.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {risk.impactAreas.map((area, j) => (
          <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium border border-gray-200">{area}</span>
        ))}
      </div>
    </div>
  );
}
