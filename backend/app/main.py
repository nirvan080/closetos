from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.db import init_db
from app.seed_data import seed_starter_wardrobe
from app.api.endpoints import wardrobe, styling, analysis, weather

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema & seed starter wardrobe
    init_db()
    seed_starter_wardrobe()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ClosetOS — Intelligent Wardrobe Digitization & Personal Styling Agent",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads (originals and transparent cutouts)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Mount API routes
app.include_router(wardrobe.router, prefix=f"{settings.API_V1_STR}/wardrobe", tags=["Wardrobe"])
app.include_router(styling.router, prefix=f"{settings.API_V1_STR}/styling", tags=["Styling"])
app.include_router(analysis.router, prefix=f"{settings.API_V1_STR}/analysis", tags=["Analysis"])
app.include_router(weather.router, prefix=f"{settings.API_V1_STR}/weather", tags=["Weather"])

@app.get("/")
def root():
    return {
        "name": "ClosetOS API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
