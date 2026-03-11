from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class DashboardQueryRequest(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    symbol_id: UUID | None = None
    market: str | None = None


class DashboardSummaryResponse(BaseModel):
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
    summary: DashboardSummaryResponse
    pnl_time_series: list[PnlTimeSeriesPointResponse]
    symbol_performance: list[SymbolPerformanceResponse]
    market_distribution: list[MarketDistributionResponse]
    mistake_tag_stats: list[MistakeTagStatResponse]
