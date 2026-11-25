from typing import Dict, List, Optional, Set
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ballot import DemoBallot, VoterParticipationLock
from app.models.candidate import Candidate
from app.models.election import Election
from app.models.user import User
from app.schemas.election import (
    CandidateBrief,
    ElectionCreate,
    ElectionDetailOut,
    ElectionOut,
    ElectionUpdate,
)
from app.services.audit_service import record_audit_event
from app.services.candidate_service import parse_objectives


def _build_election_out(
    election: Election,
    candidate_counts: Dict[int, int],
    ballot_counts: Dict[int, int],
    voted_ids: Set[int],
) -> ElectionOut:
    total_ballots = ballot_counts.get(election.id, 0)
    eligible = max(election.eligible_voter_count, 1)
    rate = round(min((total_ballots / eligible) * 100.0, 100.0), 1)
    return ElectionOut(
        id=election.id,
        title=election.title,
        description=election.description,
        election_type=election.election_type,
        eligibility_note=election.eligibility_note,
        start_time=election.start_time,
        end_time=election.end_time,
        status=election.status,
        eligible_voter_count=election.eligible_voter_count,
        created_at=election.created_at,
        candidate_count=candidate_counts.get(election.id, 0),
        total_ballots=total_ballots,
        participation_rate=rate,
        has_voted=election.id in voted_ids,
    )


def list_elections(
    db: Session,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    include_drafts: bool = False,
    user: Optional[User] = None,
) -> List[ElectionOut]:
    query = db.query(Election)
    if not include_drafts and status_filter != "draft":
        query = query.filter(Election.status != "draft")
    if status_filter and status_filter != "all":
        query = query.filter(Election.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            Election.title.ilike(term)
            | Election.description.ilike(term)
            | Election.election_type.ilike(term)
        )

    elections = query.order_by(Election.start_time.desc(), Election.id.asc()).all()

    cand_rows = (
        db.query(Candidate.election_id, func.count(Candidate.id))
        .group_by(Candidate.election_id)
        .all()
    )
    candidate_counts = {eid: cnt for eid, cnt in cand_rows}

    ballot_rows = (
        db.query(DemoBallot.election_id, func.count(DemoBallot.id))
        .group_by(DemoBallot.election_id)
        .all()
    )
    ballot_counts = {eid: cnt for eid, cnt in ballot_rows}

    voted_ids: Set[int] = set()
    if user:
        lock_rows = (
            db.query(VoterParticipationLock.election_id)
            .filter(VoterParticipationLock.user_id == user.id)
            .all()
        )
        voted_ids = {eid for (eid,) in lock_rows}

    return [
        _build_election_out(e, candidate_counts, ballot_counts, voted_ids)
        for e in elections
    ]


def get_election_detail(
    db: Session, election_id: int, user: Optional[User] = None, allow_draft: bool = False
) -> ElectionDetailOut:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election or (election.status == "draft" and not allow_draft):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    candidates = (
        db.query(Candidate)
        .filter(Candidate.election_id == election.id)
        .order_by(Candidate.id.asc())
        .all()
    )
    total_ballots = (
        db.query(func.count(DemoBallot.id))
        .filter(DemoBallot.election_id == election.id)
        .scalar()
        or 0
    )
    has_voted = False
    if user:
        has_voted = (
            db.query(VoterParticipationLock.id)
            .filter(
                VoterParticipationLock.election_id == election.id,
                VoterParticipationLock.user_id == user.id,
            )
            .first()
            is not None
        )

    eligible = max(election.eligible_voter_count, 1)
    rate = round(min((total_ballots / eligible) * 100.0, 100.0), 1)

    return ElectionDetailOut(
        id=election.id,
        title=election.title,
        description=election.description,
        election_type=election.election_type,
        eligibility_note=election.eligibility_note,
        start_time=election.start_time,
        end_time=election.end_time,
        status=election.status,
        eligible_voter_count=election.eligible_voter_count,
        created_at=election.created_at,
        candidate_count=len(candidates),
        total_ballots=total_ballots,
        participation_rate=rate,
        has_voted=has_voted,
        candidates=[
            CandidateBrief(
                id=c.id,
                name=c.name,
                position=c.position,
                organization=c.organization,
                biography=c.biography,
                manifesto=c.manifesto,
                vision=c.vision,
                objectives=parse_objectives(c.objectives_json),
                accent_color=c.accent_color,
                election_id=c.election_id,
            )
            for c in candidates
        ],
    )


def create_election(db: Session, payload: ElectionCreate, admin: User) -> ElectionOut:
    election = Election(
        title=payload.title.strip(),
        description=payload.description.strip(),
        election_type=payload.election_type.strip(),
        eligibility_note=payload.eligibility_note.strip(),
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status,
        eligible_voter_count=payload.eligible_voter_count,
    )
    db.add(election)
    db.flush()

    record_audit_event(
        db,
        event_type="ELECTION_CREATED",
        election_id=election.id,
        metadata={
            "title": election.title,
            "status": election.status,
            "actor_role": admin.role,
        },
    )
    db.commit()
    db.refresh(election)
    return _build_election_out(election, {}, {}, set())


def update_election(
    db: Session, election_id: int, payload: ElectionUpdate, admin: User
) -> ElectionDetailOut:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    data = payload.model_dump(exclude_unset=True)
    new_start = data.get("start_time", election.start_time)
    new_end = data.get("end_time", election.end_time)
    if new_end <= new_start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_time must be after start_time.",
        )

    for field in ("title", "description", "election_type", "eligibility_note"):
        if field in data and data[field] is not None:
            setattr(election, field, data[field].strip())
    for field in ("start_time", "end_time", "eligible_voter_count"):
        if field in data and data[field] is not None:
            setattr(election, field, data[field])

    record_audit_event(
        db,
        event_type="ELECTION_UPDATED",
        election_id=election.id,
        metadata={"updated_fields": sorted(data.keys()), "actor_role": admin.role},
    )
    db.commit()
    return get_election_detail(db, election.id, allow_draft=True)


def update_election_status(
    db: Session, election_id: int, new_status: str, admin: User
) -> ElectionDetailOut:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )
    old_status = election.status
    election.status = new_status
    record_audit_event(
        db,
        event_type="ELECTION_STATUS_CHANGED",
        election_id=election.id,
        metadata={
            "previous_status": old_status,
            "new_status": new_status,
            "actor_role": admin.role,
        },
    )
    db.commit()
    return get_election_detail(db, election.id, allow_draft=True)


def delete_election(db: Session, election_id: int, admin: User) -> None:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )
    title = election.title
    db.delete(election)
    record_audit_event(
        db,
        event_type="ELECTION_DELETED",
        election_id=None,
        metadata={"deleted_election_id": election_id, "title": title, "actor_role": admin.role},
    )
    db.commit()
