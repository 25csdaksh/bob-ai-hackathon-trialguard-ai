import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.session import get_db
from ..models.domain import Site, Patient, Visit, Deviation
from ..schemas.schemas import SiteDetail, DeviationSchema

router = APIRouter(prefix="/api/sites", tags=["Sites"])

@router.get("", response_model=List[SiteDetail])
def list_sites(risk_level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Site)
    if risk_level:
        query = query.filter(Site.risk_level == risk_level)

    sites = query.all()
    results = []
    for s in sites:
        factors = json.loads(s.risk_factors) if s.risk_factors else []
        results.append({
            "site_id": s.site_id,
            "site_name": s.site_name,
            "location": s.location,
            "principal_investigator": s.principal_investigator,
            "total_patients": s.total_patients,
            "total_visits": s.total_visits,
            "total_deviations": s.total_deviations,
            "major_deviations": s.major_deviations,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "risk_factors": factors,
            "trend": s.trend
        })
    return results

@router.get("/{site_id}")
def get_site_details(site_id: str, db: Session = Depends(get_db)):
    s = db.query(Site).filter(Site.site_id == site_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Site not found")

    factors = json.loads(s.risk_factors) if s.risk_factors else []
    deviations = db.query(Deviation).filter(Deviation.site_id == site_id).all()
    patients = db.query(Patient).filter(Patient.site_id == site_id).all()

    return {
        "site": {
            "site_id": s.site_id,
            "site_name": s.site_name,
            "location": s.location,
            "principal_investigator": s.principal_investigator,
            "total_patients": len(patients),
            "total_visits": s.total_visits,
            "total_deviations": len(deviations),
            "major_deviations": len([d for d in deviations if d.severity == "Major"]),
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "risk_factors": factors,
            "trend": s.trend
        },
        "patients_count": len(patients),
        "deviations": deviations,
        "recommended_mitigations": [
            "Initiate protocol compliance retraining for site staff",
            "Perform 100% source data verification (SDV) on all major deviation visits",
            "Establish bi-weekly quality check meetings with Principal Investigator",
            "Deploy automated patient reminder alerts to reduce missed visits"
        ]
    }
