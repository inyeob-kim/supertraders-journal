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
        trade_direction: str,
        market_type: str,
        entry_price: Decimal,
        exit_price: Decimal | None = None,
        quantity: Decimal | None = None,
        strategy_tags: list[str] | None = None,
        entry_reason: str | None = None,
        exit_reason: str | None = None,
        trade_reflection: str | None = None,
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
            trade_direction=trade_direction,
            market_type=market_type,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            strategy_tags=strategy_tags,
            entry_reason=entry_reason,
            exit_reason=exit_reason,
            trade_reflection=trade_reflection,
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
        trade_direction: str | None = None,
        market_type: str | None = None,
        entry_price: Decimal | None = None,
        exit_price: Decimal | None = None,
        quantity: Decimal | None = None,
        entry_reason: str | None = None,
        exit_reason: str | None = None,
        trade_reflection: str | None = None,
        strategy_tags: list[str] | None = None,
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
            trade_direction=trade_direction,
            market_type=market_type,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            entry_reason=entry_reason,
            exit_reason=exit_reason,
            trade_reflection=trade_reflection,
            strategy_tags=strategy_tags,
            memo=memo,
            mistake_tag_ids=mistake_tag_ids,
            chart_image_url=chart_image_url,
            chart_image_path=chart_image_path,
            entry_at=entry_at,
            exit_at=exit_at,
        )

    async def soft_delete(self, trade: Trade) -> None:
        await self.trade_repository.soft_delete(trade)
