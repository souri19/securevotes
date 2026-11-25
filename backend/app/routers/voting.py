from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_csrf
from app.models.user import User
from app.schemas.ballot import DemoBallotReceipt, DemoBallotSubmitRequest, VotingEligibilityResponse
from app.services.voting_service import check_voting_eligibility, submit_demo_ballot

router = APIRouter(prefix="/api/voting", tags=["Demo Voting Booth"])


@router.get("/eligibility/{election_id}", response_model=VotingEligibilityResponse)
def get_eligibility(
    election_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return check_voting_eligibility(db, election_id, current_user)


@router.post("/submit", response_model=DemoBallotReceipt, status_code=status.HTTP_201_CREATED)
def cast_demo_ballot(
    payload: DemoBallotSubmitRequest,
    current_user: User = Depends(get_current_user),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    return submit_demo_ballot(db, payload.election_id, payload.candidate_id, current_user)
