from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

ElectionStatusType = Literal["draft", "upcoming", "active", "completed", "archived"]


class CandidateBrief(BaseModel):
    id: int
    name: str
    position: str
    organization: str
    biography: str
    manifesto: str
    vision: str
    objectives: List[str]
    accent_color: str
    election_id: int


class ElectionBase(BaseModel):
    title: str = Field(min_length=4, max_length=200)
    description: str = Field(min_length=10, max_length=4000)
    election_type: str = Field(min_length=2, max_length=80)
    eligibility_note: str = Field(default="All registered demo voters", max_length=300)
    start_time: datetime
    end_time: datetime
    eligible_voter_count: int = Field(default=500, ge=1, le=10000000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class ElectionCreate(ElectionBase):
    status: ElectionStatusType = "upcoming"


class ElectionUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=4, max_length=200)
    description: Optional[str] = Field(default=None, min_length=10, max_length=4000)
    election_type: Optional[str] = Field(default=None, min_length=2, max_length=80)
    eligibility_note: Optional[str] = Field(default=None, max_length=300)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eligible_voter_count: Optional[int] = Field(default=None, ge=1, le=10000000)


class ElectionStatusUpdate(BaseModel):
    status: ElectionStatusType


class ElectionOut(BaseModel):
    id: int
    title: str
    description: str
    election_type: str
    eligibility_note: str
    start_time: datetime
    end_time: datetime
    status: ElectionStatusType
    eligible_voter_count: int
    created_at: datetime
    candidate_count: int = 0
    total_ballots: int = 0
    participation_rate: float = 0.0
    has_voted: bool = False


class ElectionDetailOut(ElectionOut):
    candidates: List[CandidateBrief] = []
