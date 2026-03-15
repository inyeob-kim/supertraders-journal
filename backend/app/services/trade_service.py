from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.models.trade import Trade
from app.repositories.trade_repository import TradeRepository


class TradeService:
    def __init__(self, trade_repository: TradeRepository) -> None:
        self.trade_repository = trade_repository

    async def create(
        self,
        user_id: UUID,
        symbol_id: UUID,
        trade_date: date,
        entry_price: Decimal,
        exit_price: Decimal,
        quantity: Decimal | None = None,
        memo: str | None = None,
        mistake_tag_ids: list[UUID] | None = None,
        chart_image_url: str | None = None,
        chart_image_path: str | None = None,
        entry_at: datetime | None = None,
        exit_at: datetime | None = None,
    ) -> Trade:
        return await self.trade_repository.create(
            user_id=user_id,
            symbol_id=symbol_id,
            trade_date=trade_date,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            memo=memo,
            mistake_tag_ids=mistake_tag_ids,
            chart_image_url=chart_image_url,
            chart_image_path=chart_image_path,
            entry_at=entry_at,
            exit_at=exit_at,
        )

    async def get_by_id(self, trade_id: UUID, user_id: UUID) -> Trade | None:
        return await self.trade_repository.get_by_id_and_user(trade_id, user_id)

    async def list_by_user(
        self,
        user_id: UUID,
        page: int = 1,
        size: int = 20,
        start_date: date | None = None,
        end_date: date | None = None,
        symbol: str | None = None,
        mistake_tag_id: UUID | None = None,
        sort: str = "newest",
    ) -> tuple[list[Trade], int]:
        return await self.trade_repository.list_by_user(
            user_id=user_id,
            page=page,
            size=size,
            start_date=start_date,
            end_date=end_date,
            symbol=symbol,
            mistake_tag_id=mistake_tag_id,
            sort=sort,
        )

    async def update(
        self,
        trade: Trade,
        *,
        trade_date: date | None = None,
        entry_price: Decimal | None = None,
        exit_price: Decimal | None = None,
        quantity: Decimal | None = None,
        memo: str | None = None,
        mistake_tag_ids: list[UUID] | None = None,
        chart_image_url: str | None = None,
        chart_image_path: str | None = None,
        entry_at: datetime | None = None,
        exit_at: datetime | None = None,
    ) -> Trade:
        return await self.trade_repository.update(
            trade,
            trade_date=trade_date,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            memo=memo,
            mistake_tag_ids=mistake_tag_ids,
            chart_image_url=chart_image_url,
            chart_image_path=chart_image_path,
            entry_at=entry_at,
            exit_at=exit_at,
        )

    async def soft_delete(self, trade: Trade) -> None:
        await self.trade_repository.soft_delete(trade)
