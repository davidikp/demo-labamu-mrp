from __future__ import annotations

import math

from app.schemas.category import CategoryFilters, CategoryListResponse
from app.schemas.product import PaginationMeta
from app.services.providers.base import CategoryProvider


class CategoryService:
    def __init__(self, provider: CategoryProvider) -> None:
        self.provider = provider

    async def list_categories(
        self, tenant_id: str, filters: CategoryFilters
    ) -> CategoryListResponse:
        raw = await self.provider.get_categories(tenant_id, filters)
        total_pages = math.ceil(raw.meta.total / filters.size) if filters.size > 0 else 0
        return CategoryListResponse(
            data=raw.data,
            meta=PaginationMeta(
                page=filters.page,
                size=filters.size,
                total=raw.meta.total,
                total_pages=total_pages,
            ),
        )

    async def reset(self) -> None:
        await self.provider.reset_demo_data()
