from __future__ import annotations

from typing import Optional

from sqlalchemy import and_, delete, func, or_, select

from app.demo.category_seed import _seed_categories
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import (
    CategoryFilters,
    CategoryItem,
    CategoryListResponse,
)
from app.schemas.product import PaginationMeta

_ALLOWED_SORT_FIELDS: set = {"id", "name", "status", "updated_at", "created_at"}
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
    col = getattr(Category, field)
    return col.desc() if direction == "desc" else col.asc()


class DemoCategoryProvider:
    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    async def get_categories(
        self, tenant_id: str, filters: CategoryFilters
    ) -> CategoryListResponse:
        async with self._session_factory() as session:
            conditions = [Category.tenant_id == tenant_id]

            if filters.name:
                conditions.append(Category.name.ilike(f"%{filters.name}%"))
            if filters.status:
                conditions.append(Category.status == filters.status.value)
            if filters.keyword:
                kw = f"%{filters.keyword}%"
                conditions.append(or_(
                    Category.name.ilike(kw),
                    Category.description.ilike(kw),
                ))
            if filters.has_published is True:
                published_ids = (
                    select(Product.category_id)
                    .where(
                        Product.tenant_id == tenant_id,
                        Product.platform_status == "published",
                    )
                    .distinct()
                )
                conditions.append(Category.id.in_(published_ids))

            where_clause = and_(*conditions)

            total_result = await session.execute(
                select(func.count()).select_from(Category).where(where_clause)
            )
            total = total_result.scalar() or 0

            field, direction = _parse_sort(filters.sort)
            offset = (filters.page - 1) * filters.size

            rows_result = await session.execute(
                select(Category)
                .where(where_clause)
                .order_by(_sort_column(field, direction))
                .offset(offset)
                .limit(filters.size)
            )
            rows = rows_result.scalars().all()

            return CategoryListResponse(
                data=[CategoryItem.model_validate(r) for r in rows],
                meta=PaginationMeta(
                    page=filters.page,
                    size=filters.size,
                    total=total,
                    total_pages=0,  # recalculated in CategoryService
                ),
            )

    async def get_category_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[CategoryItem]:
        # Stubbed for future use — not wired to any route yet.
        # Will back GET /demo/v1/categories/{id} once that endpoint is added.
        async with self._session_factory() as session:
            result = await session.execute(
                select(Category).where(
                    Category.id == id, Category.tenant_id == tenant_id
                )
            )
            row = result.scalar_one_or_none()
            return CategoryItem.model_validate(row) if row else None

    async def reset_demo_data(self) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(Category).where(Category.tenant_id == "tenant-001")
            )
            await _seed_categories(session, "tenant-001")
            await session.commit()
