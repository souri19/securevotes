import time
from collections import defaultdict, deque
from threading import Lock
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings


class AuthRateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding window rate limiter for authentication endpoints
    to mitigate brute-force login and registration abuse in the prototype.
    """

    RATE_LIMITED_PATHS = {"/api/auth/login", "/api/auth/register"}

    def __init__(self, app):
        super().__init__(app)
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()

    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path in self.RATE_LIMITED_PATHS:
            settings = get_settings()
            client_ip = request.client.host if request.client else "unknown"
            key = f"{client_ip}:{request.url.path}"
            now = time.monotonic()
            window = settings.AUTH_RATE_LIMIT_WINDOW_SECONDS
            limit = settings.AUTH_RATE_LIMIT_MAX_REQUESTS

            with self._lock:
                bucket = self._hits[key]
                while bucket and (now - bucket[0]) > window:
                    bucket.popleft()
                if len(bucket) >= limit:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Too many authentication attempts. Please wait a moment before trying again."
                        },
                    )
                bucket.append(now)

        return await call_next(request)
