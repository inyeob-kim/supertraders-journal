import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin


class FavoriteSymbol(Base, CreatedAtMixin):
    __tablename__ = "favorite_symbols"
    __table_args__ = (
        UniqueConstraint("user_id", "symbol_id", name="uq_favorite_symbol_user_symbol"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    symbol_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("symbols.id", ondelete="CASCADE"), nullable=False
    )

    user = relationship("User", back_populates="favorite_symbols", lazy="joined")
    symbol = relationship("Symbol", back_populates="favorites", lazy="joined")

