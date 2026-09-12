import React from 'react';
import { DashboardMetrics, SiteDetail } from '../api';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RiskAnalysisViewProps {
  metrics: DashboardMetrics | null;
  sites: SiteDetail[];
  onSelectSite: (siteId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  metrics,
  sites,
  onSelectSite,
  onNavigateTab
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-800"></div>
      </div>
    );
  }

  const SEVERITY_COLORS = ['#f43f5e', '#f59e0b', '#64748b'];

  const severityData = [
    { name: 'Major', value: metrics.major_deviations },
    { name: 'Minor', value: metrics.minor_deviations },
    { name: 'Administrative', value: metrics.administrative_deviations },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="h-5 w-5 text-bottle-800" />
            <span>Clinical Trial Risk Analytics Workspace</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Deep-dive multi-center risk comparative analysis & protocol compliance telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-bottle-50 text-bottle-900 border border-bottle-200 rounded-xl text-xs font-bold font-mono">
            {metrics.total_sites} Sites Monitored
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold font-mono">
            {metrics.total_patients} Subjects Enrolled
          </span>
        </div>
      </div>

      {/* Grid Row 1: Site Risk Comparison Bar Chart & Risk Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Risk Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-bottle-800" />
                <span>Site Risk Comparison Ranking (0–100 Scale)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Weighted composite risk score calculated by telemetry engine</p>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">0–100 Index</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.site_risk_ranking} margin={{ left: 10, right: 20, top: 10, bottom: 20 }}>
                <XAxis dataKey="site_id" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any, props: any) => [`${value} / 100`, `Risk Score (${props.payload.risk_level})`]}
                />
                <Bar dataKey="risk_score" radius={[6, 6, 0, 0]}>
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

        {/* Deviation Severity Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5 flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4 text-bottle-800" />
              <span>Deviation Severity Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Rule-classified severity proportion</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-[10px] font-bold uppercase text-rose-700">Major</p>
              <p className="text-lg font-extrabold text-rose-800">{metrics.major_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-bold uppercase text-amber-700">Minor</p>
              <p className="text-lg font-extrabold text-amber-800">{metrics.minor_deviations}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-600">Admin</p>
              <p className="text-lg font-extrabold text-slate-800">{metrics.administrative_deviations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Detailed Site Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinical Site Risk Scorecard & Ranking</h3>
            <p className="text-xs text-slate-500">Full multi-center breakdown by risk score, major violations, and primary drivers</p>
          </div>
          <button
            onClick={() => onNavigateTab('sites')}
            className="px-3.5 py-1.5 bg-bottle-900 hover:bg-bottle-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Manage Sites
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Site ID & Name</th>
                <th className="p-4">Principal Investigator</th>
                <th className="p-4">Total Devs</th>
                <th className="p-4">Major Devs</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics.site_risk_ranking.map((item, idx) => (
                <tr key={item.site_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-bottle-800 mr-2">{item.site_id}</span>
                    <span className="font-bold text-slate-900">{item.site_name}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {sites.find((s) => s.site_id === item.site_id)?.principal_investigator || 'Lead PI'}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{item.total_deviations}</td>
                  <td className="p-4 font-bold text-rose-700">{item.major_deviations}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{item.risk_score} / 100</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                      item.risk_level.toUpperCase() === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      item.risk_level.toUpperCase() === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      item.risk_level.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {item.risk_level.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectSite(item.site_id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-bottle-900 text-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Inspect Site
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
