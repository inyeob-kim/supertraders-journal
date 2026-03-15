# Backend scripts

## Seed scripts

Seed scripts populate the database with initial data for development and testing. They are **idempotent**: running them multiple times will not create duplicates.

### Prerequisites

1. Database is running (e.g. `docker compose up -d` from project root).
2. Migrations are applied:
   ```bash
   cd backend
   alembic upgrade head
   ```

### Running seeds

From the **backend** directory (with your venv activated if you use one):

**Mistake tags** (common trading mistakes in Korean and English):

```bash
python -m scripts.seed_mistake_tags
```

Or with venv explicitly:

```bash
.venv/bin/python -m scripts.seed_mistake_tags
```

**Sample symbols** (KR and US stocks for autocomplete/testing):

```bash
python -m scripts.seed_symbols
```

Or:

```bash
.venv/bin/python -m scripts.seed_symbols
```

### What gets seeded

- **seed_mistake_tags.py**: Inserts rows into `mistake_tags` (e.g. FOMO, overtrading, no stop loss, revenge trading, poor risk management, holding losers, early profit taking, ignoring trend, overleveraging, emotional trading, chasing price, no plan). Each has `code`, `label_ko`, `label_en`, and `sort_order`. Existing codes are skipped.

- **seed_symbols.py**: Inserts a small set of symbols into `symbols`: Korean names (e.g. Samsung, SK Hynix, NAVER, Kakao) and US tickers (e.g. AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA). Existing `(symbol, market)` pairs are skipped.

### Order

You can run the two seed scripts in any order. Run them after `alembic upgrade head`.
