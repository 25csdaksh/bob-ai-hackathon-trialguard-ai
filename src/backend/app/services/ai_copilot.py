import os
import json
import httpx
from sqlalchemy.orm import Session
from ..models.domain import Site, Patient, Visit, Deviation, CAPAReport
from .capa_generator import generate_capa_report

WATSONX_API_KEY = os.environ.get("WATSONX_API_KEY") or os.environ.get("BOB_API_KEY") or os.environ.get("IBM_BOB_API_KEY")
WATSONX_URL = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_PROJECT_ID = os.environ.get("WATSONX_PROJECT_ID")

async def process_copilot_query(db: Session, prompt: str, context_site_id: str = None) -> dict:
    prompt_lower = prompt.lower().strip()

    # Retrieve overall database metrics for context grounding
    sites = db.query(Site).all()
    deviations = db.query(Deviation).all()
    patients = db.query(Patient).all()
    major_devs = [d for d in deviations if d.severity == "Major"]
    minor_devs = [d for d in deviations if d.severity == "Minor"]
    admin_devs = [d for d in deviations if d.severity == "Administrative"]
    high_risk_sites = [s for s in sites if s.risk_score >= 60]
    critical_sites = sorted(sites, key=lambda x: x.risk_score, reverse=True)
    top_site = critical_sites[0] if critical_sites else None

    # Check for out-of-scope / non-existent data queries
    unknown_keywords = ["country", "countries", "europe", "asia", "france", "germany", "japan", "uk", "nonexistent"]
    if any(k in prompt_lower for k in unknown_keywords):
        return {
            "answer": (
                "⚠️ **Data Unavailable**: The requested information is not available in the TrialGuard AI dataset.\n\n"
                "The current trial telemetry tracks 5 active US clinical research sites:\n"
                "- SITE-001 (Boston, MA)\n- SITE-002 (Chicago, IL)\n- SITE-003 (Houston, TX)\n- SITE-004 (San Francisco, CA)\n- SITE-005 (Seattle, WA)\n\n"
                "*No international site or patient data exists in this trial configuration.*"
            ),
            "data_context": {"available_sites": [s.site_id for s in sites]},
            "suggested_actions": ["Show me SITE-003 details", "Summarize current trial risk"]
        }

    # 1. Detect site-specific query (SITE-001 .. SITE-005, site a .. e, or context_site_id)
    target_site_id = None
    if "site-001" in prompt_lower or "site a" in prompt_lower: target_site_id = "SITE-001"
    elif "site-002" in prompt_lower or "site b" in prompt_lower: target_site_id = "SITE-002"
    elif "site-003" in prompt_lower or "site c" in prompt_lower: target_site_id = "SITE-003"
    elif "site-004" in prompt_lower or "site d" in prompt_lower: target_site_id = "SITE-004"
    elif "site-005" in prompt_lower or "site e" in prompt_lower: target_site_id = "SITE-005"
    elif context_site_id: target_site_id = context_site_id

    # 1. CAPA Generation Query
    if "capa" in prompt_lower:
        capa_site = target_site_id or "SITE-003"
        capa = generate_capa_report(db, site_id=capa_site)

        answer = (
            f"✅ **AI-Assisted CAPA Recommendation Generated** for **{capa_site}** (Report ID: `{capa.report_id}`):\n\n"
            f"- **Issue Summary**: {capa.issue_summary}\n"
            f"- **Observations**: {capa.observations}\n"
            f"- **Root Cause**: {capa.root_cause}\n"
            f"- **Immediate Corrective Action**: {capa.corrective_action}\n"
            f"- **Preventive Action**: {capa.preventive_action}\n"
            f"- **Priority**: `{capa.priority}` | **Responsible Role**: `{capa.responsible_role}`\n"
            f"- **Follow-Up Recommendation**: {capa.followup_recommendation}\n\n"
            f"⚠️ *Notice: This CAPA draft is an AI-assisted decision support suggestion requiring qualified human review.*"
        )
        return {
            "answer": answer,
            "data_context": {"report_id": capa.report_id, "site_id": capa_site},
            "suggested_actions": ["Open CAPA Reports Tab", "Download CAPA PDF"]
        }

    # 2. Handle explicit site query
    if target_site_id:
        site_obj = db.query(Site).filter(Site.site_id == target_site_id).first()
        if site_obj:
            site_devs = db.query(Deviation).filter(Deviation.site_id == target_site_id).all()
            site_majors = [d for d in site_devs if d.severity == "Major"]
            site_minors = [d for d in site_devs if d.severity == "Minor"]
            site_admins = [d for d in site_devs if d.severity == "Administrative"]
            factors = json.loads(site_obj.risk_factors) if site_obj.risk_factors else []

            types_count = {}
            for d in site_devs:
                types_count[d.deviation_type] = types_count.get(d.deviation_type, 0) + 1
            type_summary = ", ".join([f"{k}: {v}" for k, v in types_count.items()]) if types_count else "None"

            answer = (
                f"**{site_obj.site_name} ({site_obj.site_id}) Telemetry Summary**:\n\n"
                f"- **Risk Level**: `{site_obj.risk_level.upper()}` (Score: `{site_obj.risk_score}/100`)\n"
                f"- **Principal Investigator**: {site_obj.principal_investigator} ({site_obj.location})\n"
                f"- **Patients Enrolled**: {site_obj.total_patients} subjects\n"
                f"- **Total Deviations**: `{len(site_devs)}` (Major: `{len(site_majors)}`, Minor: `{len(site_minors)}`, Admin: `{len(site_admins)}`)\n"
                f"- **Deviation Breakdown**: {type_summary}\n\n"
                f"### Primary Contributing Risk Factors:\n"
            )
            for factor in factors:
                answer += f"- {factor}\n"

            return {
                "answer": answer,
                "data_context": {
                    "site_id": site_obj.site_id,
                    "site_name": site_obj.site_name,
                    "risk_score": site_obj.risk_score,
                    "risk_level": site_obj.risk_level,
                    "total_deviations": len(site_devs),
                    "major_deviations": len(site_majors)
                },
                "suggested_actions": [
                    f"Generate CAPA for {site_obj.site_id}",
                    "Show all major deviations",
                    "Summarize recent deviations"
                ]
            }

    # 2. CAPA Generation Query
    if "generate capa" in prompt_lower or "capa recommendation" in prompt_lower:
        capa_site = target_site_id or "SITE-003"
        capa = generate_capa_report(db, site_id=capa_site)

        answer = (
            f"✅ **AI-Assisted CAPA Recommendation Generated** for **{capa_site}** (Report ID: `{capa.report_id}`):\n\n"
            f"- **Issue Summary**: {capa.issue_summary}\n"
            f"- **Observations**: {capa.observations}\n"
            f"- **Root Cause**: {capa.root_cause}\n"
            f"- **Immediate Corrective Action**: {capa.corrective_action}\n"
            f"- **Preventive Action**: {capa.preventive_action}\n"
            f"- **Priority**: `{capa.priority}` | **Responsible Role**: `{capa.responsible_role}`\n"
            f"- **Follow-Up Recommendation**: {capa.followup_recommendation}\n\n"
            f"⚠️ *Notice: This CAPA draft is an AI-assisted decision support suggestion and requires qualified human review.*"
        )
        return {
            "answer": answer,
            "data_context": {"report_id": capa.report_id, "site_id": capa_site},
            "suggested_actions": ["Open CAPA Reports Tab", "Download CAPA PDF"]
        }

    # 3. Major Deviations Query
    if "major" in prompt_lower and ("deviation" in prompt_lower or "violation" in prompt_lower):
        answer = f"Found **{len(major_devs)} Major Protocol Deviations** across trial sites:\n\n"
        dev_list = []
        for d in major_devs[:8]:
            site = db.query(Site).filter(Site.site_id == d.site_id).first()
            s_name = site.site_name if site else d.site_id
            answer += f"- **[{d.deviation_id}]** (Patient `{d.patient_id}` at `{s_name}`): **{d.deviation_type}** on {d.date}. *Explanation*: {d.explanation}\n"
            dev_list.append({"deviation_id": d.deviation_id, "patient_id": d.patient_id, "site_id": d.site_id, "type": d.deviation_type})

        answer += "\n> Major deviations pose critical threats to subject safety or data integrity and require immediate CAPA filing."

        return {
            "answer": answer,
            "data_context": {"count": len(major_devs), "deviations": dev_list},
            "suggested_actions": ["Filter Deviations by Major", "Generate CAPA for Site C"]
        }

    # 4. Highest Risk / Immediate Attention Query
    if "immediate attention" in prompt_lower or "highest risk" in prompt_lower or "worst site" in prompt_lower or "highest" in prompt_lower:
        if top_site:
            answer = (
                f"**{top_site.site_name} ({top_site.site_id})** has the **HIGHEST RISK SCORE** in the trial.\n\n"
                f"- **Risk Level**: `{top_site.risk_level.upper()}` (Score: `{top_site.risk_score}/100`)\n"
                f"- **Principal Investigator**: {top_site.principal_investigator}\n"
                f"- **Total Deviations**: {top_site.total_deviations} ({top_site.major_deviations} Major)\n"
                f"- **Trend**: {top_site.trend}\n\n"
                f"This site accounts for `{top_site.major_deviations}` out of `{len(major_devs)}` ({int((top_site.major_deviations / max(1, len(major_devs))) * 100)}%) of all major safety deviations in the trial."
            )
            return {
                "answer": answer,
                "data_context": {"site_id": top_site.site_id, "risk_score": top_site.risk_score},
                "suggested_actions": [f"Open {top_site.site_id} Details", f"Generate CAPA for {top_site.site_id}"]
            }

    # 5. Total Deviations / Summary Queries
    if "total deviation" in prompt_lower or "how many deviation" in prompt_lower or "summarize" in prompt_lower or "summary" in prompt_lower:
        answer = (
            f"### 📊 Clinical Trial Risk Telemetry Summary\n\n"
            f"- **Active Sites Monitored**: {len(sites)} sites\n"
            f"- **Enrolled Patients**: {len(patients)} subjects\n"
            f"- **Total Protocol Deviations**: `{len(deviations)}`\n"
            f"- **Severity Breakdown**: Major: `{len(major_devs)}` | Minor: `{len(minor_devs)}` | Admin: `{len(admin_devs)}`\n"
            f"- **High-Risk Sites**: `{len(high_risk_sites)}` site(s) requiring CAPA remediation ({', '.join([s.site_id for s in high_risk_sites])})\n"
            f"- **Top Issue Category**: Late Visit scheduling window & Missed Visit occurrences."
        )
        return {
            "answer": answer,
            "data_context": {"total_sites": len(sites), "total_deviations": len(deviations), "major_deviations": len(major_devs)},
            "suggested_actions": ["Why is SITE-003 high risk?", "Show me all major deviations"]
        }

    # 6. watsonx.ai REST API Integration (When API credentials are present)
    if WATSONX_API_KEY and WATSONX_PROJECT_ID:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"{WATSONX_URL}/ml/v1/text/generation?version=2023-05-29",
                    headers={"Authorization": f"Bearer {WATSONX_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "input": f"Clinical Trial Database Context: {len(sites)} sites, {len(deviations)} deviations ({len(major_devs)} Major). Top Risk Site: {top_site.site_id if top_site else 'None'}. User Query: {prompt}",
                        "parameters": {"max_new_tokens": 300},
                        "project_id": WATSONX_PROJECT_ID
                    },
                    timeout=10.0
                )
                if res.status_code == 200:
                    data = res.json()
                    gen_text = data["results"][0]["generated_text"]
                    return {
                        "answer": f"**IBM watsonx.ai Response**:\n\n{gen_text}",
                        "data_context": {"provider": "IBM watsonx.ai REST API"},
                        "suggested_actions": ["Ask Follow-up", "Generate CAPA"]
                    }
        except Exception as e:
            print(f"watsonx integration note: {e}")

    # 7. Fallback Mode (Data-grounded in active SQLite database metrics)
    answer = (
        f"Based on live clinical trial database telemetry:\n\n"
        f"We are tracking **{len(sites)} sites** and **{len(patients)} patients** with **{len(deviations)} total protocol deviations**.\n"
        f"The primary site of operational concern is **{top_site.site_name} ({top_site.site_id})** with a risk score of **{top_site.risk_score}/100** ({top_site.risk_level} Risk).\n\n"
        f"*Note: Running in TrialGuard AI Copilot data-grounded analytical engine mode.*"
    )
    return {
        "answer": answer,
        "data_context": {"total_sites": len(sites), "total_deviations": len(deviations)},
        "suggested_actions": ["Why is SITE-003 high risk?", "Show me all major deviations", "Summarize current trial risk"]
    }
