"""init_uuid_schema

Revision ID: a74c9c69b6aa
Revises: 
Create Date: 2026-03-11 17:05:28.038301

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a74c9c69b6aa'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=100), nullable=True),
        sa.Column("provider", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "symbols",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol", sa.String(length=30), nullable=False),
        sa.Column("name_kr", sa.String(length=255), nullable=True),
        sa.Column("name_en", sa.String(length=255), nullable=True),
        sa.Column("market", sa.String(length=50), nullable=False),
        sa.Column("exchange", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("symbol", "market", name="uq_symbols_symbol_market"),
    )
    op.create_index(op.f("ix_symbols_symbol"), "symbols", ["symbol"], unique=False)
    op.create_index(op.f("ix_symbols_market"), "symbols", ["market"], unique=False)

    op.create_table(
        "mistake_tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("label_ko", sa.String(length=100), nullable=False),
        sa.Column("label_en", sa.String(length=100), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    op.create_table(
        "user_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trading_principles", sa.Text(), nullable=True),
        sa.Column("mindset_quotes", sa.Text(), nullable=True),
        sa.Column("daily_max_loss_pct", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column(
            "monthly_target_return_pct",
            sa.Numeric(precision=5, scale=2),
            nullable=True,
        ),
        sa.Column("risk_per_trade_pct", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("rule_of_the_day", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "trades",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol_snapshot", sa.String(length=30), nullable=False),
        sa.Column("symbol_name_snapshot", sa.String(length=255), nullable=True),
        sa.Column("market_snapshot", sa.String(length=50), nullable=True),
        sa.Column("exchange_snapshot", sa.String(length=100), nullable=True),
        sa.Column("trade_date", sa.Date(), nullable=False),
        sa.Column("entry_price", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("exit_price", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=18, scale=4), nullable=True),
        sa.Column("pnl_amount", sa.Numeric(precision=18, scale=4), nullable=True),
        sa.Column("pnl_pct", sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column("memo", sa.Text(), nullable=True),
        sa.Column("chart_image_url", sa.Text(), nullable=True),
        sa.Column("chart_image_path", sa.Text(), nullable=True),
        sa.Column("entry_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("exit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["symbol_id"], ["symbols.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trades_user_id"), "trades", ["user_id"], unique=False)
    op.create_index(op.f("ix_trades_symbol_id"), "trades", ["symbol_id"], unique=False)
    op.create_index(op.f("ix_trades_trade_date"), "trades", ["trade_date"], unique=False)
    op.create_index(
        "ix_trades_user_trade_date_desc",
        "trades",
        ["user_id", sa.text("trade_date DESC")],
        unique=False,
    )
    op.create_index(
        "ix_trades_user_created_at_desc",
        "trades",
        ["user_id", sa.text("created_at DESC")],
        unique=False,
    )
    op.create_index("ix_trades_user_symbol", "trades", ["user_id", "symbol_id"], unique=False)

    op.create_table(
        "favorite_symbols",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("symbol_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["symbol_id"], ["symbols.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "symbol_id", name="uq_favorite_symbol_user_symbol"),
    )

    op.create_table(
        "trade_mistake_tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trade_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mistake_tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["mistake_tag_id"], ["mistake_tags.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["trade_id"], ["trades.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("trade_id", "mistake_tag_id", name="uq_trade_mistake_tag"),
    )


def downgrade() -> None:
    op.drop_table("trade_mistake_tags")
    op.drop_table("favorite_symbols")
    op.drop_index("ix_trades_user_symbol", table_name="trades")
    op.drop_index("ix_trades_user_created_at_desc", table_name="trades")
    op.drop_index("ix_trades_user_trade_date_desc", table_name="trades")
    op.drop_index(op.f("ix_trades_trade_date"), table_name="trades")
    op.drop_index(op.f("ix_trades_symbol_id"), table_name="trades")
    op.drop_index(op.f("ix_trades_user_id"), table_name="trades")
    op.drop_table("trades")
    op.drop_table("user_profiles")
    op.drop_table("mistake_tags")
    op.drop_index(op.f("ix_symbols_market"), table_name="symbols")
    op.drop_index(op.f("ix_symbols_symbol"), table_name="symbols")
    op.drop_table("symbols")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

