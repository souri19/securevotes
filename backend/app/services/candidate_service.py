import json
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.election import Election
from app.models.user import User
from app.schemas.candidate import CandidateCreate, CandidateOut, CandidateUpdate
from app.services.audit_service import record_audit_event


def parse_objectives(raw_json: str) -> List[str]:
    try:
        parsed = json.loads(raw_json or "[]")
        return [str(x) for x in parsed] if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def to_candidate_out(candidate: Candidate, election: Optional[Election] = None) -> CandidateOut:
    el = election or candidate.election
    return CandidateOut(
        id=candidate.id,
        name=candidate.name,
        position=candidate.position,
        organization=candidate.organization,
        biography=candidate.biography,
        manifesto=candidate.manifesto,
        vision=candidate.vision,
        objectives=parse_objectives(candidate.objectives_json),
        accent_color=candidate.accent_color,
        election_id=candidate.election_id,
        election_title=el.title if el else None,
        election_status=el.status if el else None,
    )


def list_candidates(
    db: Session,
    election_id: Optional[int] = None,
    search: Optional[str] = None,
) -> List[CandidateOut]:
    query = db.query(Candidate).join(Election, Candidate.election_id == Election.id)
    if election_id is not None:
        query = query.filter(Candidate.election_id == election_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            Candidate.name.ilike(term)
            | Candidate.organization.ilike(term)
            | Candidate.position.ilike(term)
        )
    candidates = query.order_by(Candidate.election_id.asc(), Candidate.id.asc()).all()
    return [to_candidate_out(c) for c in candidates]


def get_candidate_or_404(db: Session, candidate_id: int) -> Candidate:
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found.",
        )
    return candidate


def create_candidate(db: Session, payload: CandidateCreate, admin: User) -> CandidateOut:
    election = db.query(Election).filter(Election.id == payload.election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target election not found.",
        )

    candidate = Candidate(
        name=payload.name.strip(),
        position=payload.position.strip(),
        organization=payload.organization.strip(),
        biography=payload.biography.strip(),
        manifesto=payload.manifesto.strip(),
        vision=payload.vision.strip(),
        objectives_json=json.dumps([o.strip() for o in payload.objectives if o.strip()]),
        accent_color=payload.accent_color.strip(),
        election_id=payload.election_id,
    )
    db.add(candidate)
    db.flush()

    record_audit_event(
        db,
        event_type="CANDIDATE_ADDED",
        election_id=election.id,
        metadata={
            "candidate_id": candidate.id,
            "position": candidate.position,
            "actor_role": admin.role,
        },
    )
    db.commit()
    db.refresh(candidate)
    return to_candidate_out(candidate, election)


def update_candidate(
    db: Session, candidate_id: int, payload: CandidateUpdate, admin: User
) -> CandidateOut:
    candidate = get_candidate_or_404(db, candidate_id)
    data = payload.model_dump(exclude_unset=True)

    if "election_id" in data:
        election = db.query(Election).filter(Election.id == data["election_id"]).first()
        if not election:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target election not found.",
            )
        candidate.election_id = data["election_id"]

    if "objectives" in data and data["objectives"] is not None:
        candidate.objectives_json = json.dumps(
            [o.strip() for o in data["objectives"] if o.strip()]
        )

    for field in ("name", "position", "organization", "biography", "manifesto", "vision", "accent_color"):
        if field in data and data[field] is not None:
            setattr(candidate, field, data[field].strip())

    record_audit_event(
        db,
        event_type="CANDIDATE_UPDATED",
        election_id=candidate.election_id,
        metadata={"candidate_id": candidate.id, "actor_role": admin.role},
    )
    db.commit()
    db.refresh(candidate)
    return to_candidate_out(candidate)


def delete_candidate(db: Session, candidate_id: int, admin: User) -> None:
    candidate = get_candidate_or_404(db, candidate_id)
    election_id = candidate.election_id
    db.delete(candidate)
    record_audit_event(
        db,
        event_type="CANDIDATE_REMOVED",
        election_id=election_id,
        metadata={"candidate_id": candidate_id, "actor_role": admin.role},
    )
    db.commit()
