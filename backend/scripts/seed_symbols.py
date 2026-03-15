"""
Seed symbols with a small sample of KR and US stock symbols for development/testing.

Run from backend directory:
  python -m scripts.seed_symbols

Or with venv:
  .venv/bin/python -m scripts.seed_symbols

Idempotent: skips symbols that already exist (by symbol + market).
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
from app.models.symbol import Symbol


# Sample symbols: (symbol, name_kr, name_en, market, exchange)
SAMPLE_SYMBOLS = [
    # KR (Korea)
    ("005930", "삼성전자", "Samsung Electronics", "KR", "KRX"),
    ("000660", "SK하이닉스", "SK Hynix", "KR", "KRX"),
    ("035420", "NAVER", "NAVER", "KR", "KRX"),
    ("051910", "LG화학", "LG Chem", "KR", "KRX"),
    ("006400", "삼성SDI", "Samsung SDI", "KR", "KRX"),
    ("035720", "카카오", "Kakao", "KR", "KRX"),
    ("207940", "삼성바이오로직스", "Samsung Biologics", "KR", "KRX"),
    ("005380", "현대차", "Hyundai Motor", "KR", "KRX"),
    ("000270", "기아", "Kia", "KR", "KRX"),
    ("068270", "셀트리온", "Celltrion", "KR", "KRX"),
    # US
    ("AAPL", "애플", "Apple Inc.", "US", "NASDAQ"),
    ("MSFT", "마이크로소프트", "Microsoft Corporation", "US", "NASDAQ"),
    ("GOOGL", "알파벳(구글)", "Alphabet (Google)", "US", "NASDAQ"),
    ("AMZN", "아마존", "Amazon.com Inc.", "US", "NASDAQ"),
    ("TSLA", "테슬라", "Tesla Inc.", "US", "NASDAQ"),
    ("NVDA", "엔비디아", "NVIDIA Corporation", "US", "NASDAQ"),
    ("META", "메타", "Meta Platforms Inc.", "US", "NASDAQ"),
    ("JPM", "JP모건", "JPMorgan Chase", "US", "NYSE"),
    ("V", "비자", "Visa Inc.", "US", "NYSE"),
    ("JNJ", "존슨앤존슨", "Johnson & Johnson", "US", "NYSE"),
]


async def run() -> None:
    async with SessionLocal() as session:
        existing = await session.execute(
            select(Symbol.symbol, Symbol.market)
        )
        existing_pairs = {(r[0], r[1]) for r in existing.scalars()}
        to_add = [
            (s, nkr, nen, m, e)
            for s, nkr, nen, m, e in SAMPLE_SYMBOLS
            if (s, m) not in existing_pairs
        ]
        if not to_add:
            print("All sample symbols already exist. Nothing to seed.")
            return
        for symbol, name_kr, name_en, market, exchange in to_add:
            session.add(
                Symbol(
                    symbol=symbol,
                    name_kr=name_kr,
                    name_en=name_en,
                    market=market,
                    exchange=exchange,
                    is_active=True,
                )
            )
        await session.commit()
        print(f"Inserted {len(to_add)} symbol(s): {[t[0] for t in to_add]}")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
