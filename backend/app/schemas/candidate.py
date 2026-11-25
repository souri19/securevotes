from typing import List, Optional
from pydantic import BaseModel, Field


class CandidateCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    position: str = Field(min_length=2, max_length=120)
    organization: str = Field(min_length=2, max_length=160)
    biography: str = Field(min_length=10, max_length=3000)
    manifesto: str = Field(min_length=10, max_length=4000)
    vision: str = Field(default="", max_length=2000)
    objectives: List[str] = Field(default_factory=list, max_length=10)
    accent_color: str = Field(default="#C8A96A", max_length=20)
    election_id: int = Field(ge=1)


class CandidateUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    position: Optional[str] = Field(default=None, min_length=2, max_length=120)
    organization: Optional[str] = Field(default=None, min_length=2, max_length=160)
    biography: Optional[str] = Field(default=None, min_length=10, max_length=3000)
    manifesto: Optional[str] = Field(default=None, min_length=10, max_length=4000)
    vision: Optional[str] = Field(default=None, max_length=2000)
    objectives: Optional[List[str]] = Field(default=None, max_length=10)
    accent_color: Optional[str] = Field(default=None, max_length=20)
    election_id: Optional[int] = Field(default=None, ge=1)


class CandidateOut(BaseModel):
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
    election_title: Optional[str] = None
    election_status: Optional[str] = None
