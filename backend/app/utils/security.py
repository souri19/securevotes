import hashlib
import hmac
import secrets
from pwdlib import PasswordHash

from app.config import get_settings

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hasher.verify(plain_password, hashed_password)
    except Exception:
        return False


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(raw_token: str) -> str:
    settings = get_settings()
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        raw_token.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_csrf_token(cookie_token: str | None, header_token: str | None, session_csrf: str) -> bool:
    if not cookie_token or not header_token or not session_csrf:
        return False
    return (
        hmac.compare_digest(cookie_token, session_csrf)
        and hmac.compare_digest(header_token, session_csrf)
    )


def generate_demo_receipt_ref() -> str:
    # Unlinkable random receipt identifier for the simulated demo booth
    return f"SV-DEMO-{secrets.token_hex(6).upper()}"
