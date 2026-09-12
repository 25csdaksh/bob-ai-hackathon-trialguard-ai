import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SitesView } from './components/SitesView';
import { SiteDetailModal } from './components/SiteDetailModal';
import { DeviationsView } from './components/DeviationsView';
import { DeviationDetailModal } from './components/DeviationDetailModal';
import { CAPAReportView } from './components/CAPAReportView';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { fetchDashboardMetrics, fetchSites, fetchDeviations, DashboardMetrics, SiteDetail, Deviation } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [sites, setSites] = useState<SiteDetail[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedDeviation, setSelectedDeviation] = useState<Deviation | null>(null);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string | undefined>(undefined);

  const [capaTargetSite, setCapaTargetSite] = useState<string | undefined>(undefined);
  const [capaTargetDev, setCapaTargetDev] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [m, s, d] = await Promise.all([
        fetchDashboardMetrics(),
        fetchSites(),
        fetchDeviations()
      ]);
      setMetrics(m);
      setSites(s);
      setDeviations(d);
    } catch (e) {
      console.error("Failed loading trial data", e);
    }
  };

  const handleOpenCopilotPrompt = (prompt: string) => {
    setCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const handleGenerateCAPAFromModal = (siteId: string, devId?: string) => {
    setCapaTargetSite(siteId);
    setCapaTargetDev(devId);
    setActiveTab('capa');
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        highRiskCount={metrics?.high_risk_sites_count || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            onSelectSite={(id) => setSelectedSiteId(id)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            openCopilotPrompt={handleOpenCopilotPrompt}
          />
        )}

        {activeTab === 'sites' && (
          <SitesView
            sites={sites}
            onSelectSite={(id) => setSelectedSiteId(id)}
            openCopilotPrompt={handleOpenCopilotPrompt}
          />
        )}

        {activeTab === 'deviations' && (
          <DeviationsView
            deviations={deviations}
            onSelectDeviation={(dev) => setSelectedDeviation(dev)}
          />
        )}

        {activeTab === 'capa' && (
          <CAPAReportView
            initialSiteId={capaTargetSite}
            initialDeviationId={capaTargetDev}
          />
        )}
      </main>

      {/* Site Detail Drawer / Modal */}
      <SiteDetailModal
        siteId={selectedSiteId}
        onClose={() => setSelectedSiteId(null)}
        onSelectDeviation={(dev) => setSelectedDeviation(dev)}
        onGenerateCAPA={(siteId) => handleGenerateCAPAFromModal(siteId)}
        openCopilotPrompt={handleOpenCopilotPrompt}
      />

      {/* Deviation Detail Modal */}
      <DeviationDetailModal
        deviation={selectedDeviation}
        onClose={() => setSelectedDeviation(null)}
        onGenerateCAPA={(siteId, devId) => handleGenerateCAPAFromModal(siteId, devId)}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotPrompt}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>TrialGuard AI — IBM Bob AI Innovation Hackathon 2026 Submission • Powered by FastAPI & React</p>
      </footer>
    </div>
  );
}
