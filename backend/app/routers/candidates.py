from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.candidate import CandidateOut
from app.services.candidate_service import get_candidate_or_404, list_candidates, to_candidate_out

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


@router.get("", response_model=List[CandidateOut])
def get_candidates(
    election_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
):
    return list_candidates(db, election_id=election_id, search=search)


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
):
    candidate = get_candidate_or_404(db, candidate_id)
    return to_candidate_out(candidate)
