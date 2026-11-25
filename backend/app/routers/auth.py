from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_session, require_csrf
from app.models.session import UserSession
from app.schemas.auth import AuthSessionResponse, LoginRequest, RegisterRequest, UserPublic
from app.services.auth_service import (
    authenticate_user,
    clear_session_cookies,
    create_user_session,
    register_voter,
    revoke_session,
    set_session_cookies,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=AuthSessionResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, payload.resolved_identifier, payload.password)
    _session, raw_token, csrf_token = create_user_session(db, user)
    set_session_cookies(response, raw_token, csrf_token)
    return AuthSessionResponse(
        user=UserPublic.model_validate(user),
        csrf_token=csrf_token,
    )


@router.post("/register", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = register_voter(db, payload.name, payload.email, payload.voter_id, payload.password)
    _session, raw_token, csrf_token = create_user_session(db, user)
    set_session_cookies(response, raw_token, csrf_token)
    return AuthSessionResponse(
        user=UserPublic.model_validate(user),
        csrf_token=csrf_token,
    )


@router.post("/logout")
def logout(
    response: Response,
    session: UserSession = Depends(require_csrf),
    db: Session = Depends(get_db),
):
    revoke_session(db, session)
    clear_session_cookies(response)
    return {"message": "Signed out cleanly."}


@router.get("/me", response_model=AuthSessionResponse)
def me(
    session: UserSession = Depends(get_current_session),
):
    return AuthSessionResponse(
        user=UserPublic.model_validate(session.user),
        csrf_token=session.csrf_token,
    )
