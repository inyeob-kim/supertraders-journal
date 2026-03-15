from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserUpdateRequest(BaseModel):
    display_name: str | None = None
    is_active: bool | None = None


class UserMeResponse(BaseModel):
    """Current user info returned by GET /users/me (Firebase-based auth)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    firebase_uid: str
    email: str | None
    display_name: str | None
    photo_url: str | None
    provider: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    firebase_uid: str
    email: str | None
    display_name: str | None
    photo_url: str | None
    provider: str
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


# Backward-compatible alias.
UserRead = UserResponse
