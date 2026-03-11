from fastapi import APIRouter

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary() -> dict[str, str]:
    return {"message": "Dashboard summary placeholder"}

