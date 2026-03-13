# Test script to verify OpenWeatherMap API key

import requests
import certifi
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
API_KEY = os.environ.get("OWM_API_KEY")
CITY = "Hyderabad"

if not API_KEY:
    raise RuntimeError("OWM_API_KEY is not set. Add it to .env before running this script.")

url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"

response = requests.get(url, verify=certifi.where())

if response.status_code == 200:
    print("API Key is valid. Response:")
    print(response.json())
else:
    print(f"Failed to fetch weather data. HTTP Status Code: {response.status_code}")
    print(response.text)