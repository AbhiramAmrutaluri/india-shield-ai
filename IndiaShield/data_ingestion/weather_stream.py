# Weather Stream Script
# This script fetches weather data from OpenWeatherMap API and sends it to Kafka.

import requests
import time
import os
from kafka import KafkaProducer
import certifi
from dotenv import load_dotenv

# OpenWeatherMap API credentials
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
API_KEY = os.environ.get("OWM_API_KEY")
CITY = 'Delhi'

if not API_KEY:
    raise RuntimeError("OWM_API_KEY is not set. Add it to .env before running this script.")

# Kafka configuration
KAFKA_TOPIC = 'weather_stream'
KAFKA_BROKER = 'localhost:9092'

# Initialize Kafka producer
producer = KafkaProducer(bootstrap_servers=KAFKA_BROKER)

# Fetch weather data periodically
def fetch_weather():
    url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}"
    while True:
        try:
            response = requests.get(url, verify=certifi.where())
            if response.status_code == 200:
                producer.send(KAFKA_TOPIC, value=response.content)
                print("Weather data sent to Kafka")
            else:
                print(f"Failed to fetch weather data: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(60)  # Fetch data every 60 seconds

if __name__ == "__main__":
    fetch_weather()