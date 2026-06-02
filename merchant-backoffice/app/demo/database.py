import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.product import Base

def _default_database_url() -> str:
    # Vercel serverless functions can write reliably to /tmp.
    # For persistent production data, set DATABASE_URL to a hosted database.
    if os.getenv("VERCEL"):
        return "sqlite+aiosqlite:////tmp/demo.db"
    return "sqlite+aiosqlite:///./demo.db"


DATABASE_URL = os.getenv("DATABASE_URL", _default_database_url())

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
