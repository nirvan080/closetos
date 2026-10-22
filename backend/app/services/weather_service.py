from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
from app.models.schemas import WeatherCondition

DEFAULT_CITY = "Pithoragarh, Uttarakhand"

WEATHER_PRESETS: Dict[str, WeatherCondition] = {
    "chilly": WeatherCondition(
        temp_c=13.8,
        feels_like_c=12.5,
        condition="Crisp Himalayan Breeze",
        humidity=62,
        wind_speed_kmh=12.0,
        rain_probability=0.05,
        city=DEFAULT_CITY
    ),
    "coding": WeatherCondition(
        temp_c=17.5,
        feels_like_c=17.0,
        condition="Pleasant Mountain Sun",
        humidity=48,
        wind_speed_kmh=8.0,
        rain_probability=0.0,
        city=DEFAULT_CITY
    ),
    "summer": WeatherCondition(
        temp_c=24.5,
        feels_like_c=25.0,
        condition="Warm Valley Sun",
        humidity=45,
        wind_speed_kmh=9.0,
        rain_probability=0.0,
        city=DEFAULT_CITY
    ),
    "rainy": WeatherCondition(
        temp_c=15.0,
        feels_like_c=14.2,
        condition="Himalayan Showers & Mist",
        humidity=88,
        wind_speed_kmh=16.0,
        rain_probability=0.80,
        city=DEFAULT_CITY
    ),
    "evening": WeatherCondition(
        temp_c=12.2,
        feels_like_c=10.8,
        condition="Cold Alpine Night",
        humidity=70,
        wind_speed_kmh=14.0,
        rain_probability=0.0,
        city=DEFAULT_CITY
    ),
}

async def fetch_realtime_weather(city: str = DEFAULT_CITY, preset: Optional[str] = None) -> WeatherCondition:
    if preset and preset in WEATHER_PRESETS:
        wc = WEATHER_PRESETS[preset]
        return wc.model_copy(update={"city": city})

    if settings.OPENWEATHER_API_KEY:
        try:
            # Pithoragarh query
            query_city = city.split(",")[0].strip()
            url = f"https://api.openweathermap.org/data/2.5/weather?q={query_city},IN&units=metric&appid={settings.OPENWEATHER_API_KEY}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    temp = data["main"]["temp"]
                    feels = data["main"]["feels_like"]
                    cond = data["weather"][0]["main"]
                    humidity = data["main"]["humidity"]
                    wind = data["wind"]["speed"] * 3.6  # m/s to km/h
                    rain_prob = 0.8 if "Rain" in cond else 0.05
                    return WeatherCondition(
                        temp_c=round(temp, 1),
                        feels_like_c=round(feels, 1),
                        condition=cond,
                        humidity=humidity,
                        wind_speed_kmh=round(wind, 1),
                        rain_probability=rain_prob,
                        city=city
                    )
        except Exception as e:
            print(f"OpenWeather API request failed: {e}")

    # Default realistic Pithoragarh autumn weather
    return WEATHER_PRESETS["chilly"].model_copy(update={"city": city})
