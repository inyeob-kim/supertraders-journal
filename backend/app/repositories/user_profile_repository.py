from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_profile import UserProfile


class UserProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user_id(self, user_id: UUID) -> UserProfile | None:
        result = await self.session.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def upsert(
        self,
        user_id: UUID,
        *,
        trading_principles: str | None = None,
        mindset_quotes: str | None = None,
        daily_max_loss_pct: Decimal | None = None,
        monthly_target_return_pct: Decimal | None = None,
        risk_per_trade_pct: Decimal | None = None,
        rule_of_the_day: str | None = None,
        common_mistakes: list[str] | None = None,
    ) -> UserProfile:
        profile = await self.get_by_user_id(user_id)
        if profile is None:
            profile = UserProfile(user_id=user_id)
            self.session.add(profile)
            await self.session.flush()
        if trading_principles is not None:
            profile.trading_principles = trading_principles
        if mindset_quotes is not None:
            profile.mindset_quotes = mindset_quotes
        if daily_max_loss_pct is not None:
            profile.daily_max_loss_pct = daily_max_loss_pct
        if monthly_target_return_pct is not None:
            profile.monthly_target_return_pct = monthly_target_return_pct
        if risk_per_trade_pct is not None:
            profile.risk_per_trade_pct = risk_per_trade_pct
        if rule_of_the_day is not None:
            profile.rule_of_the_day = rule_of_the_day
        if common_mistakes is not None:
            profile.common_mistakes = common_mistakes
        await self.session.flush()
        await self.session.refresh(profile)
        return profile
