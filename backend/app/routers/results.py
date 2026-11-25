from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.results import ElectionResultsOut, PlatformOverviewStats
from app.services.results_service import get_election_results, get_platform_overview

router = APIRouter(prefix="/api/results", tags=["Results"])


@router.get("/overview", response_model=PlatformOverviewStats)
def platform_overview(db: Session = Depends(get_db)):
    return get_platform_overview(db)


@router.get("/{election_id}", response_model=ElectionResultsOut)
def election_results(election_id: int, db: Session = Depends(get_db)):
    return get_election_results(db, election_id)
