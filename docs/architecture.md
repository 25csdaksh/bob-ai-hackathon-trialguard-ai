# 🏗️ Technical Architecture — TrialGuard AI

## System Architecture Diagram

```
User (Browser)
     │
     ▼
React 18 + TypeScript + Vite + Tailwind CSS Frontend
     │ (REST API Fetch / JSON)
     ▼
FastAPI Python Backend (Uvicorn Server)
     ├── API Routers (/api/dashboard, /api/sites, /api/deviations, /api/capa, /api/copilot)
     ├── Protocol Rule Engine (app/services/deviation_detector.py)
     ├── Risk Scoring Engine (app/services/risk_scoring.py)
     ├── CAPA Generator Service (app/services/capa_generator.py)
     └── AI Copilot Service (app/services/ai_copilot.py)
           │ (HTTP REST / Fallback)
           ▼
     IBM watsonx.ai REST API (When configured via credentials)
     │
     ▼
SQLite Database (SQLAlchemy ORM - Site, Patient, Visit, Deviation, CAPAReport)
```

## Backend API Specification

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard` | `GET` | Returns aggregate metrics, severity distributions, risk rankings, and deviation trends. |
| `/api/sites` | `GET` | Lists trial sites with calculated 0–100 risk scores, levels, and filter options. |
| `/api/sites/{site_id}` | `GET` | Returns detailed site metrics, patient list, deviations, and recommended mitigations. |
| `/api/deviations` | `GET` | Returns list of recorded protocol deviations with search and severity filters. |
| `/api/deviations/{deviation_id}` | `GET` | Returns full deviation detail (expected vs actual, detection explanation). |
| `/api/deviations/analyze` | `POST` | Triggers a full protocol rule engine re-scan across all visits. |
| `/api/capa` | `GET/POST` | Fetches or generates a new CAPA-ready report for a site or deviation. |
| `/api/copilot` | `POST` | Processes natural language questions with data-grounded AI responses. |

## Data Schema & Storage

- **Site Table**: `site_id`, `site_name`, `location`, `principal_investigator`, `total_patients`, `total_visits`, `total_deviations`, `major_deviations`, `risk_score`, `risk_level`, `risk_factors`, `trend`.
- **Patient Table**: `patient_id`, `site_id`, `patient_name`, `age`, `gender`, `enrolled_date`, `status`.
- **Visit Table**: `visit_id`, `patient_id`, `site_id`, `visit_name`, `expected_visit_date`, `actual_visit_date`, `dose_expected`, `dose_actual`, `medication`, `prohibited_medication`, `lab_required`, `lab_completed`, `lab_results`, `notes`, `status`.
- **Deviation Table**: `deviation_id`, `patient_id`, `site_id`, `visit_id`, `deviation_type`, `expected_value`, `actual_value`, `severity`, `date`, `explanation`, `recommended_action`, `status`.
- **CAPAReport Table**: `report_id`, `site_id`, `deviation_id`, `issue_summary`, `observations`, `root_cause`, `corrective_action`, `preventive_action`, `priority`, `responsible_role`, `followup_recommendation`, `created_at`.
