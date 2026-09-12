import React, { useState, useEffect } from 'react';
import { CAPAReport, fetchCAPAReports, generateCAPAReport } from '../api';
import { FileText, Download, Edit3, Check, AlertCircle, Plus } from 'lucide-react';
import jsPDF from 'jspdf';

interface CAPAReportViewProps {
  initialSiteId?: string;
  initialDeviationId?: string;
}

export const CAPAReportView: React.FC<CAPAReportViewProps> = ({ initialSiteId, initialDeviationId }) => {
  const [reports, setReports] = useState<CAPAReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CAPAReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState<CAPAReport | null>(null);
  const [loading, setLoading] = useState(true);

  const [targetSite, setTargetSite] = useState(initialSiteId || 'SITE-003');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchCAPAReports();
      setReports(data);
      if (data.length > 0) {
        setSelectedReport(data[0]);
        setEditedReport(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    setLoading(true);
    try {
      const newReport = await generateCAPAReport(targetSite, initialDeviationId);
      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
      setEditedReport(newReport);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editedReport) {
      setSelectedReport(editedReport);
      setReports(reports.map(r => r.report_id === editedReport.report_id ? editedReport : r));
      setIsEditing(false);
    }
  };

  const exportPDF = () => {
    if (!selectedReport) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(6, 78, 59);
    doc.text("TrialGuard AI — Corrective and Preventive Action (CAPA) Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report ID: ${selectedReport.report_id} | Date: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Target Site: ${selectedReport.site_id} | Priority: ${selectedReport.priority}`, 14, 34);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(12);
    doc.setTextColor(0);

    let y = 48;
    const addSection = (title: string, content: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 14, y);
      y += lines.length * 6 + 6;
    };

    addSection("1. Issue Summary", selectedReport.issue_summary);
    addSection("2. Detailed Observations", selectedReport.observations);
    addSection("3. Root Cause Analysis", selectedReport.root_cause);
    addSection("4. Immediate Corrective Action", selectedReport.corrective_action);
    addSection("5. Preventive Action", selectedReport.preventive_action);
    addSection("6. Responsible Role", selectedReport.responsible_role);
    addSection("7. Recommended Follow-Up", selectedReport.followup_recommendation);

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("DISCLAIMER: CAPA recommendations are AI-assisted decision support suggestions and require qualified human review.", 14, y);

    doc.save(`${selectedReport.report_id}_CAPA.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-bottle-800" />
            <span>CAPA-Ready Report Management</span>
          </h2>
          <p className="text-xs text-slate-500">Automated Corrective & Preventive Action Formulations</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={targetSite}
            onChange={(e) => setTargetSite(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-bottle-600"
          >
            <option value="SITE-003">SITE-003 (Crestview - Critical Risk)</option>
            <option value="SITE-002">SITE-002 (Beacon)</option>
            <option value="SITE-001">SITE-001 (Apex)</option>
            <option value="SITE-004">SITE-004 (Delta)</option>
            <option value="SITE-005">SITE-005 (Evergreen)</option>
          </select>

          <button
            onClick={handleGenerateNew}
            className="px-3.5 py-1.5 bg-bottle-900 hover:bg-bottle-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New CAPA</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Report List sidebar + Active Report Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Generated Reports</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div
                key={rep.report_id}
                onClick={() => {
                  setSelectedReport(rep);
                  setEditedReport(rep);
                  setIsEditing(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selectedReport?.report_id === rep.report_id
                    ? 'bg-bottle-50 border-bottle-300 text-bottle-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-bottle-800">{rep.report_id}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    rep.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {rep.priority}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-900 mt-1 line-clamp-2">{rep.issue_summary}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">Site: {rep.site_id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Report Display / Editor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
          {selectedReport && editedReport ? (
            <>
              {/* Report Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-bottle-800">{selectedReport.report_id}</span>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 rounded-full">
                      Priority: {selectedReport.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">Site {selectedReport.site_id} Corrective & Preventive Action Report</h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Edits</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Fields</span>
                    </button>
                  )}

                  <button
                    onClick={exportPDF}
                    className="px-3.5 py-1.5 bg-bottle-900 hover:bg-bottle-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Regulatory Notice Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Notice: CAPA recommendations are AI-assisted decision support suggestions requiring qualified human review prior to submission.</span>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 text-xs">
                {/* Issue Summary */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">1. Issue Summary</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.issue_summary}
                      onChange={(e) => setEditedReport({ ...editedReport, issue_summary: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-sans text-xs focus:ring-2 focus:ring-bottle-600 focus:outline-none"
                      rows={2}
                    />
                  ) : (
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">{selectedReport.issue_summary}</p>
                  )}
                </div>

                {/* Observations */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">2. Detailed Observations</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.observations}
                      onChange={(e) => setEditedReport({ ...editedReport, observations: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-sans text-xs focus:ring-2 focus:ring-bottle-600 focus:outline-none"
                      rows={2}
                    />
                  ) : (
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">{selectedReport.observations}</p>
                  )}
                </div>

                {/* Root Cause */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider">3. Root Cause Analysis</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.root_cause}
                      onChange={(e) => setEditedReport({ ...editedReport, root_cause: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-sans text-xs focus:ring-2 focus:ring-bottle-600 focus:outline-none"
                      rows={2}
                    />
                  ) : (
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">{selectedReport.root_cause}</p>
                  )}
                </div>

                {/* Grid for Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-emerald-700 uppercase tracking-wider">4. Immediate Corrective Action</label>
                    {isEditing ? (
                      <textarea
                        value={editedReport.corrective_action}
                        onChange={(e) => setEditedReport({ ...editedReport, corrective_action: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-sans text-xs focus:ring-2 focus:ring-bottle-600 focus:outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="p-3 bg-emerald-50/60 rounded-xl text-emerald-950 border border-emerald-200">{selectedReport.corrective_action}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-bottle-800 uppercase tracking-wider">5. Preventive Action</label>
                    {isEditing ? (
                      <textarea
                        value={editedReport.preventive_action}
                        onChange={(e) => setEditedReport({ ...editedReport, preventive_action: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-sans text-xs focus:ring-2 focus:ring-bottle-600 focus:outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="p-3 bg-bottle-50/60 rounded-xl text-bottle-950 border border-bottle-200">{selectedReport.preventive_action}</p>
                    )}
                  </div>
                </div>

                {/* Responsible role & followup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">6. Responsible Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedReport.responsible_role}
                        onChange={(e) => setEditedReport({ ...editedReport, responsible_role: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">{selectedReport.responsible_role}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider">7. Follow-Up Recommendation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedReport.followup_recommendation}
                        onChange={(e) => setEditedReport({ ...editedReport, followup_recommendation: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200">{selectedReport.followup_recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64 text-slate-500 text-xs">
              Select or generate a CAPA report to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
