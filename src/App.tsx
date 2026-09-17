import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useFilterStore } from '@/store/filterStore';
import { useAuthStore } from '@/store/authStore';
import { LoginPage } from '@/components/LoginPage';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionErrorBoundary } from '@/components/common/SectionErrorBoundary';
import { CapacityOverview } from '@/components/sections/CapacityOverview';
import { IndustryOverview } from '@/components/sections/IndustryOverview';
import { GenerationSection } from '@/components/sections/GenerationSection';
import { OwnershipSection } from '@/components/sections/OwnershipSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { RiskAnalysis } from '@/components/sections/RiskAnalysis';
import { RiskIntelligence } from '@/components/sections/RiskIntelligence';
import { NuclearSection } from '@/components/sections/NuclearSection';
import { PowerSourceComparison } from '@/components/sections/PowerSourceComparison';
import { DataMethodology } from '@/components/sections/DataMethodology';
import { BESSDeepDive } from '@/components/sections/BESSDeepDive';
import { SiteMap } from '@/components/sections/SiteMap';
import { DownloadsLibrary } from '@/components/sections/DownloadsLibrary';
import { MarketPlayersSection } from '@/components/sections/MarketPlayersSection';
import { NewsSection } from '@/components/sections/NewsSection';
import { DownloadsSection } from '@/components/sections/DownloadsSection';
import { GeographySection } from '@/components/sections/GeographySection';
import { QuizSection } from '@/components/sections/QuizSection';

function DashboardContent() {
  const activeSection = useFilterStore((s) => s.activeSection);
  const role = useAuthStore((s) => s.role);

  // Scroll back to the top whenever the user switches to a different section
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'downloads':
        return (
          <SectionErrorBoundary sectionName="Downloads">
            <DownloadsLibrary />
          </SectionErrorBoundary>
        );

      case 'sitemap':
        return (
          <SectionErrorBoundary sectionName="Site Map">
            <SiteMap />
          </SectionErrorBoundary>
        );

      case 'overview':
      case 'industry-overview':
        return (
          <SectionErrorBoundary sectionName="Industry Overview">
            <IndustryOverview />
          </SectionErrorBoundary>
        );

      case 'generation':
        return (
          <SectionErrorBoundary sectionName="Generation">
            <GenerationSection />
          </SectionErrorBoundary>
        );

      case 'ownership':
        return (
          <SectionErrorBoundary sectionName="Ownership">
            <OwnershipSection />
          </SectionErrorBoundary>
        );

      case 'energy-source':
        return (
          <SectionErrorBoundary sectionName="Capacity Overview">
            <CapacityOverview />
          </SectionErrorBoundary>
        );

      case 'timeline':
        return (
          <SectionErrorBoundary sectionName="Timeline">
            <TimelineSection />
          </SectionErrorBoundary>
        );

      case 'projections':
        return (
          <SectionErrorBoundary sectionName="Timeline">
            <TimelineSection />
          </SectionErrorBoundary>
        );

      case 'market-players':
        return (
          <SectionErrorBoundary sectionName="Market Players">
            <MarketPlayersSection />
          </SectionErrorBoundary>
        );

      // ── Existing risk section (insurance-focused) ──
      case 'risks':
        return (
          <SectionErrorBoundary sectionName="Risk Analysis">
            <RiskAnalysis />
          </SectionErrorBoundary>
        );

      // ── New: Nuclear Deep Dive ──
      case 'nuclear':
        return (
          <SectionErrorBoundary sectionName="Nuclear">
            <NuclearSection />
          </SectionErrorBoundary>
        );

      // ── New: Power Source Comparison ──
      // ── New: Data & Methodology ──
      case 'data-methodology':
        return (
          <SectionErrorBoundary sectionName="Data & Methodology">
            <DataMethodology />
          </SectionErrorBoundary>
        );

      // ── New: BESS Deep Dive ──
      case 'bess':
        return (
          <SectionErrorBoundary sectionName="BESS Deep Dive">
            <BESSDeepDive />
          </SectionErrorBoundary>
        );

      case 'geography':
        return (
          <SectionErrorBoundary sectionName="Geography">
            <GeographySection />
          </SectionErrorBoundary>
        );

      case 'news':
        return (
          <SectionErrorBoundary sectionName="News">
            <NewsSection />
          </SectionErrorBoundary>
        );

      case 'quiz':
        return (
          <SectionErrorBoundary sectionName="Power Quiz">
            <QuizSection />
          </SectionErrorBoundary>
        );

      default:
        return (
          <SectionErrorBoundary sectionName="Industry Overview">
            <IndustryOverview />
          </SectionErrorBoundary>
        );
    }
  };

  return (
    <AppShell>
      <Breadcrumbs />
      {renderSection()}
    </AppShell>
  );
}

function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoggedIn ? <DashboardContent /> : <LoginPage />}
    </QueryClientProvider>
  );
}

export default App;
