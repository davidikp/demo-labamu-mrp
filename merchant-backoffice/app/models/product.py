from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"

    id               = Column(String,  primary_key=True)
    tenant_id        = Column(String,  index=True, nullable=False)
    mrp_id           = Column(String,  nullable=False)
    sku              = Column(String,  nullable=False)
    name             = Column(String,  nullable=False)
    description      = Column(String,  nullable=False)
    price            = Column(Float,   nullable=False)
    category_id      = Column(String,  nullable=False)
    status           = Column(String,  nullable=False)    # stored as string; enum coercion in Pydantic
    product_source   = Column(String,  nullable=False)    # stored as string; enum coercion in Pydantic
    platform_status  = Column(String,  nullable=False)    # stored as string; enum coercion in Pydantic
    lead_time        = Column(String,  nullable=True)
    selling_price    = Column(Float,   nullable=True)
    primary_material = Column(String,  nullable=True)
    gross_weight     = Column(Float,   nullable=True)
    image_attached   = Column(String,  nullable=True)     # stored as JSON string; deserialized in Pydantic
    sales_price      = Column(String,  nullable=True)     # stored as JSON string; deserialized in Pydantic
    updated_at       = Column(DateTime, nullable=False)
    created_at       = Column(DateTime, nullable=False)
    synced_at        = Column(DateTime, nullable=True)
