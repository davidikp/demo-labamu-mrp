from __future__ import annotations

import json
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class ProductStatus(str, Enum):
    active   = "ACTIVE"
    inactive = "INACTIVE"


class ProductSource(str, Enum):
    STANDARD_CATALOG = "STANDARD_CATALOG"
    # TODO engineer: add CUSTOM_ORDER when custom product catalog integration is built


class PlatformStatus(str, Enum):
    draft     = "draft"
    published = "published"
    archived  = "archived"


class ProductFilters(BaseModel):
    page:            int                           = 1
    size:            int                           = 10
    name:            Optional[str]                 = None
    status:          Optional[ProductStatus]       = None
    product_source:  Optional[ProductSource]       = None
    platform_status: Optional[PlatformStatus]      = None
    published:       Optional[bool]                = None
    category_id:     Optional[str]                 = None
    sku:             Optional[str]                 = None
    keyword:         Optional[str]                 = None
    sort:            str                           = "updated_at:desc"


class ProductItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:               str
    tenant_id:        str
    mrp_id:           str
    sku:              str
    name:             str
    description:      str
    price:            float
    category_id:      str
    status:           ProductStatus
    product_source:   ProductSource
    platform_status:  PlatformStatus
    updated_at:       datetime
    created_at:       datetime
    synced_at:        Optional[datetime]
    lead_time:        Optional[str]      = None
    selling_price:    Optional[float]    = None
    primary_material: Optional[str]      = None
    gross_weight:     Optional[float]    = None
    image_attached:   List[dict]         = []
    sales_price:      List[dict]         = []

    @field_validator('image_attached', 'sales_price', mode='before')
    @classmethod
    def parse_json_field(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v or []


class PaginationMeta(BaseModel):
    page:        int
    size:        int
    total:       int
    total_pages: int


class ProductListResponse(BaseModel):
    data: list[ProductItem]
    meta: PaginationMeta


class ProductDetailResponse(BaseModel):
    data: ProductItem


class ProductUpdate(BaseModel):
    platform_status: PlatformStatus


class ErrorResponse(BaseModel):
    code:    int
    message: str
    detail:  Optional[str] = None
