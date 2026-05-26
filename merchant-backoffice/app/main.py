import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "demo")

app = FastAPI(
    title="CE Service Ecommerce Catalog API",
    description="Product catalog service API documentation for CE Service Ecommerce",
    version="1.0",
    docs_url="/demo/docs",
    redoc_url="/demo/redoc",
    openapi_url="/demo/openapi.json",
)

# CORS — demo only
# TODO engineer: restrict CORS origins for production /api/v1 router
if APP_ENV == "demo":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )

# TODO engineer: add BearerAuth middleware for /api/v1 router
# TODO engineer: mount real router at /api/v1 once RealProductProvider is implemented


@app.on_event("startup")
async def startup() -> None:
    from app.demo.category_seed import seed_categories_if_empty
    from app.demo.company_seed import seed_company_if_empty
    from app.demo.database import AsyncSessionLocal, init_db
    from app.demo.product_seed import seed_if_empty
    from app.services.category_service import CategoryService
    from app.services.company_service import CompanyService
    from app.services.product_service import ProductService

    await init_db()
    await seed_if_empty(AsyncSessionLocal)
    await seed_categories_if_empty(AsyncSessionLocal)
    await seed_company_if_empty(AsyncSessionLocal)

    if APP_ENV == "demo":
        from app.services.providers.demo_category_provider import DemoCategoryProvider
        from app.services.providers.demo_company_provider import DemoCompanyProvider
        from app.services.providers.demo_provider import DemoProductProvider
        provider = DemoProductProvider(session_factory=AsyncSessionLocal)
        category_provider = DemoCategoryProvider(session_factory=AsyncSessionLocal)
        company_provider = DemoCompanyProvider(session_factory=AsyncSessionLocal)
    else:
        from app.services.providers.real_category_provider import RealCategoryProvider
        from app.services.providers.real_company_provider import RealCompanyProvider
        from app.services.providers.real_provider import RealProductProvider
        provider = RealProductProvider()
        category_provider = RealCategoryProvider()
        company_provider = RealCompanyProvider()

    app.state.product_service = ProductService(provider=provider)
    app.state.category_service = CategoryService(provider=category_provider)
    app.state.company_service = CompanyService(provider=company_provider)


# Mount demo router only in demo mode
# TODO engineer: remove demo router mount when APP_ENV=production is enforced
if APP_ENV == "demo":
    from app.demo.router import router as demo_router
    app.include_router(demo_router, prefix="/demo/v1", tags=["demo"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
