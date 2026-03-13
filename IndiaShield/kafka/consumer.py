# Kafka Consumer Script
# This script acts as a Kafka consumer to read data from Kafka topics.

from kafka import KafkaConsumer
import json
import requests

# Kafka configuration
KAFKA_BROKER = 'localhost:9092'
TOPICS = ['twitter_stream', 'weather_stream']

# Initialize Kafka consumer
consumer = KafkaConsumer(
    *TOPICS,
    bootstrap_servers=KAFKA_BROKER,
    value_deserializer=lambda v: json.loads(v.decode('utf-8'))
)

API_INGEST_URL = "http://localhost:8000/api/ingest"

def consume_data():
    for message in consumer:
        data = message.value
        print(f"[Kafka] Received from topic {message.topic}: {data}")
        try:
            resp = requests.post(API_INGEST_URL, json=data, timeout=3)
            if resp.status_code == 201:
                print(f"[Kafka] Forwarded event {data.get('id', '?')} to API server")
            else:
                print(f"[Kafka] API server returned {resp.status_code}")
        except Exception as e:
            print(f"[Kafka] Failed to forward event to API server: {e}")

if __name__ == "__main__":
    consume_data()