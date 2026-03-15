from uuid import UUID

from app.models.favorite_symbol import FavoriteSymbol
from app.models.symbol import Symbol
from app.repositories.symbol_repository import SymbolRepository


class SymbolService:
    def __init__(self, symbol_repository: SymbolRepository) -> None:
        self.symbol_repository = symbol_repository

    async def search(
        self,
        q: str | None = None,
        market: str | None = None,
        limit: int = 10,
    ) -> list[Symbol]:
        return await self.symbol_repository.search(q=q, market=market, limit=limit)

    async def get_by_id(self, symbol_id: UUID) -> Symbol | None:
        return await self.symbol_repository.get_by_id(symbol_id)

    async def get_favorites(self, user_id: UUID) -> list[FavoriteSymbol]:
        return await self.symbol_repository.get_favorites_by_user_id(user_id)

    async def add_favorite(self, user_id: UUID, symbol_id: UUID) -> FavoriteSymbol:
        symbol = await self.symbol_repository.get_by_id(symbol_id)
        if symbol is None:
            raise ValueError("Symbol not found")
        return await self.symbol_repository.add_favorite(user_id, symbol_id)

    async def remove_favorite(self, user_id: UUID, symbol_id: UUID) -> bool:
        return await self.symbol_repository.remove_favorite(user_id, symbol_id)
