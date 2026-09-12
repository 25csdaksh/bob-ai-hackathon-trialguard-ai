import React, { useState } from 'react';
import { SiteDetail } from '../api';
import { Building2, Search, UserCheck, ArrowRight } from 'lucide-react';

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
        return <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-full shadow-xs">CRITICAL ({score})</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 font-bold text-xs rounded-full shadow-xs">HIGH ({score})</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-full shadow-xs">MEDIUM ({score})</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-full shadow-xs">LOW ({score})</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-bottle-800" />
            <span>Clinical Trial Sites Risk Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500">Monitoring 0–100 calculated risk scores & contributing drivers</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search site, PI, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bottle-600"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-xl">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  riskFilter === lvl ? 'bg-white text-bottle-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
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
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-semibold text-bottle-800">{site.site_id}</span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-bottle-800 transition-colors">{site.site_name}</h3>
                  <p className="text-xs text-slate-500">{site.location}</p>
                </div>
                {getRiskBadge(site.risk_level, site.risk_score)}
              </div>

              {/* Investigator */}
              <div className="flex items-center space-x-2 text-xs text-slate-700 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <UserCheck className="h-4 w-4 text-bottle-800 shrink-0" />
                <span className="truncate">PI: <strong className="text-slate-900">{site.principal_investigator}</strong></span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Calculated Risk Score</span>
                  <span className="font-mono text-slate-900 font-bold">{site.risk_score} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
              <div className="space-y-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Top Risk Factors:</span>
                <ul className="space-y-1 list-disc list-inside">
                  {site.risk_factors.slice(0, 2).map((factor, idx) => (
                    <li key={idx} className="truncate text-slate-600">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 text-slate-500">
                <span>Deviations: <strong className="text-slate-900">{site.total_deviations}</strong></span>
                <span>Major: <strong className="text-rose-600">{site.major_deviations}</strong></span>
              </div>
              <span className="text-bottle-800 font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
