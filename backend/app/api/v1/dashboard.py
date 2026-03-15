from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, get_dashboard_service
from app.models.trade import Trade
from app.schemas.dashboard import (
    DashboardMistakeStatResponse,
    DashboardSummaryBlockResponse,
    DashboardSummaryResponse,
)
from app.schemas.trade import MistakeTagRef, TradeListItemResponse
from app.services.dashboard_service import DashboardService


def _trade_to_list_item(trade: Trade) -> TradeListItemResponse:
    mistake_tags = [
        MistakeTagRef(
            id=tmt.mistake_tag.id,
            code=tmt.mistake_tag.code,
            label_ko=tmt.mistake_tag.label_ko,
        )
        for tmt in trade.trade_mistake_tags
    ]
    return TradeListItemResponse(
        id=trade.id,
        symbol_snapshot=trade.symbol_snapshot,
        symbol_name_snapshot=trade.symbol_name_snapshot,
        market_snapshot=trade.market_snapshot,
        trade_date=trade.trade_date,
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        quantity=trade.quantity,
        pnl_amount=trade.pnl_amount,
        pnl_pct=trade.pnl_pct,
        memo=trade.memo,
        mistake_tags=mistake_tags,
        chart_image_url=trade.chart_image_url,
        created_at=trade.created_at,
    )


router = APIRouter()


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
)
async def get_dashboard_summary(
    current_user: CurrentUser,
    dashboard_service: Annotated[DashboardService, Depends(get_dashboard_service)],
    range_param: str = Query("week", alias="range", pattern="^(today|week|month|all)$"),
):
    data = await dashboard_service.get_summary(
        user_id=current_user.id,
        range_param=range_param,
    )
    return DashboardSummaryResponse(
        range=data["range"],
        summary=DashboardSummaryBlockResponse(**data["summary"]),
        recent_trades=[_trade_to_list_item(t) for t in data["recent_trades"]],
        mistake_stats=[DashboardMistakeStatResponse(**s) for s in data["mistake_stats"]],
        rule_of_the_day=data["rule_of_the_day"],
    )
