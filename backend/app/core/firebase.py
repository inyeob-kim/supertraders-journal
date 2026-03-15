"""
Firebase Admin SDK integration for ID token verification.
The frontend signs in with Firebase Auth and sends the ID token in the Authorization header.
This module verifies the token and exposes claims (firebase_uid, email, etc.).
"""

from dataclasses import dataclass
from typing import Any

from firebase_admin import App, auth, credentials, initialize_app

from app.core.settings import get_settings

_firebase_app: App | None = None


def get_firebase_app() -> App:
    """Get or create the Firebase Admin app (lazy init)."""
    global _firebase_app
    if _firebase_app is None:
        settings = get_settings()
        if not settings.FIREBASE_PROJECT_ID:
            raise ValueError(
                "FIREBASE_PROJECT_ID is required for Firebase token verification"
            )
        options: dict[str, Any] = {"project_id": settings.FIREBASE_PROJECT_ID}
        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        else:
            cred = credentials.ApplicationDefault()
        _firebase_app = initialize_app(cred, options)
    return _firebase_app


@dataclass(frozen=True)
class FirebaseClaims:
    """Claims extracted from a verified Firebase ID token."""

    firebase_uid: str
    email: str | None
    display_name: str | None
    photo_url: str | None


def verify_firebase_id_token(id_token: str) -> FirebaseClaims:
    """
    Verify a Firebase ID token and return extracted claims.
    Raises ValueError if the token is invalid or expired.
    """
    try:
        app = get_firebase_app()
        decoded = auth.verify_id_token(id_token, app=app)
    except Exception as e:
        raise ValueError(f"Invalid Firebase ID token: {e}") from e

    uid = decoded.get("uid") or decoded.get("sub")
    if not uid:
        raise ValueError("Firebase token missing uid/sub")

    return FirebaseClaims(
        firebase_uid=uid,
        email=decoded.get("email"),
        display_name=decoded.get("name"),
        photo_url=decoded.get("picture"),
    )
