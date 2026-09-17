import { ReactNode, useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useAuthStore } from '@/store/authStore';

interface AppShellProps {
  children: ReactNode;
}

const SECTIONS = [
  { id: 'industry-overview', label: 'Overview', icon: '🏭' },
  { id: 'generation', label: 'Generation', icon: '⚡' },
  { id: 'ownership', label: 'Ownership', icon: '🏛️' },
  { id: 'nuclear', label: 'Nuclear', icon: '⚛️' },
  { id: 'risks', label: 'Risks', icon: '📋' },
  { id: 'bess', label: 'BESS', icon: '🔋' },
  { id: 'market-players', label: 'Players', icon: '🏢' },
  { id: 'geography', label: 'Map', icon: '🗺️' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'data-methodology', label: 'Data', icon: '📖' },
  { id: 'quiz', label: 'Quiz', icon: '🎮' },
];

export function AppShell({ children }: AppShellProps) {
  const activeSection = useFilterStore((s) => s.activeSection);
  const setActiveSection = useFilterStore((s) => s.setActiveSection);
  const { role, username, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-icici-cream flex flex-col font-mulish">
      {/* ═══ TOP HEADER ═══ */}
      <header className="icici-gradient sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1920px] mx-auto px-5 py-2.5 flex items-center justify-between">
          {/* Left: Logo + Title + Quick Links */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-base font-black text-white">IL</span>
            </div>
            <div className="hidden tablet:block">
              <h1 className="text-[15px] font-bold text-white leading-tight">India Power Sector Intelligence</h1>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">ICICI Lombard Analytics & Risk Dashboard</p>
            </div>
          </div>

          {/* Right: Site Map + Library + User + Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('sitemap')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeSection === 'sitemap'
                  ? 'bg-white text-icici-maroon shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              🧭 Site Map
            </button>
            <button
              onClick={() => setActiveSection('downloads')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeSection === 'downloads'
                  ? 'bg-white text-icici-maroon shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              📥 Library
            </button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <span className="text-[11px] text-white/60">
              {role === 'admin' ? '🔑' : '👤'} {username}
            </span>
            <button
              onClick={logout}
              className="text-[11px] text-white/50 hover:text-white font-bold px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ═══ BODY: SIDEBAR + CONTENT ═══ */}
      <div className="flex flex-1">
        {/* Left Sidebar — colored background, tight spacing, clear active state */}
        <aside className={`sticky top-[52px] h-[calc(100vh-52px)] bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 transition-all duration-200 overflow-y-auto flex-shrink-0 ${sidebarCollapsed ? 'w-12' : 'w-[170px]'}`}>
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full py-1.5 text-center text-gray-400 hover:text-icici-maroon text-[10px] font-bold border-b border-gray-200 transition-colors bg-white/50"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '« Hide'}
          </button>

          {/* Navigation Items */}
          <nav className="py-1.5 px-1.5">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-[6px] rounded-lg text-left transition-all duration-150 mb-[2px] ${
                    isActive
                      ? 'bg-white text-icici-maroon shadow-sm border border-icici-maroon/30'
                      : 'text-gray-600 hover:bg-white/80 hover:text-gray-800'
                  }`}
                  title={sidebarCollapsed ? section.label : undefined}
                >
                  <span className="text-[14px] flex-shrink-0">{section.icon}</span>
                  {!sidebarCollapsed && (
                    <span className={`text-[13px] truncate ${isActive ? 'font-black' : 'font-medium'}`}>{section.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-5 pb-14 max-w-[1600px]">
          {children}
        </main>
      </div>

      {/* ═══ FIXED BOTTOM RIBBON ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-icici-maroon to-icici-navy py-1.5 px-6 shadow-lg">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">IL</span>
            </div>
            <span className="text-[10px] text-white/70 font-medium">
              ICICI Lombard — Power Sector Intelligence
            </span>
          </div>
          <span className="text-[10px] text-white/90 font-semibold">
            Designed by : <span className="font-black text-white">Deepak Arora</span>
          </span>
          <span className="text-[10px] text-white/50 hidden tablet:block">
            Data: CEA · MoP · MNRE · NPCIL · DAE
          </span>
        </div>
      </div>
    </div>
  );
}
