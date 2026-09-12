import React, { useEffect, useState } from 'react';
import { fetchSiteDetail, Deviation } from '../api';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, FileText, Bot, ArrowUpRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 text-slate-900">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-bottle-50 rounded-2xl border border-bottle-200 text-bottle-800">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{data?.site?.site_name || siteId}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-bottle-100 text-bottle-900 rounded-full font-bold border border-bottle-200">
                  {siteId}
                </span>
              </div>
              <p className="text-xs text-slate-500">{data?.site?.location} • PI: {data?.site?.principal_investigator}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-800"></div>
            </div>
          ) : data ? (
            <>
              {/* Site Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Risk Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <h3 className={`text-2xl font-extrabold ${
                      data.site.risk_score > 80 ? 'text-rose-700' :
                      data.site.risk_score > 60 ? 'text-orange-700' :
                      data.site.risk_score > 30 ? 'text-amber-700' : 'text-emerald-700'
                    }`}>{data.site.risk_score}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      data.site.risk_level.toUpperCase() === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      data.site.risk_level.toUpperCase() === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      data.site.risk_level.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>{data.site.risk_level}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Patients Enrolled</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data.site.total_patients}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Deviations</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{data.site.total_deviations}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Major Deviations</span>
                  <h3 className="text-2xl font-extrabold text-rose-700 mt-1">{data.site.major_deviations}</h3>
                </div>
              </div>

              {/* Contributing Risk Factors */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Calculated Risk Factor Drivers</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {data.site.risk_factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deviations Register for this site */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recorded Protocol Deviations ({data.deviations.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {data.deviations.map((dev: Deviation) => (
                    <div
                      key={dev.deviation_id}
                      onClick={() => onSelectDeviation(dev)}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-bottle-50/50 border border-slate-200 hover:border-bottle-300 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          dev.severity === 'Major' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          dev.severity === 'Minor' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-bottle-100 text-bottle-900 border border-bottle-200'
                        }`}>
                          {dev.severity}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{dev.deviation_type}</p>
                          <p className="text-xs text-slate-500">Patient {dev.patient_id} • {dev.date}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 hover:text-bottle-800" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Mitigations */}
              <div className="p-5 rounded-2xl bg-bottle-50 border border-bottle-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-bottle-950">Recommended Quality Assurance Mitigations</h4>
                <ul className="space-y-2 text-xs text-slate-800">
                  {data.recommended_mitigations.map((mit: string, idx: number) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{mit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => openCopilotPrompt(`Why is ${siteId} high risk?`)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5"
          >
            <Bot className="h-4 w-4 text-bottle-800" />
            <span>Ask Copilot About {siteId}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGenerateCAPA(siteId);
            }}
            className="px-4 py-2 bg-bottle-900 hover:bg-bottle-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <FileText className="h-4 w-4" />
            <span>Generate CAPA Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
