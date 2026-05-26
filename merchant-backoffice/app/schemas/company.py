from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ErrorResponse  # noqa: F401 — re-exported for router use


class CompanyItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    company_name: str
    company_official_name: str
    company_whatsapp: str
    company_uid: str
    company_slug: str
    company_address: str
    company_city: str
    company_province: str
    company_district: str
    company_village: str
    company_country: str
    company_zipcode: str
    company_email_contact: str
    company_phone: str
    company_lat: Optional[float]
    company_long: Optional[float]
    company_tax_number: Optional[str]
    company_rt: Optional[str]
    company_rw: Optional[str]
    company_type: str
    business_entity_name_en: str
    company_product_types_name_id: str
    company_industry_id: Optional[int]
    company_industry_name_id: Optional[str]
    company_industry_name_en: Optional[str]
    business_activity: str
    membership: str
    logo_url: str
    synced_at: Optional[datetime]


class CompanyResponse(BaseModel):
    data: CompanyItem
