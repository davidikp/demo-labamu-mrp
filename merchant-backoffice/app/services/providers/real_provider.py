from __future__ import annotations

from typing import Optional

from app.schemas.product import ProductFilters, ProductItem, ProductListResponse


class RealProductProvider:
    async def get_products(
        self, tenant_id: str, filters: ProductFilters
    ) -> ProductListResponse:
        # TODO engineer: implement get_products with SQLAlchemy async + asyncpg + Postgres
        raise NotImplementedError

    async def get_product_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[ProductItem]:
        # TODO engineer: implement get_product_by_id
        # Calls GET /products/{id} from MRP API via httpx
        # MRP endpoint returns single product wrapped in { data: {...}, message, status }
        # Extract data field and map to ProductItem schema
        raise NotImplementedError

    async def reset_demo_data(self) -> None:
        # TODO engineer: implement tenant_id extraction from JWT (see demo/auth.py for reference pattern)
        # TODO engineer: run alembic init and generate migration from Product model
        raise NotImplementedError
