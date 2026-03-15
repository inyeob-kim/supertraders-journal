from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.firebase import FirebaseClaims, verify_firebase_id_token
from app.database import get_db_session
from app.models.user import User
from app.repositories.mistake_tag_repository import MistakeTagRepository
from app.repositories.symbol_repository import SymbolRepository
from app.repositories.trade_repository import TradeRepository
from app.repositories.user_profile_repository import UserProfileRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.dashboard_service import DashboardService
from app.services.symbol_service import SymbolService
from app.services.trade_service import TradeService
from app.services.user_profile_service import UserProfileService

security = HTTPBearer(auto_error=False)


def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> UserRepository:
    return UserRepository(session)


def get_user_profile_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> UserProfileRepository:
    return UserProfileRepository(session)


def get_symbol_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> SymbolRepository:
    return SymbolRepository(session)


def get_trade_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> TradeRepository:
    return TradeRepository(session)


def get_mistake_tag_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> MistakeTagRepository:
    return MistakeTagRepository(session)


def get_auth_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> AuthService:
    return AuthService(user_repository)


def get_user_profile_service(
    profile_repository: Annotated[
        UserProfileRepository, Depends(get_user_profile_repository)
    ],
) -> UserProfileService:
    return UserProfileService(profile_repository)


def get_symbol_service(
    symbol_repository: Annotated[SymbolRepository, Depends(get_symbol_repository)],
) -> SymbolService:
    return SymbolService(symbol_repository)


def get_trade_service(
    trade_repository: Annotated[TradeRepository, Depends(get_trade_repository)],
) -> TradeService:
    return TradeService(trade_repository)


def get_dashboard_service(
    trade_repository: Annotated[TradeRepository, Depends(get_trade_repository)],
    profile_repository: Annotated[
        UserProfileRepository, Depends(get_user_profile_repository)
    ],
    mistake_tag_repository: Annotated[
        MistakeTagRepository, Depends(get_mistake_tag_repository)
    ],
) -> DashboardService:
    return DashboardService(
        trade_repository, profile_repository, mistake_tag_repository
    )


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(security)
    ],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """
    Reusable dependency: verify Firebase ID token from Authorization Bearer header,
    load or create user by firebase_uid, update last_login_at, return current user.
    """
    if not credentials or credentials.credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        claims: FirebaseClaims = verify_firebase_id_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    user = await auth_service.get_or_create_user_from_firebase(claims)
    await auth_service.user_repository.session.commit()
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
