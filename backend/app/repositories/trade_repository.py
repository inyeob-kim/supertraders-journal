from sqlalchemy.ext.asyncio import AsyncSession


class TradeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

