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
import { ShieldAlert, Activity, Building2, AlertTriangle, FileText, Settings, Info, ChevronRight, Sparkles } from 'lucide-react';

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'sites', label: 'Sites & Risk', icon: Building2, count: sites.length },
    { id: 'deviations', label: 'Deviation Log', icon: AlertTriangle, count: deviations.length },
    { id: 'capa', label: 'CAPA Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
        {/* Sidebar Header / Branding */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">TrialGuard</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Risk Intelligence Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Banner / Promotion */}
        <div className="p-3 mx-3 mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>IBM Bob Copilot</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
            Database-grounded clinical risk Q&A assistant.
          </p>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="mt-2.5 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Open Assistant</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>IBM Hackathon 2026</span>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">v1.0</span>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
          highRiskCount={metrics?.high_risk_sites_count || 0}
        />

        {/* Mobile Nav Tabs Bar */}
        <div className="md:hidden flex items-center space-x-1 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Footer */}
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <p>TrialGuard AI — IBM Bob AI Innovation Hackathon 2026 Submission • Powered by FastAPI, React & SQLite</p>
        </footer>
      </div>

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
    </div>
  );
}
