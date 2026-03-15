from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mistake_tag import MistakeTag


class MistakeTagRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all_active(self) -> list[MistakeTag]:
        result = await self.session.execute(
            select(MistakeTag).where(MistakeTag.is_active == True).order_by(MistakeTag.sort_order)
        )
        return list(result.scalars().all())
