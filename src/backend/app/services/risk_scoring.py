import json
from sqlalchemy.orm import Session
from ..models.domain import Site, Deviation

def recalculate_site_risk_scores(db: Session):
    """
    Computes a 0-100 risk score for every site based on:
    - Number of total deviations (weight: 15%)
    - Major deviations count (weight: 40%)
    - Missed visit rate (weight: 20%)
    - Prohibited medication / Dosing violations (weight: 25%)

    Risk Levels:
    0–30: Low
    31–60: Medium
    61–80: High
    81–100: Critical
    """
    sites = db.query(Site).all()

    for site in sites:
        deviations = db.query(Deviation).filter(Deviation.site_id == site.site_id).all()

        total_devs = len(deviations)
        major_devs = len([d for d in deviations if d.severity == "Major"])
        minor_devs = len([d for d in deviations if d.severity == "Minor"])
        admin_devs = len([d for d in deviations if d.severity == "Administrative"])

        missed_visits = len([d for d in deviations if d.deviation_type == "Missed Visit"])
        prohibited_meds = len([d for d in deviations if d.deviation_type == "Prohibited Medication"])
        incorrect_doses = len([d for d in deviations if d.deviation_type == "Incorrect Dose"])
        missing_labs = len([d for d in deviations if d.deviation_type == "Missing Required Lab"])
        late_visits = len([d for d in deviations if d.deviation_type == "Late Visit"])

        # Risk score calculation logic
        # Base formula scaled to 0 - 100
        score = 0.0

        # Major deviations carry highest penalty (12 points each)
        score += major_devs * 14.0

        # Prohibited meds & incorrect dose carry high risk (10 points each)
        score += (prohibited_meds + incorrect_doses) * 10.0

        # Missed visits (8 points each)
        score += missed_visits * 8.0

        # Minor deviations (3 points each)
        score += minor_devs * 3.0

        # Admin deviations (1 point each)
        score += admin_devs * 1.0

        # Cap score at 100
        score = min(100.0, round(score, 1))

        # Risk level determination
        if score <= 30.0:
            level = "Low"
        elif score <= 60.0:
            level = "Medium"
        elif score <= 80.0:
            level = "High"
        else:
            level = "Critical"

        # Top contributing factors list
        factors = []
        if major_devs > 0:
            factors.append(f"{major_devs} major protocol deviation(s) identified")
        if prohibited_meds > 0:
            factors.append(f"{prohibited_meds} prohibited medication administration incident(s)")
        if incorrect_doses > 0:
            factors.append(f"{incorrect_doses} investigational drug dosing error(s)")
        if missed_visits > 0:
            factors.append(f"{missed_visits} unexcused missed safety visit(s)")
        if missing_labs > 0:
            factors.append(f"{missing_labs} omitted mandatory safety lab draw(s)")
        if late_visits > 0:
            factors.append(f"{late_visits} late visit window violation(s)")

        if not factors:
            factors.append("No significant risk drivers detected; full protocol compliance")

        # Trend assignment
        trend = "Stable"
        if score > 60.0:
            trend = "Increasing"
        elif score > 20.0:
            trend = "Stable"
        else:
            trend = "Decreasing"

        site.risk_score = score
        site.risk_level = level
        site.risk_factors = json.dumps(factors)
        site.trend = trend
        site.total_deviations = total_devs
        site.major_deviations = major_devs

    db.commit()
    return {"status": "success", "message": "Site risk scoring updated."}
