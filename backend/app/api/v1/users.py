from fastapi import APIRouter, status

from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate) -> UserRead:
    return UserRead(id=1, email=payload.email, is_active=True)

