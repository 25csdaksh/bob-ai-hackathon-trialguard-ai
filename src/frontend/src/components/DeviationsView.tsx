import React, { useState } from 'react';
import { Deviation } from '../api';
import { AlertTriangle, Search, ArrowUpRight } from 'lucide-react';

interface DeviationsViewProps {
  deviations: Deviation[];
  onSelectDeviation: (dev: Deviation) => void;
}

export const DeviationsView: React.FC<DeviationsViewProps> = ({ deviations, onSelectDeviation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');

  const filteredDeviations = deviations.filter((dev) => {
    const matchesSearch = dev.deviation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.site_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.deviation_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || dev.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesSite = siteFilter === 'ALL' || dev.site_id === siteFilter;

    return matchesSearch && matchesSeverity && matchesSite;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Major':
        return <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-full">MAJOR</span>;
      case 'Minor':
        return <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs rounded-full">MINOR</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-full">ADMINISTRATIVE</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>Protocol Deviation Master Register</span>
          </h2>
          <p className="text-xs text-slate-500">Recorded rule engine violations across all sites ({deviations.length} total)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient, site, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bottle-600"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-bottle-600"
          >
            <option value="ALL">All Severities</option>
            <option value="MAJOR">Major</option>
            <option value="MINOR">Minor</option>
            <option value="ADMINISTRATIVE">Administrative</option>
          </select>

          {/* Site filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-bottle-600"
          >
            <option value="ALL">All Sites</option>
            <option value="SITE-001">SITE-001 (Apex)</option>
            <option value="SITE-002">SITE-002 (Beacon)</option>
            <option value="SITE-003">SITE-003 (Crestview)</option>
            <option value="SITE-004">SITE-004 (Delta)</option>
            <option value="SITE-005">SITE-005 (Evergreen)</option>
          </select>
        </div>
      </div>

      {/* Deviations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Dev ID</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Site</th>
                <th className="p-4">Deviation Type</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDeviations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No protocol deviations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeviations.map((dev) => (
                  <tr
                    key={dev.deviation_id}
                    onClick={() => onSelectDeviation(dev)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 font-mono font-bold text-bottle-800">{dev.deviation_id}</td>
                    <td className="p-4 font-medium text-slate-900">{dev.patient_id}</td>
                    <td className="p-4 text-slate-700">{dev.site_id}</td>
                    <td className="p-4 font-medium text-slate-900">{dev.deviation_type}</td>
                    <td className="p-4">{getSeverityBadge(dev.severity)}</td>
                    <td className="p-4 text-slate-500">{dev.date}</td>
                    <td className="p-4 text-right">
                      <button className="px-3 py-1 bg-slate-100 group-hover:bg-bottle-900 text-slate-700 group-hover:text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1">
                        <span>Inspect</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
