from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse

from app.demo.auth import get_demo_tenant_id
from app.schemas.category import (
    CategoryFilters,
    CategoryListResponse,
    CategoryStatus,
)
from app.schemas.company import CompanyResponse
from app.schemas.product import (
    ErrorResponse,
    PlatformStatus,
    ProductDetailResponse,
    ProductFilters,
    ProductListResponse,
    ProductSource,
    ProductStatus,
    ProductUpdate,
)
from app.services.category_service import CategoryService
from app.services.company_service import CompanyService
from app.services.product_service import ProductService

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_service(request: Request) -> ProductService:
    return request.app.state.product_service


def _get_category_service(request: Request) -> CategoryService:
    return request.app.state.category_service


def _get_company_service(request: Request) -> CompanyService:
    return request.app.state.company_service


@router.get(
    "/products",
    response_model=ProductListResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get all products",
    description=(
        "Retrieve paginated product catalog. All filters are AND conditions "
        "except keyword, which is OR across sku and name."
    ),
)
async def get_products(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    name: Optional[str] = Query(default=None),
    status: Optional[ProductStatus] = Query(default=None),
    product_source: Optional[ProductSource] = Query(default=None),
    platform_status: Optional[PlatformStatus] = Query(default=None),
    published: Optional[bool] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    sku: Optional[str] = Query(default=None),
    keyword: Optional[str] = Query(default=None),
    sort: str = Query(default="updated_at:desc"),
    tenant_id: str = Depends(get_demo_tenant_id),
    service: ProductService = Depends(_get_service),
) -> ProductListResponse:
    try:
        filters = ProductFilters(
            page=page, size=size, name=name, status=status,
            product_source=product_source, platform_status=platform_status,
            published=published, category_id=category_id, sku=sku,
            keyword=keyword, sort=sort,
        )
        return await service.list_products(tenant_id, filters)
    except Exception as exc:
        logger.exception("Unhandled error in GET /products")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


@router.get(
    "/products/{id}",
    response_model=ProductDetailResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get product by ID",
    description="Retrieve a single product by ID for the authenticated tenant.",
)
async def get_product(
    id: str,
    tenant_id: str = Depends(get_demo_tenant_id),
    service: ProductService = Depends(_get_service),
) -> ProductDetailResponse:
    try:
        product = await service.get_product_by_id(tenant_id, id)
        if not product:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(code=404, message="Product not found", detail=f"No product with id {id}").model_dump(),
            )
        return ProductDetailResponse(data=product)
    except Exception as exc:
        logger.exception("Unhandled error in GET /products/{id}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


@router.patch(
    "/products/{product_id}",
    response_model=ProductDetailResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Update product platform status",
    description="Update the platform_status of a product (published / draft / archived).",
)
async def patch_product(
    product_id: str,
    body: ProductUpdate,
    tenant_id: str = Depends(get_demo_tenant_id),
    service: ProductService = Depends(_get_service),
) -> ProductDetailResponse:
    try:
        updated = await service.update_product(tenant_id, product_id, body.platform_status.value)
        if not updated:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(code=404, message="Product not found", detail=f"No product with id {product_id}").model_dump(),
            )
        return ProductDetailResponse(data=updated)
    except Exception as exc:
        logger.exception("Unhandled error in PATCH /products/{id}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


@router.get(
    "/categories",
    response_model=CategoryListResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get all product categories",
    description="Retrieve paginated categories. keyword is OR across name + description.",
)
async def get_categories(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    name: Optional[str] = Query(default=None),
    status: Optional[CategoryStatus] = Query(default=None),
    keyword: Optional[str] = Query(default=None),
    sort: str = Query(default="updated_at:desc"),
    has_published: Optional[bool] = Query(default=None),
    tenant_id: str = Depends(get_demo_tenant_id),
    service: CategoryService = Depends(_get_category_service),
) -> CategoryListResponse:
    try:
        filters = CategoryFilters(
            page=page, size=size, name=name, status=status,
            keyword=keyword, sort=sort, has_published=has_published,
        )
        return await service.list_categories(tenant_id, filters)
    except Exception as exc:
        logger.exception("Unhandled error in GET /categories")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


@router.get(
    "/company",
    response_model=CompanyResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get company profile",
    description="Retrieve the company profile for the current tenant.",
)
async def get_company(
    tenant_id: str = Depends(get_demo_tenant_id),
    service: CompanyService = Depends(_get_company_service),
) -> CompanyResponse:
    try:
        company = await service.get_company(tenant_id)
        if company is None:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(code=404, message="Company not found", detail=f"No company found for tenant {tenant_id}").model_dump(),
            )
        return CompanyResponse(data=company)
    except Exception as exc:
        logger.exception("Unhandled error in GET /company")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


@router.get(
    "/company/sync",
    response_model=CompanyResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Sync company data",
    description="Simulates re-pulling company data from Labamu Core SSO by updating synced_at.",
)
async def sync_company(
    tenant_id: str = Depends(get_demo_tenant_id),
    service: CompanyService = Depends(_get_company_service),
) -> CompanyResponse:
    # DEMO ONLY — simulates Labamu Core SSO sync
    try:
        company = await service.sync_company(tenant_id)
        if company is None:
            return JSONResponse(
                status_code=404,
                content=ErrorResponse(code=404, message="Company not found", detail=f"No company found for tenant {tenant_id}").model_dump(),
            )
        return CompanyResponse(data=company)
    except Exception as exc:
        logger.exception("Unhandled error in GET /company/sync")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(code=500, message="Internal server error", detail=str(exc)).model_dump(),
        )


# ─────────────────────────────────────────────
# UTILITY — keep these routes LAST in this file.
# Add all new endpoints ABOVE this line.
# ─────────────────────────────────────────────
@router.get(
    "/reset",
    summary="Reset demo data",
    description="Wipe all products and categories for tenant-001 and reseed with default data.",
)
async def reset_demo(
    service: ProductService = Depends(_get_service),
    category_service: CategoryService = Depends(_get_category_service),
) -> dict:
    try:
        await service.reset()
        await category_service.reset()
        return {"message": "Demo data reset successfully"}
    except Exception as exc:
        logger.exception("Unhandled error in GET /reset")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get(
    "/company/reset",
    summary="Reset company demo data",
    description="Wipe and reseed the company row for tenant-001.",
)
async def reset_company(
    service: CompanyService = Depends(_get_company_service),
) -> dict:
    try:
        await service.reset()
        return {"message": "Company data reset successfully"}
    except Exception as exc:
        logger.exception("Unhandled error in GET /company/reset")
        raise HTTPException(status_code=500, detail=str(exc))
