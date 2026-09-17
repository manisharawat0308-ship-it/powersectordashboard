import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'India Energy Research';
pptx.subject = 'India Power Sector Story';

// Colors — Clean teal/blue theme (non-ICICI)
const TEAL = '0F766E';
const DARK_TEAL = '115E59';
const AMBER = 'F59E0B';
const BLUE = '1E40AF';
const DARK = '111827';
const WHITE = 'FFFFFF';
const GREEN = '059669';
const GRAY = '6B7280';
const LIGHT_BG = 'F9FAFB';

function addFooter(slide, num) {
  slide.addText('India Energy Research', { x: 0.5, y: 7.0, w: 5, h: 0.3, fontSize: 16, color: GRAY });
  slide.addText(`${num} / 10`, { x: 11.5, y: 7.0, w: 1.5, h: 0.3, fontSize: 16, color: GRAY, align: 'right' });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.04, fill: { color: TEAL } });
}

// SLIDE 1: Title
let slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addShape(pptx.ShapeType.rect, { x: 8.5, y: 0, w: 4.83, h: 7.5, fill: { color: TEAL } });
slide.addText('IE', { x: 0.5, y: 0.5, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: WHITE, fill: { color: TEAL }, align: 'center', valign: 'middle' });
slide.addText('INDIA ENERGY RESEARCH', { x: 1.3, y: 0.6, w: 4, h: 0.4, fontSize: 16, color: TEAL, bold: true });
slide.addText("India's Power Sector\nA Comprehensive Overview", { x: 0.5, y: 2.5, w: 7.5, h: 1.5, fontSize: 44, bold: true, color: DARK, lineSpacingMultiple: 1.1 });
slide.addText('450 GW installed • 1,752 BU generated • 36 states\nFrom 20 GW (1975) to 450 GW (2025) — a 22.5× transformation', { x: 0.5, y: 4.2, w: 7.5, h: 0.9, fontSize: 17, color: GRAY });
slide.addText('July 2026\nData: CEA • MNRE • Ministry of Power', { x: 0.5, y: 5.8, w: 6, h: 0.6, fontSize: 16, color: GRAY });
slide.addText('⚡', { x: 10, y: 3, w: 2, h: 2, fontSize: 80, align: 'center', valign: 'middle', color: WHITE });
addFooter(slide, 1);

// SLIDE 2: Big Picture
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('The Big Picture', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
slide.addText("India's power sector at a glance — June 2026", { x: 0.5, y: 1.2, w: 8, h: 0.4, fontSize: 15, color: GRAY });

const stats = [
  { val: '450 GW', label: 'Installed Capacity', color: TEAL },
  { val: '1,752 BU', label: 'Annual Generation', color: GREEN },
  { val: '54 : 46', label: 'Fossil : Non-Fossil', color: AMBER },
  { val: '53.5%', label: 'Private Sector Share', color: BLUE },
];
stats.forEach((s, i) => {
  const x = 0.5 + i * 3.2;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 2.9, h: 2.0, fill: { color: LIGHT_BG }, line: { color: 'E5E7EB', width: 1 }, rectRadius: 0.08 });
  slide.addText(s.val, { x, y: 2.3, w: 2.9, h: 0.9, fontSize: 36, bold: true, color: s.color, align: 'center' });
  slide.addText(s.label, { x, y: 3.3, w: 2.9, h: 0.4, fontSize: 16, color: GRAY, align: 'center' });
});
addFooter(slide, 2);

// SLIDE 3: Energy Mix
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Energy Mix', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 6.7, h: 0.5, fill: { color: 'DC2626' } });
slide.addText('🔥 Fossil — 243.87 GW (54.2%)', { x: 0.5, y: 1.5, w: 6.7, h: 0.5, fontSize: 17, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 7.2, y: 1.5, w: 5.63, h: 0.5, fill: { color: TEAL } });
slide.addText('🌿 Non-Fossil — 206.42 GW (45.8%)', { x: 7.2, y: 1.5, w: 5.63, h: 0.5, fontSize: 17, bold: true, color: WHITE, align: 'center', valign: 'middle' });

// Fossil table
slide.addText('Fossil Sources', { x: 0.5, y: 2.3, w: 6, h: 0.4, fontSize: 16, bold: true, color: 'DC2626' });
const fossil = [['Coal', '211,540 MW', '47.0%'], ['Gas', '24,900 MW', '5.5%'], ['Lignite', '6,740 MW', '1.5%'], ['Diesel', '690 MW', '0.2%']];
fossil.forEach((f, i) => { slide.addText(`${f[0]}  —  ${f[1]}  (${f[2]})`, { x: 0.8, y: 2.8 + i * 0.4, w: 5, h: 0.35, fontSize: 17, color: '4B5563' }); });

// Non-fossil table
slide.addText('Non-Fossil Sources', { x: 7, y: 2.3, w: 6, h: 0.4, fontSize: 16, bold: true, color: TEAL });
const nf = [['Solar', '90,570 MW', '20.1%'], ['Wind', '47,650 MW', '10.6%'], ['Large Hydro', '47,050 MW', '10.5%'], ['Biomass', '10,750 MW', '2.4%'], ['Nuclear', '8,180 MW', '1.8%']];
nf.forEach((f, i) => { slide.addText(`${f[0]}  —  ${f[1]}  (${f[2]})`, { x: 7.3, y: 2.8 + i * 0.4, w: 5.5, h: 0.35, fontSize: 17, color: '4B5563' }); });
addFooter(slide, 3);

// SLIDE 4: Growth Timeline
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Growth Timeline', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });

const tl = [
  { yr: '1975', gw: '20 GW', note: 'State monopoly era' },
  { yr: '2000', gw: '102 GW', note: 'Post-liberalization' },
  { yr: '2010', gw: '174 GW', note: 'Solar Mission launched' },
  { yr: '2020', gw: '370 GW', note: '100 GW RE crossed' },
  { yr: '2025', gw: '450 GW', note: '46% non-fossil' },
];
tl.forEach((t, i) => {
  const x = 0.5 + i * 2.5;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: 2.3, h: 2.2, fill: { color: LIGHT_BG }, line: { color: 'E5E7EB' }, rectRadius: 0.08 });
  slide.addText(t.yr, { x, y: 1.7, w: 2.3, h: 0.4, fontSize: 17, color: GRAY, align: 'center' });
  slide.addText(t.gw, { x, y: 2.1, w: 2.3, h: 0.7, fontSize: 22, bold: true, color: TEAL, align: 'center' });
  slide.addText(t.note, { x, y: 2.9, w: 2.3, h: 0.4, fontSize: 15, color: GRAY, align: 'center' });
});

slide.addText('Key Milestones', { x: 0.5, y: 4.2, w: 6, h: 0.4, fontSize: 16, bold: true, color: DARK });
const ms = ['1991 — Sector liberalization, private IPP entry', '2003 — Electricity Act restructured the sector', '2010 — National Solar Mission (JNNSM) launched', '2015 — 175 GW RE target at Paris COP21', '2020 — Crossed 100 GW renewable capacity', '2022 — 500 GW non-fossil target announced'];
ms.forEach((m, i) => {
  const col = i < 3 ? 0 : 1;
  const row = i % 3;
  slide.addText(`• ${m}`, { x: 0.5 + col * 6.2, y: 4.7 + row * 0.4, w: 6, h: 0.35, fontSize: 16, color: '4B5563' });
});
addFooter(slide, 4);

// SLIDE 5: Load Factor
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Capacity vs Generation', { x: 0.5, y: 0.3, w: 10, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
slide.addText('Why installed capacity ≠ actual generation — the load factor effect', { x: 0.5, y: 1.2, w: 10, h: 0.4, fontSize: 15, color: GRAY });

// Headers
slide.addText('Source', { x: 0.5, y: 1.8, w: 2.2, h: 0.4, fontSize: 16, bold: true, color: GRAY });
slide.addText('Capacity %', { x: 2.8, y: 1.8, w: 2, h: 0.4, fontSize: 16, bold: true, color: TEAL, align: 'center' });
slide.addText('Generation %', { x: 4.8, y: 1.8, w: 2, h: 0.4, fontSize: 16, bold: true, color: 'DC2626', align: 'center' });
slide.addText('PLF/CUF', { x: 6.8, y: 1.8, w: 1.5, h: 0.4, fontSize: 16, bold: true, color: AMBER, align: 'center' });
slide.addText('Insight', { x: 8.5, y: 1.8, w: 4, h: 0.4, fontSize: 16, bold: true, color: GRAY });

const lf = [
  { name: 'Coal', cap: '47.0%', gen: '62.4%', plf: '64.2%', insight: 'Baseload — runs 24/7' },
  { name: 'Solar', cap: '20.1%', gen: '8.1%', plf: '18.2%', insight: 'Daylight only — needs storage' },
  { name: 'Wind', cap: '10.6%', gen: '4.7%', plf: '21.5%', insight: 'Seasonal — monsoon peak' },
  { name: 'Large Hydro', cap: '10.5%', gen: '9.6%', plf: '38.4%', insight: 'Balanced — grid stabilizer' },
  { name: 'Nuclear', cap: '1.8%', gen: '2.9%', plf: '78.6%', insight: 'Highest efficiency source' },
];
lf.forEach((l, i) => {
  const y = 2.3 + i * 0.6;
  const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 12, h: 0.55, fill: { color: bg } });
  slide.addText(l.name, { x: 0.6, y, w: 2, h: 0.55, fontSize: 17, bold: true, color: DARK, valign: 'middle' });
  slide.addText(l.cap, { x: 2.8, y, w: 2, h: 0.55, fontSize: 15, bold: true, color: TEAL, align: 'center', valign: 'middle' });
  slide.addText(l.gen, { x: 4.8, y, w: 2, h: 0.55, fontSize: 15, bold: true, color: 'DC2626', align: 'center', valign: 'middle' });
  slide.addText(l.plf, { x: 6.8, y, w: 1.5, h: 0.55, fontSize: 15, bold: true, color: AMBER, align: 'center', valign: 'middle' });
  slide.addText(l.insight, { x: 8.5, y, w: 4, h: 0.55, fontSize: 16, color: '4B5563', valign: 'middle' });
});
addFooter(slide, 5);

// SLIDE 6: Ownership
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Ownership Structure', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
// Bar
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.4, w: 2.9, h: 0.5, fill: { color: BLUE } });
slide.addText('Central 23%', { x: 0.5, y: 1.4, w: 2.9, h: 0.5, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 3.4, y: 1.4, w: 3.0, h: 0.5, fill: { color: 'DC2626' } });
slide.addText('State 23.5%', { x: 3.4, y: 1.4, w: 3.0, h: 0.5, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 6.4, y: 1.4, w: 6.4, h: 0.5, fill: { color: AMBER } });
slide.addText('Private 53.5%', { x: 6.4, y: 1.4, w: 6.4, h: 0.5, fontSize: 16, bold: true, color: DARK, align: 'center', valign: 'middle' });

const ow = [
  { name: 'Central PSU', gw: '103.45 GW', color: BLUE, detail: 'NTPC (72 GW), NHPC, NPCIL • 53% fossil' },
  { name: 'State PSU', gw: '105.82 GW', color: 'DC2626', detail: 'MAHAGENCO, GSECL, TANGEDCO • 68% fossil' },
  { name: 'Private Sector', gw: '241.02 GW', color: AMBER, detail: 'Adani Green (20 GW), Tata, ReNew • 52% non-fossil' },
];
ow.forEach((o, i) => {
  const x = 0.5 + i * 4.2;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.3, w: 3.9, h: 2.5, fill: { color: LIGHT_BG }, line: { color: o.color, width: 2 }, rectRadius: 0.08 });
  slide.addText(o.name, { x: x + 0.3, y: 2.5, w: 3.3, h: 0.4, fontSize: 16, bold: true, color: o.color });
  slide.addText(o.gw, { x: x + 0.3, y: 3.0, w: 3.3, h: 0.6, fontSize: 22, bold: true, color: DARK });
  slide.addText(o.detail, { x: x + 0.3, y: 3.7, w: 3.3, h: 0.6, fontSize: 15, color: GRAY });
});
addFooter(slide, 6);

// SLIDE 7: States
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('State-wise Distribution', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
const st = [
  ['1', 'Maharashtra', '52.1 GW', 'Coal'], ['2', 'Gujarat', '46.8 GW', 'Coal'],
  ['3', 'Rajasthan', '41.5 GW', 'Solar'], ['4', 'Tamil Nadu', '38.9 GW', 'Wind'],
  ['5', 'Karnataka', '34.2 GW', 'Solar'], ['6', 'Uttar Pradesh', '32.6 GW', 'Coal'],
  ['7', 'Andhra Pradesh', '28.4 GW', 'Solar'], ['8', 'Madhya Pradesh', '26.8 GW', 'Coal'],
  ['9', 'Telangana', '20.5 GW', 'Coal'], ['10', 'West Bengal', '18.2 GW', 'Coal'],
];
st.forEach((s, i) => {
  const y = 1.4 + i * 0.5;
  slide.addText(s[0], { x: 0.5, y, w: 0.5, h: 0.4, fontSize: 16, bold: true, color: TEAL });
  slide.addText(s[1], { x: 1.1, y, w: 3, h: 0.4, fontSize: 17, bold: true, color: DARK });
  slide.addText(s[2], { x: 4.2, y, w: 1.5, h: 0.4, fontSize: 17, bold: true, color: TEAL, align: 'right' });
  slide.addText(s[3], { x: 5.9, y, w: 1.2, h: 0.4, fontSize: 15, color: GRAY });
});
addFooter(slide, 7);

// SLIDE 8: Projections
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Future Outlook 2026–2035', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
slide.addText('Target: 500 GW non-fossil capacity by 2030', { x: 0.5, y: 1.2, w: 10, h: 0.4, fontSize: 15, color: GRAY });

const pr = [['2026', '466', '478'], ['2028', '506', '548'], ['2030', '550', '630'], ['2032', '600', '702'], ['2035', '688', '822']];
slide.addText('Year', { x: 0.5, y: 1.8, w: 1.5, h: 0.35, fontSize: 16, bold: true, color: GRAY });
slide.addText('Demand (GW)', { x: 2, y: 1.8, w: 2, h: 0.35, fontSize: 16, bold: true, color: 'DC2626', align: 'center' });
slide.addText('Supply (GW)', { x: 4, y: 1.8, w: 2, h: 0.35, fontSize: 16, bold: true, color: GREEN, align: 'center' });
pr.forEach((p, i) => {
  const y = 2.2 + i * 0.5;
  slide.addText(p[0], { x: 0.5, y, w: 1.5, h: 0.4, fontSize: 15, bold: true, color: DARK });
  slide.addText(p[1] + ' GW', { x: 2, y, w: 2, h: 0.4, fontSize: 15, color: 'DC2626', align: 'center' });
  slide.addText(p[2] + ' GW ✓', { x: 4, y, w: 2, h: 0.4, fontSize: 15, color: GREEN, align: 'center' });
});

slide.addText('Planned Additions 2026–2030', { x: 7, y: 1.8, w: 5, h: 0.4, fontSize: 15, bold: true, color: DARK });
const ad = [['Solar', '+180 GW'], ['Wind', '+50 GW'], ['Coal', '+10 GW'], ['Hydro', '+8 GW'], ['Nuclear', '+8 GW']];
ad.forEach((a, i) => { slide.addText(`${a[0]}:  ${a[1]}`, { x: 7.3, y: 2.3 + i * 0.5, w: 4, h: 0.4, fontSize: 17, color: '4B5563' }); });
addFooter(slide, 8);

// SLIDE 9: Risks
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Risk Landscape', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });
slide.addText('Source', { x: 0.5, y: 1.4, w: 1.8, h: 0.35, fontSize: 15, bold: true, color: GRAY });
slide.addText('Top AOG Peril', { x: 2.3, y: 1.4, w: 3.5, h: 0.35, fontSize: 15, bold: true, color: GRAY });
slide.addText('Top Non-AOG Peril', { x: 5.8, y: 1.4, w: 3.5, h: 0.35, fontSize: 15, bold: true, color: GRAY });
slide.addText('Typical Claim', { x: 9.3, y: 1.4, w: 3.5, h: 0.35, fontSize: 15, bold: true, color: GRAY });

const risks = [
  ['Coal', 'Flood / Cyclone', 'Boiler Explosion / Turbine Failure', '₹50–500 Cr'],
  ['Wind', 'Cyclone / Lightning', 'Gearbox / Blade Failure', '₹5–200 Cr (portfolio)'],
  ['Solar', 'Hailstorm / Cyclone', 'Inverter Failure / Fire', '₹20–200 Cr'],
];
risks.forEach((r, i) => {
  const y = 1.8 + i * 0.6;
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 12.3, h: 0.55, fill: { color: i % 2 === 0 ? LIGHT_BG : WHITE } });
  slide.addText(r[0], { x: 0.6, y, w: 1.6, h: 0.55, fontSize: 17, bold: true, color: DARK, valign: 'middle' });
  slide.addText(r[1], { x: 2.3, y, w: 3.5, h: 0.55, fontSize: 16, color: '4B5563', valign: 'middle' });
  slide.addText(r[2], { x: 5.8, y, w: 3.5, h: 0.55, fontSize: 16, color: '4B5563', valign: 'middle' });
  slide.addText(r[3], { x: 9.3, y, w: 3.5, h: 0.55, fontSize: 16, bold: true, color: 'DC2626', valign: 'middle' });
});

slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 4.0, w: 12.3, h: 2.5, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0' }, rectRadius: 0.08 });
slide.addText('Insurance Considerations', { x: 0.8, y: 4.2, w: 5, h: 0.4, fontSize: 15, bold: true, color: '065F46' });
slide.addText('• Coal: Turbine failures = longest BI (12–18 months lead time)\n• Wind: Crane availability is critical — 3–6 months wait in India\n• Solar: Hailstorm emerged as #1 peril post-2020 (can damage 80% modules)\n• All: Business Interruption often exceeds Material Damage claim value\n• Best practice: Pre-agreed repair protocols, regional spare depots, parametric covers', { x: 0.8, y: 4.7, w: 11.5, h: 1.6, fontSize: 16, color: '047857', lineSpacingMultiple: 1.4 });
addFooter(slide, 9);

// SLIDE 10: Takeaways
slide = pptx.addSlide();
slide.background = { fill: WHITE };
slide.addText('Key Takeaways', { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 34, bold: true, color: DARK });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 2, h: 0.05, fill: { color: TEAL } });

const ta = [
  'Capacity grew 22.5× from 20 GW (1975) to 450 GW (2025)',
  'Non-fossil share doubled: 24% → 45.8% in 25 years',
  'Solar: fastest growth in history — 0 to 162 GW in 12 years',
  'Coal still generates 62% of electricity (PLF 64% vs Solar CUF 18%)',
  'Private sector owns 53.5% — Adani, Tata, ReNew lead',
  'India adding ~50 GW/year — 75% from renewables',
  'On track for 500 GW non-fossil by 2030',
];
ta.forEach((t, i) => {
  slide.addText(`✅  ${t}`, { x: 0.5, y: 1.4 + i * 0.6, w: 12, h: 0.5, fontSize: 16, color: DARK });
});

slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 5.8, w: 12.3, h: 0.7, fill: { color: 'ECFDF5' }, line: { color: TEAL, width: 1 }, rectRadius: 0.05 });
slide.addText('India is undergoing a fundamental energy transformation — from coal-dependent to a diversified, renewable-first power system.', { x: 0.8, y: 5.85, w: 11.8, h: 0.6, fontSize: 17, bold: true, color: TEAL, valign: 'middle' });
addFooter(slide, 10);

// Generate
const fileName = 'India_Power_Sector_Presentation_Generic.pptx';
pptx.writeFile({ fileName })
  .then(() => console.log(`✅ Generic presentation saved: ${fileName}`))
  .catch(err => console.error('Error:', err));

