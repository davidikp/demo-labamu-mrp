"""Vercel serverless entrypoint for the FastAPI demo API."""

from app.main import app

# Vercel's Python runtime discovers this ASGI app from api/index.py.
