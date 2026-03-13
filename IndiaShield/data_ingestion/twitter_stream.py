# Twitter Stream Script
# This script will connect to the Twitter API and stream tweets related to disasters.

import tweepy
import json
from kafka import KafkaProducer
import certifi

# Twitter API credentials
API_KEY = 'your_api_key'
API_SECRET = 'your_api_secret'
ACCESS_TOKEN = 'your_access_token'
ACCESS_SECRET = 'your_access_secret'

# Kafka configuration
KAFKA_TOPIC = 'twitter_stream'
KAFKA_BROKER = 'localhost:9092'

# Tweepy StreamingClient
class DisasterStreamClient(tweepy.StreamingClient):
    def __init__(self, bearer_token, producer):
        super().__init__(bearer_token)
        self.producer = producer

    def on_data(self, data):
        try:
            self.producer.send(KAFKA_TOPIC, value=data.encode('utf-8'))
            print("Tweet sent to Kafka")
        except Exception as e:
            print(f"Error: {e}")

    def on_error(self, status_code):
        print(f"Error: {status_code}")
        if status_code == 420:
            return False

# Initialize Kafka producer
producer = KafkaProducer(bootstrap_servers=KAFKA_BROKER)

# Initialize Tweepy StreamingClient
BEARER_TOKEN = 'your_bearer_token'  # Replace with your actual bearer token
stream_client = DisasterStreamClient(BEARER_TOKEN, producer)

# Add rules and start streaming
stream_client.add_rules(tweepy.StreamRule("disaster OR earthquake OR flood OR fire OR accident"))
stream_client.filter()

# Set the certificate path explicitly
import os
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()