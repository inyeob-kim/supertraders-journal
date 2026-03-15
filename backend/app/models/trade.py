import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, Text, desc
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Trade(Base, TimestampMixin):
    __tablename__ = "trades"
    __table_args__ = (
        Index("ix_trades_user_trade_date_desc", "user_id", desc("trade_date")),
        Index("ix_trades_user_created_at_desc", "user_id", desc("created_at")),
        Index("ix_trades_user_symbol", "user_id", "symbol_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    symbol_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("symbols.id", ondelete="RESTRICT"), index=True, nullable=False
    )

    symbol_snapshot: Mapped[str] = mapped_column(String(30), nullable=False)
    symbol_name_snapshot: Mapped[str | None] = mapped_column(String(255), nullable=True)
    market_snapshot: Mapped[str | None] = mapped_column(String(50), nullable=True)
    exchange_snapshot: Mapped[str | None] = mapped_column(String(100), nullable=True)

    trade_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    trade_direction: Mapped[str] = mapped_column(String(10), nullable=False, default="LONG")
    market_type: Mapped[str] = mapped_column(String(30), nullable=False, default="US_STOCK")
    entry_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    pnl_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    pnl_pct: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    trade_status: Mapped[str] = mapped_column(String(20), nullable=False, default="CLOSED")
    entry_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    exit_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    trade_reflection: Mapped[str | None] = mapped_column(Text, nullable=True)
    strategy_tags: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)

    chart_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    chart_image_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    entry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    exit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="trades", lazy="joined")
    symbol = relationship("Symbol", back_populates="trades", lazy="joined")
    trade_mistake_tags = relationship(
        "TradeMistakeTag",
        back_populates="trade",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

