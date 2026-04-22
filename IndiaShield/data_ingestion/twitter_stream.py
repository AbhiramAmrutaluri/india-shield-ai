# Twitter Stream Script
# This script will connect to the Twitter API and stream tweets related to disasters.

import tweepy
import json
from kafka import KafkaProducer
import certifi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Twitter API credentials
API_KEY = os.getenv('TWITTER_API_KEY')
API_SECRET = os.getenv('TWITTER_API_SECRET')
ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

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
KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC_TWITTER', 'twitter_stream')
producer = KafkaProducer(bootstrap_servers=KAFKA_BROKER)

# Initialize Tweepy StreamingClient
BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN')
if not BEARER_TOKEN:
    raise ValueError('TWITTER_BEARER_TOKEN is not set in environment variables')
stream_client = DisasterStreamClient(BEARER_TOKEN, producer)

# Add rules and start streaming
stream_client.add_rules(tweepy.StreamRule("disaster OR earthquake OR flood OR fire OR accident"))
stream_client.filter()

# Set the certificate path explicitly
import os
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()