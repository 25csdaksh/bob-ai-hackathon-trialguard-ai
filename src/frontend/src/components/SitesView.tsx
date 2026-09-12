import React, { useState } from 'react';
import { SiteDetail } from '../api';
import { Building2, Search, Filter, ShieldAlert, AlertTriangle, ArrowRight, UserCheck, Activity } from 'lucide-react';

interface SitesViewProps {
  sites: SiteDetail[];
  onSelectSite: (siteId: string) => void;
  openCopilotPrompt: (prompt: string) => void;
}

export const SitesView: React.FC<SitesViewProps> = ({ sites, onSelectSite, openCopilotPrompt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.site_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || site.risk_level.toUpperCase() === riskFilter.toUpperCase();

    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (level: string, score: number) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-full shadow-sm">CRITICAL ({score})</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs rounded-full shadow-sm">HIGH ({score})</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-full shadow-sm">MEDIUM ({score})</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-full shadow-sm">LOW ({score})</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            <span>Clinical Trial Site Risk Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400">Monitoring 0–100 calculated risk scores & contributing drivers</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search site, PI, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-dark-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1 bg-dark-800 border border-slate-700 p-1 rounded-xl">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  riskFilter === lvl ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site) => (
          <div
            key={site.site_id}
            onClick={() => onSelectSite(site.site_id)}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-blue-500/40 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-semibold text-blue-400">{site.site_id}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{site.site_name}</h3>
                  <p className="text-xs text-slate-400">{site.location}</p>
                </div>
                {getRiskBadge(site.risk_level, site.risk_score)}
              </div>

              {/* Investigator */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 mb-4 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <UserCheck className="h-4 w-4 text-blue-400" />
                <span>PI: <strong className="text-white">{site.principal_investigator}</strong></span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Risk Gauge Score</span>
                  <span className="font-mono text-white font-bold">{site.risk_score} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      site.risk_score > 80 ? 'bg-rose-500' :
                      site.risk_score > 60 ? 'bg-orange-500' :
                      site.risk_score > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${site.risk_score}%` }}
                  ></div>
                </div>
              </div>

              {/* Primary Risk Driver snippet */}
              <div className="space-y-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Top Contributing Factors:</span>
                <ul className="space-y-1 list-disc list-inside">
                  {site.risk_factors.slice(0, 2).map((factor, idx) => (
                    <li key={idx} className="truncate text-slate-400">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 text-slate-400">
                <span>Deviations: <strong className="text-white">{site.total_deviations}</strong></span>
                <span>Major: <strong className="text-rose-400">{site.major_deviations}</strong></span>
              </div>
              <span className="text-blue-400 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
