import json
import uuid
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import PlatformStatus, ProductSource, ProductStatus


def _img(sku: str) -> str:
    return json.dumps([{
        "document_id": "placeholder",
        "document_original_name": "product.jpg",
        "document_public_url": f"https://placehold.co/600x400?text={sku}",
        "is_primary": True,
    }])


def _sp(idr_price: int) -> str:
    return json.dumps([
        {"currency_code": "IDR", "price": idr_price},
        {"currency_code": "USD", "price": round(idr_price / 16000)},
        {"currency_code": "EUR", "price": round(idr_price / 17500)},
    ])


_SC = ProductSource.STANDARD_CATALOG

_SEED_PRODUCTS = [
    # cat-001 — Solid Wood Furniture · lead_time: 30 days
    {
        "mrp_id": "MRP-1001", "sku": "MFG-1001", "name": "Teak Dining Table 6-Seater",
        "description": "Solid teak dining table with hand-finished surface, seats six comfortably.",
        "price": 8500000, "category_id": "cat-001",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 5,
        "lead_time": "30 days", "selling_price": 8500000, "primary_material": "Teak",
        "image_attached": _img("MFG-1001"), "sales_price": _sp(8500000),
    },
    {
        "mrp_id": "MRP-1002", "sku": "MFG-1002", "name": "Mahogany Bed Frame King",
        "description": "King-size bed frame in solid mahogany with carved headboard detail.",
        "price": 12000000, "category_id": "cat-001",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 12,
        "lead_time": "30 days", "selling_price": 12000000, "primary_material": "Mahogany",
        "image_attached": _img("MFG-1002"), "sales_price": _sp(12000000),
    },
    {
        "mrp_id": "MRP-1003", "sku": "MFG-1003", "name": "Teak Bookshelf 5-Tier",
        "description": "Five-tier freestanding bookshelf in kiln-dried teak, natural oil finish.",
        "price": 4500000, "category_id": "cat-001",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.draft, "days_ago": 20,
        "lead_time": "30 days", "selling_price": 4500000, "primary_material": "Teak",
        "image_attached": _img("MFG-1003"), "sales_price": _sp(4500000),
    },
    {
        "mrp_id": "MRP-1004", "sku": "MFG-1004", "name": "Solid Wood Coffee Table",
        "description": "Rectangular coffee table in solid teak with lower shelf for storage.",
        "price": 3200000, "category_id": "cat-001",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 30,
        "lead_time": "30 days", "selling_price": 3200000, "primary_material": "Teak",
        "image_attached": _img("MFG-1004"), "sales_price": _sp(3200000),
    },
    {
        "mrp_id": "MRP-1005", "sku": "MFG-1005", "name": "Mahogany Wardrobe 3-Door",
        "description": "Three-door wardrobe in solid mahogany with internal hanging rail and shelves.",
        "price": 9800000, "category_id": "cat-001",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.archived, "days_ago": 45,
        "lead_time": "30 days", "selling_price": 9800000, "primary_material": "Mahogany",
        "image_attached": _img("MFG-1005"), "sales_price": _sp(9800000),
    },
    # cat-002 — Custom Order Furniture · lead_time: 45-60 days
    {
        "mrp_id": "MRP-2001", "sku": "MFG-2001", "name": "Custom Carved Dining Chair",
        "description": "Handcarved dining chair with custom motif, made to order in teak or mahogany.",
        "price": 2100000, "category_id": "cat-002",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.draft, "days_ago": 8,
        "lead_time": "45-60 days", "selling_price": 2100000, "primary_material": "Teak",
        "image_attached": _img("MFG-2001"), "sales_price": _sp(2100000),
    },
    {
        "mrp_id": "MRP-2002", "sku": "MFG-2002", "name": "Bespoke TV Cabinet",
        "description": "Custom-built TV cabinet with cable management and adjustable shelving.",
        "price": 5600000, "category_id": "cat-002",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.draft, "days_ago": 15,
        "lead_time": "45-60 days", "selling_price": 5600000, "primary_material": "Teak",
        "image_attached": _img("MFG-2002"), "sales_price": _sp(5600000),
    },
    {
        "mrp_id": "MRP-2003", "sku": "MFG-2003", "name": "Custom Writing Desk",
        "description": "Handcrafted writing desk with drawers, built to customer dimensions.",
        "price": 4200000, "category_id": "cat-002",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.archived, "days_ago": 55,
        "lead_time": "45-60 days", "selling_price": 4200000, "primary_material": "Teak",
        "image_attached": _img("MFG-2003"), "sales_price": _sp(4200000),
    },
    {
        "mrp_id": "MRP-2004", "sku": "MFG-2004", "name": "Carved Headboard King",
        "description": "Ornate king-size headboard with traditional Jepara carving motifs.",
        "price": 3800000, "category_id": "cat-002",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 25,
        "lead_time": "45-60 days", "selling_price": 3800000, "primary_material": "Mahogany",
        "image_attached": _img("MFG-2004"), "sales_price": _sp(3800000),
    },
    {
        "mrp_id": "MRP-2005", "sku": "MFG-2005", "name": "Custom Display Cabinet",
        "description": "Glass-front display cabinet built to specification, available in all sizes.",
        "price": 6500000, "category_id": "cat-002",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.draft, "days_ago": 70,
        "lead_time": "45-60 days", "selling_price": 6500000, "primary_material": "Teak",
        "image_attached": _img("MFG-2005"), "sales_price": _sp(6500000),
    },
    # cat-003 — Outdoor & Garden Furniture · lead_time: 21 days
    {
        "mrp_id": "MRP-3001", "sku": "MFG-3001", "name": "Teak Garden Dining Set 4-Seater",
        "description": "Four-seater outdoor dining set in grade-A teak, weather-resistant.",
        "price": 11000000, "category_id": "cat-003",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 3,
        "lead_time": "21 days", "selling_price": 11000000, "primary_material": "Teak",
        "image_attached": _img("MFG-3001"), "sales_price": _sp(11000000),
    },
    {
        "mrp_id": "MRP-3002", "sku": "MFG-3002", "name": "Teak Sun Lounger",
        "description": "Adjustable teak sun lounger with stainless steel bolts, FSC certified.",
        "price": 3800000, "category_id": "cat-003",
        "status": ProductStatus.active, "product_source": _SC,
        "platform_status": PlatformStatus.published, "days_ago": 18,
        "lead_time": "21 days", "selling_price": 3800000, "primary_material": "Teak",
        "image_attached": _img("MFG-3002"), "sales_price": _sp(3800000),
    },
    {
        "mrp_id": "MRP-3003", "sku": "MFG-3003", "name": "Outdoor Bench Teak 2m",
        "description": "Two-metre garden bench in solid teak, no maintenance required.",
        "price": 2900000, "category_id": "cat-003",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.archived, "days_ago": 80,
        "lead_time": "21 days", "selling_price": 2900000, "primary_material": "Teak",
        "image_attached": _img("MFG-3003"), "sales_price": _sp(2900000),
    },
    {
        "mrp_id": "MRP-3004", "sku": "MFG-3004", "name": "Teak Folding Chair",
        "description": "Folding teak garden chair, lightweight and compact for easy storage.",
        "price": 1200000, "category_id": "cat-003",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.draft, "days_ago": 40,
        "lead_time": "21 days", "selling_price": 1200000, "primary_material": "Teak",
        "image_attached": _img("MFG-3004"), "sales_price": _sp(1200000),
    },
    {
        "mrp_id": "MRP-3005", "sku": "MFG-3005", "name": "Garden Coffee Table Teak",
        "description": "Square outdoor coffee table in solid teak with hidden drainage channels.",
        "price": 2400000, "category_id": "cat-003",
        "status": ProductStatus.inactive, "product_source": _SC,
        "platform_status": PlatformStatus.archived, "days_ago": 90,
        "lead_time": "21 days", "selling_price": 2400000, "primary_material": "Teak",
        "image_attached": _img("MFG-3005"), "sales_price": _sp(2400000),
    },
]


async def _seed(session: AsyncSession, tenant_id: str) -> None:
    now = datetime.utcnow()
    for row in _SEED_PRODUCTS:
        updated = now - timedelta(days=row["days_ago"])
        session.add(Product(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            mrp_id=row["mrp_id"],
            sku=row["sku"],
            name=row["name"],
            description=row["description"],
            price=row["price"],
            category_id=row["category_id"],
            status=row["status"].value,
            product_source=row["product_source"].value,
            platform_status=row["platform_status"].value,
            lead_time=row["lead_time"],
            selling_price=row["selling_price"],
            primary_material=row["primary_material"],
            gross_weight=None,
            image_attached=row["image_attached"],
            sales_price=row["sales_price"],
            updated_at=updated,
            created_at=updated,
            synced_at=None,
        ))


async def seed_if_empty(session_factory, tenant_id: str = "tenant-001") -> None:
    async with session_factory() as session:
        result = await session.execute(select(func.count()).select_from(Product))
        count = result.scalar()
        if count == 0:
            await _seed(session, tenant_id)
            await session.commit()
