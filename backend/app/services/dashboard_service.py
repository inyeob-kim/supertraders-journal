from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

from app.models.trade import Trade
from app.models.user_profile import UserProfile
from app.repositories.mistake_tag_repository import MistakeTagRepository
from app.repositories.trade_repository import TradeRepository
from app.repositories.user_profile_repository import UserProfileRepository


class DashboardService:
    def __init__(
        self,
        trade_repository: TradeRepository,
        profile_repository: UserProfileRepository,
        mistake_tag_repository: MistakeTagRepository,
    ) -> None:
        self.trade_repository = trade_repository
        self.profile_repository = profile_repository
        self.mistake_tag_repository = mistake_tag_repository

    async def get_summary(
        self,
        user_id: UUID,
        range_param: str = "week",
    ) -> dict:
        today = date.today()
        start_date: date | None = None
        end_date: date | None = today
        if range_param == "today":
            start_date = today
        elif range_param == "week":
            start_date = today - timedelta(days=7)
        elif range_param == "month":
            start_date = today - timedelta(days=30)
        elif range_param == "all":
            start_date = None

        trades = await self.trade_repository.get_trades_in_range(
            user_id, start_date=start_date, end_date=end_date
        )
        total_trades = len(trades)
        winning = sum(1 for t in trades if t.pnl_amount and t.pnl_amount > 0)
        win_rate = (Decimal(winning) / total_trades * 100) if total_trades else Decimal(0)

        def _is_kr_market(m: str | None) -> bool:
            if not m:
                return False
            u = (m or "").upper()
            return u in ("KR", "KRX") or u.startswith("KOSPI") or u.startswith("KOSDAQ")

        krw_trades = [t for t in trades if _is_kr_market(t.market_snapshot)]
        usd_trades = [t for t in trades if not _is_kr_market(t.market_snapshot)]
        total_pnl_krw = sum((t.pnl_amount or Decimal(0)) for t in krw_trades)
        total_pnl_usd = sum((t.pnl_amount or Decimal(0)) for t in usd_trades)
        trade_count_krw = len(krw_trades)
        trade_count_usd = len(usd_trades)

        recent = trades[:5]

        mistake_counts: dict[UUID, int] = {}
        for t in trades:
            for tmt in t.trade_mistake_tags:
                mid = tmt.mistake_tag_id
                mistake_counts[mid] = mistake_counts.get(mid, 0) + 1
        all_tags = await self.mistake_tag_repository.get_all_active()
        mistake_stats_raw = []
        for tag in all_tags:
            count = mistake_counts.get(tag.id, 0)
            pct = (Decimal(count) / total_trades * 100) if total_trades else Decimal(0)
            mistake_stats_raw.append({
                "mistake_tag_id": tag.id,
                "code": tag.code,
                "label_ko": tag.label_ko,
                "count": count,
                "percentage": float(pct),
            })
        # 주요 실수: 건수 기준 내림차순, 1건 이상만 포함
        mistake_stats = sorted(
            [s for s in mistake_stats_raw if s["count"] > 0],
            key=lambda s: s["count"],
            reverse=True,
        )

        profile: UserProfile | None = await self.profile_repository.get_by_user_id(user_id)
        rule_of_the_day = (profile.rule_of_the_day if profile else None) or None
        trading_principles = (profile.trading_principles if profile else None) or None
        trading_process = getattr(profile, "trading_process", None) or None

        return {
            "range": range_param,
            "summary": {
                "total_trades": total_trades,
                "win_rate": float(win_rate),
                "total_pnl_amount": float(total_pnl_krw + total_pnl_usd),
                "total_pnl_amount_krw": float(total_pnl_krw),
                "total_pnl_amount_usd": float(total_pnl_usd),
                "trade_count_krw": trade_count_krw,
                "trade_count_usd": trade_count_usd,
            },
            "recent_trades": recent,
            "mistake_stats": mistake_stats,
            "rule_of_the_day": rule_of_the_day,
            "trading_principles": trading_principles,
            "trading_process": trading_process,
        }
