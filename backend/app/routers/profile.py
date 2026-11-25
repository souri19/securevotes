from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_csrf
from app.models.ballot import VoterParticipationLock
from app.models.election import Election
from app.models.user import User
from app.schemas.auth import UserPublic
from app.schemas.user import ParticipationHistoryItem, PasswordChangeRequest, ProfileUpdateRequest
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.patch("", response_model=UserPublic)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    current_user.name = payload.name.strip()
    db.commit()
    db.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.post("/password")
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully."}


@router.get("/participation", response_model=List[ParticipationHistoryItem])
def get_participation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(VoterParticipationLock, Election)
        .join(Election, VoterParticipationLock.election_id == Election.id)
        .filter(VoterParticipationLock.user_id == current_user.id)
        .order_by(VoterParticipationLock.participated_at.desc())
        .all()
    )
    return [
        ParticipationHistoryItem(
            election_id=election.id,
            election_title=election.title,
            election_status=election.status,
            participated_at=lock.participated_at,
        )
        for lock, election in rows
    ]
