import math
from typing import Optional

from app.schemas.product import (
    PaginationMeta,
    ProductFilters,
    ProductItem,
    ProductListResponse,
)
from app.services.providers.base import ProductProvider


class ProductService:
    def __init__(self, provider: ProductProvider) -> None:
        self.provider = provider

    async def list_products(
        self, tenant_id: str, filters: ProductFilters
    ) -> ProductListResponse:
        raw = await self.provider.get_products(tenant_id, filters)
        total_pages = math.ceil(raw.meta.total / filters.size) if filters.size > 0 else 0
        return ProductListResponse(
            data=raw.data,
            meta=PaginationMeta(
                page=filters.page,
                size=filters.size,
                total=raw.meta.total,
                total_pages=total_pages,
            ),
        )

    async def get_product_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[ProductItem]:
        return await self.provider.get_product_by_id(tenant_id, id)

    async def update_product(
        self, tenant_id: str, product_id: str, platform_status: str
    ) -> Optional[ProductItem]:
        return await self.provider.update_product(tenant_id, product_id, platform_status)

    async def reset(self) -> None:
        await self.provider.reset_demo_data()
