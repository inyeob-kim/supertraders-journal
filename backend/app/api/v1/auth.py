from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(payload: LoginRequest) -> TokenResponse:
    return TokenResponse(access_token="placeholder", token_type="bearer")

