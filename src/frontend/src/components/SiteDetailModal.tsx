import React, { useEffect, useState } from 'react';
import { fetchSiteDetail, Deviation } from '../api';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, UserCheck, FileText, Bot, ArrowUpRight } from 'lucide-react';

interface SiteDetailModalProps {
  siteId: string | null;
  onClose: () => void;
  onSelectDeviation: (dev: Deviation) => void;
  onGenerateCAPA: (siteId: string) => void;
  openCopilotPrompt: (prompt: string) => void;
}

export const SiteDetailModal: React.FC<SiteDetailModalProps> = ({
  siteId,
  onClose,
  onSelectDeviation,
  onGenerateCAPA,
  openCopilotPrompt
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    fetchSiteDetail(siteId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [siteId]);

  if (!siteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-modal w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700/60">
        {/* Modal Header */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{data?.site?.site_name || siteId}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-bold border border-blue-500/30">
                  {siteId}
                </span>
              </div>
              <p className="text-xs text-slate-400">{data?.site?.location} • PI: {data?.site?.principal_investigator}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : data ? (
            <>
              {/* Site Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Risk Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <h3 className={`text-2xl font-extrabold ${
                      data.site.risk_score > 80 ? 'text-rose-400' :
                      data.site.risk_score > 60 ? 'text-orange-400' :
                      data.site.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{data.site.risk_score}</h3>
                    <span className="text-xs font-bold uppercase">{data.site.risk_level}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Patients Enrolled</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{data.site.total_patients}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Total Deviations</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{data.site.total_deviations}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Major Deviations</span>
                  <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{data.site.major_deviations}</h3>
                </div>
              </div>

              {/* Contributing Risk Factors */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Calculated Risk Factor Drivers</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {data.site.risk_factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deviations Register for this site */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Recorded Protocol Deviations ({data.deviations.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {data.deviations.map((dev: Deviation) => (
                    <div
                      key={dev.deviation_id}
                      onClick={() => onSelectDeviation(dev)}
                      className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          dev.severity === 'Major' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          dev.severity === 'Minor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {dev.severity}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{dev.deviation_type}</p>
                          <p className="text-xs text-slate-400">Patient {dev.patient_id} • {dev.date}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Mitigations */}
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                <h4 className="text-sm font-bold text-blue-300">Recommended Quality Assurance Mitigations</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {data.recommended_mitigations.map((mit: string, idx: number) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{mit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={() => openCopilotPrompt(`Why is ${siteId} high risk?`)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center space-x-1.5"
          >
            <Bot className="h-4 w-4 text-blue-400" />
            <span>Ask AI Copilot About {siteId}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGenerateCAPA(siteId);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-1.5"
          >
            <FileText className="h-4 w-4" />
            <span>Generate CAPA Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
