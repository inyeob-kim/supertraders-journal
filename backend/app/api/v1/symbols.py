from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, get_symbol_service
from app.schemas.symbol import FavoriteSymbolResponse, SymbolSearchItemResponse
from app.services.symbol_service import SymbolService

router = APIRouter()


@router.get(
    "/",
    response_model=list[SymbolSearchItemResponse],
    status_code=status.HTTP_200_OK,
)
async def search_symbols(
    symbol_service: Annotated[SymbolService, Depends(get_symbol_service)],
    q: str | None = None,
    market: str | None = None,
    limit: int = 10,
):
    limit = min(max(limit, 1), 20)
    symbols = await symbol_service.search(q=q, market=market, limit=limit)
    return symbols


@router.get(
    "/favorites",
    response_model=list[FavoriteSymbolResponse],
    status_code=status.HTTP_200_OK,
)
async def list_favorite_symbols(
    current_user: CurrentUser,
    symbol_service: Annotated[SymbolService, Depends(get_symbol_service)],
):
    favs = await symbol_service.get_favorites(current_user.id)
    return [
        FavoriteSymbolResponse(
            id=f.id,
            symbol_id=f.symbol_id,
            symbol=f.symbol.symbol,
            name_kr=f.symbol.name_kr,
            name_en=f.symbol.name_en,
            market=f.symbol.market,
            exchange=f.symbol.exchange,
            created_at=f.created_at,
        )
        for f in favs
    ]


@router.post(
    "/favorites/{symbol_id}",
    response_model=FavoriteSymbolResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_favorite_symbol(
    current_user: CurrentUser,
    symbol_id: UUID,
    symbol_service: Annotated[SymbolService, Depends(get_symbol_service)],
):
    try:
        fav = await symbol_service.add_favorite(current_user.id, symbol_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Symbol not found",
            ) from e
        if "already" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Symbol already in favorites",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    await symbol_service.symbol_repository.session.commit()
    return FavoriteSymbolResponse(
        id=fav.id,
        symbol_id=fav.symbol_id,
        symbol=fav.symbol.symbol,
        name_kr=fav.symbol.name_kr,
        name_en=fav.symbol.name_en,
        market=fav.symbol.market,
        exchange=fav.symbol.exchange,
        created_at=fav.created_at,
    )


@router.delete(
    "/favorites/{symbol_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_favorite_symbol(
    current_user: CurrentUser,
    symbol_id: UUID,
    symbol_service: Annotated[SymbolService, Depends(get_symbol_service)],
):
    removed = await symbol_service.remove_favorite(current_user.id, symbol_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
    await symbol_service.symbol_repository.session.commit()
