from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SymbolCreateRequest(BaseModel):
    symbol: str
    name_kr: str | None = None
    name_en: str | None = None
    market: str
    exchange: str | None = None
    is_active: bool = True


class SymbolUpdateRequest(BaseModel):
    name_kr: str | None = None
    name_en: str | None = None
    market: str | None = None
    exchange: str | None = None
    is_active: bool | None = None


class SymbolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    symbol: str
    name_kr: str | None
    name_en: str | None
    market: str
    exchange: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Backward-compatible alias for currently imported name.
SymbolRead = SymbolResponse

