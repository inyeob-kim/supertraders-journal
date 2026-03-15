from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MistakeTagRef(BaseModel):
    id: UUID
    code: str
    label_ko: str


class TradeCreateRequest(BaseModel):
    symbol_id: UUID
    trade_date: date
    entry_price: Decimal
    exit_price: Decimal
    quantity: Decimal | None = None
    memo: str | None = None
    mistake_tag_ids: list[UUID] | None = None
    chart_image_url: str | None = None
    chart_image_path: str | None = None
    entry_at: datetime | None = None
    exit_at: datetime | None = None


class TradeUpdateRequest(BaseModel):
    trade_date: date | None = None
    entry_price: Decimal | None = None
    exit_price: Decimal | None = None
    quantity: Decimal | None = None
    memo: str | None = None
    mistake_tag_ids: list[UUID] | None = None
    chart_image_url: str | None = None
    chart_image_path: str | None = None
    entry_at: datetime | None = None
    exit_at: datetime | None = None


class TradeListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    symbol_snapshot: str
    symbol_name_snapshot: str | None
    market_snapshot: str | None = None
    trade_date: date
    entry_price: Decimal
    exit_price: Decimal
    quantity: Decimal | None
    pnl_amount: Decimal | None
    pnl_pct: Decimal | None
    memo: str | None
    mistake_tags: list[MistakeTagRef] = []
    chart_image_url: str | None
    created_at: datetime


class TradeDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    symbol_id: UUID
    symbol_snapshot: str
    symbol_name_snapshot: str | None
    market_snapshot: str | None
    exchange_snapshot: str | None
    trade_date: date
    entry_price: Decimal
    exit_price: Decimal
    quantity: Decimal | None
    pnl_amount: Decimal | None
    pnl_pct: Decimal | None
    memo: str | None
    mistake_tags: list[MistakeTagRef] = []
    chart_image_url: str | None
    chart_image_path: str | None
    entry_at: datetime | None
    exit_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    symbol_id: UUID
    symbol_snapshot: str
    symbol_name_snapshot: str | None
    market_snapshot: str | None
    exchange_snapshot: str | None
    trade_date: date
    entry_price: Decimal
    exit_price: Decimal
    quantity: Decimal | None
    pnl_amount: Decimal | None
    pnl_pct: Decimal | None
    memo: str | None
    mistake_tags: list[MistakeTagRef] = []
    chart_image_url: str | None
    chart_image_path: str | None
    entry_at: datetime | None
    exit_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedTradeResponse(BaseModel):
    items: list[TradeListItemResponse]
    page: int
    size: int
    total: int
    total_pages: int


# Backward-compatible aliases.
TradeCreate = TradeCreateRequest
TradeRead = TradeResponse
