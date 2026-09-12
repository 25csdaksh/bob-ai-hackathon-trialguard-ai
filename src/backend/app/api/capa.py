from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.session import get_db
from ..models.domain import CAPAReport
from ..schemas.schemas import CAPAReportSchema, CAPARequest
from ..services.capa_generator import generate_capa_report

router = APIRouter(prefix="/api/capa", tags=["CAPA"])

@router.get("", response_model=List[CAPAReportSchema])
def list_capa_reports(site_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CAPAReport)
    if site_id:
        query = query.filter(CAPAReport.site_id == site_id)
    return query.order_by(CAPAReport.created_at.desc()).all()

@router.post("", response_model=CAPAReportSchema)
def create_capa_report(request: CAPARequest, db: Session = Depends(get_db)):
    try:
        capa = generate_capa_report(
            db,
            site_id=request.site_id,
            deviation_id=request.deviation_id,
            custom_notes=request.custom_notes
        )
        return capa
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
