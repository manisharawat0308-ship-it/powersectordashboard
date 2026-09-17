/**
 * News Refresh Script — Power Sector News
 * 
 * This script fetches latest power sector news from public RSS/API sources
 * and updates public/data/news/power-sector-news.json.
 * 
 * Usage:
 *   node scripts/refresh-news.mjs
 * 
 * Scheduled Execution (daily):
 *   - Windows Task Scheduler: run this script daily at 6:00 AM
 *   - Or via cron on Linux/Mac: 0 6 * * * cd /path/to/project && node scripts/refresh-news.mjs
 *   - Or via GitHub Actions (see .github/workflows/refresh-news.yml if using CI)
 * 
 * Sources:
 *   1. ET Energyworld RSS (energy.economictimes.indiatimes.com)
 *   2. Business Standard Energy RSS
 *   3. Mercom India (mercomcommunications.com) 
 *   4. MNRE press releases (mnre.gov.in)
 *   5. CEA notifications (cea.nic.in)
 * 
 * Note: If RSS fetch fails (network/firewall), the script preserves existing news
 * and adds a "lastFetchAttempt" timestamp so the UI can show staleness.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_FILE = resolve(__dirname, '../public/data/news/power-sector-news.json');

// ── Configuration ─────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    id: 'et_energyworld',
    name: 'ET Energyworld',
    url: 'https://energy.economictimes.indiatimes.com/rss/top-stories',
    category: 'industry',
  },
  {
    id: 'business_standard_energy',
    name: 'Business Standard',
    url: 'https://www.business-standard.com/rss/industry-news-20201.rss',
    category: 'industry',
  },
  {
    id: 'mercom_india',
    name: 'Mercom India',
    url: 'https://mercomindia.com/feed/',
    category: 'industry',
  },
];

const KEYWORDS = [
  'power', 'energy', 'electricity', 'solar', 'wind', 'nuclear', 'hydro',
  'thermal', 'coal', 'NTPC', 'Adani', 'renewable', 'MW', 'GW', 'grid',
  'DISCOM', 'CEA', 'MNRE', 'capacity', 'generation', 'PLF', 'CUF',
  'turbine', 'reactor', 'NPCIL', 'NHPC', 'transmission', 'transformer',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPowerSectorRelevant(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function detectEnergySource(text) {
  const t = text.toLowerCase();
  if (t.includes('solar') || t.includes('pv')) return 'solar';
  if (t.includes('wind') || t.includes('turbine') && t.includes('blade')) return 'wind';
  if (t.includes('nuclear') || t.includes('npcil') || t.includes('reactor')) return 'nuclear';
  if (t.includes('hydro') || t.includes('dam') || t.includes('nhpc')) return 'hydro';
  if (t.includes('coal') || t.includes('thermal') || t.includes('boiler')) return 'coal';
  if (t.includes('gas') || t.includes('lng')) return 'gas';
  return 'all';
}

function detectCategory(title, summary) {
  const t = `${title} ${summary}`.toLowerCase();
  if (t.includes('accident') || t.includes('fire') || t.includes('explosion') || t.includes('blast') || t.includes('fatal')) return 'accident';
  if (t.includes('tender') || t.includes('auction') || t.includes('bid')) return 'tender';
  if (t.includes('policy') || t.includes('regulation') || t.includes('ministry') || t.includes('govt')) return 'policy';
  if (t.includes('commission') || t.includes('operational') || t.includes('new plant') || t.includes('inaugurat')) return 'commissioning';
  return 'industry';
}

async function fetchRSS(source) {
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'PowerDashboard-NewsBot/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.warn(`  ⚠️ ${source.name}: HTTP ${response.status}`);
      return [];
    }
    const xml = await response.text();
    // Simple XML parsing for RSS <item> elements
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/) || [])[1] || (itemXml.match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const link = (itemXml.match(/<link>(.*?)<\/link>/) || [])[1] || '';
      const desc = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/) || [])[1] || '';
      const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';

      const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
      const cleanDesc = desc.replace(/<[^>]*>/g, '').trim().slice(0, 200);

      if (cleanTitle && isPowerSectorRelevant(cleanTitle, cleanDesc)) {
        items.push({
          title: cleanTitle,
          summary: cleanDesc,
          url: link.trim(),
          date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          source: source.name,
          energySource: detectEnergySource(`${cleanTitle} ${cleanDesc}`),
          category: detectCategory(cleanTitle, cleanDesc),
        });
      }
    }
    return items.slice(0, 10); // Max 10 per source
  } catch (err) {
    console.warn(`  ⚠️ ${source.name}: ${err.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Power Sector News Refresh — ' + new Date().toISOString());
  console.log('');

  // Load existing news
  let existing;
  try {
    existing = JSON.parse(readFileSync(NEWS_FILE, 'utf-8'));
  } catch {
    existing = { lastUpdated: null, articles: [] };
  }

  const existingUrls = new Set(existing.articles.map((a) => a.url));
  let newArticles = [];

  // Fetch from each source
  for (const source of RSS_SOURCES) {
    console.log(`  📡 Fetching: ${source.name}...`);
    const items = await fetchRSS(source);
    const fresh = items.filter((item) => !existingUrls.has(item.url));
    console.log(`     → ${items.length} power-sector articles, ${fresh.length} new`);
    newArticles.push(...fresh);
  }

  // Merge: new articles first, then existing (cap at 50 total)
  const maxId = existing.articles.reduce((max, a) => Math.max(max, a.id || 0), 0);
  const mergedArticles = [
    ...newArticles.map((a, i) => ({
      id: maxId + i + 1,
      ...a,
      region: 'all',
      state: null,
    })),
    ...existing.articles,
  ].slice(0, 50);

  const output = {
    lastUpdated: new Date().toISOString().split('T')[0],
    lastFetchAttempt: new Date().toISOString(),
    refreshMethod: 'scripts/refresh-news.mjs — run daily via scheduler',
    note: 'News articles sourced from public RSS feeds. Run `node scripts/refresh-news.mjs` to refresh. Set up Windows Task Scheduler or cron for daily automation.',
    articles: mergedArticles,
  };

  writeFileSync(NEWS_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log('');
  console.log(`✅ Done. ${newArticles.length} new articles added. Total: ${mergedArticles.length}`);
  console.log(`   Saved to: ${NEWS_FILE}`);
}

main().catch((err) => {
  console.error('❌ News refresh failed:', err);
  process.exit(1);
});
