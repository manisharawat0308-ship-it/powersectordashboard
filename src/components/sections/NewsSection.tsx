import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJson, queryClient } from '@/lib/queryClient';
import { useSectorFilter } from '@/hooks/useSectorFilter';
import { getSourceColor } from '@/utils/colors';
import { formatSourceLabel } from '@/utils/formatting';

interface NewsArticle {
  id: number;
  date: string;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  category: 'business_win' | 'accident' | 'industry';
  energySource: string;
  region: string;
  state: string | null;
}

interface NewsData {
  lastUpdated: string;
  articles: NewsArticle[];
}

const REGIONS = [
  { id: 'all', label: 'All India', icon: '🇮🇳' },
  { id: 'north', label: 'North', icon: '🏔️' },
  { id: 'south', label: 'South', icon: '🌴' },
  { id: 'east', label: 'East', icon: '🌊' },
  { id: 'west', label: 'West', icon: '🏜️' },
];

const CATEGORIES = [
  { id: 'all', label: 'All News', icon: '📰' },
  { id: 'business_win', label: 'Business Wins', icon: '🏆' },
  { id: 'accident', label: 'Losses / Accidents', icon: '⚠️' },
  { id: 'industry', label: 'Industry Updates', icon: '📊' },
  { id: 'commissioning', label: 'Commissioning', icon: '🎉' },
  { id: 'tender', label: 'Tenders', icon: '📋' },
  { id: 'policy', label: 'Policy', icon: '🏛️' },
];

const SOURCES = [
  { id: 'all', label: 'All Sources' },
  { id: 'coal', label: '🏭 Coal' },
  { id: 'solar', label: '☀️ Solar' },
  { id: 'wind', label: '💨 Wind' },
  { id: 'large_hydro', label: '💧 Hydro' },
  { id: 'nuclear', label: '⚛️ Nuclear' },
  { id: 'biomass', label: '🌿 Biomass' },
];

export function NewsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => fetchJson<NewsData>('/data/news/power-sector-news.json'),
  });
  const { isSourceInView } = useSectorFilter();
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />;
  if (!data) return <div className="icici-card p-6"><p className="font-bold text-icici-maroon">News — Data unavailable</p></div>;

  const filtered = data.articles.filter((a) => {
    // 'all' energySource articles always pass the source-in-view check
    if (a.energySource !== 'all' && !isSourceInView(a.energySource)) return false;
    if (regionFilter !== 'all' && a.region !== regionFilter && a.region !== 'all') return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (sourceFilter !== 'all' && a.energySource !== sourceFilter && a.energySource !== 'all') return false;
    return true;
  });

  const categoryConfig: Record<string, { icon: string; bg: string; border: string; badge: string }> = {
    business_win:  { icon: '🏆', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
    accident:      { icon: '⚠️', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    industry:      { icon: '📊', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    commissioning: { icon: '🎉', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
    tender:        { icon: '📋', bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
    policy:        { icon: '🏛️', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  };
  const defaultConfig = { icon: '📰', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="icici-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-icici-navy flex items-center justify-center text-lg">📰</div>
          <div>
            <h2 className="text-sm font-black text-gray-800">Power Sector News & Events</h2>
            <p className="text-[14px] text-gray-400">Business wins, losses/accidents, industry updates • Filter by region & source</p>
          </div>
          <div className="ml-auto text-right flex-shrink-0">
            <div className="text-[11px] text-gray-400">Last updated: <span className="font-bold text-gray-600">{data.lastUpdated}</span></div>
            <button
              onClick={() => { queryClient.invalidateQueries({ queryKey: ['news'] }); }}
              className="mt-1 text-[11px] font-bold text-icici-navy border border-icici-navy/30 px-2 py-1 rounded hover:bg-icici-navy/5 transition-all"
              title="Re-fetches news data from server. For truly fresh news from RSS, run: node scripts/refresh-news.mjs"
            >
              🔄 Reload
            </button>
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-3">
          <span className="text-[14px] font-bold text-gray-500 uppercase mr-2">Region:</span>
          <div className="inline-flex gap-1 flex-wrap">
            {REGIONS.map((r) => (
              <button key={r.id} onClick={() => setRegionFilter(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[14px] font-bold transition-all ${regionFilter === r.id ? 'bg-icici-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          <span className="text-[14px] font-bold text-gray-500 uppercase mr-2">Category:</span>
          <div className="inline-flex gap-1 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCategoryFilter(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[14px] font-bold transition-all ${categoryFilter === c.id ? 'bg-icici-maroon text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energy Source Filter */}
        <div>
          <span className="text-[14px] font-bold text-gray-500 uppercase mr-2">Source:</span>
          <div className="inline-flex gap-1 flex-wrap">
            {SOURCES.filter(s => s.id === 'all' || isSourceInView(s.id)).map((s) => (
              <button key={s.id} onClick={() => setSourceFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[14px] font-bold transition-all ${sourceFilter === s.id ? 'bg-icici-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="icici-card p-6 text-center">
            <p className="text-sm text-gray-500">No news articles match the current filters.</p>
          </div>
        )}
        {filtered.map((article) => {
          const config = categoryConfig[article.category] || defaultConfig;
          return (
            <div key={article.id} className={`icici-card p-4 border-l-4 ${config.border}`}>
              <div className="flex items-start gap-3">
                <div className="text-xl mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[14px] px-2 py-0.5 rounded-full font-bold ${config.badge}`}>
                      {article.category === 'business_win' ? 'BUSINESS WIN' : article.category === 'accident' ? 'LOSS / ACCIDENT' : article.category === 'commissioning' ? 'COMMISSIONING' : article.category === 'tender' ? 'TENDER' : article.category === 'policy' ? 'POLICY' : 'INDUSTRY'}
                    </span>
                    <span className="text-[14px] px-2 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: getSourceColor(article.energySource as any) }}>
                      {formatSourceLabel(article.energySource)}
                    </span>
                    {article.state && (
                      <span className="text-[14px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        📍 {article.state}
                      </span>
                    )}
                    <span className="text-[14px] text-gray-400 ml-auto">{article.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 mb-1">
                    {article.url ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-icici-maroon hover:underline transition-colors">
                        {article.title} ↗
                      </a>
                    ) : (
                      article.title
                    )}
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed">{article.summary}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[14px] text-gray-400">Source: {article.source}</span>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-bold text-icici-maroon hover:underline">
                        Read Full Article →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="text-[14px] text-gray-400 text-center p-2">
        News compiled from public sources: press releases, BSE/NSE filings, industry publications. Last updated: {data.lastUpdated}
      </div>
    </div>
  );
}


