# Kafka Consumer Script
# This script acts as a Kafka consumer to read data from Kafka topics.

from kafka import KafkaConsumer
import json

# Kafka configuration
KAFKA_BROKER = 'localhost:9092'
TOPICS = ['twitter_stream', 'weather_stream']

# Initialize Kafka consumer
consumer = KafkaConsumer(
    *TOPICS,
    bootstrap_servers=KAFKA_BROKER,
    value_deserializer=lambda v: json.loads(v.decode('utf-8'))
)

def consume_data():
    for message in consumer:
        print(f"Received message from topic {message.topic}: {message.value}")

if __name__ == "__main__":
    consume_data()