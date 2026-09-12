import React from 'react';
import { Bot, AlertTriangle, Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleCopilot: () => void;
  highRiskCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleCopilot, highRiskCount }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Clinical Trial Dashboard', subtitle: 'Real-time trial oversight and risk intelligence' };
      case 'sites':
        return { title: 'Clinical Trial Sites', subtitle: 'Monitor site performance, risk scores, and protocol deviation indicators' };
      case 'deviations':
        return { title: 'Protocol Deviations', subtitle: 'Review, filter, and prioritize detected protocol deviations' };
      case 'capa':
        return { title: 'CAPA Reports', subtitle: 'Corrective and Preventive Action Management & Regulatory Compliance' };
      default:
        return { title: 'Clinical Trial Risk Intelligence', subtitle: 'Real-time monitoring and compliance' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Header Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h1>
            <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
          </div>

          {/* Global Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <Search className="h-4 w-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sites, patients, deviations..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Controls & User Profile */}
          <div className="flex items-center space-x-3 shrink-0">
            {highRiskCount > 0 && (
              <div
                onClick={() => setActiveTab('sites')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 cursor-pointer hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                <span>{highRiskCount} Critical Alert</span>
              </div>
            )}

            {/* Notification Bell */}
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* IBM Bob Copilot Button */}
            <button
              onClick={toggleCopilot}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">IBM Bob Copilot</span>
            </button>

            {/* User Profile */}
            <div className="pl-2 border-l border-slate-200 flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                SJ
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">Dr. Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 leading-tight">Lead Clinical Auditor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
