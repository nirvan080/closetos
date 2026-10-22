import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "originals").mkdir(exist_ok=True)
(UPLOAD_DIR / "cutouts").mkdir(exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "ClosetOS"
    API_V1_STR: str = "/api/v1"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    DEFAULT_CITY: str = "Pithoragarh, Uttarakhand"
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    DATABASE_PATH: Path = DATA_DIR / "closetos.db"
    UPLOAD_DIR: Path = UPLOAD_DIR
    STATIC_UPLOADS_URL: str = "/uploads"
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.29.207:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

settings = Settings()
