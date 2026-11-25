from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AdminUserUpdateRequest(BaseModel):
    role: Optional[Literal["voter", "admin"]] = None
    status: Optional[Literal["active", "suspended"]] = None


class UserSummary(BaseModel):
    id: int
    name: str
    email: EmailStr
    voter_id: str
    role: Literal["voter", "admin"]
    status: Literal["active", "suspended"]
    created_at: datetime
    participated_elections_count: int = 0

    model_config = {"from_attributes": True}


class ParticipationHistoryItem(BaseModel):
    election_id: int
    election_title: str
    election_status: str
    participated_at: datetime
    privacy_note: str = "Participation recorded without linking your identity to any ballot choice."
