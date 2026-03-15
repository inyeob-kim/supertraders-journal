"""
Seed mistake_tags with common trading mistake tags in Korean and English.

Run from backend directory:
  python -m scripts.seed_mistake_tags

Or with venv:
  .venv/bin/python -m scripts.seed_mistake_tags

Idempotent: skips tags that already exist (by code).
"""
from __future__ import annotations

import asyncio
import os
import sys

# Ensure app is on path when run as __main__
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import SessionLocal
from app.models.mistake_tag import MistakeTag


MISTAKE_TAGS = [
    {"code": "fomo", "label_ko": "FOMO (공포와 탐욕)", "label_en": "FOMO", "sort_order": 10},
    {"code": "overtrading", "label_ko": "과도한 매매", "label_en": "Overtrading", "sort_order": 20},
    {"code": "no-stop-loss", "label_ko": "손절 미설정", "label_en": "No stop loss", "sort_order": 30},
    {"code": "revenge-trading", "label_ko": "복수 매매", "label_en": "Revenge trading", "sort_order": 40},
    {"code": "poor-risk-management", "label_ko": "위험 관리 실패", "label_en": "Poor risk management", "sort_order": 50},
    {"code": "holding-losers", "label_ko": "손실 물타기", "label_en": "Holding losers", "sort_order": 60},
    {"code": "early-profit-taking", "label_ko": "조기 익절", "label_en": "Early profit taking", "sort_order": 70},
    {"code": "ignoring-trend", "label_ko": "추세 무시", "label_en": "Ignoring trend", "sort_order": 80},
    {"code": "overleveraging", "label_ko": "과도한 레버리지", "label_en": "Overleveraging", "sort_order": 90},
    {"code": "emotional-trading", "label_ko": "감정적 매매", "label_en": "Emotional trading", "sort_order": 100},
    {"code": "chasing-price", "label_ko": "가격 추격 매수", "label_en": "Chasing price", "sort_order": 110},
    {"code": "no-plan", "label_ko": "계획 없는 매매", "label_en": "Trading without plan", "sort_order": 120},
]


async def run() -> None:
    async with SessionLocal() as session:
        existing = await session.execute(select(MistakeTag.code))
        existing_codes = set(existing.scalars().all())
        to_add = [t for t in MISTAKE_TAGS if t["code"] not in existing_codes]
        if not to_add:
            print("All mistake tags already exist. Nothing to seed.")
            return
        for t in to_add:
            session.add(
                MistakeTag(
                    code=t["code"],
                    label_ko=t["label_ko"],
                    label_en=t["label_en"],
                    sort_order=t["sort_order"],
                    is_active=True,
                )
            )
        await session.commit()
        print(f"Inserted {len(to_add)} mistake tag(s): {[t['code'] for t in to_add]}")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
