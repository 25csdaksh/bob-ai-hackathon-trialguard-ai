import React from 'react';
import { DashboardMetrics } from '../api';
import { Users, Building2, Calendar, AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2, FileText, Sparkles, Bot, Filter, Download } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064E3B]"></div>
      </div>
    );
  }

  // 60:30:10 Palette: 60% White/Slate, 30% Deep Forest Green (#064E3B), 10% Accents (Emerald #059669 / Rose #DC2626)
  const DONUT_COLORS = ['#064E3B', '#059669', '#D97706', '#DC2626'];

  const severityData = [
    { name: 'Major', value: metrics.major_deviations },
    { name: 'Minor', value: metrics.minor_deviations },
    { name: 'Administrative', value: metrics.administrative_deviations },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome & Primary Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-[#064E3B] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            <span>Welcome back, Dr. Daksh Soni</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono">TG-2026-ONC</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Trial Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time trial oversight, site risk intelligence, and protocol deviation analytics</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('capa')}
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Generate CAPA Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Critical Banner Alert (If Critical site present) */}
      {metrics.high_risk_sites_count > 0 && metrics.site_risk_ranking.length > 0 && (() => {
        const topSite = metrics.site_risk_ranking[0];
        return (
          <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 border border-rose-200 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">Critical Site Risk Alert: {topSite.site_name} ({topSite.site_id})</h3>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded uppercase tracking-wider">
                    CRITICAL 100.0/100
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Risk score has reached <strong className="text-rose-700 font-extrabold">100.0 / 100</strong> driven by {topSite.major_deviations} major protocol deviations (dosing non-compliance & prohibited medication).
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onSelectSite(topSite.site_id)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Inspect {topSite.site_id}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => openCopilotPrompt(`Why is ${topSite.site_id} high risk?`)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                Ask Copilot
              </button>
            </div>
          </div>
        );
      })()}

      {/* 3. Top 4 KPI Metrics Grid - Unified 60:30:10 Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#064E3B]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Sites</span>
            <div className="p-2 bg-slate-100 text-[#064E3B] rounded-lg border border-slate-200/80">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.total_sites}</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Multi-Center Trial Oversight</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#064E3B]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Patients</span>
            <div className="p-2 bg-slate-100 text-[#064E3B] rounded-lg border border-slate-200/80">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.total_patients}</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Enrolled Trial Subjects</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#064E3B]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visits Evaluated</span>
            <div className="p-2 bg-slate-100 text-[#064E3B] rounded-lg border border-slate-200/80">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.total_visits}</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Rule Engine Active Monitoring</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Deviations</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{metrics.total_deviations}</h2>
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {metrics.major_deviations} Major
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Auto-Classified Severity</p>
          </div>
        </div>
      </div>

      {/* 4. Main Charts Row: Site Risk Overview & Deviation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Risk Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900">Site Risk Overview</h3>
                <span className="text-[10px] font-bold text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                  Weighted Engine 0-100
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Calculated risk scores across active clinical trial sites</p>
            </div>
            <button
              onClick={() => onNavigateTab('sites')}
              className="text-xs text-[#064E3B] hover:text-[#047857] font-bold flex items-center space-x-1"
            >
              <span>View All Sites</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.site_risk_ranking} margin={{ left: 0, right: 10, top: 10, bottom: 20 }}>
                <XAxis dataKey="site_id" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="risk_score" radius={[6, 6, 0, 0]}>
                  {metrics.site_risk_ranking.map((entry, index) => {
                    let color = '#059669'; // Low
                    if (entry.risk_score >= 80) color = '#DC2626'; // Critical (SITE-003)
                    else if (entry.risk_score > 50) color = '#D97706'; // High/Medium
                    return <Cell key={`bar-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <span className="flex items-center font-medium"><span className="w-2.5 h-2.5 rounded-full bg-[#059669] mr-1.5"></span>Low (0-30)</span>
              <span className="flex items-center font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>Medium (31-60)</span>
              <span className="flex items-center font-medium"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span>High (61-80)</span>
              <span className="flex items-center font-bold text-rose-700"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-1.5"></span>Critical (81-100)</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">Deterministic Rule Engine</span>
          </div>
        </div>

        {/* Deviation Severity Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Protocol Deviation Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution by automated severity rating</p>

            <div className="h-44 w-full my-2">
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
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', color: '#0f172a', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200">
              <p className="text-[10px] font-bold text-rose-700 uppercase">Major</p>
              <p className="text-base font-extrabold text-rose-800 font-mono">{metrics.major_deviations}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-700 uppercase">Minor</p>
              <p className="text-base font-extrabold text-amber-800 font-mono">{metrics.minor_deviations}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-700 uppercase">Admin</p>
              <p className="text-base font-extrabold text-slate-900 font-mono">{metrics.administrative_deviations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Lower Row: Priority Sites Oversight & AI Copilot Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Sites Oversight Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Priority Clinical Trial Sites</h3>
                <p className="text-xs text-slate-500">Live risk scores and major deviation counters</p>
              </div>
              <button
                onClick={() => onNavigateTab('sites')}
                className="text-xs text-[#064E3B] hover:text-[#047857] font-bold flex items-center space-x-1"
              >
                <span>View All ({metrics.total_sites})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-5">Site ID</th>
                    <th className="p-3.5">Site Name</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Risk Level</th>
                    <th className="p-3.5">Deviations</th>
                    <th className="p-3.5 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {metrics.site_risk_ranking.map((site) => (
                    <tr key={site.site_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-[#064E3B]">{site.site_id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{site.site_name}</td>
                      <td className="p-3.5 font-mono font-extrabold text-slate-900">{site.risk_score} / 100</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded border ${
                          site.risk_level.toUpperCase() === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          site.risk_level.toUpperCase() === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          site.risk_level.toUpperCase() === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {site.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 font-mono">{site.total_deviations}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => onSelectSite(site.site_id)}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#064E3B] text-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Copilot & Quick Assist Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs border-t-4 border-t-[#064E3B] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#064E3B] mb-1">
              <Bot className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-slate-900">Clinical AI Copilot</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Grounded telemetry decision support for clinical trial auditors</p>

            <div className="space-y-2 mb-4">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Suggested Queries:</p>
              <button
                onClick={() => openCopilotPrompt("Why is SITE-003 high risk?")}
                className="w-full p-2.5 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>Why is SITE-003 high risk?</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#064E3B]" />
              </button>

              <button
                onClick={() => openCopilotPrompt("Which site needs immediate attention?")}
                className="w-full p-2.5 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>Which site needs immediate attention?</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#064E3B]" />
              </button>

              <button
                onClick={() => openCopilotPrompt("Generate a CAPA report for SITE-003")}
                className="w-full p-2.5 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>Generate CAPA for SITE-003</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#064E3B]" />
              </button>
            </div>
          </div>

          <button
            onClick={() => openCopilotPrompt("Summarize overall clinical trial risks")}
            className="w-full py-2.5 bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Bot className="h-4 w-4" />
            <span>Launch Interactive Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
