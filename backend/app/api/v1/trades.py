from fastapi import APIRouter

from app.schemas.trade import TradeCreate, TradeRead

router = APIRouter()


@router.get("/", response_model=list[TradeRead])
async def list_trades() -> list[TradeRead]:
    return []


@router.post("/", response_model=TradeRead)
async def create_trade(payload: TradeCreate) -> TradeRead:
    return TradeRead(
        id=1,
        user_id=1,
        symbol_id=payload.symbol_id,
        side=payload.side,
        quantity=payload.quantity,
    )

