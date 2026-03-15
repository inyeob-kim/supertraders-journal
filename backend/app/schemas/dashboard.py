from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.trade import TradeListItemResponse


class DashboardQueryRequest(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    symbol_id: UUID | None = None
    market: str | None = None


class DashboardSummaryBlockResponse(BaseModel):
    total_trades: int
    win_rate: float
    total_pnl_amount: float
    total_pnl_amount_krw: float = 0.0
    total_pnl_amount_usd: float = 0.0
    trade_count_krw: int = 0
    trade_count_usd: int = 0


class DashboardMistakeStatResponse(BaseModel):
    mistake_tag_id: UUID
    code: str
    label_ko: str
    count: int
    percentage: float


class DashboardSummaryResponse(BaseModel):
    range: str
    summary: DashboardSummaryBlockResponse
    recent_trades: list[TradeListItemResponse]
    mistake_stats: list[DashboardMistakeStatResponse]
    rule_of_the_day: str | None
    trading_principles: str | None = None
    trading_process: list[str] | None = None


class DashboardSummaryResponseLegacy(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: Decimal | None
    total_pnl_amount: Decimal | None
    average_pnl_pct: Decimal | None


class PnlTimeSeriesPointResponse(BaseModel):
    trade_date: date
    pnl_amount: Decimal
    cumulative_pnl_amount: Decimal


class SymbolPerformanceResponse(BaseModel):
    symbol_id: UUID
    symbol_snapshot: str
    trade_count: int
    total_pnl_amount: Decimal | None
    average_pnl_pct: Decimal | None


class MarketDistributionResponse(BaseModel):
    market: str
    trade_count: int


class MistakeTagStatResponse(BaseModel):
    mistake_tag_id: UUID
    code: str
    label_ko: str
    label_en: str | None
    usage_count: int


class DashboardResponse(BaseModel):
    summary: DashboardSummaryResponseLegacy
    pnl_time_series: list[PnlTimeSeriesPointResponse]
    symbol_performance: list[SymbolPerformanceResponse]
    market_distribution: list[MarketDistributionResponse]
    mistake_tag_stats: list[MistakeTagStatResponse]
