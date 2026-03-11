import uuid

from sqlalchemy import Boolean, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Symbol(Base, TimestampMixin):
    __tablename__ = "symbols"
    __table_args__ = (
        UniqueConstraint("symbol", "market", name="uq_symbols_symbol_market"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    symbol: Mapped[str] = mapped_column(String(30), index=True, nullable=False)
    name_kr: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    market: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    exchange: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    trades = relationship("Trade", back_populates="symbol", lazy="selectin")
    favorites = relationship("FavoriteSymbol", back_populates="symbol", lazy="selectin")

