"""trade_direction_market_reasons: add trade_direction, market_type, entry/exit_reason, strategy_tags, trade_status; exit_price nullable.

Revision ID: d4e5f6a7b8c9
Revises: c2d3e4f5a6b7
Create Date: 2026-03-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c2d3e4f5a6b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "trades",
        sa.Column("trade_direction", sa.String(length=10), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("market_type", sa.String(length=30), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("entry_reason", sa.Text(), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("exit_reason", sa.Text(), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("trade_reflection", sa.Text(), nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("strategy_tags", JSONB, nullable=True),
    )
    op.add_column(
        "trades",
        sa.Column("trade_status", sa.String(length=20), nullable=True),
    )
    op.execute("UPDATE trades SET trade_direction = 'LONG' WHERE trade_direction IS NULL")
    op.execute("UPDATE trades SET market_type = 'US_STOCK' WHERE market_type IS NULL")
    op.execute("UPDATE trades SET trade_status = 'CLOSED' WHERE trade_status IS NULL")
    op.alter_column(
        "trades",
        "trade_direction",
        existing_type=sa.String(length=10),
        nullable=False,
    )
    op.alter_column(
        "trades",
        "market_type",
        existing_type=sa.String(length=30),
        nullable=False,
    )
    op.alter_column(
        "trades",
        "trade_status",
        existing_type=sa.String(length=20),
        nullable=False,
    )
    op.alter_column(
        "trades",
        "exit_price",
        existing_type=sa.Numeric(precision=18, scale=4),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "trades",
        "exit_price",
        existing_type=sa.Numeric(precision=18, scale=4),
        nullable=False,
    )
    op.drop_column("trades", "trade_status")
    op.drop_column("trades", "strategy_tags")
    op.drop_column("trades", "trade_reflection")
    op.drop_column("trades", "exit_reason")
    op.drop_column("trades", "entry_reason")
    op.drop_column("trades", "market_type")
    op.drop_column("trades", "trade_direction")
