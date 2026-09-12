from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.session import get_db
from ..models.domain import Deviation
from ..schemas.schemas import DeviationSchema
from ..services.deviation_detector import run_deviation_detector

router = APIRouter(prefix="/api/deviations", tags=["Deviations"])

@router.get("", response_model=List[DeviationSchema])
def list_deviations(
    site_id: Optional[str] = None,
    severity: Optional[str] = None,
    deviation_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Deviation)
    if site_id:
        query = query.filter(Deviation.site_id == site_id)
    if severity:
        query = query.filter(Deviation.severity == severity)
    if deviation_type:
        query = query.filter(Deviation.deviation_type == deviation_type)

    return query.all()

@router.get("/{deviation_id}", response_model=DeviationSchema)
def get_deviation_detail(deviation_id: str, db: Session = Depends(get_db)):
    dev = db.query(Deviation).filter(Deviation.deviation_id == deviation_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Deviation not found")
    return dev

@router.post("/analyze")
def trigger_analysis(db: Session = Depends(get_db)):
    result = run_deviation_detector(db)
    return result
