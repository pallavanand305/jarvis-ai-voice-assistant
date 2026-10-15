from fastapi import APIRouter, HTTPException
from datetime import datetime
from zoneinfo import ZoneInfo
from ..core.config import settings

router = APIRouter()

@router.get("/time")
async def get_time(tz: str = "Asia/Kolkata"):
    try:
        now = datetime.now(ZoneInfo(tz))
    except Exception:
        now = datetime.now(ZoneInfo("Asia/Kolkata"))
    return {"time": now.strftime("%Y-%m-%d %H:%M:%S"), "tz": tz}

@router.get("/weather")
async def get_weather(city: str = "Delhi"):
    key = settings.OPENWEATHERMAP_API_KEY or settings.WEATHER_API_KEY
    if not key:
        raise HTTPException(status_code=400, detail="weather API key not configured")
    import httpx
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": key, "units": "metric"},
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"weather fetch failed: {e}")
    return {
        "city": data.get("name", city),
        "temp_c": data.get("main", {}).get("temp"),
        "description": data.get("weather", [{}])[0].get("description", ""),
        "humidity": data.get("main", {}).get("humidity"),
    }

@router.get("/search")
async def web_search(q: str = ""):
    if not q.strip():
        raise HTTPException(status_code=400, detail="q is required")
    import httpx
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            r = await client.get(
                "https://duckduckgo.com/html/",
                params={"q": q},
                headers={"User-Agent": "jarvis-ai/0.1"},
            )
            r.raise_for_status()
            html = r.text
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"search failed: {e}")
    from html.parser import HTMLParser
    class DDGParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.in_snip = False
            self.results = []
            self.current = ""
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == "a" and attrs.get("class") == "result__snippet":
                self.in_snip = True
                self.current = ""
        def handle_endtag(self, tag):
            if tag == "a" and self.in_snip:
                self.in_snip = False
                if self.current.strip():
                    self.results.append(self.current.strip())
        def handle_data(self, data):
            if self.in_snip:
                self.current += data
    parser = DDGParser()
    parser.feed(html)
    return {"query": q, "results": parser.results[:5]}
