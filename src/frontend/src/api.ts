export interface DashboardMetrics {
  total_patients: number;
  total_sites: number;
  total_visits: number;
  total_deviations: number;
  major_deviations: number;
  minor_deviations: number;
  administrative_deviations: number;
  high_risk_sites_count: number;
  severity_distribution: { [key: string]: number };
  site_risk_ranking: Array<{
    site_id: string;
    site_name: string;
    risk_score: number;
    risk_level: string;
    total_deviations: number;
    major_deviations: number;
    trend: string;
  }>;
  recent_deviation_trend: Array<{
    period: string;
    major: number;
    minor: number;
    admin: number;
  }>;
  deviation_categories: Array<{ category: string; count: number }>;
}

export interface SiteDetail {
  site_id: string;
  site_name: string;
  location: string;
  principal_investigator: string;
  total_patients: number;
  total_visits: number;
  total_deviations: number;
  major_deviations: number;
  risk_score: number;
  risk_level: string;
  risk_factors: string[];
  trend: string;
}

export interface Deviation {
  deviation_id: string;
  patient_id: string;
  site_id: string;
  visit_id: string;
  deviation_type: string;
  expected_value: string;
  actual_value: string;
  severity: 'Major' | 'Minor' | 'Administrative';
  date: string;
  explanation: string;
  recommended_action: string;
  status: string;
}

export interface CAPAReport {
  report_id: string;
  site_id: string;
  deviation_id?: string;
  issue_summary: string;
  observations: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  priority: string;
  responsible_role: string;
  followup_recommendation: string;
  created_at?: string;
}

const API_BASE = '/api';

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchSites(risk_level?: string): Promise<SiteDetail[]> {
  const url = risk_level ? `${API_BASE}/sites?risk_level=${risk_level}` : `${API_BASE}/sites`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sites');
  return res.json();
}

export async function fetchSiteDetail(site_id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/sites/${site_id}`);
  if (!res.ok) throw new Error('Failed to fetch site detail');
  return res.json();
}

export async function fetchDeviations(filters?: { site_id?: string; severity?: string; deviation_type?: string }): Promise<Deviation[]> {
  let url = `${API_BASE}/deviations?`;
  if (filters?.site_id) url += `site_id=${filters.site_id}&`;
  if (filters?.severity) url += `severity=${filters.severity}&`;
  if (filters?.deviation_type) url += `deviation_type=${encodeURIComponent(filters.deviation_type)}&`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch deviations');
  return res.json();
}

export async function fetchCAPAReports(site_id?: string): Promise<CAPAReport[]> {
  const url = site_id ? `${API_BASE}/capa?site_id=${site_id}` : `${API_BASE}/capa`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CAPA reports');
  return res.json();
}

export async function generateCAPAReport(site_id: string, deviation_id?: string, custom_notes?: string): Promise<CAPAReport> {
  const res = await fetch(`${API_BASE}/capa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site_id, deviation_id, custom_notes }),
  });
  if (!res.ok) throw new Error('Failed to generate CAPA report');
  return res.json();
}

export async function queryCopilot(prompt: string, context_site_id?: string): Promise<{ answer: string; data_context?: any; suggested_actions?: string[] }> {
  const res = await fetch(`${API_BASE}/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context_site_id }),
  });
  if (!res.ok) throw new Error('Failed to send copilot query');
  return res.json();
}
