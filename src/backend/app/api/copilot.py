from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..schemas.schemas import CopilotQueryRequest, CopilotQueryResponse
from ..services.ai_copilot import process_copilot_query

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])

@router.post("", response_model=CopilotQueryResponse)
async def query_copilot(request: CopilotQueryRequest, db: Session = Depends(get_db)):
    res = await process_copilot_query(
        db,
        prompt=request.prompt,
        context_site_id=request.context_site_id
    )
    return res
