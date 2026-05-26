from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company

_SEED_COMPANY = {
    "id":                           "company-001",
    "tenant_id":                    "tenant-001",
    "company_name":                 "TeakWorks",
    "company_official_name":        "PT. TeakWorks Global Mandiri",
    "company_whatsapp":             "+6282110989696",
    "company_uid":                  "bpo3ok",
    "company_slug":                 "teakworks-1",
    "company_address":              "Jl. Raya Jepara No. 12",
    "company_city":                 "Kabupaten Jepara",
    "company_province":             "Jawa Tengah",
    "company_district":             "Kedung",
    "company_village":              "Kedungmalang",
    "company_country":              "Indonesia",
    "company_zipcode":              "59463",
    "company_email_contact":        "info@teakworks.id",
    "company_phone":                "+6281298765432",
    "company_lat":                  -6.5891,
    "company_long":                 110.6742,
    "company_tax_number":           "08.230.138.0-130.021",
    "company_rt":                   "015",
    "company_rw":                   "002",
    "company_type":                 "OUTLET",
    "business_entity_name_en":      "pt",
    "company_product_types_name_id": "both",
    "company_industry_id":          29,
    "company_industry_name_id":     "Manufaktur",
    "company_industry_name_en":     "Manufacturing",
    "business_activity":            "offline",
    "membership":                   "pro",
    "logo_url":                     "/assets/teakworks-logo.png",
    "synced_at":                    None,
}


async def _seed_company(session: AsyncSession, tenant_id: str) -> None:
    session.add(Company(**_SEED_COMPANY))


async def seed_company_if_empty(session_factory, tenant_id: str = "tenant-001") -> None:
    async with session_factory() as session:
        result = await session.execute(select(func.count()).select_from(Company))
        count = result.scalar()
        if count == 0:
            await _seed_company(session, tenant_id)
            await session.commit()
