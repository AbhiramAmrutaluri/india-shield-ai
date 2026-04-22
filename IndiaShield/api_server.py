"""
IndiaShield Real-Time API Server
Aggregates live data from:
  1. USGS Earthquake API    (free, no key)
  2. OpenWeatherMap API     (key from weather_stream.py)
  3. NASA EONET             (free, no key — live natural events)
  4. GDACS                  (free RSS — global disaster alerts)
Serves unified disaster events via REST + SSE to the React dashboard on port 8000.
"""

from flask import Flask, jsonify, Response, request, stream_with_context
from flask_cors import CORS
import requests, time, threading, json, os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types as genai_types
from dotenv import load_dotenv

# Load environment variables from .env (project root)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Disk cache for Gemini results — survives server restarts without burning quota
_GEMINI_CACHE_FILE = os.path.join(os.path.dirname(__file__), ".gemini_cache.json")

_cache_lock = threading.Lock()       # protects kafka_events concurrent access
_owm_fetch_lock = threading.Lock()   # ensures only one OWM fetch runs at a time

app = Flask(__name__)
CORS(app)  # Allow React dev server (port 5173) to call us

# ── CONFIG ──────────────────────────────────────────────────
OWM_API_KEY    = os.environ["OWM_API_KEY"]
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]

INDIAN_CITIES = [
    # North India
    ("Delhi",              28.6139, 77.2090),
    ("Jaipur",             26.9124, 75.7873),
    ("Lucknow",            26.8467, 80.9462),
    ("Kanpur",             26.4499, 80.3319),
    ("Agra",               27.1767, 78.0081),
    ("Varanasi",           25.3176, 82.9739),
    ("Meerut",             28.9845, 77.7064),
    ("Chandigarh",         30.7333, 76.7794),
    ("Amritsar",           31.6340, 74.8723),
    ("Ludhiana",           30.9010, 75.8573),
    ("Shimla",             31.1048, 77.1734),
    ("Dehradun",           30.3165, 78.0322),
    # East India
    ("Kolkata",            22.5726, 88.3639),
    ("Patna",              25.5941, 85.1376),
    ("Ranchi",             23.3441, 85.3096),
    ("Bhubaneswar",        20.2961, 85.8245),
    ("Guwahati",           26.1445, 91.7362),
    ("Imphal",             24.8170, 93.9368),
    ("Shillong",           25.5788, 91.8933),
    ("Agartala",           23.8315, 91.2868),
    ("Siliguri",           26.7271, 88.3953),
    # West India
    ("Mumbai",             19.0760, 72.8777),
    ("Pune",               18.5204, 73.8567),
    ("Nagpur",             21.1458, 79.0882),
    ("Surat",              21.1702, 72.8311),
    ("Ahmedabad",          23.0225, 72.5714),
    ("Vadodara",           22.3072, 73.1812),
    ("Rajkot",             22.3039, 70.8022),
    ("Panaji",             15.4909, 73.8278),
    ("Aurangabad",         19.8762, 75.3433),
    ("Nashik",             19.9975, 73.7898),
    # Central India
    ("Bhopal",             23.2599, 77.4126),
    ("Indore",             22.7196, 75.8577),
    ("Raipur",             21.2514, 81.6296),
    ("Jabalpur",           23.1815, 79.9864),
    ("Gwalior",            26.2183, 78.1828),
    # South India
    ("Chennai",            13.0827, 80.2707),
    ("Bengaluru",          12.9716, 77.5946),
    ("Hyderabad",          17.3850, 78.4867),
    ("Coimbatore",         11.0168, 76.9558),
    ("Madurai",             9.9252, 78.1198),
    ("Visakhapatnam",      17.6868, 83.2185),
    ("Vijayawada",         16.5062, 80.6480),
    ("Thiruvananthapuram",  8.5241, 76.9366),
    ("Kochi",               9.9312, 76.2673),
    ("Kozhikode",          11.2588, 75.7804),
    ("Mysuru",             12.2958, 76.6394),
    ("Mangaluru",          12.9141, 74.8560),
    ("Tirupati",           13.6288, 79.4192),
    ("Warangal",           17.9784, 79.5941),
    ("Salem",              11.6643, 78.1460),
    ("Tiruchirappalli",    10.7905, 78.7047),
    # Additional Tier-2 cities
    ("Jodhpur",            26.2389, 73.0243),
    ("Udaipur",            24.5854, 73.7125),
    ("Kota",               25.2138, 75.8648),
    ("Srinagar",           34.0837, 74.7973),
    ("Jammu",              32.7266, 74.8570),
    ("Leh",                34.1526, 77.5771),
    ("Haridwar",           29.9457, 78.1642),
    ("Prayagraj",          25.4358, 81.8463),
    ("Gorakhpur",          26.7605, 83.3731),
    ("Ghaziabad",          28.6692, 77.4538),
    ("Noida",              28.5355, 77.3910),
    ("Moradabad",          28.8386, 78.7733),
    ("Bareilly",           28.3670, 79.4304),
    ("Aligarh",            27.8974, 78.0880),
    ("Dhanbad",            23.7957, 86.4304),
    ("Jamshedpur",         22.8046, 86.2029),
    ("Puri",               19.8106, 85.8314),
    ("Cuttack",            20.4625, 85.8828),
    ("Dibrugarh",          27.4728, 94.9120),
    ("Silchar",            24.8333, 92.7789),
    ("Aizawl",             23.7307, 92.7173),
    ("Gangtok",            27.3389, 88.6065),
    ("Itanagar",           27.0844, 93.6053),
    ("Kohima",             25.6751, 94.1086),
    ("Hubli",              15.3647, 75.1240),
    ("Belgaum",            15.8497, 74.4977),
    ("Davangere",          14.4644, 75.9218),
    ("Nellore",            14.4426, 79.9865),
    ("Kurnool",            15.8281, 78.0373),
    ("Rajahmundry",        17.0005, 81.8040),
    ("Thrissur",           10.5276, 76.2144),
    ("Kollam",              8.8932, 76.6141),
    ("Vellore",            12.9165, 79.1325),
    ("Thoothukudi",         8.7642, 78.1348),
    ("Pondicherry",        11.9416, 79.8083),
    # Additional district & coastal cities
    ("Bikaner",            28.0229, 73.3119),
    ("Ajmer",              26.4499, 74.6399),
    ("Alwar",              27.5530, 76.6346),
    ("Mathura",            27.4924, 77.6737),
    ("Saharanpur",         29.9680, 77.5510),
    ("Kolhapur",           16.7050, 74.2433),
    ("Solapur",            17.6805, 75.9064),
    ("Amravati",           20.9320, 77.7523),
    ("Jalgaon",            21.0077, 75.5626),
    ("Bhavnagar",          21.7645, 72.1519),
    ("Junagadh",           21.5222, 70.4579),
    ("Bilaspur",           22.0796, 82.1391),
    ("Korba",              22.3595, 82.7501),
    ("Bokaro",             23.6693, 85.9915),
    ("Durgapur",           23.5204, 87.3119),
    ("Asansol",            23.6739, 86.9524),
    ("Tezpur",             26.6338, 92.7926),
    ("Jorhat",             26.7465, 94.2026),
    ("Erode",              11.3410, 77.7172),
    ("Kumbakonam",         10.9617, 79.3788),
    ("Nagercoil",           8.1833, 77.4119),
    ("Nanded",             19.1383, 77.3210),
    ("Latur",              18.4088, 76.5604),
    ("Akola",              20.7096, 77.0021),
    ("Ahmednagar",         19.0952, 74.7496),
    ("Satara",             17.6805, 74.0183),
    ("Sangli",             16.8524, 74.5815),
    ("Ratnagiri",          16.9944, 73.3001),
    ("Navi Mumbai",        19.0330, 73.0297),
    ("Thane",              19.2183, 72.9781),
]

STATE_MAP = {
    "Delhi": "Delhi",
    "Jaipur": "Rajasthan", "Jodhpur": "Rajasthan", "Udaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh", "Kanpur": "Uttar Pradesh", "Agra": "Uttar Pradesh",
    "Varanasi": "Uttar Pradesh", "Meerut": "Uttar Pradesh",
    "Chandigarh": "Chandigarh", "Amritsar": "Punjab", "Ludhiana": "Punjab",
    "Shimla": "Himachal Pradesh", "Dehradun": "Uttarakhand",
    "Kolkata": "West Bengal", "Siliguri": "West Bengal",
    "Patna": "Bihar", "Ranchi": "Jharkhand",
    "Bhubaneswar": "Odisha", "Guwahati": "Assam", "Imphal": "Manipur",
    "Shillong": "Meghalaya", "Agartala": "Tripura",
    "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
    "Aurangabad": "Maharashtra", "Nashik": "Maharashtra",
    "Surat": "Gujarat", "Ahmedabad": "Gujarat", "Vadodara": "Gujarat", "Rajkot": "Gujarat",
    "Panaji": "Goa",
    "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh",
    "Jabalpur": "Madhya Pradesh", "Gwalior": "Madhya Pradesh",
    "Raipur": "Chhattisgarh",
    "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu", "Madurai": "Tamil Nadu",
    "Salem": "Tamil Nadu", "Tiruchirappalli": "Tamil Nadu",
    "Bengaluru": "Karnataka", "Mysuru": "Karnataka", "Mangaluru": "Karnataka",
    "Hyderabad": "Telangana", "Warangal": "Telangana",
    "Visakhapatnam": "Andhra Pradesh", "Vijayawada": "Andhra Pradesh", "Tirupati": "Andhra Pradesh",
    "Thiruvananthapuram": "Kerala", "Kochi": "Kerala", "Kozhikode": "Kerala",
    "Thrissur": "Kerala", "Kollam": "Kerala",
    # Tier-2 additions
    "Jodhpur": "Rajasthan", "Udaipur": "Rajasthan", "Kota": "Rajasthan",
    "Srinagar": "Jammu & Kashmir", "Jammu": "Jammu & Kashmir", "Leh": "Ladakh",
    "Haridwar": "Uttarakhand",
    "Prayagraj": "Uttar Pradesh", "Gorakhpur": "Uttar Pradesh",
    "Ghaziabad": "Uttar Pradesh", "Noida": "Uttar Pradesh",
    "Moradabad": "Uttar Pradesh", "Bareilly": "Uttar Pradesh", "Aligarh": "Uttar Pradesh",
    "Dhanbad": "Jharkhand", "Jamshedpur": "Jharkhand",
    "Puri": "Odisha", "Cuttack": "Odisha",
    "Dibrugarh": "Assam", "Silchar": "Assam",
    "Aizawl": "Mizoram", "Gangtok": "Sikkim",
    "Itanagar": "Arunachal Pradesh", "Kohima": "Nagaland",
    "Hubli": "Karnataka", "Belgaum": "Karnataka", "Davangere": "Karnataka",
    "Nellore": "Andhra Pradesh", "Kurnool": "Andhra Pradesh", "Rajahmundry": "Andhra Pradesh",
    "Vellore": "Tamil Nadu", "Thoothukudi": "Tamil Nadu", "Pondicherry": "Puducherry",
    "Erode": "Tamil Nadu", "Kumbakonam": "Tamil Nadu", "Nagercoil": "Tamil Nadu",
    "Thrissur": "Kerala", "Kollam": "Kerala",
    "Kolhapur": "Maharashtra", "Solapur": "Maharashtra", "Amravati": "Maharashtra",
    "Jalgaon": "Maharashtra", "Nanded": "Maharashtra", "Latur": "Maharashtra",
    "Akola": "Maharashtra", "Ahmednagar": "Maharashtra", "Satara": "Maharashtra",
    "Sangli": "Maharashtra", "Ratnagiri": "Maharashtra",
    "Navi Mumbai": "Maharashtra", "Thane": "Maharashtra",
    "Bhavnagar": "Gujarat", "Junagadh": "Gujarat",
    "Bikaner": "Rajasthan", "Ajmer": "Rajasthan", "Alwar": "Rajasthan",
    "Mathura": "Uttar Pradesh", "Saharanpur": "Uttar Pradesh",
    "Bilaspur": "Chhattisgarh", "Korba": "Chhattisgarh",
    "Bokaro": "Jharkhand",
    "Durgapur": "West Bengal", "Asansol": "West Bengal",
    "Tezpur": "Assam", "Jorhat": "Assam",
}

# In-memory cache — kept warm by the background fetcher thread
_cache = {
    "events": [],
    "last_quake_fetch": 0,
    "last_weather_fetch": 0,
    "last_eonet_fetch": 0,
    "last_gdacs_fetch": 0,
    "last_gemini_fetch": 0,
    "quake_events": [],
    "weather_events": [],
    "eonet_events": [],
    "gdacs_events": [],
    "gemini_events": [],
    "kafka_events": [],  # events pushed in by the Kafka consumer
}

# Load Gemini results from disk on startup to avoid burning quota on restarts
def _load_gemini_disk_cache():
    try:
        if os.path.exists(_GEMINI_CACHE_FILE):
            with open(_GEMINI_CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            saved_at = data.get("saved_at", 0)
            # Only use disk cache if it is less than 24 hours old
            if time.time() - saved_at < 86400:
                _cache["gemini_events"]     = data.get("events", [])
                _cache["last_gemini_fetch"] = saved_at
                print(f"[Gemini] Loaded {len(_cache['gemini_events'])} events from disk cache")
    except Exception as e:
        print(f"[Gemini] Disk cache load failed: {e}")

_load_gemini_disk_cache()
QUAKE_TTL   = 60    # refresh earthquakes every 1 min
WEATHER_TTL = 180   # refresh weather every 3 min
EONET_TTL   = 300   # refresh NASA EONET every 5 min
GDACS_TTL   = 600   # refresh GDACS every 10 min
GEMINI_TTL  = 7200  # refresh Gemini live alerts every 2 hours (free tier: 20 req/day)

# ── HELPERS ─────────────────────────────────────────────────
def severity_from_magnitude(mag: float) -> str:
    if mag >= 6.5: return "critical"
    if mag >= 5.5: return "severe"
    if mag >= 4.5: return "moderate"
    return "low"

def _is_actual_hazard(weather_id: int, wind_ms: float, temp_c: float, humidity: int) -> bool:
    """Return True only when real-world weather thresholds indicate a genuine hazard.
    Thresholds are calibrated to IMD (India Meteorological Dept) advisory levels:
      - Heat advisory issued at 37 °C for plains
      - Cold-day advisory below 8 °C
      - Wind warning at 10 m/s (36 km/h)
      - High humidity (≥82 %) combined with heat (≥28 °C) = real discomfort / health hazard
      - Clear sky + hot (≥35 °C) + bone-dry (≤18 %) = drought / dust risk
    Normal cloudy/warm days are excluded.
    """
    if 200 <= weather_id < 300: return True           # any thunderstorm
    if 300 <= weather_id < 600: return True           # drizzle / rain
    if 600 <= weather_id < 700: return True           # snow / sleet / ice
    # Atmospheric hazards: smoke, haze, dust, sand, fog, squall, tornado
    if 700 <= weather_id < 800: return True
    if temp_c >= 40:  return True                     # critical heatwave
    if temp_c >= 37:  return True                     # IMD heat advisory threshold
    if temp_c < 8:    return True                     # IMD cold-day advisory
    if wind_ms >= 10: return True                     # wind warning (36 km/h)
    if humidity >= 82 and temp_c >= 28: return True   # hot + humid = real health hazard
    if weather_id == 800 and temp_c >= 35 and humidity <= 18:
        return True                                   # clear sky + hot + bone-dry → drought/dust
    return False

def severity_from_weather(weather_id: int, wind_ms: float, temp_c: float, humidity: int) -> str:
    """Return severity for events that passed _is_actual_hazard()."""
    if 200 <= weather_id < 300:
        return "critical" if wind_ms > 18 else "severe"
    if temp_c >= 44: return "critical"
    if temp_c >= 40: return "severe"
    if temp_c >= 37: return "moderate"
    if temp_c < 2:   return "severe"
    if temp_c < 8:   return "moderate"
    if weather_id in (502, 503, 504, 522): return "severe"   # heavy/extreme rain
    if 500 <= weather_id < 600: return "moderate"
    if 600 <= weather_id < 700: return "moderate"            # snow / ice
    if wind_ms >= 20: return "severe"
    if wind_ms >= 14: return "moderate"
    if wind_ms >= 10: return "low"
    if humidity >= 90 and temp_c >= 30: return "moderate"
    if humidity >= 82 and temp_c >= 28: return "low"
    if 700 <= weather_id < 800: return "low"
    return "low"

# ── USGS EARTHQUAKE FETCH ────────────────────────────────────
def fetch_earthquakes() -> list:
    now = time.time()
    if now - _cache["last_quake_fetch"] < QUAKE_TTL:
        return _cache["quake_events"]

    url = (
        "https://earthquake.usgs.gov/fdsnws/event/1/query"
        "?format=geojson&minmagnitude=2.5"
        "&minlatitude=5&maxlatitude=38"
        "&minlongitude=65&maxlongitude=100"
        "&orderby=time&limit=150"
    )
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        features = r.json().get("features", [])
        events = []
        for f in features:
            p   = f["properties"]
            geo = f["geometry"]["coordinates"]
            mag = p.get("mag") or 0
            place = p.get("place") or "India region"
            ts    = p.get("time") or 0
            dt    = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat()
            sev   = severity_from_magnitude(mag)
            events.append({
                "id":            f"usgs-{f['id']}",
                "type":          "earthquake",
                "title":         f"M{mag:.1f} Earthquake — {place}",
                "location":      place,
                "lat":           geo[1],
                "lng":           geo[0],
                "severity":      sev,
                "timestamp":     dt,
                "source":        "USGS Earthquake API",
                "description":   f"Magnitude {mag:.1f} earthquake detected. {place}.",
                "affectedPeople": int(max(1000, mag ** 3 * 500)),
                "confidence":    0.97,
                "magnitude":     mag,
            })
        _cache["quake_events"]       = events
        _cache["last_quake_fetch"]   = now
        print(f"[USGS] Fetched {len(events)} earthquakes")
        return events
    except Exception as e:
        print(f"[USGS] Error: {e}")
        return _cache.get("quake_events", [])

# ── OPENWEATHERMAP FETCH ─────────────────────────────────────
# Geographic zones for zone-aware default disaster type assignment
_COASTAL_CITIES = {
    "Mumbai", "Navi Mumbai", "Thane", "Ratnagiri", "Panaji", "Mangaluru",
    "Chennai", "Pondicherry", "Thoothukudi", "Nagercoil", "Nellore",
    "Visakhapatnam", "Rajahmundry", "Kakinada",
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam",
    "Bhubaneswar", "Puri", "Cuttack",
    "Kolkata", "Siliguri",
}
_MOUNTAIN_CITIES = {
    "Shimla", "Dehradun", "Haridwar", "Srinagar", "Jammu", "Leh",
    "Gangtok", "Shillong", "Aizawl", "Itanagar", "Kohima", "Imphal",
    "Mussoorie", "Nainital", "Darjeeling",
}
_NORTHEAST_CITIES = {
    "Guwahati", "Dibrugarh", "Silchar", "Tezpur", "Jorhat", "Agartala",
}
_DRY_PLAINS_CITIES = {
    "Jaipur", "Jodhpur", "Bikaner", "Ajmer", "Alwar", "Udaipur",
    "Barmer", "Nagpur", "Ahmedabad", "Rajkot", "Bhavnagar", "Junagadh",
}

def _zone_default(city: str, temp_c: float, humidity: int) -> str:
    """Return a geographically appropriate disaster type for normal weather conditions."""
    if city in _COASTAL_CITIES:
        return "flood"           # coastal flood / storm surge risk
    if city in _MOUNTAIN_CITIES:
        return "landslide" if humidity > 45 else "cold_wave"
    if city in _NORTHEAST_CITIES:
        return "flood"           # Northeast = high rainfall region
    if city in _DRY_PLAINS_CITIES:
        return "dust_storm"      # Rajasthan / dry Deccan = sandstorm risk
    if temp_c > 35:
        return "heatwave"
    if humidity > 75:
        return "flood"           # high humidity → flood risk
    return "drought"             # default for peninsular / central India

def _fetch_one_city(city, lat, lon, now):
    """Fetch weather for one city and return an event dict (or None on failure)."""
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={OWM_API_KEY}&units=metric"
        )
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        d = r.json()
        weather_id = d["weather"][0]["id"]
        desc       = d["weather"][0]["description"].capitalize()
        temp_c     = d["main"]["temp"]
        wind_ms    = d["wind"]["speed"]
        humidity   = d["main"]["humidity"]
        city_name  = d.get("name", city)
        state = STATE_MAP.get(city, STATE_MAP.get(city_name, "India"))

        # Skip cities with no genuine hazard — avoids fabricated "Flood risk" on clear days
        if not _is_actual_hazard(weather_id, wind_ms, temp_c, humidity):
            return None

        sev   = severity_from_weather(weather_id, wind_ms, temp_c, humidity)
        # Map OWM weather code → disaster type (order matters)
        if 200 <= weather_id < 300:           # Thunderstorm
            etype = "cyclone" if wind_ms >= 10 else "flood"
        elif 300 <= weather_id < 600:         # Drizzle / Rain
            etype = "flood"
        elif 600 <= weather_id < 700:         # Snow / sleet / ice
            etype = "cold_wave"
        elif weather_id in (711, 762):        # Smoke / volcanic ash → industrial/air quality
            etype = "industrial"
        elif weather_id in (771, 781):        # Squalls / Tornado
            etype = "cyclone"
        elif 700 <= weather_id < 800:         # Mist (701), haze (721), dust (731/761), fog (741), sand (751)
            etype = "dust_storm"
        elif weather_id == 800:               # Clear sky
            if temp_c >= 37:                  etype = "heatwave"
            elif temp_c < 8:                  etype = "cold_wave"
            elif humidity <= 18:              etype = "dust_storm"
            else:                             etype = _zone_default(city, temp_c, humidity)
        elif 801 <= weather_id <= 804:        # Cloudy
            if temp_c >= 37:                  etype = "heatwave"
            elif wind_ms >= 10:               etype = "cyclone"
            elif temp_c < 8:                  etype = "cold_wave"
            elif humidity >= 82:              etype = "flood"
            else:                             etype = _zone_default(city, temp_c, humidity)
        else:
            etype = _zone_default(city, temp_c, humidity)
        # Build a context-aware title that reflects both the disaster type AND what triggered it
        def _owm_title():
            if 200 <= weather_id < 300:
                return f"Thunderstorm warning — {city_name}, {state}"
            if 300 <= weather_id < 400:
                return f"Drizzle / light rain — {city_name}, {state}"
            if 500 <= weather_id < 600:
                intensity = "heavy rain" if weather_id in (502, 503, 504, 522) else "rainfall"
                return f"Active {intensity} — {city_name}, {state}"
            if 600 <= weather_id < 700:
                return f"Snowfall / ice — {city_name}, {state}"
            if weather_id in (711, 762):
                return f"Smoke / hazardous air — {city_name}, {state}"
            if 700 <= weather_id < 800:
                return f"Haze / reduced visibility — {city_name}, {state}"
            # Clear or partly cloudy — label by hazard type, not geography
            if etype == "heatwave":
                return f"Heat advisory {temp_c:.0f}°C — {city_name}, {state}"
            if etype == "cold_wave":
                return f"Cold wave {temp_c:.0f}°C — {city_name}, {state}"
            if etype == "cyclone":
                return f"Strong winds {wind_ms:.0f} m/s — {city_name}, {state}"
            if etype == "dust_storm":
                return f"Dry heat & dust risk — {city_name}, {state}"
            if etype == "flood":
                return f"High humidity monsoon watch — {city_name}, {state}"
            if etype == "drought":
                return f"Drought / low moisture — {city_name}, {state}"
            return f"{desc} — {city_name}, {state}"
        event_title = _owm_title()
        return {
            "id":            f"owm-{city.lower().replace(' ', '-')}",
            "type":          etype,
            "title":         event_title,
            "location":      f"{city_name}, {state}",
            "lat":           lat,
            "lng":           lon,
            "severity":      sev,
            "timestamp":     datetime.now(tz=timezone.utc).isoformat(),
            "source":        "OpenWeatherMap API",
            "description":   (
                f"{desc} in {city_name}. "
                f"Temp: {temp_c:.1f}\u00b0C, Wind: {wind_ms:.1f} m/s, Humidity: {humidity}%."
            ),
            "affectedPeople": max(5000, int(wind_ms * 2000 + max(0, temp_c - 25) * 1000)),
            "confidence":    0.90,
            "temperature":   temp_c,
            "wind_speed":    wind_ms,
            "humidity":      humidity,
        }
    except Exception as e:
        print(f"[OWM] {city}: {e}")
        return None

def fetch_weather_alerts() -> list:
    now = time.time()
    if now - _cache["last_weather_fetch"] < WEATHER_TTL:
        return _cache["weather_events"]

    # Prevent two threads from fetching simultaneously
    if not _owm_fetch_lock.acquire(blocking=False):
        return _cache.get("weather_events", [])
    try:
        events = []
        # 8 workers — sufficient for 117 cities without overwhelming OWM free tier
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = {pool.submit(_fetch_one_city, city, lat, lon, now): city
                       for city, lat, lon in INDIAN_CITIES}
            for fut in as_completed(futures):
                result = fut.result()
                if result:
                    events.append(result)

        # Sort by city name for stable ordering
        events.sort(key=lambda e: e["location"])
        _cache["weather_events"]     = events
        _cache["last_weather_fetch"] = now
        print(f"[OWM] {len(events)} weather events from {len(INDIAN_CITIES)} cities")
        return events
    finally:
        _owm_fetch_lock.release()

# ── NASA EONET FETCH ─────────────────────────────────────────
def fetch_eonet_events() -> list:
    """Fetch open natural events from NASA EONET within India's bounding box."""
    now = time.time()
    if now - _cache["last_eonet_fetch"] < EONET_TTL:
        return _cache["eonet_events"]

    url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        events = []
        type_map = {
            "Wildfires":        ("fire",       "severe"),
            "Floods":           ("flood",      "severe"),
            "Severe Storms":    ("cyclone",    "severe"),
            "Earthquakes":      ("earthquake", "moderate"),
            "Landslides":       ("landslide",  "moderate"),
            "Volcanoes":        ("industrial", "moderate"),
            "Sea and Lake Ice": ("cold_wave",  "low"),
            "Drought":          ("drought",    "moderate"),
            "Dust and Haze":    ("dust_storm", "moderate"),
            "Manmade":          ("industrial", "low"),
            "Snow":             ("cold_wave",  "low"),
            "Temperature Extreme": ("heatwave", "severe"),
        }
        for ev in data.get("events", []):
            category = ev.get("categories", [{}])[0].get("title", "")
            etype, sev = type_map.get(category, ("accident", "low"))
            geometry = ev.get("geometry", [])
            if not geometry:
                continue
            geo = geometry[-1]  # most recent geometry point
            coords = geo.get("coordinates", [])
            if not coords or len(coords) < 2:
                continue
            lng, lat = coords[0], coords[1]
            # Filter to South/South-East Asia region (India + surrounding)
            if not (5 <= lat <= 40 and 60 <= lng <= 105):
                continue
            dt = geo.get("date") or datetime.now(tz=timezone.utc).isoformat()
            title = ev.get("title", "Natural event detected")
            events.append({
                "id":            f"eonet-{ev['id']}",
                "type":          etype,
                "title":         title,
                "location":      f"India region ({lat:.2f}°N, {lng:.2f}°E)",
                "lat":           lat,
                "lng":           lng,
                "severity":      sev,
                "timestamp":     dt,
                "source":        "NASA EONET",
                "description":   f"{category}: {title}. Detected via NASA Earth Observatory.",
                "affectedPeople": 10000,
                "confidence":    0.92,
            })
        _cache["eonet_events"]     = events
        _cache["last_eonet_fetch"] = now
        print(f"[EONET] Fetched {len(events)} events")
        return events
    except Exception as e:
        print(f"[EONET] Error: {e}")
        return _cache.get("eonet_events", [])

# ── GDACS FETCH ──────────────────────────────────────────────
def fetch_gdacs_events() -> list:
    """Fetch disaster alerts from GDACS RSS feed, filtered to India's bounding box."""
    now = time.time()
    if now - _cache["last_gdacs_fetch"] < GDACS_TTL:
        return _cache["gdacs_events"]

    url = "https://www.gdacs.org/xml/rss.xml"
    try:
        r = requests.get(url, timeout=12)
        r.raise_for_status()
        root = ET.fromstring(r.content)
        ns = {
            "geo":   "http://www.w3.org/2003/01/geo/wgs84_pos#",
            "gdacs": "http://www.gdacs.org",
        }
        events = []
        for item in root.iter("item"):
            title_el = item.find("title")
            lat_el   = item.find("geo:lat",         ns)
            lon_el   = item.find("geo:long",        ns)
            desc_el  = item.find("description")
            alert_el = item.find("gdacs:alertlevel", ns)
            eid_el   = item.find("gdacs:eventid",    ns)
            if lat_el is None or lon_el is None:
                continue
            try:
                lat = float(lat_el.text)
                lng = float(lon_el.text)
            except (ValueError, TypeError):
                continue
            # Only keep events within India's bounding box
            if not (6 <= lat <= 37 and 68 <= lng <= 97):
                continue
            title       = title_el.text if title_el is not None else "GDACS Alert"
            description = desc_el.text  if desc_el  is not None else ""
            alert_level = (alert_el.text or "").lower() if alert_el is not None else ""
            event_id    = eid_el.text if eid_el is not None else str(int(now))
            sev = "critical" if alert_level == "red" else "severe" if alert_level == "orange" else "moderate"
            title_lower = title.lower()
            if   "flood"      in title_lower:                                                                etype = "flood"
            elif "earthquake" in title_lower or "quake" in title_lower:                                    etype = "earthquake"
            elif "cyclone"    in title_lower or "storm" in title_lower or "typhoon" in title_lower:        etype = "cyclone"
            elif "fire"       in title_lower or "wildfire" in title_lower:                                 etype = "fire"
            elif "landslide"  in title_lower:                                                              etype = "landslide"
            elif "tsunami"    in title_lower:                                                              etype = "tsunami"
            elif "drought"    in title_lower:                                                              etype = "drought"
            elif "heat"       in title_lower or "heatwave" in title_lower:                                 etype = "heatwave"
            elif "volcano"    in title_lower or "volcanic" in title_lower:                                 etype = "industrial"
            elif "dust"       in title_lower or "sand"  in title_lower or "haze" in title_lower:          etype = "dust_storm"
            elif "cold"       in title_lower or "frost" in title_lower or "snow" in title_lower:          etype = "cold_wave"
            else:                                                                                           etype = "industrial"
            events.append({
                "id":            f"gdacs-{event_id}",
                "type":          etype,
                "title":         title,
                "location":      f"India region ({lat:.2f}°N, {lng:.2f}°E)",
                "lat":           lat,
                "lng":           lng,
                "severity":      sev,
                "timestamp":     datetime.now(tz=timezone.utc).isoformat(),
                "source":        "GDACS",
                "description":   description or f"{title}. Source: GDACS global disaster alert.",
                "affectedPeople": 25000,
                "confidence":    0.88,
            })
        _cache["gdacs_events"]     = events
        _cache["last_gdacs_fetch"] = now
        print(f"[GDACS] {len(events)} India-region events")
        return events
    except Exception as e:
        print(f"[GDACS] Error: {e}")
        return _cache.get("gdacs_events", [])

# ── GEMINI LIVE ALERTS (Google Search Grounding) ─────────────
_VALID_TYPES = {
    "earthquake", "flood", "fire", "cyclone", "landslide",
    "accident", "heatwave", "drought", "dust_storm",
    "tsunami", "cold_wave", "industrial",
}

def fetch_gemini_alerts() -> list:
    """Use Gemini 2.0 Flash + Google Search grounding to get real-time India disaster news."""
    now = time.time()
    if now - _cache["last_gemini_fetch"] < GEMINI_TTL:
        return _cache["gemini_events"]

    today = datetime.now(tz=timezone.utc).strftime("%B %d, %Y")
    prompt = f"""Today is {today}. Search the web and find CURRENT real-time disaster and emergency alerts happening RIGHT NOW or in the last 24 hours in India.

Look for: earthquakes, floods, cyclones, fires, landslides, heat waves, droughts, dust storms, tsunamis, cold waves, industrial accidents, gas leaks, building collapses.

Return ONLY a valid JSON array (no markdown, no code fences, no explanation) with up to 25 events exactly in this format:
[
  {{
    "title": "short descriptive title",
    "type": "earthquake|flood|fire|cyclone|landslide|accident|heatwave|drought|dust_storm|tsunami|cold_wave|industrial",
    "location": "City, State",
    "lat": 28.61,
    "lng": 77.20,
    "severity": "critical|severe|moderate|low",
    "description": "2-3 sentence description of the event",
    "source": "news outlet or agency name",
    "affectedPeople": 10000
  }}
]

Only include events in India. Use realistic coordinates for Indian cities. Return accurate current information from news sources."""

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())],
                temperature=0.1,
            ),
        )
        text = (response.text or "").strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        start = text.find("[")
        end   = text.rfind("]") + 1
        if start == -1 or end <= 0:
            print("[Gemini] No JSON array found in response")
            return _cache.get("gemini_events", [])

        raw = json.loads(text[start:end])
        events = []
        for i, e in enumerate(raw):
            etype = e.get("type", "accident")
            if etype not in _VALID_TYPES:
                etype = "accident"
            try:
                lat = float(e.get("lat", 20.5937))
                lng = float(e.get("lng", 78.9629))
            except (TypeError, ValueError):
                lat, lng = 20.5937, 78.9629
            # affectedPeople may be a plain int, a float, or a descriptive string
            raw_ap = e.get("affectedPeople", 5000)
            try:
                affected = max(0, int(float(str(raw_ap).split()[0].replace(",", "").replace("+", ""))))
            except (TypeError, ValueError):
                affected = 5000
            try:
                events.append({
                    "id":            f"gemini-{int(now)}-{i}",
                    "type":          etype,
                    "title":         str(e.get("title", "Disaster alert"))[:120],
                    "location":      str(e.get("location", "India"))[:80],
                    "lat":           lat,
                    "lng":           lng,
                    "severity":      e.get("severity", "moderate") if e.get("severity") in ("critical","severe","moderate","low") else "moderate",
                    "timestamp":     datetime.now(tz=timezone.utc).isoformat(),
                    "source":        f"Gemini AI \u2014 {str(e.get('source', 'Google News'))[:60]}",
                    "description":   str(e.get("description", ""))[:300],
                    "affectedPeople": affected,
                    "confidence":    0.82,
                })
            except Exception as parse_err:
                print(f"[Gemini] Skipping event {i}: {parse_err}")

        _cache["gemini_events"]     = events
        _cache["last_gemini_fetch"] = now
        print(f"[Gemini] {len(events)} live alerts via Google Search grounding")
        # Persist to disk so server restarts don't burn the daily quota
        try:
            with open(_GEMINI_CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump({"saved_at": now, "events": events}, f)
        except Exception as disk_err:
            print(f"[Gemini] Disk cache save failed: {disk_err}")
        return events
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return _cache.get("gemini_events", [])

# ── ROUTES ───────────────────────────────────────────────────
@app.route("/api/events")
def get_events():
    quakes  = fetch_earthquakes()
    weather = fetch_weather_alerts()
    eonet   = fetch_eonet_events()
    gdacs   = fetch_gdacs_events()
    gemini  = fetch_gemini_alerts()
    kafka   = list(_cache["kafka_events"])
    all_events = quakes + weather + eonet + gdacs + gemini + kafka
    all_events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
    return jsonify({
        "events":  all_events[:200],
        "count":   len(all_events),
        "sources": {
            "usgs_earthquakes": len(quakes),
            "owm_weather":      len(weather),
            "eonet_events":     len(eonet),
            "gdacs_events":     len(gdacs),
            "gemini_alerts":    len(gemini),
            "kafka_events":     len(kafka),
        },
        "fetched_at": datetime.now(tz=timezone.utc).isoformat(),
    })

@app.route("/api/stream")
def stream_events():
    """Server-Sent Events endpoint.
    - Sends a keepalive comment every 5 seconds to prevent browser timeout.
    - Sends full event payload every 60 seconds (aligned with cache refresh).
    """
    def event_generator():
        last_push = 0.0
        while True:
            now = time.time()
            # Push fresh data every 60 seconds
            if now - last_push >= 60:
                quakes  = fetch_earthquakes()
                weather = fetch_weather_alerts()
                eonet   = fetch_eonet_events()
                gdacs   = fetch_gdacs_events()
                gemini  = fetch_gemini_alerts()
                with _cache_lock:
                    kafka = list(_cache["kafka_events"])
                all_ev = quakes + weather + eonet + gdacs + gemini + kafka
                all_ev.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
                payload = json.dumps({
                    "events": all_ev[:200],
                    "count":  len(all_ev),
                    "sources": {
                        "usgs_earthquakes": len(quakes),
                        "owm_weather":      len(weather),
                        "eonet_events":     len(eonet),
                        "gdacs_events":     len(gdacs),
                        "gemini_alerts":    len(gemini),
                        "kafka_events":     len(kafka),
                    },
                    "fetched_at": datetime.now(tz=timezone.utc).isoformat(),
                })
                yield f"data: {payload}\n\n"
                last_push = now
            else:
                # SSE keepalive comment — prevents browser/proxy from closing the connection
                yield ": keepalive\n\n"
            time.sleep(5)
    resp = Response(
        stream_with_context(event_generator()),
        mimetype="text/event-stream",
    )
    resp.headers["Cache-Control"]               = "no-cache"
    resp.headers["X-Accel-Buffering"]           = "no"
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

@app.route("/api/ingest", methods=["POST"])
def ingest_event():
    """Accept events pushed by the Kafka consumer or other internal producers."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400
    event = {
        "id":            data.get("id") or f"kafka-{int(time.time() * 1000)}",
        "type":          data.get("type", "accident"),
        "title":         data.get("title", "Kafka event"),
        "location":      data.get("location", "India"),
        "lat":           float(data.get("lat", 20.5937)),
        "lng":           float(data.get("lng", 78.9629)),
        "severity":      data.get("severity", "moderate"),
        "timestamp":     data.get("timestamp") or datetime.now(tz=timezone.utc).isoformat(),
        "source":        data.get("source", "Kafka Stream"),
        "description":   data.get("description", ""),
        "affectedPeople": int(data.get("affectedPeople", 0)),
        "confidence":    float(data.get("confidence", 0.8)),
    }
    _cache["kafka_events"].append(event)
    _cache["kafka_events"] = _cache["kafka_events"][-50:]  # keep latest 50
    return jsonify({"status": "ingested", "id": event["id"]}), 201

@app.route("/api/status")
def get_status():
    return jsonify({
        "status":  "online",
        "apis":    ["USGS Earthquake API", "OpenWeatherMap API", "NASA EONET", "GDACS", "Gemini AI (Google Search)", "Kafka Ingest"],
        "time":    datetime.now(tz=timezone.utc).isoformat(),
        "cache": {
            "quake_events":   len(_cache["quake_events"]),
            "weather_events": len(_cache["weather_events"]),
            "eonet_events":   len(_cache["eonet_events"]),
            "gdacs_events":   len(_cache["gdacs_events"]),
            "gemini_events":  len(_cache["gemini_events"]),
            "kafka_events":   len(_cache["kafka_events"]),
        },
    })

@app.route("/api/earthquakes")
def get_earthquakes():
    return jsonify({"events": fetch_earthquakes()})

@app.route("/api/weather")
def get_weather():
    return jsonify({"events": fetch_weather_alerts()})

# ── CONTINUOUS BACKGROUND FETCHER ────────────────────────────
def _force_refresh():
    """Force-expire TTLs for fast-changing sources. Gemini has its own 5-min TTL — do NOT reset it here."""
    with _cache_lock:
        _cache["last_quake_fetch"]   = 0
        _cache["last_weather_fetch"] = 0
        _cache["last_eonet_fetch"]   = 0
        _cache["last_gdacs_fetch"]   = 0
        # Note: last_gemini_fetch is NOT zeroed — Gemini runs at its own GEMINI_TTL (2 hrs)

def background_fetcher():
    """Refresh all data sources every 60 seconds unconditionally."""
    time.sleep(2)  # let Flask fully start first
    print("[IndiaShield] Background fetcher starting — warming cache...")
    fetch_earthquakes()
    fetch_weather_alerts()
    fetch_eonet_events()
    fetch_gdacs_events()
    fetch_gemini_alerts()
    print("[IndiaShield] Cache warmed. Continuous refresh active (60s cycle).")
    while True:
        time.sleep(60)
        try:
            _force_refresh()          # guarantee external API hit each cycle
            fetch_earthquakes()
            fetch_weather_alerts()
            fetch_eonet_events()
            fetch_gdacs_events()
            fetch_gemini_alerts()
            print(f"[IndiaShield] Refreshed at {datetime.now(tz=timezone.utc).isoformat()}")
        except Exception as e:
            print(f"[IndiaShield] Background fetcher error: {e}")

if __name__ == "__main__":
    threading.Thread(target=background_fetcher, daemon=True).start()
    print("[IndiaShield API] Server starting on http://localhost:8001")
    app.run(host="0.0.0.0", port=8001, debug=False, threaded=True)
