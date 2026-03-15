"""
Auth API. Sign-up and sign-in are handled by the frontend with Firebase Auth.
The backend only verifies Firebase ID tokens via the Authorization Bearer header.
Protected routes use the get_current_user dependency (see api/deps.py).
"""

from fastapi import APIRouter

router = APIRouter()

# No login/signup endpoints; frontend uses Firebase Auth and sends ID token in headers.
