from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite_symbol import FavoriteSymbol
from app.models.symbol import Symbol


class SymbolRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def search(
        self,
        q: str | None = None,
        market: str | None = None,
        limit: int = 10,
    ) -> list[Symbol]:
        stmt = select(Symbol).where(Symbol.is_active == True)
        if market:
            stmt = stmt.where(Symbol.market == market)
        if q and q.strip():
            pattern = f"%{q.strip()}%"
            stmt = stmt.where(
                or_(
                    Symbol.symbol.ilike(pattern),
                    Symbol.name_kr.ilike(pattern),
                    Symbol.name_en.ilike(pattern),
                )
            )
        stmt = stmt.limit(min(max(limit, 1), 20))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, symbol_id: UUID) -> Symbol | None:
        result = await self.session.execute(
            select(Symbol).where(Symbol.id == symbol_id, Symbol.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_favorites_by_user_id(self, user_id: UUID) -> list[FavoriteSymbol]:
        result = await self.session.execute(
            select(FavoriteSymbol)
            .where(FavoriteSymbol.user_id == user_id)
            .options(selectinload(FavoriteSymbol.symbol))
        )
        return list(result.scalars().unique().all())

    async def add_favorite(self, user_id: UUID, symbol_id: UUID) -> FavoriteSymbol:
        existing = await self.session.execute(
            select(FavoriteSymbol).where(
                FavoriteSymbol.user_id == user_id,
                FavoriteSymbol.symbol_id == symbol_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Already in favorites")
        fav = FavoriteSymbol(user_id=user_id, symbol_id=symbol_id)
        self.session.add(fav)
        await self.session.flush()
        await self.session.refresh(fav, ["symbol"])
        return fav

    async def remove_favorite(self, user_id: UUID, symbol_id: UUID) -> bool:
        result = await self.session.execute(
            select(FavoriteSymbol).where(
                FavoriteSymbol.user_id == user_id,
                FavoriteSymbol.symbol_id == symbol_id,
            )
        )
        fav = result.scalar_one_or_none()
        if fav is None:
            return False
        await self.session.delete(fav)
        await self.session.flush()
        return True
