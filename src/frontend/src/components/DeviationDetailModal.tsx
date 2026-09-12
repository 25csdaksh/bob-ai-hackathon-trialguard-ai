import React from 'react';
import { Deviation } from '../api';
import { X, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${
              deviation.severity === 'Major' ? 'bg-rose-100 text-rose-700 border-rose-200' :
              deviation.severity === 'Minor' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-bottle-100 text-bottle-800 border-bottle-200'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{deviation.deviation_type}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-bottle-100 text-bottle-900 rounded-full font-bold border border-bottle-200">
                  {deviation.deviation_id}
                </span>
              </div>
              <p className="text-xs text-slate-500">Patient: {deviation.patient_id} • Site: {deviation.site_id} • Date: {deviation.date}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Comparison Matrix: Expected vs Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Protocol Requirement (Expected)</span>
              <p className="text-xs font-medium text-slate-800">{deviation.expected_value}</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Clinical Observation (Actual)</span>
              <p className="text-xs font-medium text-slate-800">{deviation.actual_value}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detection Explanation & Root Context</h4>
            <p className="text-xs text-slate-700 leading-relaxed">{deviation.explanation}</p>
          </div>

          {/* Recommended Action */}
          <div className="p-4 rounded-2xl bg-bottle-50 border border-bottle-200 space-y-1.5">
            <h4 className="text-xs font-bold text-bottle-950 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Recommended Corrective Action</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed">{deviation.recommended_action}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGenerateCAPA(deviation.site_id, deviation.deviation_id);
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
