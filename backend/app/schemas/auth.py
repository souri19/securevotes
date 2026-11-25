from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
import re

VOTER_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9\-]{3,31}$")


class LoginRequest(BaseModel):
    identifier: Optional[str] = Field(default=None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def ensure_identifier(self):
        if not self.identifier and not self.email:
            raise ValueError("Please provide your Email address or Voter ID.")
        return self

    @property
    def resolved_identifier(self) -> str:
        return (self.identifier or str(self.email or "")).strip()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    voter_id: str = Field(min_length=4, max_length=32)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("voter_id")
    @classmethod
    def validate_voter_id(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not VOTER_ID_PATTERN.match(cleaned):
            raise ValueError(
                "Voter ID must be 4–32 characters using letters, numbers, or hyphens (e.g. VID-2026-4091)."
            )
        return cleaned


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    voter_id: str
    role: Literal["voter", "admin"]
    status: Literal["active", "suspended"]
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthSessionResponse(BaseModel):
    user: UserPublic
    csrf_token: str
    demo_notice: str = (
        "Prototype session active. Simulated demo accounts only; not for production elections."
    )
