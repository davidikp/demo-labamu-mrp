"""Create demo tables and seed demo data.

Safe to run multiple times. Used by Vercel build/deploy and local setup.
"""

import asyncio
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.demo.category_seed import seed_categories_if_empty
from app.demo.company_seed import seed_company_if_empty
from app.demo.database import AsyncSessionLocal, init_db
from app.demo.product_seed import seed_if_empty


async def main() -> None:
    await init_db()
    await seed_if_empty(AsyncSessionLocal)
    await seed_categories_if_empty(AsyncSessionLocal)
    await seed_company_if_empty(AsyncSessionLocal)


if __name__ == "__main__":
    asyncio.run(main())
