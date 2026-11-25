from datetime import datetime, timezone
from typing import Optional
from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.session import UserSession
from app.models.user import User
from app.utils.security import hash_session_token, verify_csrf_token


def _ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def get_optional_session(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[UserSession]:
    settings = get_settings()
    raw_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not raw_token:
        return None
    token_hash = hash_session_token(raw_token)
    session = (
        db.query(UserSession)
        .filter(
            UserSession.session_token_hash == token_hash,
            UserSession.revoked.is_(False),
        )
        .first()
    )
    if not session:
        return None
    now = datetime.now(timezone.utc)
    if _ensure_utc(session.expires_at) <= now:
        return None
    if not session.user or session.user.status != "active":
        return None
    return session


def get_optional_user(
    session: Optional[UserSession] = Depends(get_optional_session),
) -> Optional[User]:
    return session.user if session else None


def get_current_session(
    session: Optional[UserSession] = Depends(get_optional_session),
) -> UserSession:
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to continue.",
        )
    return session


def get_current_user(
    session: UserSession = Depends(get_current_session),
) -> User:
    return session.user


def require_csrf(
    request: Request,
    x_csrf_token: Optional[str] = Header(default=None, alias="X-CSRF-Token"),
    session: UserSession = Depends(get_current_session),
) -> UserSession:
    settings = get_settings()
    csrf_cookie = request.cookies.get(settings.CSRF_COOKIE_NAME)
    if not verify_csrf_token(csrf_cookie, x_csrf_token, session.csrf_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing CSRF token.",
        )
    return session


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required.",
        )
    return current_user
