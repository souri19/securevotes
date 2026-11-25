from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.audit import AuditEventOut, TransparencySummaryOut
from app.services.audit_service import get_transparency_summary, list_audit_events

router = APIRouter(prefix="/api/transparency", tags=["Transparency"])


@router.get("", response_model=TransparencySummaryOut)
def transparency_summary(db: Session = Depends(get_db)):
    return get_transparency_summary(db)


@router.get("/events", response_model=List[AuditEventOut])
def transparency_events(
    event_type: Optional[str] = Query(default=None),
    election_id: Optional[int] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return list_audit_events(db, limit=limit, event_type=event_type, election_id=election_id)
