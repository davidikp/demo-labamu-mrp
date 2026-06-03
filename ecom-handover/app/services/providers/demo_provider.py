from __future__ import annotations

from typing import Optional

from sqlalchemy import and_, delete, func, or_, select, update

from app.demo.product_seed import _seed
from app.models.product import Product
from app.schemas.product import (
    PaginationMeta,
    ProductFilters,
    ProductItem,
    ProductListResponse,
)

_ALLOWED_SORT_FIELDS: set = {
    "id", "name", "sku", "price", "status", "updated_at", "created_at",
}
_DEFAULT_SORT = ("updated_at", "desc")


def _parse_sort(sort: str) -> tuple:
    parts = sort.split(":", 1)
    if parts[0] not in _ALLOWED_SORT_FIELDS:
        return _DEFAULT_SORT
    field = parts[0]
    direction = (
        parts[1].lower()
        if len(parts) > 1 and parts[1].lower() in ("asc", "desc")
        else _DEFAULT_SORT[1]
    )
    return field, direction


def _sort_column(field: str, direction: str):
    col = getattr(Product, field)
    return col.desc() if direction == "desc" else col.asc()


class DemoProductProvider:
    def __init__(self, session_factory) -> None:  # param name matches main.py injection
        self._session_factory = session_factory

    async def get_products(
        self, tenant_id: str, filters: ProductFilters
    ) -> ProductListResponse:
        async with self._session_factory() as session:
            conditions = [Product.tenant_id == tenant_id]

            if filters.name:
                conditions.append(Product.name.ilike(f"%{filters.name}%"))
            if filters.status:
                conditions.append(Product.status == filters.status.value)
            if filters.product_source:
                conditions.append(Product.product_source == filters.product_source.value)
            if filters.platform_status:
                conditions.append(Product.platform_status == filters.platform_status.value)
            if filters.published is True:
                conditions.append(Product.platform_status == "published")
            elif filters.published is False:
                conditions.append(Product.platform_status != "published")
            if filters.category_id:
                conditions.append(Product.category_id == filters.category_id)
            if filters.sku:
                conditions.append(Product.sku.ilike(f"%{filters.sku}%"))
            if filters.keyword:
                kw = f"%{filters.keyword}%"
                conditions.append(or_(
                    Product.sku.ilike(kw),
                    Product.name.ilike(kw),
                ))

            where_clause = and_(*conditions)

            total_result = await session.execute(
                select(func.count()).select_from(Product).where(where_clause)
            )
            total = total_result.scalar() or 0

            field, direction = _parse_sort(filters.sort)
            offset = (filters.page - 1) * filters.size

            rows_result = await session.execute(
                select(Product)
                .where(where_clause)
                .order_by(_sort_column(field, direction))
                .offset(offset)
                .limit(filters.size)
            )
            rows = rows_result.scalars().all()

            return ProductListResponse(
                data=[ProductItem.model_validate(r) for r in rows],
                meta=PaginationMeta(
                    page=filters.page,
                    size=filters.size,
                    total=total,
                    total_pages=0,  # recalculated in ProductService
                ),
            )

    async def get_product_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[ProductItem]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(Product).where(
                    Product.id == id,
                    Product.tenant_id == tenant_id,
                )
            )
            row = result.scalar_one_or_none()
            return ProductItem.model_validate(row) if row else None

    async def update_product(
        self, tenant_id: str, product_id: str, platform_status: str
    ) -> Optional[ProductItem]:
        async with self._session_factory() as session:
            stmt = (
                update(Product)
                .where(Product.id == product_id, Product.tenant_id == tenant_id)
                .values(platform_status=platform_status)
                .returning(Product)
            )
            result = await session.execute(stmt)
            await session.commit()
            row = result.scalar_one_or_none()
            return ProductItem.model_validate(row) if row else None

    async def reset_demo_data(self) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(Product).where(Product.tenant_id == "tenant-001")
            )
            await _seed(session, "tenant-001")
            await session.commit()
