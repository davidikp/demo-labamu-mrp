from sqlalchemy import Column, DateTime, Float, Integer, String

from app.models.product import Base


class Company(Base):
    __tablename__ = "companies"

    id                           = Column(String,  primary_key=True)
    tenant_id                    = Column(String,  index=True, nullable=False)
    company_name                 = Column(String,  nullable=False)
    company_official_name        = Column(String,  nullable=False)
    company_whatsapp             = Column(String,  nullable=False)
    company_uid                  = Column(String,  nullable=False)
    company_slug                 = Column(String,  nullable=False)
    company_address              = Column(String,  nullable=False)
    company_city                 = Column(String,  nullable=False)
    company_province             = Column(String,  nullable=False)
    company_district             = Column(String,  nullable=False)
    company_village              = Column(String,  nullable=False)
    company_country              = Column(String,  nullable=False)
    company_zipcode              = Column(String,  nullable=False)
    company_email_contact        = Column(String,  nullable=False)
    company_phone                = Column(String,  nullable=False)
    company_lat                  = Column(Float,   nullable=True)
    company_long                 = Column(Float,   nullable=True)
    company_tax_number           = Column(String,  nullable=True)
    company_rt                   = Column(String,  nullable=True)
    company_rw                   = Column(String,  nullable=True)
    company_type                 = Column(String,  nullable=False)
    business_entity_name_en      = Column(String,  nullable=False)
    company_product_types_name_id = Column(String, nullable=False)
    company_industry_id          = Column(Integer, nullable=True)
    company_industry_name_id     = Column(String,  nullable=True)
    company_industry_name_en     = Column(String,  nullable=True)
    business_activity            = Column(String,  nullable=False)
    membership                   = Column(String,  nullable=False, default="pro")
    logo_url                     = Column(String,  nullable=False, default="/assets/teakworks-logo.png")
    synced_at                    = Column(DateTime, nullable=True)
