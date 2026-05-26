from __future__ import annotations

from typing import Optional

from app.schemas.company import CompanyItem
from app.services.providers.base import CompanyProvider


class CompanyService:
    def __init__(self, provider: CompanyProvider) -> None:
        self.provider = provider

    async def get_company(self, tenant_id: str) -> Optional[CompanyItem]:
        return await self.provider.get_company(tenant_id)

    async def sync_company(self, tenant_id: str) -> Optional[CompanyItem]:
        # DEMO ONLY: simulates re-pull from Labamu Core by updating synced_at
        # TODO engineer: replace with real Labamu Core SSO API call
        return await self.provider.touch_synced_at(tenant_id)

    async def reset(self) -> None:
        await self.provider.reset_demo_data()
