from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class UserUpdateRequest(BaseModel):
    display_name: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    display_name: str | None
    provider: str
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


# Backward-compatible aliases for currently imported names.
UserCreate = UserCreateRequest
UserRead = UserResponse

