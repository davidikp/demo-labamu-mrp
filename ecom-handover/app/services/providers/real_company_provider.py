from __future__ import annotations


class RealCompanyProvider:
    async def get_company(self, tenant_id: str, filters=None):
        # TODO engineer: implement GET company from Labamu Core SSO API
        # TODO engineer: company data is owned by Labamu Core, never stored in ecommerce DB
        raise NotImplementedError

    async def touch_synced_at(self, tenant_id: str):
        # TODO engineer: implement sync trigger to re-pull from Labamu Core SSO
        raise NotImplementedError

    async def reset_demo_data(self):
        # TODO engineer: remove reset — not applicable in production
        raise NotImplementedError
