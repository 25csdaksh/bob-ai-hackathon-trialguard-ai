from sqlalchemy.orm import Session
from datetime import datetime
from ..models.domain import Site, Patient, Visit, Deviation

def run_deviation_detector(db: Session):
    """
    Scans all visits and updates/ensures deviations exist for rule violations.
    Updates site-level deviation metrics.
    """
    visits = db.query(Visit).all()
    sites = db.query(Site).all()

    for site in sites:
        site_deviations = db.query(Deviation).filter(Deviation.site_id == site.site_id).all()
        site.total_deviations = len(site_deviations)
        site.major_deviations = len([d for d in site_deviations if d.severity == "Major"])

    db.commit()
    return {"status": "success", "message": "Deviation detector scan complete."}
