from datetime import datetime, timedelta, timezone
from typing import Tuple
from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.session import UserSession
from app.models.user import User
from app.services.audit_service import record_audit_event
from app.utils.security import (
    generate_csrf_token,
    generate_session_token,
    hash_password,
    hash_session_token,
    verify_password,
)


def authenticate_user(db: Session, identifier: str, password: str) -> User:
    raw = identifier.strip()
    if "@" in raw:
        user = db.query(User).filter(User.email == raw.lower()).first()
    else:
        user = db.query(User).filter(User.voter_id == raw.upper()).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Email/Voter ID or password.",
        )
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This demo account is currently suspended.",
        )
    return user


def register_voter(db: Session, name: str, email: str, voter_id: str, password: str) -> User:
    normalized_email = email.strip().lower()
    normalized_voter_id = voter_id.strip().upper()

    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )
    if db.query(User).filter(User.voter_id == normalized_voter_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Voter ID is already registered. Each Voter ID may only register once.",
        )

    user = User(
        name=name.strip(),
        email=normalized_email,
        voter_id=normalized_voter_id,
        password_hash=hash_password(password),
        role="voter",
        status="active",
    )
    db.add(user)
    db.flush()

    record_audit_event(
        db,
        event_type="DEMO_VOTER_REGISTERED",
        metadata={"role": "voter", "registration_mode": "voter_id_verified_demo"},
    )
    db.commit()
    db.refresh(user)
    return user


def create_user_session(db: Session, user: User) -> Tuple[UserSession, str, str]:
    settings = get_settings()
    raw_token = generate_session_token()
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.SESSION_EXPIRE_HOURS)

    session = UserSession(
        session_token_hash=hash_session_token(raw_token),
        csrf_token=csrf_token,
        user_id=user.id,
        expires_at=expires_at,
        revoked=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session, raw_token, csrf_token


def revoke_session(db: Session, session: UserSession) -> None:
    session.revoked = True
    db.commit()


def set_session_cookies(response: Response, raw_token: str, csrf_token: str) -> None:
    settings = get_settings()
    max_age = settings.SESSION_EXPIRE_HOURS * 3600
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/",
    )
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/",
    )


def clear_session_cookies(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(key=settings.CSRF_COOKIE_NAME, path="/")
