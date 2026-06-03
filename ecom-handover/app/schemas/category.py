from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ErrorResponse, PaginationMeta


class CategoryStatus(str, Enum):
    ACTIVE   = "ACTIVE"
    INACTIVE = "INACTIVE"


class CategoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          str
    tenant_id:   str
    name:        str
    description: str
    status:      CategoryStatus
    created_at:  datetime
    updated_at:  datetime


class CategoryListResponse(BaseModel):
    data: list[CategoryItem]
    meta: PaginationMeta


class CategoryFilters(BaseModel):
    page:          int                      = 1
    size:          int                      = 10
    name:          Optional[str]            = None
    status:        Optional[CategoryStatus] = None
    keyword:       Optional[str]            = None
    sort:          str                      = "updated_at:desc"
    has_published: Optional[bool]           = None
