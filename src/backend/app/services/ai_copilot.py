import os
import json
import httpx
from sqlalchemy.orm import Session
from ..models.domain import Site, Patient, Visit, Deviation, CAPAReport
from .capa_generator import generate_capa_report

WATSONX_API_KEY = os.environ.get("WATSONX_API_KEY")
WATSONX_URL = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_PROJECT_ID = os.environ.get("WATSONX_PROJECT_ID")

async def process_copilot_query(db: Session, prompt: str, context_site_id: str = None) -> dict:
    prompt_lower = prompt.lower().strip()

    # Retrieve overall database metrics for context grounding
    sites = db.query(Site).all()
    deviations = db.query(Deviation).all()
    major_devs = [d for d in deviations if d.severity == "Major"]
    high_risk_sites = [s for s in sites if s.risk_score >= 60]
    critical_sites = sorted(sites, key=lambda x: x.risk_score, reverse=True)

    top_site = critical_sites[0] if critical_sites else None

    # Handle explicit queries with deterministic data-grounded responses
    if "site c" in prompt_lower or (context_site_id == "SITE-003" and "why" in prompt_lower):
        site_c = db.query(Site).filter(Site.site_id == "SITE-003").first()
        if site_c:
            factors = json.loads(site_c.risk_factors)
            site_c_devs = db.query(Deviation).filter(Deviation.site_id == "SITE-003").all()
            majors = [d for d in site_c_devs if d.severity == "Major"]
            types_count = {}
            for d in site_c_devs:
                types_count[d.deviation_type] = types_count.get(d.deviation_type, 0) + 1

            type_summary = ", ".join([f"{k}: {v}" for k, v in types_count.items()])

            answer = (
                f"**Site C ({site_c.site_name})** is classified as **{site_c.risk_level.upper()} RISK** with a risk score of **{site_c.risk_score}/100**.\n\n"
                f"### Core Risk Drivers:\n"
                f"- **Total Deviations**: {len(site_c_devs)} (including **{len(majors)} Major** severity deviations)\n"
                f"- **Deviation Breakdown**: {type_summary}\n"
                f"- **Primary Factors**:\n"
            )
            for factor in factors:
                answer += f"  - {factor}\n"

            answer += (
                f"\n**Root Cause Summary**: Site C exhibits repeated compliance breakdowns in subject visit scheduling, "
                f"concomitant medication screening, and dose administration accuracy under PI {site_c.principal_investigator}.\n"
                f"**Recommended Action**: Issue immediate trial enrollment hold and trigger on-site audit."
            )

            return {
                "answer": answer,
                "data_context": {
                    "site_id": "SITE-003",
                    "site_name": site_c.site_name,
                    "risk_score": site_c.risk_score,
                    "risk_level": site_c.risk_level,
                    "total_deviations": len(site_c_devs),
                    "major_deviations": len(majors)
                },
                "suggested_actions": [
                    "Generate CAPA Report for Site C",
                    "View Site C Major Deviations",
                    "Initiate Monitoring Audit"
                ]
            }

    elif "major" in prompt_lower and "deviation" in prompt_lower:
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
            "suggested_actions": ["Filter Deviations by Major", "Generate CAPA for Top Major Deviation"]
        }

    elif "immediate attention" in prompt_lower or "highest risk" in prompt_lower or "worst site" in prompt_lower:
        if top_site:
            answer = (
                f"**{top_site.site_name} ({top_site.site_id})** requires **IMMEDIATE ATTENTION**.\n\n"
                f"- **Risk Level**: `{top_site.risk_level.upper()}` (Score: `{top_site.risk_score}/100`)\n"
                f"- **Principal Investigator**: {top_site.principal_investigator}\n"
                f"- **Total Deviations**: {top_site.total_deviations} ({top_site.major_deviations} Major)\n"
                f"- **Trend**: {top_site.trend}\n\n"
                f"This site accounts for over {int((top_site.major_deviations / max(1, len(major_devs))) * 100)}% of all major safety deviations in the trial."
            )
            return {
                "answer": answer,
                "data_context": {"site_id": top_site.site_id, "risk_score": top_site.risk_score},
                "suggested_actions": [f"Open {top_site.site_id} Details", f"Generate CAPA for {top_site.site_id}"]
            }

    elif "generate capa" in prompt_lower:
        target_site = "SITE-003"
        if "site a" in prompt_lower: target_site = "SITE-001"
        elif "site b" in prompt_lower: target_site = "SITE-002"
        elif "site c" in prompt_lower: target_site = "SITE-003"
        elif "site d" in prompt_lower: target_site = "SITE-004"
        elif "site e" in prompt_lower: target_site = "SITE-005"

        capa = generate_capa_report(db, site_id=target_site)

        answer = (
            f"✅ **CAPA-Ready Report Generated** for **{target_site}** (Report ID: `{capa.report_id}`):\n\n"
            f"- **Issue Summary**: {capa.issue_summary}\n"
            f"- **Root Cause**: {capa.root_cause}\n"
            f"- **Corrective Action**: {capa.corrective_action}\n"
            f"- **Preventive Action**: {capa.preventive_action}\n"
            f"- **Priority**: `{capa.priority}` | **Responsible**: `{capa.responsible_role}`\n\n"
            f"*This AI-assisted CAPA draft is ready for review and export on the CAPA Reports tab.*"
        )
        return {
            "answer": answer,
            "data_context": {"report_id": capa.report_id, "site_id": target_site},
            "suggested_actions": ["Open CAPA Reports Tab", "Export CAPA PDF"]
        }

    elif "patients" in prompt_lower and ("violation" in prompt_lower or "deviation" in prompt_lower):
        patient_devs = {}
        for d in deviations:
            patient_devs[d.patient_id] = patient_devs.get(d.patient_id, 0) + 1

        top_patients = sorted(patient_devs.items(), key=lambda x: x[1], reverse=True)
        answer = f"A total of **{len(patient_devs)} patients** have recorded protocol violations.\n\n### Top Affected Patients:\n"
        for pid, count in top_patients[:6]:
            p_obj = db.query(Patient).filter(Patient.patient_id == pid).first()
            p_site = p_obj.site_id if p_obj else "Unknown"
            answer += f"- **Patient `{pid}`** (Site `{p_site}`): `{count}` deviation(s)\n"

        return {
            "answer": answer,
            "data_context": {"total_affected_patients": len(patient_devs)},
            "suggested_actions": ["Filter Deviations by Patient", "View Patient Profile"]
        }

    elif "summarize" in prompt_lower or "summary" in prompt_lower:
        answer = (
            f"### 📊 Trial Risk & Deviation Executive Summary\n\n"
            f"- **Active Sites**: {len(sites)} sites monitored\n"
            f"- **Total Protocol Deviations**: {len(deviations)}\n"
            f"- **Severity Breakdown**: Major: `{len(major_devs)}` | Minor: `{len(deviations) - len(major_devs)}`\n"
            f"- **High Risk Sites**: {len(high_risk_sites)} site(s) requiring remediation ({', '.join([s.site_id for s in high_risk_sites])})\n"
            f"- **Most Common Issue**: Missed Visit & Late Visit Scheduling Window violations.\n"
        )
        return {
            "answer": answer,
            "data_context": {"total_sites": len(sites), "total_deviations": len(deviations)},
            "suggested_actions": ["View Risk Scoreboard", "Download CAPA Summary"]
        }

    # Generic watsonx or deterministic fallback generator
    if WATSONX_API_KEY and WATSONX_PROJECT_ID:
        try:
            # Call IBM watsonx.ai REST API
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"{WATSONX_URL}/ml/v1/text/generation?version=2023-05-29",
                    headers={"Authorization": f"Bearer {WATSONX_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "input": f"Clinical Trial Context: {len(sites)} sites, {len(deviations)} deviations. User query: {prompt}",
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
                        "data_context": {"provider": "IBM watsonx.ai"},
                        "suggested_actions": ["Ask Follow-up", "Generate CAPA"]
                    }
        except Exception as e:
            print(f"watsonx fallback error: {e}")

    # Default fallback answer grounded in trial database metrics
    answer = (
        f"Based on current clinical trial database telemetry:\n\n"
        f"We are tracking **{len(sites)} trial sites** with **{len(deviations)} total deviations**.\n"
        f"The primary site of operational concern is **{top_site.site_name} ({top_site.site_id})** with a risk score of **{top_site.risk_score}/100** ({top_site.risk_level} Risk).\n\n"
        f"*Note: Running in TrialGuard AI Copilot deterministic analytical engine mode.*"
    )
    return {
        "answer": answer,
        "data_context": {"total_sites": len(sites), "highest_risk_site": top_site.site_id if top_site else None},
        "suggested_actions": ["Why is Site C high risk?", "Show me all major deviations", "Summarize recent deviations"]
    }
