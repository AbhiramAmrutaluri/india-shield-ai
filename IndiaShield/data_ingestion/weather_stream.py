# Weather Stream Script
# This script fetches weather data from OpenWeatherMap API and sends it to Kafka.

import requests
import time
from kafka import KafkaProducer
import certifi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenWeatherMap API credentials
API_KEY = os.getenv('OPENWEATHER_API_KEY')
CITY = os.getenv('WEATHER_CITY', 'Delhi')

# Kafka configuration
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC_WEATHER', 'weather_stream')
KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')

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