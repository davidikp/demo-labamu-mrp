import uuid
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryStatus

_SEED_CATEGORIES = [
    {
        "id": "cat-001", "name": "Solid Wood Furniture",
        "description": "Teak and mahogany dining sets, beds and living room pieces",
        "status": CategoryStatus.ACTIVE, "days_ago": 10,
    },
    {
        "id": "cat-002", "name": "Custom Order Furniture",
        "description": "Bespoke handcrafted pieces made to specification",
        "status": CategoryStatus.ACTIVE, "days_ago": 25,
    },
    {
        "id": "cat-003", "name": "Outdoor & Garden Furniture",
        "description": "Teak garden sets, sun loungers and outdoor dining",
        "status": CategoryStatus.ACTIVE, "days_ago": 40,
    },
    {
        "id": "cat-004", "name": "Wood Components & Panels",
        "description": "Raw timber components, panels and structural wood parts",
        "status": CategoryStatus.ACTIVE, "days_ago": 60,
    },
    {
        "id": "cat-005", "name": "Finishing & Hardware",
        "description": "Wood stains, varnishes, hinges, handles and fittings",
        "status": CategoryStatus.INACTIVE, "days_ago": 85,
    },
]


async def _seed_categories(session: AsyncSession, tenant_id: str) -> None:
    now = datetime.utcnow()
    for row in _SEED_CATEGORIES:
        updated = now - timedelta(days=row["days_ago"])
        session.add(Category(
            id=row["id"],
            tenant_id=tenant_id,
            name=row["name"],
            description=row["description"],
            status=row["status"].value,
            created_at=updated,
            updated_at=updated,
        ))


async def seed_categories_if_empty(session_factory, tenant_id: str = "tenant-001") -> None:
    async with session_factory() as session:
        result = await session.execute(select(func.count()).select_from(Category))
        count = result.scalar()
        if count == 0:
            await _seed_categories(session, tenant_id)
            await session.commit()
