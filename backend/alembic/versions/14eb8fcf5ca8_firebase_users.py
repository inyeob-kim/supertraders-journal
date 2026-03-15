"""firebase_users

Revision ID: 14eb8fcf5ca8
Revises: a74c9c69b6aa
Create Date: 2026-03-11 21:49:33.635756

Schema changes for Firebase-based auth:
- users: add firebase_uid, photo_url; make email nullable; drop password_hash; extend display_name to 255.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "14eb8fcf5ca8"
down_revision: Union[str, Sequence[str], None] = "a74c9c69b6aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add firebase_uid as nullable first so existing rows don't break
    op.add_column(
        "users",
        sa.Column("firebase_uid", sa.String(length=128), nullable=True),
    )
    # Backfill existing users so we can set NOT NULL (use placeholder; real backfill should use real Firebase UIDs)
    op.execute(
        "UPDATE users SET firebase_uid = 'legacy-' || id::text WHERE firebase_uid IS NULL"
    )
    op.alter_column(
        "users",
        "firebase_uid",
        existing_type=sa.String(length=128),
        nullable=False,
    )
    op.create_index(
        op.f("ix_users_firebase_uid"),
        "users",
        ["firebase_uid"],
        unique=True,
    )

    # Email nullable (Firebase may not provide email for some providers)
    op.alter_column(
        "users",
        "email",
        existing_type=sa.String(length=255),
        nullable=True,
    )

    # Add photo_url
    op.add_column(
        "users",
        sa.Column("photo_url", sa.String(length=512), nullable=True),
    )

    # Extend display_name 100 -> 255
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.String(length=100),
        type_=sa.String(length=255),
        existing_nullable=True,
    )

    # Set default provider for new rows
    op.alter_column(
        "users",
        "provider",
        existing_type=sa.String(length=30),
        server_default=sa.text("'firebase'"),
        existing_nullable=False,
    )

    # Remove local-auth password column
    op.drop_column("users", "password_hash")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(length=255), nullable=True),
    )
    op.alter_column(
        "users",
        "provider",
        existing_type=sa.String(length=30),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.String(length=255),
        type_=sa.String(length=100),
        existing_nullable=True,
    )
    op.drop_column("users", "photo_url")
    op.alter_column(
        "users",
        "email",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_index(op.f("ix_users_firebase_uid"), table_name="users")
    op.drop_column("users", "firebase_uid")
