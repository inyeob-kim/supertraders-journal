from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import CurrentUser, get_mistake_tag_repository
from app.repositories.mistake_tag_repository import MistakeTagRepository

router = APIRouter()


class MistakeTagItem(BaseModel):
    id: str
    code: str
    label_ko: str


@router.get("", response_model=list[MistakeTagItem])
@router.get("/", response_model=list[MistakeTagItem])
async def list_mistake_tags(
    current_user: CurrentUser,
    mistake_tag_repository: Annotated[
        MistakeTagRepository, Depends(get_mistake_tag_repository)
    ],
):
    """Return all active mistake tags (for profile pills / trade tagging)."""
    tags = await mistake_tag_repository.get_all_active()
    return [
        MistakeTagItem(id=str(t.id), code=t.code, label_ko=t.label_ko)
        for t in tags
    ]
