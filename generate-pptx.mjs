import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'ICICI Lombard Analytics';
pptx.subject = 'India Power Sector Story';

// Colors
const MAROON = 'B02A30';
const NAVY = '005B75';
const ORANGE = 'F99D27';
const DARK = '1A1A2E';
const WHITE = 'FFFFFF';
const GREEN = '4CAF50';

// Helper: Add branded footer
function addFooter(slide, num) {
  slide.addText('ICICI Lombard General Insurance', { x: 0.5, y: 7.0, w: 5, h: 0.3, fontSize: 9, color: '999999' });
  slide.addText(`Slide ${num}`, { x: 11.5, y: 7.0, w: 1.5, h: 0.3, fontSize: 9, color: '999999', align: 'right' });
  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.05, fill: { color: ORANGE } });
}

// SLIDE 1: Title
let slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('IL', { x: 0.5, y: 0.5, w: 0.7, h: 0.7, fontSize: 24, bold: true, color: WHITE, fill: { color: MAROON }, align: 'center', valign: 'middle' });
slide.addText('ICICI LOMBARD ANALYTICS', { x: 1.4, y: 0.6, w: 4, h: 0.5, fontSize: 12, color: ORANGE, bold: true });
slide.addText("India's Power Sector Story", { x: 0.5, y: 2.5, w: 9, h: 1.2, fontSize: 48, bold: true, color: WHITE });
slide.addText('From 20 GW in 1975 to 450 GW in 2025 — A 50-year transformation\nof the world\'s 3rd largest electricity system', { x: 0.5, y: 3.9, w: 9, h: 1.0, fontSize: 20, color: 'CCCCCC' });
slide.addText('Data: CEA • NPP (npp.gov.in) • Ministry of Power\nLast Updated: June 2026', { x: 0.5, y: 5.8, w: 6, h: 0.7, fontSize: 12, color: '888888' });
addFooter(slide, 1);

// SLIDE 2: Big Picture
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('The Big Picture', { x: 0.5, y: 0.4, w: 8, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText("India's power sector at a glance — June 2026", { x: 0.5, y: 1.2, w: 8, h: 0.4, fontSize: 18, color: 'AAAAAA' });

const stats = [
  { val: '450 GW', label: 'Installed Capacity', color: ORANGE },
  { val: '1,752 BU', label: 'Annual Generation', color: GREEN },
  { val: '36', label: 'States & UTs', color: NAVY },
  { val: '22.5×', label: 'Growth Since 1975', color: MAROON },
];
stats.forEach((s, i) => {
  const x = 0.5 + i * 3.2;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.2, w: 2.9, h: 2.4, fill: { color: '2A2A4E' }, line: { color: '444466', width: 1 }, rectRadius: 0.1 });
  slide.addText(s.val, { x, y: 2.5, w: 2.9, h: 1.2, fontSize: 40, bold: true, color: s.color, align: 'center' });
  slide.addText(s.label, { x, y: 3.8, w: 2.9, h: 0.5, fontSize: 14, color: 'AAAAAA', align: 'center' });
});
addFooter(slide, 2);

// SLIDE 3: Energy Mix
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('Energy Mix — The Great Divide', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('Installed capacity split between fossil and non-fossil sources', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'AAAAAA' });
// Split bar
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.8, w: 6.7, h: 0.7, fill: { color: MAROON } });
slide.addText('🔥 Fossil — 243.87 GW (54.2%)', { x: 0.5, y: 1.8, w: 6.7, h: 0.7, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 7.2, y: 1.8, w: 5.63, h: 0.7, fill: { color: NAVY } });
slide.addText('🌿 Non-Fossil — 206.42 GW (45.8%)', { x: 7.2, y: 1.8, w: 5.63, h: 0.7, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle' });

// Fossil details
slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 2.9, w: 6, h: 3.5, fill: { color: '2A2A4E' }, line: { color: '444466' }, rectRadius: 0.1 });
slide.addText('🔥 Fossil Energy — 243.87 GW', { x: 0.8, y: 3.1, w: 5.5, h: 0.5, fontSize: 18, bold: true, color: MAROON });
const fossil = [['Coal', '211,540 MW', '86.7%'], ['Natural Gas', '24,900 MW', '10.2%'], ['Lignite', '6,740 MW', '2.8%'], ['Diesel', '690 MW', '0.3%']];
fossil.forEach((f, i) => {
  slide.addText(`${f[0]}`, { x: 0.8, y: 3.7 + i * 0.7, w: 2.5, h: 0.5, fontSize: 15, color: 'CCCCCC' });
  slide.addText(`${f[1]} (${f[2]})`, { x: 3.5, y: 3.7 + i * 0.7, w: 2.8, h: 0.5, fontSize: 15, bold: true, color: WHITE, align: 'right' });
});

// Non-fossil details
slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 2.9, w: 6, h: 3.5, fill: { color: '2A2A4E' }, line: { color: '444466' }, rectRadius: 0.1 });
slide.addText('🌿 Non-Fossil Energy — 206.42 GW', { x: 7.1, y: 3.1, w: 5.5, h: 0.5, fontSize: 18, bold: true, color: NAVY });
const nonFossil = [['Solar', '90,570 MW', '43.9%'], ['Wind', '47,650 MW', '23.1%'], ['Large Hydro', '47,050 MW', '22.8%'], ['Biomass', '10,750 MW', '5.2%'], ['Nuclear', '8,180 MW', '4.0%']];
nonFossil.forEach((f, i) => {
  slide.addText(`${f[0]}`, { x: 7.1, y: 3.7 + i * 0.6, w: 2.5, h: 0.5, fontSize: 15, color: 'CCCCCC' });
  slide.addText(`${f[1]} (${f[2]})`, { x: 9.8, y: 3.7 + i * 0.6, w: 2.8, h: 0.5, fontSize: 15, bold: true, color: WHITE, align: 'right' });
});
addFooter(slide, 3);

// SLIDE 4: Growth Timeline
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('The Growth Story — 1975 to 2025', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('India\'s installed capacity grew 22.5× in 50 years', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'AAAAAA' });

const timeline = [
  { year: '1975', gw: '20 GW', pct: 4 }, { year: '1990', gw: '64 GW', pct: 14 },
  { year: '2000', gw: '102 GW', pct: 23 }, { year: '2010', gw: '174 GW', pct: 39 },
  { year: '2015', gw: '278 GW', pct: 62 }, { year: '2020', gw: '370 GW', pct: 82 },
  { year: '2025', gw: '450 GW', pct: 100 },
];
timeline.forEach((t, i) => {
  const x = 0.5 + i * 1.8;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 1.6, h: 2.2, fill: { color: '2A2A4E' }, line: { color: '444466' }, rectRadius: 0.08 });
  slide.addText(t.year, { x, y: 2.1, w: 1.6, h: 0.5, fontSize: 13, color: 'AAAAAA', align: 'center' });
  slide.addText(t.gw, { x, y: 2.6, w: 1.6, h: 0.7, fontSize: 20, bold: true, color: ORANGE, align: 'center' });
  // Progress bar
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.2, y: 3.5, w: 1.2, h: 0.18, fill: { color: '444466' }, rectRadius: 0.05 });
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.2, y: 3.5, w: (1.2 * t.pct) / 100, h: 0.18, fill: { color: ORANGE }, rectRadius: 0.05 });
});

// Milestones
slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 4.6, w: 12.3, h: 2.0, fill: { color: '2A2A4E' }, line: { color: '444466' }, rectRadius: 0.1 });
slide.addText('Key Milestones', { x: 0.8, y: 4.8, w: 4, h: 0.5, fontSize: 18, bold: true, color: WHITE });
const milestones = ['1991 — Sector Liberalization', '2003 — Electricity Act', '2010 — National Solar Mission', '2015 — 175 GW RE Target (COP21)', '2020 — 100 GW Renewable Crossed', '2022 — 500 GW Non-Fossil Target'];
milestones.forEach((m, i) => {
  const col = i < 3 ? 0 : 1;
  const row = i % 3;
  slide.addText(`• ${m}`, { x: 0.8 + col * 6, y: 5.4 + row * 0.45, w: 5.5, h: 0.4, fontSize: 14, color: ORANGE });
});
addFooter(slide, 4);

// SLIDE 5: Renewable Revolution
slide = pptx.addSlide();
slide.background = { fill: '003D50' };
slide.addText('The Renewable Revolution', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('Non-fossil share grew from 24% (2000) to 45.8% (2025)', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'AAAAAA' });

const re = [
  { name: '☀️ Solar', gw: '90.6 GW', pct: 100, color: ORANGE, note: 'From ~0 in 2010 → Fastest growing' },
  { name: '💨 Wind', gw: '47.7 GW', pct: 53, color: '007A9E', note: 'Concentrated in TN, GJ, RJ, KA' },
  { name: '💧 Large Hydro', gw: '47.1 GW', pct: 52, color: NAVY, note: 'Mature sector — HP, UK, JK, SK' },
  { name: '⚛️ Nuclear', gw: '8.2 GW', pct: 9, color: '7B1FA2', note: 'Highest load factor (78.6%)' },
];
re.forEach((r, i) => {
  const y = 1.8 + i * 1.4;
  slide.addText(r.name, { x: 0.5, y, w: 3.5, h: 0.5, fontSize: 18, bold: true, color: WHITE });
  slide.addText(r.gw, { x: 4.0, y, w: 2, h: 0.5, fontSize: 18, bold: true, color: r.color });
  // Bar
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: y + 0.5, w: 8, h: 0.25, fill: { color: '1A3A4E' } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: y + 0.5, w: (8 * r.pct) / 100, h: 0.25, fill: { color: r.color } });
  slide.addText(r.note, { x: 0.5, y: y + 0.85, w: 8, h: 0.35, fontSize: 13, color: '88AAAA' });
});
addFooter(slide, 5);

// SLIDE 6: Load Factor
slide = pptx.addSlide();
slide.background = { fill: 'FFFAF5' };
slide.addText('The Load Factor Reality', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: DARK });
slide.addText('Why installed capacity ≠ actual generation', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: '666666' });

const lf = [
  { name: 'Coal', cap: '47.0%', gen: '62.4%', plf: '64.2%', gap: '+15.4pp', color: MAROON },
  { name: 'Solar', cap: '20.1%', gen: '8.1%', plf: '18.2%', gap: '-12.0pp', color: ORANGE },
  { name: 'Nuclear', cap: '1.8%', gen: '2.9%', plf: '78.6%', gap: '+1.1pp', color: '7B1FA2' },
  { name: 'Wind', cap: '10.6%', gen: '4.7%', plf: '21.5%', gap: '-5.9pp', color: NAVY },
  { name: 'Large Hydro', cap: '10.5%', gen: '9.6%', plf: '38.4%', gap: '-0.9pp', color: '003D50' },
];
// Table headers
slide.addText('Source', { x: 0.5, y: 1.8, w: 2.2, h: 0.5, fontSize: 13, bold: true, color: '666666' });
slide.addText('Capacity %', { x: 2.7, y: 1.8, w: 2, h: 0.5, fontSize: 13, bold: true, color: NAVY, align: 'center' });
slide.addText('Generation %', { x: 4.7, y: 1.8, w: 2.2, h: 0.5, fontSize: 13, bold: true, color: MAROON, align: 'center' });
slide.addText('Load Factor', { x: 6.9, y: 1.8, w: 2, h: 0.5, fontSize: 13, bold: true, color: ORANGE, align: 'center' });
slide.addText('Gap', { x: 8.9, y: 1.8, w: 2, h: 0.5, fontSize: 13, bold: true, color: '666666', align: 'center' });

lf.forEach((l, i) => {
  const y = 2.4 + i * 0.85;
  slide.addShape(pptx.ShapeType.rect, { x: 0.5, y, w: 10.5, h: 0.75, fill: { color: i % 2 === 0 ? 'F5F0EB' : 'FFFFFF' } });
  slide.addText(l.name, { x: 0.6, y, w: 2, h: 0.75, fontSize: 16, bold: true, color: l.color, valign: 'middle' });
  slide.addText(l.cap, { x: 2.7, y, w: 2, h: 0.75, fontSize: 16, bold: true, color: NAVY, align: 'center', valign: 'middle' });
  slide.addText(l.gen, { x: 4.7, y, w: 2.2, h: 0.75, fontSize: 16, bold: true, color: MAROON, align: 'center', valign: 'middle' });
  slide.addText(l.plf, { x: 6.9, y, w: 2, h: 0.75, fontSize: 16, bold: true, color: ORANGE, align: 'center', valign: 'middle' });
  slide.addText(l.gap, { x: 8.9, y, w: 2, h: 0.75, fontSize: 14, bold: true, color: l.gap.startsWith('+') ? GREEN : 'C62828', align: 'center', valign: 'middle' });
});

slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 6.0, w: 12, h: 0.8, fill: { color: 'FFF3E0' }, line: { color: 'FFE0B2' }, rectRadius: 0.05 });
slide.addText('💡 Coal runs 24/7 as baseload (PLF 64%). Solar only generates during daylight (CUF 18%). This is why India still depends on coal despite growing RE capacity.', { x: 0.8, y: 6.1, w: 11.5, h: 0.6, fontSize: 13, color: 'E65100', valign: 'middle' });
addFooter(slide, 6);

// SLIDE 7: Ownership
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText("Who Owns India's Power?", { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('Private sector dominates with 53.5% of installed capacity', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'AAAAAA' });

// Ownership bar
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.8, w: 2.9, h: 0.7, fill: { color: NAVY } });
slide.addText('Central 23%', { x: 0.5, y: 1.8, w: 2.9, h: 0.7, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 3.4, y: 1.8, w: 3.0, h: 0.7, fill: { color: MAROON } });
slide.addText('State 23.5%', { x: 3.4, y: 1.8, w: 3.0, h: 0.7, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle' });
slide.addShape(pptx.ShapeType.rect, { x: 6.4, y: 1.8, w: 6.4, h: 0.7, fill: { color: ORANGE } });
slide.addText('Private 53.5%', { x: 6.4, y: 1.8, w: 6.4, h: 0.7, fontSize: 14, bold: true, color: DARK, align: 'center', valign: 'middle' });

const owners = [
  { name: 'Central PSU', gw: '103.45 GW', color: NAVY, companies: 'NTPC (72.3 GW), NHPC, NPCIL, NLC', mix: '53% fossil / 47% non-fossil' },
  { name: 'State PSU', gw: '105.82 GW', color: MAROON, companies: 'MAHAGENCO, GSECL, TANGEDCO, KPCL', mix: '68% fossil / 32% non-fossil' },
  { name: 'Private', gw: '241.02 GW', color: ORANGE, companies: 'Adani Green (20.4 GW), Adani Power, Tata, ReNew', mix: '48% fossil / 52% non-fossil' },
];
owners.forEach((o, i) => {
  const x = 0.5 + i * 4.2;
  slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.9, w: 3.9, h: 3.5, fill: { color: '2A2A4E' }, line: { color: o.color, width: 2 }, rectRadius: 0.1 });
  slide.addText(o.name, { x: x + 0.2, y: 3.1, w: 3.5, h: 0.5, fontSize: 18, bold: true, color: o.color });
  slide.addText(o.gw, { x: x + 0.2, y: 3.6, w: 3.5, h: 0.7, fontSize: 28, bold: true, color: WHITE });
  slide.addText(o.companies, { x: x + 0.2, y: 4.5, w: 3.5, h: 0.8, fontSize: 12, color: 'AAAAAA' });
  slide.addText(o.mix, { x: x + 0.2, y: 5.5, w: 3.5, h: 0.4, fontSize: 13, color: 'CCCCCC' });
});
addFooter(slide, 7);

// SLIDE 8: State-wise
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('State-wise Power Map', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('Top states by installed capacity & dominant energy source', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'AAAAAA' });

const states = [
  { rank: 1, name: 'Maharashtra', gw: '52.1 GW', src: 'Coal', color: MAROON },
  { rank: 2, name: 'Gujarat', gw: '46.8 GW', src: 'Coal', color: MAROON },
  { rank: 3, name: 'Rajasthan', gw: '41.5 GW', src: 'Solar', color: ORANGE },
  { rank: 4, name: 'Tamil Nadu', gw: '38.9 GW', src: 'Wind', color: NAVY },
  { rank: 5, name: 'Karnataka', gw: '34.2 GW', src: 'Solar', color: ORANGE },
  { rank: 6, name: 'Uttar Pradesh', gw: '32.6 GW', src: 'Coal', color: MAROON },
  { rank: 7, name: 'Andhra Pradesh', gw: '28.4 GW', src: 'Solar', color: ORANGE },
  { rank: 8, name: 'Madhya Pradesh', gw: '26.8 GW', src: 'Coal', color: MAROON },
];
states.forEach((s, i) => {
  const y = 1.7 + i * 0.6;
  slide.addText(`${s.rank}`, { x: 0.5, y, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: ORANGE, align: 'center' });
  slide.addText(s.name, { x: 1.1, y, w: 2.8, h: 0.5, fontSize: 15, bold: true, color: WHITE });
  slide.addShape(pptx.ShapeType.roundRect, { x: 4.0, y: y + 0.08, w: 1.1, h: 0.35, fill: { color: s.color }, rectRadius: 0.05 });
  slide.addText(s.src, { x: 4.0, y: y + 0.08, w: 1.1, h: 0.35, fontSize: 10, bold: true, color: WHITE, align: 'center', valign: 'middle' });
  slide.addText(s.gw, { x: 5.3, y, w: 1.5, h: 0.5, fontSize: 15, bold: true, color: WHITE, align: 'right' });
});

// Regional dominance
slide.addShape(pptx.ShapeType.roundRect, { x: 7.2, y: 1.7, w: 5.6, h: 5.2, fill: { color: '2A2A4E' }, line: { color: '444466' }, rectRadius: 0.1 });
slide.addText('Regional Source Dominance', { x: 7.5, y: 1.9, w: 5, h: 0.5, fontSize: 18, bold: true, color: WHITE });
const regions = [
  { label: '🏭 Coal Belt', states: 'MH, GJ, UP, MP, TS, WB, CG, OD', note: '~280 GW combined' },
  { label: '💧 Hydro Belt', states: 'HP, UK, JK, SK, AR, MZ', note: 'Himalayan corridor' },
  { label: '☀️ Solar Belt', states: 'RJ, KA, AP', note: 'Bhadla, Pavagada mega parks' },
  { label: '💨 Wind Corridor', states: 'TN, GJ (coast)', note: 'Muppandal, Kutch' },
];
regions.forEach((r, i) => {
  slide.addText(r.label, { x: 7.5, y: 2.6 + i * 1.1, w: 5, h: 0.4, fontSize: 16, bold: true, color: ORANGE });
  slide.addText(r.states, { x: 7.5, y: 3.0 + i * 1.1, w: 5, h: 0.35, fontSize: 13, color: 'AAAAAA' });
  slide.addText(r.note, { x: 7.5, y: 3.3 + i * 1.1, w: 5, h: 0.3, fontSize: 12, color: '888888' });
});
addFooter(slide, 8);

// SLIDE 9: Future Projections
slide = pptx.addSlide();
slide.background = { fill: '5C1A1F' };
slide.addText('Future Outlook — 2026 to 2035', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addText('India targets 500 GW non-fossil by 2030', { x: 0.5, y: 1.1, w: 10, h: 0.4, fontSize: 18, color: 'FFCCCC' });

// Demand vs Supply table
const proj = [
  { yr: '2026', dem: '466', sup: '478' }, { yr: '2028', dem: '506', sup: '548' },
  { yr: '2030', dem: '550', sup: '630' }, { yr: '2032', dem: '600', sup: '702' }, { yr: '2035', dem: '688', sup: '822' },
];
slide.addText('Year', { x: 0.5, y: 1.8, w: 1.5, h: 0.5, fontSize: 14, bold: true, color: 'FFCCCC' });
slide.addText('Demand (GW)', { x: 2.0, y: 1.8, w: 2.5, h: 0.5, fontSize: 14, bold: true, color: 'FFCCCC', align: 'center' });
slide.addText('Planned Supply (GW)', { x: 4.5, y: 1.8, w: 2.8, h: 0.5, fontSize: 14, bold: true, color: 'FFCCCC', align: 'center' });
proj.forEach((p, i) => {
  const y = 2.4 + i * 0.7;
  slide.addText(p.yr, { x: 0.5, y, w: 1.5, h: 0.6, fontSize: 18, bold: true, color: WHITE });
  slide.addText(`${p.dem} GW`, { x: 2.0, y, w: 2.5, h: 0.6, fontSize: 18, bold: true, color: ORANGE, align: 'center' });
  slide.addText(`${p.sup} GW ✓`, { x: 4.5, y, w: 2.8, h: 0.6, fontSize: 18, bold: true, color: GREEN, align: 'center' });
});

// Additions bar
slide.addShape(pptx.ShapeType.roundRect, { x: 7.5, y: 1.8, w: 5.3, h: 4.8, fill: { color: '3A1015' }, line: { color: '661520' }, rectRadius: 0.1 });
slide.addText('Planned Additions 2026–2030', { x: 7.8, y: 2.0, w: 5, h: 0.5, fontSize: 16, bold: true, color: WHITE });
const additions = [
  { src: '☀️ Solar', gw: '+180 GW', color: ORANGE }, { src: '💨 Wind', gw: '+50 GW', color: NAVY },
  { src: '🏭 Coal', gw: '+10 GW', color: MAROON }, { src: '💧 Hydro', gw: '+8 GW', color: '003D50' },
  { src: '⚛️ Nuclear', gw: '+8 GW', color: '7B1FA2' },
];
additions.forEach((a, i) => {
  slide.addText(a.src, { x: 7.8, y: 2.7 + i * 0.8, w: 2.5, h: 0.6, fontSize: 16, color: WHITE });
  slide.addText(a.gw, { x: 10.3, y: 2.7 + i * 0.8, w: 2, h: 0.6, fontSize: 18, bold: true, color: a.color, align: 'right' });
});
addFooter(slide, 9);

// SLIDE 10: Key Takeaways
slide = pptx.addSlide();
slide.background = { fill: DARK };
slide.addText('Key Takeaways', { x: 0.5, y: 0.4, w: 10, h: 0.8, fontSize: 36, bold: true, color: WHITE });
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.2, w: 1.5, h: 0.06, fill: { color: ORANGE } });

const takeaways = [
  'India\'s power capacity grew 22.5× from 20 GW (1975) to 450 GW (2025)',
  'Non-fossil share nearly doubled from 24% to 45.8% in 25 years',
  'Solar is the fastest growing source — 0 to 90.6 GW in 15 years',
  'Coal still generates 62% of electricity due to higher load factors (64% PLF vs 18% CUF for solar)',
  'Private sector owns 53.5% of capacity — led by Adani, Tata, ReNew',
  'India plans to add ~250 GW by 2030 — primarily solar & wind',
  'Supply is projected to exceed demand through 2035 with current plans',
];
takeaways.forEach((t, i) => {
  slide.addText(`✅  ${t}`, { x: 0.5, y: 1.7 + i * 0.75, w: 12, h: 0.65, fontSize: 17, color: WHITE });
});

slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 6.2, w: 12.3, h: 0.7, fill: { color: '2A2A4E' }, line: { color: ORANGE, width: 1 }, rectRadius: 0.05 });
slide.addText('🎯 India is on track for its 500 GW non-fossil target by 2030 — a fundamental transformation of its energy landscape.', { x: 0.8, y: 6.25, w: 11.8, h: 0.6, fontSize: 14, bold: true, color: ORANGE, valign: 'middle' });
addFooter(slide, 10);

// Generate the file
const fileName = 'India_Power_Sector_Presentation.pptx';
pptx.writeFile({ fileName: fileName })
  .then(() => console.log(`✅ Presentation saved: ${fileName}`))
  .catch(err => console.error('Error:', err));
