import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..models.domain import Site, Patient, Visit, Deviation
from ..schemas.schemas import DashboardMetrics

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    patients_count = db.query(Patient).count()
    sites_count = db.query(Site).count()
    visits_count = db.query(Visit).count()
    deviations = db.query(Deviation).all()

    total_deviations = len(deviations)
    major = len([d for d in deviations if d.severity == "Major"])
    minor = len([d for d in deviations if d.severity == "Minor"])
    admin = len([d for d in deviations if d.severity == "Administrative"])

    sites = db.query(Site).all()
    high_risk_sites_count = len([s for s in sites if s.risk_score >= 60])

    site_ranking = []
    for s in sorted(sites, key=lambda x: x.risk_score, reverse=True):
        site_ranking.append({
            "site_id": s.site_id,
            "site_name": s.site_name,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "total_deviations": s.total_deviations,
            "major_deviations": s.major_deviations,
            "trend": s.trend
        })

    # Deviation type categories
    type_counts = {}
    for d in deviations:
        type_counts[d.deviation_type] = type_counts.get(d.deviation_type, 0) + 1

    deviation_categories = [{"category": k, "count": v} for k, v in type_counts.items()]

    # Mock timeline trend data
    recent_trend = [
        {"period": "Week 1", "major": 1, "minor": 3, "admin": 2},
        {"period": "Week 2", "major": 2, "minor": 4, "admin": 1},
        {"period": "Week 3", "major": 3, "minor": 5, "admin": 3},
        {"period": "Week 4", "major": major - 6 if major >= 6 else major, "minor": minor - 12 if minor >= 12 else minor, "admin": admin - 6 if admin >= 6 else admin}
    ]

    return {
        "total_patients": patients_count,
        "total_sites": sites_count,
        "total_visits": visits_count,
        "total_deviations": total_deviations,
        "major_deviations": major,
        "minor_deviations": minor,
        "administrative_deviations": admin,
        "high_risk_sites_count": high_risk_sites_count,
        "severity_distribution": {
            "Major": major,
            "Minor": minor,
            "Administrative": admin
        },
        "site_risk_ranking": site_ranking,
        "recent_deviation_trend": recent_trend,
        "deviation_categories": deviation_categories
    }
