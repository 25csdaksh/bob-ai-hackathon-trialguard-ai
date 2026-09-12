import React from 'react';
import { DashboardMetrics } from '../api';
import { Users, Building2, Calendar, AlertTriangle, ShieldAlert, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-800"></div>
      </div>
    );
  }

  const COLORS = ['#f43f5e', '#f59e0b', '#065f46'];

  const severityData = [
    { name: 'Major', value: metrics.major_deviations },
    { name: 'Minor', value: metrics.minor_deviations },
    { name: 'Administrative', value: metrics.administrative_deviations },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if Critical Site present */}
      {metrics.high_risk_sites_count > 0 && metrics.site_risk_ranking.length > 0 && (() => {
        const topSite = metrics.site_risk_ranking[0];
        return (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 border border-rose-200 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Critical Site Risk Alert: {topSite.site_name} ({topSite.site_id})</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {topSite.site_id} risk score has reached <span className="font-extrabold text-rose-700">{topSite.risk_score}/100 ({topSite.risk_level.toUpperCase()})</span> driven by {topSite.major_deviations} major protocol deviations.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onSelectSite(topSite.site_id)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Inspect {topSite.site_id}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => openCopilotPrompt(`Why is ${topSite.site_id} high risk?`)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
              >
                Ask Copilot
              </button>
            </div>
          </div>
        );
      })()}

      {/* Top 4 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-bottle-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Sites</span>
            <div className="p-2 bg-bottle-50 rounded-xl text-bottle-800 border border-bottle-100">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{metrics.total_sites} Sites</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Multi-Center Trial Oversight</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-bottle-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="p-2 bg-bottle-50 rounded-xl text-bottle-800 border border-bottle-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{metrics.total_patients} Enrolled</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active Study Subjects</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-emerald-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visits Evaluated</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{metrics.total_visits} Visits</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Rule Engine Active Monitoring</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-amber-500 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Protocol Deviations</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{metrics.total_deviations} Total</h2>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {metrics.major_deviations} Major
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Auto-Classified Severity</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Deviation Severity Summary</h3>
          <p className="text-xs text-slate-500 mb-4">Rule-based severity distribution</p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-[11px] font-semibold text-rose-700">Major</p>
              <p className="text-base font-extrabold text-rose-800">{metrics.major_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[11px] font-semibold text-amber-700">Minor</p>
              <p className="text-base font-extrabold text-amber-800">{metrics.minor_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-bottle-50 border border-bottle-200">
              <p className="text-[11px] font-semibold text-bottle-800">Admin</p>
              <p className="text-base font-extrabold text-bottle-900">{metrics.administrative_deviations}</p>
            </div>
          </div>
        </div>

        {/* Site Risk Scoreboard Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Site Risk Scoreboard</h3>
              <p className="text-xs text-slate-500">Calculated 0–100 risk score across active trial sites</p>
            </div>
            <button
              onClick={() => onNavigateTab('sites')}
              className="text-xs text-bottle-800 hover:text-bottle-950 font-semibold flex items-center space-x-1"
            >
              <span>View All Sites</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.site_risk_ranking} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis dataKey="site_id" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={65} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="risk_score" radius={[0, 6, 6, 0]}>
                  {metrics.site_risk_ranking.map((entry, index) => {
                    let color = '#10b981'; // emerald low
                    if (entry.risk_score > 80) color = '#f43f5e'; // rose critical
                    else if (entry.risk_score > 60) color = '#f97316'; // orange high
                    else if (entry.risk_score > 30) color = '#f59e0b'; // yellow medium
                    return <Cell key={`bar-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>Low (0-30)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>Medium (31-60)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span>High (61-80)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span>Critical (81-100)</span>
            </div>
            <span className="text-slate-400 font-medium">Weighted Engine</span>
          </div>
        </div>
      </div>

      {/* Second Row: Deviation Categories & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deviation Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Top Deviation Categories</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown by protocol violation type</p>

          <div className="space-y-3.5">
            {metrics.deviation_categories.map((cat, idx) => {
              const pct = Math.round((cat.count / metrics.total_deviations) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{cat.category}</span>
                    <span className="text-slate-500">{cat.count} occurrences ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bottle-800 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Recommendations Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-bottle-800 mb-1">
              <TrendingUp className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-900">Recommended Quality Mitigations</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Suggested Clinical Quality Actions</p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Generate CAPA report for <strong>Site C (SITE-003)</strong> addressing drug dosing & prohibited medication compliance.</span>
              </li>
              <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deploy automated patient visit reminder workflow to mitigate <strong>Missed Visit</strong> trends.</span>
              </li>
              <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Re-train site coordinators on mandatory Day 14 & Day 28 laboratory sample collection protocols.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('capa')}
              className="w-full py-2.5 bg-bottle-900 hover:bg-bottle-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors text-center"
            >
              Generate CAPA Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
