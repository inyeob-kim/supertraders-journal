from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, get_user_profile_service
from app.models.user import User
from app.schemas.user import UserMeResponse
from app.schemas.user_profile import UserProfileResponse, UserProfileUpsertRequest
from app.services.user_profile_service import UserProfileService

router = APIRouter()


@router.get("/me", response_model=UserMeResponse, status_code=status.HTTP_200_OK)
async def get_current_user_info(current_user: CurrentUser) -> UserMeResponse:
    """Return the currently authenticated user (from Firebase ID token)."""
    # Build response explicitly to avoid SQLAlchemy async lazy-load (MissingGreenlet)
    # when Pydantic reads attributes from the ORM object.
    return UserMeResponse(
        id=current_user.id,
        firebase_uid=current_user.firebase_uid,
        email=current_user.email,
        display_name=current_user.display_name,
        photo_url=current_user.photo_url,
        provider=current_user.provider,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.get(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def get_user_profile(
    current_user: CurrentUser,
    user_profile_service: Annotated[
        UserProfileService, Depends(get_user_profile_service)
    ],
):
    profile = await user_profile_service.get_by_user_id(current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return profile


@router.patch(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def update_user_profile(
    current_user: CurrentUser,
    payload: UserProfileUpsertRequest,
    user_profile_service: Annotated[
        UserProfileService, Depends(get_user_profile_service)
    ],
):
    fields = payload.model_dump(exclude_unset=True)
    profile = await user_profile_service.upsert(current_user.id, **fields)
    await user_profile_service.profile_repository.session.commit()
    return profile
