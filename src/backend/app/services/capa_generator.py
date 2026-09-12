import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.domain import Site, Deviation, CAPAReport

def generate_capa_report(db: Session, site_id: str, deviation_id: str = None, custom_notes: str = None):
    site = db.query(Site).filter(Site.site_id == site_id).first()
    if not site:
        raise ValueError(f"Site {site_id} not found")

    deviation = None
    if deviation_id:
        deviation = db.query(Deviation).filter(Deviation.deviation_id == deviation_id).first()

    # Formulate structured CAPA parameters based on deviation or overall site risk profile
    if deviation:
        issue_summary = f"Protocol Deviation [{deviation.deviation_type}] reported at {site.site_name} for Patient {deviation.patient_id}."
        observations = f"Observed Value: '{deviation.actual_value}'. Expected Protocol Standard: '{deviation.expected_value}'. Severity: {deviation.severity}. Date: {deviation.date}."

        if deviation.deviation_type == "Missed Visit":
            root_cause = "Inadequate patient visit reminder workflows and failure of patient outreach prior to mandatory safety follow-up window."
            corrective_action = "Contact patient immediately to complete emergency safety evaluation, perform physical exam, and assess vital signs."
            preventive_action = "Implement automated SMS/email visit notification system 7 days and 24 hours prior to scheduled protocol visits across the site."
            priority = "Critical" if deviation.severity == "Major" else "High"
            responsible_role = "Clinical Research Coordinator (CRC) & Patient Lead"
            followup = "Schedule site audit within 14 days and evaluate patient retention risk."

        elif deviation.deviation_type == "Prohibited Medication":
            root_cause = "Insufficient concomitant medication screening during patient check-in and lack of real-time electronic health record (EHR) cross-checking."
            corrective_action = "Immediately suspend study drug administration, review serum liver/renal panels, and consult Principal Investigator for safety clearance."
            preventive_action = "Mandate double-signoff on concomitant medication verification by primary investigator prior to each dosing visit."
            priority = "Critical"
            responsible_role = "Principal Investigator (PI) & Medical Monitor"
            followup = "File formal IRB protocol deviation notification within 24 hours and re-assess subject inclusion eligibility."

        elif deviation.deviation_type == "Incorrect Dose":
            root_cause = "Pharmacy dispensing mismatch between kit labeling instructions and clinical trial management system (CTMS) dose schedule."
            corrective_action = "Quarantine current investigational drug batch at site pharmacy, perform immediate patient pharmacokinetic sampling."
            preventive_action = "Implement dual-barcode scanning verification for all investigational product (IP) dispensing procedures."
            priority = "Critical"
            responsible_role = "Unblinded Investigational Site Pharmacist & Sub-Investigator"
            followup = "Conduct site pharmacy audit and re-train dispensing personnel."

        else:  # Late visit, Missing lab, etc.
            root_cause = "Site staffing constraints and lack of secondary staff cross-training on specialized protocol lab procedures."
            corrective_action = "Reschedule missing lab collection or obtain baseline clinical data where feasible."
            preventive_action = "Create pre-packaged protocol visit kits containing pre-printed lab requisitions and scheduling checklists."
            priority = "Medium"
            responsible_role = "Clinical Research Associate (CRA) / Monitor"
            followup = "Review protocol compliance at upcoming routine monitoring visit."

    else:
        # Site-wide CAPA report
        issue_summary = f"Comprehensive Site Risk CAPA for {site.site_name} (Risk Score: {site.risk_score} - {site.risk_level} Risk)."
        observations = f"Site currently has {site.total_deviations} total protocol deviations, including {site.major_deviations} major deviations. Trend: {site.trend}."
        root_cause = f"Systemic site operational drivers identified. Key contributing factors: {site.risk_factors}."

        if site.risk_score > 60.0:  # High / Critical Risk
            corrective_action = "Initiate immediate Targeted On-Site Clinical Monitoring Visit and suspend new patient enrollment pending protocol re-training."
            preventive_action = "Mandate comprehensive GCP (Good Clinical Practice) and protocol refresher training for all site trial staff."
            priority = "Critical"
            responsible_role = "Lead Clinical Monitor & Quality Assurance Manager"
            followup = "Re-evaluate site risk score in 30 days following CAPA implementation."
        elif site.risk_score > 30.0:  # Medium Risk
            corrective_action = "Schedule focused virtual quality review with site coordinator to address minor visit timing and lab collection delays."
            preventive_action = "Provide pre-printed visit scheduling checklists and secondary lab collection reminders to site staff."
            priority = "Medium"
            responsible_role = "Clinical Research Associate (CRA)"
            followup = "Review site metrics at next bi-weekly monitoring check."
        else:  # Low Risk (e.g. SITE-004)
            corrective_action = "Maintain routine clinical trial monitoring schedule; no immediate corrective intervention required."
            preventive_action = "Continue standard Good Clinical Practice (GCP) quality checks and routine investigator site updates."
            priority = "Low"
            responsible_role = "Routine Site Monitor"
            followup = "Re-assess site performance at next scheduled routine monitoring visit."

    if custom_notes:
        observations += f"\nAdditional Context: {custom_notes}"

    report_id = f"CAPA-{site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}"

    capa_report = CAPAReport(
        report_id=report_id,
        site_id=site_id,
        deviation_id=deviation_id,
        issue_summary=issue_summary,
        observations=observations,
        root_cause=root_cause,
        corrective_action=corrective_action,
        preventive_action=preventive_action,
        priority=priority,
        responsible_role=responsible_role,
        followup_recommendation=followup,
        created_at=datetime.utcnow()
    )

    db.add(capa_report)
    db.commit()
    db.refresh(capa_report)
    return capa_report
