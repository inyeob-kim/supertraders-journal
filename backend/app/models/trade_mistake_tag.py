import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin


class TradeMistakeTag(Base, CreatedAtMixin):
    __tablename__ = "trade_mistake_tags"
    __table_args__ = (
        UniqueConstraint("trade_id", "mistake_tag_id", name="uq_trade_mistake_tag"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trade_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trades.id", ondelete="CASCADE"),
        nullable=False,
    )
    mistake_tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mistake_tags.id", ondelete="CASCADE"),
        nullable=False,
    )

    trade = relationship("Trade", back_populates="trade_mistake_tags", lazy="joined")
    mistake_tag = relationship("MistakeTag", back_populates="trade_mistake_tags", lazy="joined")

