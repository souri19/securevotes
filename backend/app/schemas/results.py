from datetime import datetime
from typing import List
from pydantic import BaseModel


class CandidateResultItem(BaseModel):
    candidate_id: int
    name: str
    position: str
    organization: str
    accent_color: str
    votes: int
    percentage: float


class ParticipationPoint(BaseModel):
    timestamp: datetime
    label: str
    participation_count: int


class ElectionResultsOut(BaseModel):
    election_id: int
    title: str
    election_type: str
    status: str
    start_time: datetime
    end_time: datetime
    eligible_voter_count: int
    total_votes: int
    participation_percentage: float
    is_simulated: bool = True
    disclaimer: str = (
        "Simulated demonstration results. Figures reflect prototype database state and "
        "must not be interpreted as certified real-world election outcomes."
    )
    candidates: List[CandidateResultItem]
    timeline: List[ParticipationPoint]


class PlatformOverviewStats(BaseModel):
    total_elections: int
    active_elections: int
    upcoming_elections: int
    completed_elections: int
    total_candidates: int
    total_simulated_ballots: int
    registered_demo_voters: int
    average_participation_rate: float
