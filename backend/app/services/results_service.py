from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ballot import DemoBallot
from app.models.candidate import Candidate
from app.models.election import Election
from app.models.participation import ElectionParticipation
from app.models.user import User
from app.schemas.results import (
    CandidateResultItem,
    ElectionResultsOut,
    ParticipationPoint,
    PlatformOverviewStats,
)


def get_election_results(db: Session, election_id: int) -> ElectionResultsOut:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election or election.status == "draft":
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

    tally_rows = (
        db.query(DemoBallot.candidate_id, func.count(DemoBallot.id))
        .filter(DemoBallot.election_id == election.id)
        .group_by(DemoBallot.candidate_id)
        .all()
    )
    tally_map = {cid: cnt for cid, cnt in tally_rows}
    total_votes = sum(tally_map.values())

    candidate_items = []
    for c in candidates:
        votes = tally_map.get(c.id, 0)
        pct = round((votes / total_votes) * 100.0, 1) if total_votes > 0 else 0.0
        candidate_items.append(
            CandidateResultItem(
                candidate_id=c.id,
                name=c.name,
                position=c.position,
                organization=c.organization,
                accent_color=c.accent_color,
                votes=votes,
                percentage=pct,
            )
        )
    candidate_items.sort(key=lambda x: x.votes, reverse=True)

    timeline_rows = (
        db.query(ElectionParticipation)
        .filter(ElectionParticipation.election_id == election.id)
        .order_by(ElectionParticipation.timestamp.asc(), ElectionParticipation.id.asc())
        .all()
    )
    timeline = [
        ParticipationPoint(
            timestamp=row.timestamp,
            label=row.timestamp.strftime("%b %d · %H:%M"),
            participation_count=row.participation_count,
        )
        for row in timeline_rows
    ]

    eligible = max(election.eligible_voter_count, 1)
    participation_pct = round(min((total_votes / eligible) * 100.0, 100.0), 1)

    return ElectionResultsOut(
        election_id=election.id,
        title=election.title,
        election_type=election.election_type,
        status=election.status,
        start_time=election.start_time,
        end_time=election.end_time,
        eligible_voter_count=election.eligible_voter_count,
        total_votes=total_votes,
        participation_percentage=participation_pct,
        candidates=candidate_items,
        timeline=timeline,
    )


def get_platform_overview(db: Session) -> PlatformOverviewStats:
    elections = db.query(Election).filter(Election.status != "draft").all()
    total_elections = len(elections)
    active_elections = sum(1 for e in elections if e.status == "active")
    upcoming_elections = sum(1 for e in elections if e.status == "upcoming")
    completed_elections = sum(1 for e in elections if e.status == "completed")

    total_candidates = db.query(func.count(Candidate.id)).scalar() or 0
    total_ballots = db.query(func.count(DemoBallot.id)).scalar() or 0
    registered_voters = db.query(func.count(User.id)).filter(User.role == "voter").scalar() or 0

    ballot_rows = (
        db.query(DemoBallot.election_id, func.count(DemoBallot.id))
        .group_by(DemoBallot.election_id)
        .all()
    )
    ballot_map = {eid: cnt for eid, cnt in ballot_rows}

    rates = []
    for e in elections:
        if e.status in ("active", "completed"):
            eligible = max(e.eligible_voter_count, 1)
            rates.append(min((ballot_map.get(e.id, 0) / eligible) * 100.0, 100.0))
    avg_rate = round(sum(rates) / len(rates), 1) if rates else 0.0

    return PlatformOverviewStats(
        total_elections=total_elections,
        active_elections=active_elections,
        upcoming_elections=upcoming_elections,
        completed_elections=completed_elections,
        total_candidates=total_candidates,
        total_simulated_ballots=total_ballots,
        registered_demo_voters=registered_voters,
        average_participation_rate=avg_rate,
    )
