from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import delete, select

from app.demo.company_seed import _seed_company
from app.models.company import Company
from app.schemas.company import CompanyItem


class DemoCompanyProvider:
    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    async def get_company(self, tenant_id: str) -> Optional[CompanyItem]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(Company).where(Company.tenant_id == tenant_id)
            )
            row = result.scalar_one_or_none()
            return CompanyItem.model_validate(row) if row else None

    async def touch_synced_at(self, tenant_id: str) -> Optional[CompanyItem]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(Company).where(Company.tenant_id == tenant_id)
            )
            row = result.scalar_one_or_none()
            if row is None:
                return None
            row.synced_at = datetime.utcnow()
            await session.commit()
            await session.refresh(row)
            return CompanyItem.model_validate(row)

    async def reset_demo_data(self) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(Company).where(Company.tenant_id == "tenant-001")
            )
            await _seed_company(session, "tenant-001")
            await session.commit()
