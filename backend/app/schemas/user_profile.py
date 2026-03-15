from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserProfileUpsertRequest(BaseModel):
    trading_principles: str | None = None
    mindset_quotes: str | None = None
    daily_max_loss_pct: Decimal | None = None
    monthly_target_return_pct: Decimal | None = None
    risk_per_trade_pct: Decimal | None = None
    rule_of_the_day: str | None = None
    common_mistakes: list[str] | None = None


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    trading_principles: str | None
    mindset_quotes: str | None
    daily_max_loss_pct: Decimal | None
    monthly_target_return_pct: Decimal | None
    risk_per_trade_pct: Decimal | None
    rule_of_the_day: str | None
    common_mistakes: list[str] | None
    created_at: datetime
    updated_at: datetime
