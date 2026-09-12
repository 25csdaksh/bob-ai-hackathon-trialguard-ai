# 💡 Solution Overview — TrialGuard AI

## Solution Architecture & Workflow

TrialGuard AI transforms clinical trial protocol monitoring into an automated, transparent, end-to-end decision-support system.

```
Clinical Trial Protocol + Synthetic Telemetry Data
                       ↓
            Protocol Rule Engine
                       ↓
          Protocol Deviation Detector
                       ↓
           Severity Classification (Major / Minor / Admin)
                       ↓
             0–100 Site Risk Intelligence Engine
                       ↓
             Explainable Risk Drivers
                       ↓
             CAPA Report Generator (PDF Export)
                       ↓
            IBM Bob AI Copilot (watsonx.ai Grounded)
```

## Key Modules & Innovations

### 1. Automated Protocol Rule Engine
Scans incoming visit telemetry against protocol parameters:
- **Expected Visit Window Validation**: Detects missed or out-of-window visits.
- **Dosage Verification**: Flags discrepancies between expected vs actual dosage.
- **Medication Screening**: Checks concomitant medications against prohibited lists.
- **Laboratory Panel Audit**: Verifies mandatory lab test completion status.

### 2. Prototype Severity Classification
Classifies deviations into three actionable tiers:
- **Major**: Critical threats to patient safety or primary endpoint data integrity (e.g. prohibited medication, double dosing, missed safety visit).
- **Minor**: Non-critical procedural delays (e.g. late visit within reasonable threshold, missing non-critical lab).
- **Administrative**: Minor documentation or formatting oversights.

### 3. Explainable Site Risk Intelligence Score (0–100)
Calculates a site risk score based on weighted deviation metrics, major incident frequency, and recent compliance trends. Risk levels are categorized into:
- `Low` (0–30)
- `Medium` (31–60)
- `High` (61–80)
- `Critical` (81–100)

Every risk score is accompanied by human-understandable contributing risk drivers.

### 4. CAPA-Ready Report Generator
Drafts structured Corrective & Preventive Action plans including Issue Summary, Root Cause Analysis, Immediate Corrective Actions, Preventive Actions, Priority, and Responsible Roles, downloadable directly as clean PDF documents.

### 5. IBM Bob AI Copilot
Provides an interactive natural language assistant grounded in the live trial database to answer complex questions ("Why is Site C high risk?", "Show me all major deviations") with verifiable telemetry references.
