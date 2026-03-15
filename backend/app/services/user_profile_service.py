from uuid import UUID

from app.models.user_profile import UserProfile
from app.repositories.user_profile_repository import UserProfileRepository


class UserProfileService:
    def __init__(self, profile_repository: UserProfileRepository) -> None:
        self.profile_repository = profile_repository

    async def get_by_user_id(self, user_id: UUID) -> UserProfile | None:
        return await self.profile_repository.get_by_user_id(user_id)

    async def upsert(self, user_id: UUID, **fields) -> UserProfile:
        return await self.profile_repository.upsert(user_id, **fields)
