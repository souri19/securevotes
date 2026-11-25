from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_optional_user
from app.models.user import User
from app.schemas.election import ElectionDetailOut, ElectionOut
from app.services.election_service import get_election_detail, list_elections

router = APIRouter(prefix="/api/elections", tags=["Elections"])


@router.get("", response_model=List[ElectionOut])
def get_elections(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=120),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    return list_elections(
        db,
        status_filter=status,
        search=search,
        include_drafts=False,
        user=current_user,
    )


@router.get("/{election_id}", response_model=ElectionDetailOut)
def get_election(
    election_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    return get_election_detail(db, election_id, user=current_user, allow_draft=False)
