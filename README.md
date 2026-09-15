# 🛡️ TrialGuard AI — Clinical Trial Risk Monitor & Protocol Deviation Detector

> **IBM Bob AI Innovation Hackathon 2026 Submission (AI Track)**
>
> 🚀 **Live Demo**: [https://trialguard-ai.vercel.app/](https://trialguard-ai.vercel.app/)  
> 🎬 **Demo Video**: [https://youtu.be/FWkEpFx3yz0](https://youtu.be/FWkEpFx3yz0)

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | TrialGuard Squad |
| **Track** | AI Track |
| **Team Lead** | Daksh Soni — `25cs102@charusat.edu.in` |
| **Members** | Daksh Soni (Team Lead), Vishwam, Het, Manav |

---

## 🎯 Problem Statement

Clinical trials can involve thousands of patient visits across multiple research sites. Critical protocol deviations—such as missed safety visits, incorrect investigational drug dosing, prohibited concomitant medication usage, and omitted laboratory blood draws—often remain undetected until routine monitoring or post-trial audits. Delayed detection compromises patient safety, risks regulatory rejection, causes costly trial delays, and impairs data integrity.

---

## 💡 Solution

**TrialGuard AI** is an intelligent clinical trial risk monitoring and decision-support system. Powered by a protocol rule engine and grounded AI telemetry, it continuously evaluates synthetic trial data to detect deviations, automatically classifies severity (Major, Minor, Administrative), calculates a 0–100 site risk score with explainable contributing factors, drafts CAPA-ready reports, and provides an interactive **IBM Bob AI Copilot**.

---

## ✨ Key Features

- **📊 Clinical Trial Executive Dashboard**: Real-time KPI metrics for total patients, sites, visits, detected deviations, severity breakdowns, and high-risk site alerts.
- **🔍 Protocol Deviation Detector**: Automated detection of 6 core deviation types (Missed Visit, Late Visit, Incorrect Dose, Prohibited Medication, Missing Required Lab, Rule Violation) comparing expected vs. actual parameters.
- **🏷️ Prototype Severity Classification**: Categorizes deviations into Major, Minor, and Administrative severity tiers using configurable demo rules.
- **📈 Site Risk Scoring (0–100)**: Calculates site-level risk scores, risk levels (Low, Medium, High, Critical), trend indicators, and primary risk drivers.
- **📋 CAPA Report Generator**: Generates structured, editable Corrective & Preventive Action plans (Root Cause, Corrective Action, Preventive Action, Priority, Follow-up) with client-side PDF export.
- **🤖 IBM Bob AI Copilot**: Interactive natural language assistant answering queries ("Why is Site C high risk?", "Show major deviations") grounded in live database telemetry with watsonx.ai REST integration and deterministic fallback.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.10+, TypeScript, SQL, HTML5/CSS3 |
| **Backend** | FastAPI, SQLAlchemy, Pydantic v2, Uvicorn |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, jsPDF |
| **IBM Technologies** | IBM watsonx.ai API, IBM Bob AI Copilot |
| **Database** | SQLite (PostgreSQL compatible ORM schema) |
| **DevOps & QA** | GitHub Actions Workflow Validation |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/          # FastAPI Python backend (services, models, API routes)
│   │   ├── app/
│   │   │   ├── api/      # REST API endpoints (dashboard, sites, deviations, capa, copilot)
│   │   │   ├── database/ # SQLAlchemy session & engine
│   │   │   ├── models/   # Domain models (Site, Patient, Visit, Deviation, CAPAReport)
│   │   │   ├── schemas/  # Pydantic validation schemas
│   │   │   ├── seed/     # Synthetic clinical trial data generator
│   │   │   └── services/ # Engine services (risk_scoring, deviation_detector, capa, copilot)
│   │   └── requirements.txt
│   └── frontend/         # React + Vite + Tailwind CSS dashboard UI
│       ├── src/
│       │   ├── components/ # Dashboard, Sites, Deviations, CAPA, Copilot drawer
│       │   ├── api.ts      # Backend REST client
│       │   └── App.tsx
│       └── package.json
├── docs/                 # Hackathon documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/
│   └── demo-video-link.txt
├── presentation/         # Hackathon slide deck
└── submission.yaml       # Submission metadata
```

---

## ⚡ How to Run

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup & Startup
```bash
# Navigate to backend directory
cd src/backend

# Install dependencies
python -m pip install -r requirements.txt

# Launch FastAPI server (seeds DB automatically on startup)
python -m uvicorn app.main:app --reload --port 8000
```
*Backend API will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

### 3. Frontend Setup & Startup
```bash
# Navigate to frontend directory in a new terminal
cd src/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend application will be live at `http://localhost:5173`.*

---

## 🖥️ Demo Walkthrough (3–5 Minutes)

1. **Dashboard Overview**: Open `http://localhost:5173`. View overall trial health metrics and notice the red **Critical Risk Alert for Site C (Crestview Research)**.
2. **Site Risk Scoreboard**: Navigate to **Sites & Risk**. Inspect Site C with risk score **87/100 (CRITICAL)**. Click **Inspect Site C** to view its 8 major deviations and contributing risk factors.
3. **Deviation Protocol Matrix**: Go to **Deviation Log**. Select a major deviation (e.g. Prohibited Medication or Incorrect Dose) to view expected protocol requirements vs. actual clinical observations.
4. **IBM Bob AI Copilot**: Click **IBM Bob Copilot** in the top right. Click the quick prompt *"Why is Site C high risk?"*. Observe data-grounded telemetry explanations.
5. **CAPA Report Generation & PDF Export**: Go to **CAPA Reports**. Select Site C, review the generated Corrective & Preventive Action plan, make inline edits, and click **Download PDF**.

---

## ⚠️ Known Limitations

- **Prototype Rules**: Severity classification rules and risk scoring thresholds are prototype/demo logic and do not constitute official clinical or regulatory determinations.
- **Synthetic Data**: Uses synthetic patient data for safety compliance (no real PHI/PII).
- **AI Fallback**: Integrates with IBM watsonx.ai REST API when credentials are provided; defaults to a deterministic database-grounded fallback mode when offline.

---

## 🏅 What We're Most Proud Of

The end-to-end cohesion of the system: transforming raw synthetic patient visit data into explainable 0–100 risk scores, data-grounded AI Copilot answers, and instant CAPA PDF reports in a single workflow.
