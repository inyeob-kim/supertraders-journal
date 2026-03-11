from fastapi import APIRouter

from app.api.v1 import auth, dashboard, symbols, trades, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(trades.router, prefix="/trades", tags=["trades"])
api_router.include_router(symbols.router, prefix="/symbols", tags=["symbols"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

