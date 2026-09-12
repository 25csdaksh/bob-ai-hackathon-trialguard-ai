from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from ..models.domain import Site, Patient, Visit, Deviation
from .risk_scoring import recalculate_site_risk_scores

def run_deviation_detector(db: Session):
    """
    Scans all Visit records in the database against protocol rules.
    Detects:
    1. Missed Visit / Late Visit
    2. Incorrect Dose
    3. Prohibited Medication
    4. Missing Mandatory Lab
    5. Other Rule Violation

    Prevents duplicate deviation creation upon re-runs.
    Updates site-level risk metrics.
    """
    visits = db.query(Visit).all()

    for v in visits:
        # Rule 1a: Missed Visit
        if v.status == "Missed" or (v.actual_visit_date is None and v.expected_visit_date):
            dev_type = "Missed Visit"
            existing = db.query(Deviation).filter(
                Deviation.visit_id == v.visit_id,
                Deviation.deviation_type == dev_type
            ).first()
            if not existing:
                dev = Deviation(
                    deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                    patient_id=v.patient_id,
                    site_id=v.site_id,
                    visit_id=v.visit_id,
                    deviation_type=dev_type,
                    expected_value=f"Visit scheduled on {v.expected_visit_date}",
                    actual_value="Patient missed visit; no actual visit date recorded",
                    severity="Major",
                    date=v.expected_visit_date,
                    explanation="Patient missed required clinical safety visit without prior notice.",
                    recommended_action="Contact patient immediately for emergency safety evaluation.",
                    status="Open"
                )
                db.add(dev)

        # Rule 1b: Late Visit
        elif v.actual_visit_date and v.expected_visit_date:
            try:
                exp_dt = datetime.strptime(v.expected_visit_date, "%Y-%m-%d")
                act_dt = datetime.strptime(v.actual_visit_date, "%Y-%m-%d")
                days_diff = (act_dt - exp_dt).days
                if days_diff > 3:  # Greater than allowable window (+3 days)
                    dev_type = "Late Visit"
                    existing = db.query(Deviation).filter(
                        Deviation.visit_id == v.visit_id,
                        Deviation.deviation_type == dev_type
                    ).first()
                    if not existing:
                        severity = "Major" if days_diff > 10 else ("Minor" if days_diff > 5 else "Administrative")
                        dev = Deviation(
                            deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                            patient_id=v.patient_id,
                            site_id=v.site_id,
                            visit_id=v.visit_id,
                            deviation_type=dev_type,
                            expected_value=f"Expected on {v.expected_visit_date} ± 3 days",
                            actual_value=f"Completed on {v.actual_visit_date} ({days_diff} days late)",
                            severity=severity,
                            date=v.actual_visit_date,
                            explanation=f"Visit conducted outside protocol allowed schedule window by {days_diff} days.",
                            recommended_action="Review site scheduling calendar and send timely visit reminders.",
                            status="Open"
                        )
                        db.add(dev)
            except Exception:
                pass

        # Rule 2: Incorrect Dose
        if v.dose_expected and v.dose_actual and v.dose_actual != v.dose_expected:
            dev_type = "Incorrect Dose"
            existing = db.query(Deviation).filter(
                Deviation.visit_id == v.visit_id,
                Deviation.deviation_type == dev_type
            ).first()
            if not existing:
                dev = Deviation(
                    deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                    patient_id=v.patient_id,
                    site_id=v.site_id,
                    visit_id=v.visit_id,
                    deviation_type=dev_type,
                    expected_value=f"Protocol Dose: {v.dose_expected}",
                    actual_value=f"Administered Dose: {v.dose_actual}",
                    severity="Major",
                    date=v.actual_visit_date or v.expected_visit_date,
                    explanation=f"Discrepancy detected between protocol prescribed dose ({v.dose_expected}) and actual administered dose ({v.dose_actual}).",
                    recommended_action="Perform immediate subject safety assessment and notify IRB/Medical Monitor.",
                    status="Open"
                )
                db.add(dev)

        # Rule 3: Prohibited Medication
        if v.prohibited_medication and len(v.prohibited_medication.strip()) > 0:
            dev_type = "Prohibited Medication"
            existing = db.query(Deviation).filter(
                Deviation.visit_id == v.visit_id,
                Deviation.deviation_type == dev_type
            ).first()
            if not existing:
                dev = Deviation(
                    deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                    patient_id=v.patient_id,
                    site_id=v.site_id,
                    visit_id=v.visit_id,
                    deviation_type=dev_type,
                    expected_value="No concomitant prohibited therapy",
                    actual_value=f"Concomitant med reported: {v.prohibited_medication}",
                    severity="Major",
                    date=v.actual_visit_date or v.expected_visit_date,
                    explanation=f"Subject initiated prohibited concomitant medication ({v.prohibited_medication}) during active trial phase.",
                    recommended_action="Evaluate drug-drug interaction risk and evaluate patient study continuation eligibility.",
                    status="Open"
                )
                db.add(dev)

        # Rule 4: Missing Mandatory Lab
        if v.lab_required and not v.lab_completed and v.status != "Missed":
            dev_type = "Missing Required Lab"
            existing = db.query(Deviation).filter(
                Deviation.visit_id == v.visit_id,
                Deviation.deviation_type == dev_type
            ).first()
            if not existing:
                dev = Deviation(
                    deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                    patient_id=v.patient_id,
                    site_id=v.site_id,
                    visit_id=v.visit_id,
                    deviation_type=dev_type,
                    expected_value="Mandatory safety blood/urine laboratory completion",
                    actual_value="Laboratory sample omitted or corrupted",
                    severity="Minor",
                    date=v.actual_visit_date or v.expected_visit_date,
                    explanation="Required protocol laboratory procedure was omitted during visit.",
                    recommended_action="Schedule immediate repeat lab collection.",
                    status="Open"
                )
                db.add(dev)

        # Rule 5: Other Protocol Rule Violation
        if v.notes and any(w in v.notes.lower() for w in ["violation", "unapproved", "out of sequence"]):
            dev_type = "Other Rule Violation"
            existing = db.query(Deviation).filter(
                Deviation.visit_id == v.visit_id,
                Deviation.deviation_type == dev_type
            ).first()
            if not existing:
                dev = Deviation(
                    deviation_id=f"DEV-{v.site_id.split('-')[1]}-{uuid.uuid4().hex[:6].upper()}",
                    patient_id=v.patient_id,
                    site_id=v.site_id,
                    visit_id=v.visit_id,
                    deviation_type=dev_type,
                    expected_value="Adherence to general protocol workflow",
                    actual_value=v.notes,
                    severity="Minor",
                    date=v.actual_visit_date or v.expected_visit_date,
                    explanation=f"Procedural violation noted: {v.notes}",
                    recommended_action="Review site protocol compliance with clinical research staff.",
                    status="Open"
                )
                db.add(dev)

    db.commit()

    # Recalculate risk scores & site metrics
    recalculate_site_risk_scores(db)

    return {"status": "success", "message": "Deviation detector scan complete."}
