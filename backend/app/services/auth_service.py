from app.core.firebase import FirebaseClaims
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def get_or_create_user_from_firebase(
        self, claims: FirebaseClaims, update_last_login: bool = True
    ) -> User:
        """
        Load user by firebase_uid, or create on first login.
        Optionally updates last_login_at for existing users.
        """
        user = await self.user_repository.get_by_firebase_uid(claims.firebase_uid)
        if user:
            await self.user_repository.update_from_firebase_claims(user, claims)
            if update_last_login:
                await self.user_repository.update_last_login(user)
            return user
        return await self.user_repository.create_from_firebase(claims)
