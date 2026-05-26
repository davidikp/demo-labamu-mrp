from sqlalchemy import Column, DateTime, String

from app.models.product import Base


class Category(Base):
    __tablename__ = "categories"

    id          = Column(String, primary_key=True)
    tenant_id   = Column(String, index=True, nullable=False)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status      = Column(String, nullable=False)    # stored as string; enum coercion in Pydantic
    created_at  = Column(DateTime, nullable=False)
    updated_at  = Column(DateTime, nullable=False)
