# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Vercel deployment with auto-seeded demo data

This repository now includes a Vercel serverless entrypoint at `api/index.py` and `vercel.json` routes that serve:

- React/Vite frontend from `dist`
- FastAPI demo API from `/demo/v1`

The demo database is seeded in two places:

1. `python scripts/seed_demo.py` runs during Vercel build.
2. FastAPI startup also runs `init_db()` and the idempotent seed functions, so cold starts recreate the demo data if the serverless filesystem is fresh.

For a demo deployment, you can omit `VITE_CATALOG_API_URL`; the frontend will call `/demo/v1` automatically in production builds.

For persistent production data, set `DATABASE_URL` to a hosted database. Without it, Vercel uses SQLite at `/tmp/demo.db`, which is suitable for demo data but can reset between cold starts.
