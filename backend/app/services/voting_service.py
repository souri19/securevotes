from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.ballot import DemoBallot, VoterParticipationLock
from app.models.candidate import Candidate
from app.models.election import Election
from app.models.participation import ElectionParticipation
from app.models.user import User
from app.schemas.ballot import DemoBallotReceipt, VotingEligibilityResponse
from app.services.audit_service import record_audit_event
from app.utils.security import generate_demo_receipt_ref


def check_voting_eligibility(
    db: Session, election_id: int, user: User
) -> VotingEligibilityResponse:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election or election.status == "draft":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    has_voted = (
        db.query(VoterParticipationLock.id)
        .filter(
            VoterParticipationLock.election_id == election_id,
            VoterParticipationLock.user_id == user.id,
        )
        .first()
        is not None
    )

    if user.status != "active":
        return VotingEligibilityResponse(
            election_id=election_id,
            eligible=False,
            has_voted=has_voted,
            reason="Your demo account is not currently active.",
        )
    if has_voted:
        return VotingEligibilityResponse(
            election_id=election_id,
            eligible=False,
            has_voted=True,
            reason="You have already submitted a simulated ballot for this election.",
        )
    if election.status != "active":
        return VotingEligibilityResponse(
            election_id=election_id,
            eligible=False,
            has_voted=False,
            reason=f"Voting is unavailable because this election is currently '{election.status}'.",
        )
    return VotingEligibilityResponse(
        election_id=election_id,
        eligible=True,
        has_voted=False,
        reason="Eligible to participate in this simulated demo election.",
    )


def submit_demo_ballot(
    db: Session, election_id: int, candidate_id: int, user: User
) -> DemoBallotReceipt:
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Suspended accounts cannot submit demo ballots.",
        )

    election = db.query(Election).filter(Election.id == election_id).first()
    if not election or election.status == "draft":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )
    if election.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit ballot: election is '{election.status}', not active.",
        )

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id, Candidate.election_id == election_id)
        .first()
    )
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected candidate does not belong to this election.",
        )

    existing_lock = (
        db.query(VoterParticipationLock)
        .filter(
            VoterParticipationLock.election_id == election_id,
            VoterParticipationLock.user_id == user.id,
        )
        .first()
    )
    if existing_lock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Repeated submission blocked: you have already participated in this demo election.",
        )

    receipt_ref = generate_demo_receipt_ref()
    now = datetime.now(timezone.utc)

    try:
        # 1. Record participation lock (user_id + election_id only; NO candidate_id or ballot_id)
        lock = VoterParticipationLock(
            election_id=election_id,
            user_id=user.id,
            participated_at=now,
        )
        db.add(lock)

        # 2. Record anonymized demo ballot (NO user_id or PII)
        ballot = DemoBallot(
            election_id=election_id,
            candidate_id=candidate_id,
            submission_timestamp=now,
            demo_session_ref=receipt_ref,
        )
        db.add(ballot)
        db.flush()

        # 3. Record aggregate participation snapshot
        total_ballots = (
            db.query(func.count(DemoBallot.id))
            .filter(DemoBallot.election_id == election_id)
            .scalar()
            or 0
        )
        db.add(
            ElectionParticipation(
                election_id=election_id,
                participation_count=total_ballots,
                timestamp=now,
            )
        )

        # 4. Record non-sensitive audit summary (NO voter identity, NO candidate choice)
        record_audit_event(
            db,
            event_type="DEMO_BALLOT_RECORDED",
            election_id=election_id,
            metadata={
                "simulation": True,
                "receipt_prefix": receipt_ref[:11],
                "aggregate_count": total_ballots,
            },
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Repeated submission blocked: you have already participated in this demo election.",
        )

    return DemoBallotReceipt(
        receipt_ref=receipt_ref,
        election_id=election.id,
        election_title=election.title,
        submitted_at=now,
    )
