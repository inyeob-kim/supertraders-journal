from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from app.core.settings import get_settings

settings = get_settings()


def create_access_token(
    subject: str,
    expires_minutes: int | None = None,
    extra: dict[str, Any] | None = None,
) -> str:
    expire_delta = timedelta(
        minutes=expires_minutes or settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire = datetime.now(timezone.utc) + expire_delta
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )

