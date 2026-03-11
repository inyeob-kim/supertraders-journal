# SuperTraders Journal Backend

Production-ready FastAPI backend scaffold for a SaaS trading journal.

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy 2.0 (async)
- Alembic
- Pydantic v2
- JWT auth utilities
- Python 3.11+

## Project Structure

The codebase follows clean architecture-inspired layering:

- `app/api`: HTTP layer and route definitions
- `app/services`: application/service layer
- `app/repositories`: persistence abstractions
- `app/models`: SQLAlchemy ORM models
- `app/schemas`: request/response DTOs
- `app/core`: security and settings

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy environment file and update values:

```bash
copy .env.example .env
```

## Run FastAPI Server

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Alembic Migrations

Create a migration:

```bash
alembic revision --autogenerate -m "init"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback one migration:

```bash
alembic downgrade -1
```

## Notes

- This scaffold intentionally keeps business logic minimal.
- Endpoints are placeholders so the app boots successfully.
- Expand services and repositories as features evolve (community, analytics, etc.).

