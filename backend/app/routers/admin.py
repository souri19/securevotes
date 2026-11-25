from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin, require_csrf
from app.models.ballot import VoterParticipationLock
from app.models.user import User
from app.schemas.audit import AuditEventOut
from app.schemas.candidate import CandidateCreate, CandidateOut, CandidateUpdate
from app.schemas.election import (
    ElectionCreate,
    ElectionDetailOut,
    ElectionOut,
    ElectionStatusUpdate,
    ElectionUpdate,
)
from app.schemas.results import PlatformOverviewStats
from app.schemas.user import AdminUserUpdateRequest, UserSummary
from app.services.audit_service import list_audit_events, record_audit_event
from app.services.candidate_service import create_candidate, delete_candidate, update_candidate
from app.services.election_service import (
    create_election,
    delete_election,
    list_elections,
    update_election,
    update_election_status,
)
from app.services.results_service import get_platform_overview

router = APIRouter(prefix="/api/admin", tags=["Administration"])


@router.get("/overview", response_model=PlatformOverviewStats)
def admin_overview(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_platform_overview(db)


@router.get("/elections", response_model=List[ElectionOut])
def admin_list_elections(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return list_elections(
        db,
        status_filter=status,
        search=search,
        include_drafts=True,
        user=admin,
    )


@router.post("/elections", response_model=ElectionOut, status_code=status.HTTP_201_CREATED)
def admin_create_election(
    payload: ElectionCreate,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return create_election(db, payload, admin)


@router.patch("/elections/{election_id}", response_model=ElectionDetailOut)
def admin_update_election(
    election_id: int,
    payload: ElectionUpdate,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return update_election(db, election_id, payload, admin)


@router.patch("/elections/{election_id}/status", response_model=ElectionDetailOut)
def admin_update_election_status(
    election_id: int,
    payload: ElectionStatusUpdate,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return update_election_status(db, election_id, payload.status, admin)


@router.delete("/elections/{election_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_election(
    election_id: int,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    delete_election(db, election_id, admin)


@router.post("/candidates", response_model=CandidateOut, status_code=status.HTTP_201_CREATED)
def admin_create_candidate(
    payload: CandidateCreate,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return create_candidate(db, payload, admin)


@router.patch("/candidates/{candidate_id}", response_model=CandidateOut)
def admin_update_candidate(
    candidate_id: int,
    payload: CandidateUpdate,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return update_candidate(db, candidate_id, payload, admin)


@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_candidate(
    candidate_id: int,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    delete_candidate(db, candidate_id, admin)


@router.get("/users", response_model=List[UserSummary])
def admin_list_users(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc(), User.id.asc()).all()
    counts = dict(
        db.query(VoterParticipationLock.user_id, func.count(VoterParticipationLock.id))
        .group_by(VoterParticipationLock.user_id)
        .all()
    )
    return [
        UserSummary(
            id=u.id,
            name=u.name,
            email=u.email,
            voter_id=u.voter_id,
            role=u.role,
            status=u.status,
            created_at=u.created_at,
            participated_elections_count=counts.get(u.id, 0),
        )
        for u in users
    ]


@router.patch("/users/{user_id}", response_model=UserSummary)
def admin_update_user(
    user_id: int,
    payload: AdminUserUpdateRequest,
    admin: User = Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if target.id == admin.id and payload.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own administrator account.",
        )
    if target.id == admin.id and payload.role == "voter":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote your own administrator account.",
        )

    if payload.role is not None:
        target.role = payload.role
    if payload.status is not None:
        target.status = payload.status

    record_audit_event(
        db,
        event_type="ADMIN_USER_UPDATED",
        metadata={"target_user_id": target.id, "status": target.status, "role": target.role},
    )
    db.commit()
    db.refresh(target)

    count = (
        db.query(func.count(VoterParticipationLock.id))
        .filter(VoterParticipationLock.user_id == target.id)
        .scalar()
        or 0
    )
    return UserSummary(
        id=target.id,
        name=target.name,
        email=target.email,
        voter_id=target.voter_id,
        role=target.role,
        status=target.status,
        created_at=target.created_at,
        participated_elections_count=count,
    )


@router.get("/logs", response_model=List[AuditEventOut])
def admin_audit_logs(
    event_type: Optional[str] = Query(default=None),
    election_id: Optional[int] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return list_audit_events(db, limit=limit, event_type=event_type, election_id=election_id)
