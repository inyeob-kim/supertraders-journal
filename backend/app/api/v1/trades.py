from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import CurrentUser, get_trade_service
from app.models.trade import Trade
from app.schemas.trade import (
    MistakeTagRef,
    PaginatedTradeResponse,
    TradeCreateRequest,
    TradeDetailResponse,
    TradeListItemResponse,
    TradeResponse,
    TradeUpdateRequest,
)
from app.services.trade_service import TradeService

router = APIRouter()


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
        trade_direction=getattr(trade, "trade_direction", "LONG"),
        market_type=getattr(trade, "market_type", "US_STOCK"),
        trade_status=getattr(trade, "trade_status", "CLOSED"),
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        quantity=trade.quantity,
        pnl_amount=trade.pnl_amount,
        pnl_pct=trade.pnl_pct,
        entry_reason=getattr(trade, "entry_reason", None),
        exit_reason=getattr(trade, "exit_reason", None),
        trade_reflection=getattr(trade, "trade_reflection", None),
        strategy_tags=getattr(trade, "strategy_tags", None),
        memo=trade.memo,
        mistake_tags=mistake_tags,
        chart_image_url=trade.chart_image_url,
        created_at=trade.created_at,
    )


def _trade_to_detail(trade: Trade) -> TradeDetailResponse:
    mistake_tags = [
        MistakeTagRef(
            id=tmt.mistake_tag.id,
            code=tmt.mistake_tag.code,
            label_ko=tmt.mistake_tag.label_ko,
        )
        for tmt in trade.trade_mistake_tags
    ]
    return TradeDetailResponse(
        id=trade.id,
        user_id=trade.user_id,
        symbol_id=trade.symbol_id,
        symbol_snapshot=trade.symbol_snapshot,
        symbol_name_snapshot=trade.symbol_name_snapshot,
        market_snapshot=trade.market_snapshot,
        exchange_snapshot=trade.exchange_snapshot,
        trade_date=trade.trade_date,
        trade_direction=getattr(trade, "trade_direction", "LONG"),
        market_type=getattr(trade, "market_type", "US_STOCK"),
        trade_status=getattr(trade, "trade_status", "CLOSED"),
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        quantity=trade.quantity,
        pnl_amount=trade.pnl_amount,
        pnl_pct=trade.pnl_pct,
        entry_reason=getattr(trade, "entry_reason", None),
        exit_reason=getattr(trade, "exit_reason", None),
        trade_reflection=getattr(trade, "trade_reflection", None),
        strategy_tags=getattr(trade, "strategy_tags", None),
        memo=trade.memo,
        mistake_tags=mistake_tags,
        chart_image_url=trade.chart_image_url,
        chart_image_path=trade.chart_image_path,
        entry_at=trade.entry_at,
        exit_at=trade.exit_at,
        created_at=trade.created_at,
        updated_at=trade.updated_at,
    )


def _trade_to_response(trade: Trade) -> TradeResponse:
    mistake_tags = [
        MistakeTagRef(
            id=tmt.mistake_tag.id,
            code=tmt.mistake_tag.code,
            label_ko=tmt.mistake_tag.label_ko,
        )
        for tmt in trade.trade_mistake_tags
    ]
    return TradeResponse(
        id=trade.id,
        user_id=trade.user_id,
        symbol_id=trade.symbol_id,
        symbol_snapshot=trade.symbol_snapshot,
        symbol_name_snapshot=trade.symbol_name_snapshot,
        market_snapshot=trade.market_snapshot,
        exchange_snapshot=trade.exchange_snapshot,
        trade_date=trade.trade_date,
        trade_direction=getattr(trade, "trade_direction", "LONG"),
        market_type=getattr(trade, "market_type", "US_STOCK"),
        trade_status=getattr(trade, "trade_status", "CLOSED"),
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        quantity=trade.quantity,
        pnl_amount=trade.pnl_amount,
        pnl_pct=trade.pnl_pct,
        entry_reason=getattr(trade, "entry_reason", None),
        exit_reason=getattr(trade, "exit_reason", None),
        trade_reflection=getattr(trade, "trade_reflection", None),
        strategy_tags=getattr(trade, "strategy_tags", None),
        memo=trade.memo,
        mistake_tags=mistake_tags,
        chart_image_url=trade.chart_image_url,
        chart_image_path=trade.chart_image_path,
        entry_at=trade.entry_at,
        exit_at=trade.exit_at,
        created_at=trade.created_at,
        updated_at=trade.updated_at,
    )


@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    current_user: CurrentUser,
    payload: TradeCreateRequest,
    trade_service: Annotated[TradeService, Depends(get_trade_service)],
):
    try:
        trade = await trade_service.create(
            user_id=current_user.id,
            symbol_id=payload.symbol_id,
            trade_date=payload.trade_date,
            trade_direction=payload.trade_direction,
            market_type=payload.market_type,
            entry_price=payload.entry_price,
            exit_price=payload.exit_price,
            quantity=payload.quantity,
            strategy_tags=payload.strategy_tags,
            entry_reason=payload.entry_reason,
            exit_reason=payload.exit_reason,
            trade_reflection=payload.trade_reflection,
            memo=payload.memo,
            mistake_tag_ids=payload.mistake_tag_ids,
            chart_image_url=payload.chart_image_url,
            chart_image_path=payload.chart_image_path,
            entry_at=payload.entry_at,
            exit_at=payload.exit_at,
        )
    except ValueError as e:
        if "not found" in str(e).lower() or "symbol" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symbol not found",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    await trade_service.trade_repository.session.commit()
    trade = await trade_service.get_by_id(trade.id, current_user.id)
    return _trade_to_response(trade)


@router.get(
    "/",
    response_model=PaginatedTradeResponse,
    status_code=status.HTTP_200_OK,
)
async def list_trades(
    current_user: CurrentUser,
    trade_service: Annotated[TradeService, Depends(get_trade_service)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    start_date: date | None = None,
    end_date: date | None = None,
    symbol: str | None = None,
    mistake_tag_id: UUID | None = None,
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
):
    items, total = await trade_service.list_by_user(
        user_id=current_user.id,
        page=page,
        size=size,
        start_date=start_date,
        end_date=end_date,
        symbol=symbol,
        mistake_tag_id=mistake_tag_id,
        sort=sort,
    )
    total_pages = (total + size - 1) // size if total else 0
    return PaginatedTradeResponse(
        items=[_trade_to_list_item(t) for t in items],
        page=page,
        size=size,
        total=total,
        total_pages=total_pages,
    )


@router.get(
    "/{trade_id}",
    response_model=TradeDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_trade(
    current_user: CurrentUser,
    trade_id: UUID,
    trade_service: Annotated[TradeService, Depends(get_trade_service)],
):
    trade = await trade_service.get_by_id(trade_id, current_user.id)
    if trade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found",
        )
    return _trade_to_detail(trade)


@router.patch(
    "/{trade_id}",
    response_model=TradeDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def update_trade(
    current_user: CurrentUser,
    trade_id: UUID,
    payload: TradeUpdateRequest,
    trade_service: Annotated[TradeService, Depends(get_trade_service)],
):
    trade = await trade_service.get_by_id(trade_id, current_user.id)
    if trade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found",
        )
    fields = payload.model_dump(exclude_unset=True)
    mistake_tag_ids = fields.pop("mistake_tag_ids", None)
    await trade_service.update(trade, mistake_tag_ids=mistake_tag_ids, **fields)
    await trade_service.trade_repository.session.commit()
    trade = await trade_service.get_by_id(trade_id, current_user.id)
    return _trade_to_detail(trade)


@router.delete(
    "/{trade_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_trade(
    current_user: CurrentUser,
    trade_id: UUID,
    trade_service: Annotated[TradeService, Depends(get_trade_service)],
):
    trade = await trade_service.get_by_id(trade_id, current_user.id)
    if trade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trade not found",
        )
    await trade_service.soft_delete(trade)
    await trade_service.trade_repository.session.commit()
