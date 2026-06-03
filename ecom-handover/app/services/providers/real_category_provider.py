from __future__ import annotations

from typing import Optional

from app.schemas.category import CategoryFilters, CategoryItem, CategoryListResponse


class RealCategoryProvider:
    async def get_categories(
        self, tenant_id: str, filters: CategoryFilters
    ) -> CategoryListResponse:
        # TODO engineer: implement get_categories with SQLAlchemy async + asyncpg + Postgres
        raise NotImplementedError

    async def get_category_by_id(
        self, tenant_id: str, id: str
    ) -> Optional[CategoryItem]:
        # TODO engineer: implement get_category_by_id with SQLAlchemy async + asyncpg + Postgres
        raise NotImplementedError

    async def reset_demo_data(self) -> None:
        # TODO engineer: run alembic init and generate migration from Category model
        raise NotImplementedError
