"""sync_firebase_columns: add firebase_uid/photo_url if missing (DB was ahead of code).

Revision ID: b1c2d3e4f5a6
Revises: 14eb8fcf5ca8
Create Date: 2026-03-11

Idempotent: only adds columns/index that don't exist; drops password_hash if present.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "14eb8fcf5ca8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add firebase_uid if missing (PostgreSQL 9.5+)
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) NULL"
    )
    op.execute(
        "UPDATE users SET firebase_uid = 'legacy-' || id::text WHERE firebase_uid IS NULL"
    )
    op.execute(
        "ALTER TABLE users ALTER COLUMN firebase_uid SET NOT NULL"
    )
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_firebase_uid ON users (firebase_uid)"
    )
    # Add photo_url if missing
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(512) NULL"
    )
    # Make email nullable
    op.alter_column(
        "users",
        "email",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    # Extend display_name 100 -> 255
    op.alter_column(
        "users",
        "display_name",
        existing_type=sa.String(length=100),
        type_=sa.String(length=255),
        existing_nullable=True,
    )
    # Drop password_hash only if it exists
    op.execute(
        """
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
          ) THEN
            ALTER TABLE users DROP COLUMN password_hash;
          END IF;
        END $$;
        """
    )
    # Set provider default
    op.alter_column(
        "users",
        "provider",
        existing_type=sa.String(length=30),
        server_default=sa.text("'firebase'"),
        existing_nullable=False,
    )


def downgrade() -> None:
    pass