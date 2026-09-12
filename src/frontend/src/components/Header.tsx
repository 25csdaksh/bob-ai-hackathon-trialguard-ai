import React from 'react';
import { ShieldAlert, Activity, Building2, Bot, AlertTriangle, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleCopilot: () => void;
  highRiskCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleCopilot, highRiskCount }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'sites', label: 'Sites & Risk', icon: Building2 },
    { id: 'deviations', label: 'Deviation Log', icon: AlertTriangle },
    { id: 'capa', label: 'CAPA Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-dark-800/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">TrialGuard<span className="text-blue-500">AI</span></span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  IBM Hackathon 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Clinical Trial Risk Monitor & Protocol Deviation Detector</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            {highRiskCount > 0 && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs font-semibold text-rose-400 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span>{highRiskCount} High-Risk Site Alert</span>
              </div>
            )}

            <button
              onClick={toggleCopilot}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <Bot className="h-4 w-4" />
              <span>IBM Bob Copilot</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
