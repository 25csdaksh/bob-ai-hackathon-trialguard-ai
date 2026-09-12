import React from 'react';
import { Deviation } from '../api';
import { X, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface DeviationDetailModalProps {
  deviation: Deviation | null;
  onClose: () => void;
  onGenerateCAPA: (siteId: string, devId: string) => void;
}

export const DeviationDetailModal: React.FC<DeviationDetailModalProps> = ({
  deviation,
  onClose,
  onGenerateCAPA
}) => {
  if (!deviation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-modal w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl border ${
              deviation.severity === 'Major' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
              deviation.severity === 'Minor' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{deviation.deviation_type}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-bold border border-blue-500/30">
                  {deviation.deviation_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">Patient: {deviation.patient_id} • Site: {deviation.site_id} • Date: {deviation.date}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Comparison Matrix: Expected vs Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Protocol Requirement (Expected)</span>
              <p className="text-xs font-medium text-slate-200">{deviation.expected_value}</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Clinical Observation (Actual)</span>
              <p className="text-xs font-medium text-slate-200">{deviation.actual_value}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detection Explanation & Root Context</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{deviation.explanation}</p>
          </div>

          {/* Recommended Action */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Recommended Corrective Action</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{deviation.recommended_action}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGenerateCAPA(deviation.site_id, deviation.deviation_id);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center space-x-1.5"
          >
            <FileText className="h-4 w-4" />
            <span>Generate CAPA for Deviation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
