from datetime import datetime
from pydantic import BaseModel, Field


class DemoBallotSubmitRequest(BaseModel):
    election_id: int = Field(ge=1)
    candidate_id: int = Field(ge=1)


class DemoBallotReceipt(BaseModel):
    receipt_ref: str
    election_id: int
    election_title: str
    submitted_at: datetime
    status: str = "simulated_recorded"
    privacy_notice: str = (
        "Demo simulation receipt: Your ballot selection was recorded without storing "
        "your identity alongside your choice. This prototype does not constitute a "
        "cryptographically verifiable production vote."
    )


class VotingEligibilityResponse(BaseModel):
    election_id: int
    eligible: bool
    has_voted: bool
    reason: str
