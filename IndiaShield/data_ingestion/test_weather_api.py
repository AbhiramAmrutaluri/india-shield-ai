# Test script to verify OpenWeatherMap API key

import requests
import certifi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv('OPENWEATHER_API_KEY')
CITY = os.getenv('WEATHER_CITY', 'Hyderabad')

url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"

response = requests.get(url, verify=certifi.where())

if response.status_code == 200:
    print("API Key is valid. Response:")
    print(response.json())
else:
    print(f"Failed to fetch weather data. HTTP Status Code: {response.status_code}")
    print(response.text)