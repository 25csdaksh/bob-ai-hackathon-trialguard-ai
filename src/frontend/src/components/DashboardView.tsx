import React from 'react';
import { DashboardMetrics } from '../api';
import { Users, Building2, Calendar, AlertTriangle, ShieldAlert, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onSelectSite: (siteId: string) => void;
  onNavigateTab: (tab: string) => void;
  openCopilotPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onSelectSite,
  onNavigateTab,
  openCopilotPrompt
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

  const severityData = [
    { name: 'Major', value: metrics.major_deviations },
    { name: 'Minor', value: metrics.minor_deviations },
    { name: 'Administrative', value: metrics.administrative_deviations },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if High Risk Site present */}
      {metrics.high_risk_sites_count > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-900/40 via-dark-800 to-dark-800 border border-rose-500/30 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30 text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Critical Site Risk Alert: Site C (Crestview Research)</h3>
              <p className="text-xs text-rose-200/80">
                Site C risk score has reached <span className="font-bold text-rose-400">87/100 (CRITICAL)</span> driven by 8 major protocol deviations and prohibited medication incidents.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectSite('SITE-003')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-1"
            >
              <span>Inspect Site C</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => openCopilotPrompt("Why is Site C high risk?")}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Ask AI Copilot
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Trial Patients</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{metrics.total_patients}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center">
              <span className="text-emerald-400 font-semibold mr-1">5 Sites</span> across trial protocol
            </p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Visits Evaluated</span>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{metrics.total_visits}</h2>
            <p className="text-xs text-slate-400 mt-1">Rule Engine Active Monitoring</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Detected Deviations</span>
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{metrics.total_deviations}</h2>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                {metrics.major_deviations} Major
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Auto-Classified Prototype Severity</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High Risk Sites</span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{metrics.high_risk_sites_count}</h2>
              <span className="text-xs text-slate-400">/ {metrics.total_sites} Sites</span>
            </div>
            <p className="text-xs text-amber-400/90 mt-1 font-medium">Requires CAPA Remediation</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1">Deviation Severity Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Rule-based severity classification</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-slate-400">Major</p>
              <p className="text-lg font-bold text-rose-400">{metrics.major_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-slate-400">Minor</p>
              <p className="text-lg font-bold text-amber-400">{metrics.minor_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-slate-400">Admin</p>
              <p className="text-lg font-bold text-blue-400">{metrics.administrative_deviations}</p>
            </div>
          </div>
        </div>

        {/* Site Risk Scoreboard Bar Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Site Risk Intelligence Scoreboard</h3>
              <p className="text-xs text-slate-400">0–100 Calculated Risk Scores per Site</p>
            </div>
            <button
              onClick={() => onNavigateTab('sites')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>View All Sites</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.site_risk_ranking} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis dataKey="site_id" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Bar dataKey="risk_score" radius={[0, 8, 8, 0]}>
                  {metrics.site_risk_ranking.map((entry, index) => {
                    let color = '#10b981'; // emerald low
                    if (entry.risk_score > 80) color = '#f43f5e'; // rose critical
                    else if (entry.risk_score > 60) color = '#f97316'; // orange high
                    else if (entry.risk_score > 30) color = '#eab308'; // yellow medium
                    return <Cell key={`bar-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>Low (0-30)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></span>Medium (31-60)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span>High (61-80)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span>Critical (81-100)</span>
            </div>
            <span className="text-slate-500 font-mono">*Prototype thresholds</span>
          </div>
        </div>
      </div>

      {/* Second Row: Deviation Categories & Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deviation Categories */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">Top Deviation Categories</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown by protocol violation type</p>

          <div className="space-y-3">
            {metrics.deviation_categories.map((cat, idx) => {
              const pct = Math.round((cat.count / metrics.total_deviations) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{cat.category}</span>
                    <span className="text-slate-400 font-mono">{cat.count} occurrences ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Recommendations Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-sm font-bold text-white">Recommended Immediate Mitigations</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">AI-Suggested Quality Assurance Actions</p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Issue formal CAPA report for <strong>Site C (Houston, TX)</strong> regarding drug dosing & prohibited medication compliance.</span>
              </li>
              <li className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deploy automated visit reminder workflow to mitigate <strong>Missed Visit</strong> trends across Site B and Site C.</span>
              </li>
              <li className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Re-train site coordinators on mandatory Day 14 & Day 28 laboratory sample collection protocols.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('capa')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all text-center"
            >
              Generate CAPA Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
