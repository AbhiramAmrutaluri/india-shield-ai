# Kafka Producer Script
# This script acts as a Kafka producer to send data to Kafka topics.

from kafka import KafkaProducer
import json

# Kafka configuration
KAFKA_BROKER = 'localhost:9092'
TOPICS = ['twitter_stream', 'weather_stream']

# Initialize Kafka producer
producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def send_data(topic, data):
    try:
        producer.send(topic, value=data)
        print(f"Data sent to topic {topic}")
    except Exception as e:
        print(f"Error sending data: {e}")

if __name__ == "__main__":
    # Example usage
    sample_data = {"message": "Hello Kafka!"}
    send_data(TOPICS[0], sample_data)