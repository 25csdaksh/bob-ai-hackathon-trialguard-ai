from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class SiteBase(BaseModel):
    site_id: str
    site_name: str
    location: str
    principal_investigator: str

class SiteDetail(SiteBase):
    total_patients: int
    total_visits: int
    total_deviations: int
    major_deviations: int
    risk_score: float
    risk_level: str
    risk_factors: List[str]
    trend: str

    class Config:
        from_attributes = True

class PatientSchema(BaseModel):
    patient_id: str
    site_id: str
    patient_name: str
    age: int
    gender: str
    enrolled_date: str
    status: str

    class Config:
        from_attributes = True

class VisitSchema(BaseModel):
    visit_id: str
    patient_id: str
    site_id: str
    visit_name: str
    expected_visit_date: str
    actual_visit_date: Optional[str] = None
    dose_expected: Optional[str] = None
    dose_actual: Optional[str] = None
    medication: Optional[str] = None
    prohibited_medication: Optional[str] = None
    lab_required: bool
    lab_completed: bool
    lab_results: Optional[str] = None
    notes: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class DeviationSchema(BaseModel):
    deviation_id: str
    patient_id: str
    site_id: str
    visit_id: str
    deviation_type: str
    expected_value: str
    actual_value: str
    severity: str
    date: str
    explanation: str
    recommended_action: str
    status: str

    class Config:
        from_attributes = True

class CAPAReportSchema(BaseModel):
    report_id: str
    site_id: str
    deviation_id: Optional[str] = None
    issue_summary: str
    observations: str
    root_cause: str
    corrective_action: str
    preventive_action: str
    priority: str
    responsible_role: str
    followup_recommendation: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CAPARequest(BaseModel):
    site_id: str
    deviation_id: Optional[str] = None
    custom_notes: Optional[str] = None

class DashboardMetrics(BaseModel):
    total_patients: int
    total_sites: int
    total_visits: int
    total_deviations: int
    major_deviations: int
    minor_deviations: int
    administrative_deviations: int
    high_risk_sites_count: int
    severity_distribution: dict
    site_risk_ranking: List[dict]
    recent_deviation_trend: List[dict]
    deviation_categories: List[dict]

class CopilotQueryRequest(BaseModel):
    prompt: str
    context_site_id: Optional[str] = None

class CopilotQueryResponse(BaseModel):
    answer: str
    data_context: Optional[dict] = None
    suggested_actions: Optional[List[str]] = None
