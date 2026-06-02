import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.product import Base

# Vercel's filesystem is read-only except for /tmp.
# Locally the default stays ./demo.db for convenience.
_default_db = (
    "sqlite+aiosqlite:////tmp/demo.db"
    if os.getenv("VERCEL")
    else "sqlite+aiosqlite:///./demo.db"
)

DATABASE_URL = os.getenv("DATABASE_URL", _default_db)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)