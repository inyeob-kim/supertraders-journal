from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.firebase import FirebaseClaims
from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_firebase_uid(self, firebase_uid: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.firebase_uid == firebase_uid)
        )
        return result.scalar_one_or_none()

    async def create_from_firebase(self, claims: FirebaseClaims) -> User:
        user = User(
            firebase_uid=claims.firebase_uid,
            email=claims.email,
            display_name=claims.display_name,
            photo_url=claims.photo_url,
            provider="firebase",
            is_active=True,
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update_last_login(self, user: User) -> None:
        user.last_login_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def update_from_firebase_claims(self, user: User, claims: FirebaseClaims) -> None:
        """Update user fields from latest Firebase token (e.g. email/display_name/photo_url)."""
        user.email = claims.email or user.email
        user.display_name = claims.display_name or user.display_name
        user.photo_url = claims.photo_url or user.photo_url
        await self.session.flush()
