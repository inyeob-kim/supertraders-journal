from fastapi import APIRouter

from app.schemas.symbol import SymbolRead

router = APIRouter()


@router.get("/", response_model=list[SymbolRead])
async def list_symbols() -> list[SymbolRead]:
    return []

