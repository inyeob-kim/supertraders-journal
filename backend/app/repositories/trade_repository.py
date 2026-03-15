from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import and_, desc, func, select

# Sentinel for "argument not provided" so we can set exit_price to None when client sends null
_UNSET = object()
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.symbol import Symbol
from app.models.trade import Trade
from app.models.trade_mistake_tag import TradeMistakeTag


def _calc_pnl(
    entry_price: Decimal,
    exit_price: Decimal | None,
    quantity: Decimal | None,
    trade_direction: str = "LONG",
) -> tuple[Decimal | None, Decimal | None]:
    """Compute PnL; for OPEN (exit_price None) returns None, None."""
    if exit_price is None:
        return None, None
    pnl_amount: Decimal | None = None
    pnl_pct: Decimal | None = None
    price_diff = exit_price - entry_price if trade_direction == "LONG" else entry_price - exit_price
    pct_diff = (exit_price - entry_price) / entry_price if entry_price and entry_price != 0 else None
    if trade_direction == "SHORT" and pct_diff is not None:
        pct_diff = -pct_diff
    if quantity is not None and quantity != 0:
        pnl_amount = price_diff * quantity
    else:
        pnl_amount = price_diff
    if pct_diff is not None:
        pnl_pct = pct_diff * 100
    return pnl_amount, pnl_pct


class TradeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_symbol(self, symbol_id: UUID) -> Symbol | None:
        result = await self.session.execute(select(Symbol).where(Symbol.id == symbol_id))
        return result.scalar_one_or_none()

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
        symbol = await self.get_symbol(symbol_id)
        if symbol is None:
            raise ValueError("Symbol not found")
        trade_status = "OPEN" if exit_price is None else "CLOSED"
        pnl_amount, pnl_pct = _calc_pnl(entry_price, exit_price, quantity, trade_direction)
        trade = Trade(
            user_id=user_id,
            symbol_id=symbol_id,
            symbol_snapshot=symbol.symbol,
            symbol_name_snapshot=symbol.name_kr or symbol.name_en,
            market_snapshot=symbol.market,
            exchange_snapshot=symbol.exchange,
            trade_date=trade_date,
            trade_direction=trade_direction,
            market_type=market_type,
            trade_status=trade_status,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            pnl_amount=pnl_amount,
            pnl_pct=pnl_pct,
            entry_reason=entry_reason,
            exit_reason=exit_reason,
            trade_reflection=trade_reflection,
            strategy_tags=strategy_tags,
            memo=memo,
            chart_image_url=chart_image_url,
            chart_image_path=chart_image_path,
            entry_at=entry_at,
            exit_at=exit_at,
        )
        self.session.add(trade)
        await self.session.flush()
        if mistake_tag_ids:
            for tag_id in mistake_tag_ids:
                tmt = TradeMistakeTag(trade_id=trade.id, mistake_tag_id=tag_id)
                self.session.add(tmt)
            await self.session.flush()
        await self.session.refresh(trade)
        return trade

    async def get_by_id_and_user(self, trade_id: UUID, user_id: UUID) -> Trade | None:
        result = await self.session.execute(
            select(Trade)
            .where(Trade.id == trade_id, Trade.user_id == user_id)
            .options(selectinload(Trade.trade_mistake_tags).selectinload(TradeMistakeTag.mistake_tag))
        )
        return result.scalar_one_or_none()

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
        base = and_(
            Trade.user_id == user_id,
            Trade.deleted_at.is_(None),
        )
        if start_date:
            base = and_(base, Trade.trade_date >= start_date)
        if end_date:
            base = and_(base, Trade.trade_date <= end_date)
        if symbol:
            base = and_(base, Trade.symbol_snapshot == symbol)
        if mistake_tag_id:
            sub = select(TradeMistakeTag.trade_id).where(
                TradeMistakeTag.mistake_tag_id == mistake_tag_id
            )
            base = and_(base, Trade.id.in_(sub))
        count_stmt = select(func.count()).select_from(Trade).where(base)
        total = (await self.session.execute(count_stmt)).scalar() or 0
        stmt = select(Trade).where(base)
        if sort == "oldest":
            stmt = stmt.order_by(Trade.trade_date, Trade.created_at)
        else:
            stmt = stmt.order_by(desc(Trade.trade_date), desc(Trade.created_at))
        size = min(max(size, 1), 100)
        offset = (max(page, 1) - 1) * size
        stmt = stmt.offset(offset).limit(size).options(
            selectinload(Trade.trade_mistake_tags).selectinload(TradeMistakeTag.mistake_tag)
        )
        result = await self.session.execute(stmt)
        items = list(result.scalars().unique().all())
        return items, total

    async def update(
        self,
        trade: Trade,
        *,
        trade_date: date | None = None,
        trade_direction: str | None = None,
        market_type: str | None = None,
        entry_price: Decimal | None = None,
        exit_price: Decimal | None = _UNSET,  # type: ignore[assignment]
        quantity: Decimal | None = None,
        entry_reason: str | None = None,
        exit_reason: str | None = None,
        trade_reflection: str | None = None,
        strategy_tags: list[str] | None = None,
        memo: str | None = None,
        mistake_tag_ids: list[UUID] | None = None,
        chart_image_url: str | None | type[_UNSET] = _UNSET,
        chart_image_path: str | None | type[_UNSET] = _UNSET,
        entry_at: datetime | None = None,
        exit_at: datetime | None = None,
    ) -> Trade:
        if trade_date is not None:
            trade.trade_date = trade_date
        if trade_direction is not None:
            trade.trade_direction = trade_direction
        if market_type is not None:
            trade.market_type = market_type
        if entry_price is not None:
            trade.entry_price = entry_price
        if exit_price is not _UNSET:
            trade.exit_price = exit_price
        if quantity is not None:
            trade.quantity = quantity
        if entry_reason is not None:
            trade.entry_reason = entry_reason
        if exit_reason is not None:
            trade.exit_reason = exit_reason
        if trade_reflection is not None:
            trade.trade_reflection = trade_reflection
        if strategy_tags is not None:
            trade.strategy_tags = strategy_tags
        if memo is not None:
            trade.memo = memo
        if chart_image_url is not _UNSET:
            trade.chart_image_url = chart_image_url
        if chart_image_path is not _UNSET:
            trade.chart_image_path = chart_image_path
        if entry_at is not None:
            trade.entry_at = entry_at
        if exit_at is not None:
            trade.exit_at = exit_at
        trade.trade_status = "OPEN" if trade.exit_price is None else "CLOSED"
        pnl_amount, pnl_pct = _calc_pnl(
            trade.entry_price, trade.exit_price, trade.quantity, trade.trade_direction
        )
        trade.pnl_amount = pnl_amount
        trade.pnl_pct = pnl_pct
        if mistake_tag_ids is not None:
            existing = await self.session.execute(
                select(TradeMistakeTag).where(TradeMistakeTag.trade_id == trade.id)
            )
            for tmt in existing.scalars().all():
                await self.session.delete(tmt)
            await self.session.flush()
            for tag_id in mistake_tag_ids:
                tmt = TradeMistakeTag(trade_id=trade.id, mistake_tag_id=tag_id)
                self.session.add(tmt)
        await self.session.flush()
        await self.session.refresh(trade)
        return trade

    async def soft_delete(self, trade: Trade) -> None:
        from datetime import timezone

        trade.deleted_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def get_trades_in_range(
        self,
        user_id: UUID,
        start_date: date | None = None,
        end_date: date | None = None,
        limit: int = 5000,
    ) -> list[Trade]:
        stmt = (
            select(Trade)
            .where(
                Trade.user_id == user_id,
                Trade.deleted_at.is_(None),
            )
        )
        if start_date:
            stmt = stmt.where(Trade.trade_date >= start_date)
        if end_date:
            stmt = stmt.where(Trade.trade_date <= end_date)
        stmt = stmt.order_by(desc(Trade.trade_date)).limit(limit).options(
            selectinload(Trade.trade_mistake_tags).selectinload(TradeMistakeTag.mistake_tag)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
