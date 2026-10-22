from typing import Optional
from fastapi import APIRouter
from app.core.config import settings
from app.models.schemas import WeatherCondition
from app.services.weather_service import fetch_realtime_weather, WEATHER_PRESETS

router = APIRouter()

@router.get("/current", response_model=WeatherCondition)
async def get_current_weather(city: str = settings.DEFAULT_CITY, preset: Optional[str] = None):
    return await fetch_realtime_weather(city=city, preset=preset)

@router.get("/presets")
async def list_weather_presets():
    return [
        {"id": "chilly", "label": "Crisp Himalayan Breeze (13.8°C)", "temp": 13.8, "icon": "Wind"},
        {"id": "coding", "label": "Pleasant Mountain Sun (17.5°C)", "temp": 17.5, "icon": "Sun"},
        {"id": "summer", "label": "Warm Valley Sun (24.5°C)", "temp": 24.5, "icon": "Sun"},
        {"id": "rainy", "label": "Himalayan Mist & Rain (15.0°C)", "temp": 15.0, "icon": "CloudRain"},
        {"id": "evening", "label": "Cold Alpine Night (12.2°C)", "temp": 12.2, "icon": "CloudSnow"}
    ]
