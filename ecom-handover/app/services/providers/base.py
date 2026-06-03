from __future__ import annotations

from typing import Optional, Protocol

from app.schemas.category import CategoryFilters, CategoryItem, CategoryListResponse
from app.schemas.product import ProductFilters, ProductItem, ProductListResponse


class ProductProvider(Protocol):
    async def get_products(
        self, tenant_id: str, filters: ProductFilters
    ) -> ProductListResponse: ...

    async def get_product_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[ProductItem]:
        # Stubbed for future use — not wired to any route yet.
        # Will back GET /demo/v1/products/{id} once that endpoint is added.
        ...

    async def update_product(
        self, tenant_id: str, product_id: str, platform_status: str
    ) -> Optional[ProductItem]: ...

    async def reset_demo_data(self) -> None: ...


class CategoryProvider(Protocol):
    async def get_categories(
        self, tenant_id: str, filters: CategoryFilters
    ) -> CategoryListResponse: ...

    async def get_category_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[CategoryItem]:
        # Stubbed for future use — not wired to any route yet.
        # Will back GET /demo/v1/categories/{id} once that endpoint is added.
        ...

    async def reset_demo_data(self) -> None: ...


class CompanyProvider(Protocol):
    async def get_company(self, tenant_id: str) -> Optional["CompanyItem"]: ...
    async def touch_synced_at(self, tenant_id: str) -> Optional["CompanyItem"]: ...
    async def reset_demo_data(self) -> None: ...
