import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    trading_principles: Mapped[str | None] = mapped_column(Text, nullable=True)
    mindset_quotes: Mapped[str | None] = mapped_column(Text, nullable=True)
    daily_max_loss_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    monthly_target_return_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    risk_per_trade_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    rule_of_the_day: Mapped[str | None] = mapped_column(String(255), nullable=True)
    common_mistakes: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="profile", lazy="joined")

