import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SitesView } from './components/SitesView';
import { SiteDetailModal } from './components/SiteDetailModal';
import { DeviationsView } from './components/DeviationsView';
import { DeviationDetailModal } from './components/DeviationDetailModal';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { CAPAReportView } from './components/CAPAReportView';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { fetchDashboardMetrics, fetchSites, fetchDeviations, DashboardMetrics, SiteDetail, Deviation } from './api';
import { ShieldAlert, Activity, Building2, AlertTriangle, FileText, BarChart3, Bot, ChevronRight, Sparkles } from 'lucide-react';

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
    { id: 'risk-analysis', label: 'Risk Analysis', icon: BarChart3 },
    { id: 'capa', label: 'CAPA Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* LEFT SIDEBAR NAVIGATION - Dark Forest Green Theme */}
      <aside className="w-64 bg-[#064E3B] text-white flex flex-col shrink-0 hidden md:flex border-r border-[#047857]/30 shadow-xl">
        {/* Sidebar Header / Branding */}
        <div className="p-5 border-b border-[#047857]/40 flex items-start space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="p-1.5 bg-[#022C22] rounded-2xl shadow-inner border border-emerald-500/20 shrink-0">
            <img src="/logo.svg" alt="TrialGuard AI Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">TrialGuard</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#10B981] text-[#022C22] rounded-md uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium leading-tight mt-0.5">Clinical Trial Risk Intelligence</p>
            <p className="text-[9px] text-emerald-300/60 font-semibold tracking-tight mt-1.5 italic">
              Detect Earlier. Prioritize Smarter. Act Faster.
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-emerald-300/70 uppercase tracking-widest mb-2">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#047857] text-white shadow-sm border border-emerald-400/20'
                    : 'text-emerald-100/70 hover:text-white hover:bg-[#047857]/40 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-300' : 'text-emerald-200/60'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#022C22] text-emerald-300' : 'bg-[#047857]/60 text-emerald-100'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Banner / Copilot Trigger */}
        <div className="p-3.5 mx-3 mb-4 bg-[#022C22]/80 border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
            <Sparkles className="h-4 w-4 text-[#10B981]" />
            <span>IBM Bob AI Copilot</span>
          </div>
          <p className="text-[11px] text-emerald-100/70 mt-1 leading-snug">
            Grounded decision support for site telemetry & CAPA.
          </p>
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="mt-3 w-full py-2 bg-[#10B981] hover:bg-[#059669] text-[#022C22] font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
          >
            <Bot className="h-3.5 w-3.5 mr-1" />
            <span>Ask Copilot</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-[#047857]/40 text-[10px] text-emerald-200/60 flex items-center justify-between font-mono">
          <span>IBM Hackathon 2026</span>
          <span className="px-1.5 py-0.5 bg-[#022C22] text-emerald-300 rounded text-[10px]">v1.0</span>
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
        <div className="md:hidden flex items-center space-x-1 px-4 py-2 bg-[#064E3B] text-white border-b border-emerald-700 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === item.id ? 'bg-[#10B981] text-[#022C22] font-bold' : 'text-emerald-100 bg-[#047857]/50'
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

          {activeTab === 'risk-analysis' && (
            <RiskAnalysisView
              metrics={metrics}
              sites={sites}
              onSelectSite={(id) => setSelectedSiteId(id)}
              onNavigateTab={(tab) => setActiveTab(tab)}
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
