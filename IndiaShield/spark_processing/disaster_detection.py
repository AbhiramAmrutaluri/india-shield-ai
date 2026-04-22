# Spark Streaming Script for Disaster Detection
# This script processes streaming data from Kafka and detects disasters using NLP.

from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.sql.types import StringType
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils

# Initialize Spark session
spark = SparkSession.builder \
    .appName("DisasterDetection") \
    .getOrCreate()

# Kafka configuration
KAFKA_BROKER = 'localhost:9092'
TOPICS = ['twitter_stream', 'weather_stream']

# Initialize Streaming Context
ssc = StreamingContext(spark.sparkContext, 10)  # Batch interval of 10 seconds

# Connect to Kafka
kafka_stream = KafkaUtils.createDirectStream(ssc, TOPICS, {"metadata.broker.list": KAFKA_BROKER})

# Process each RDD
def process_rdd(rdd):
    if not rdd.isEmpty():
        df = spark.read.json(rdd.map(lambda x: x[1]))
        # Example: Filter tweets mentioning "earthquake"
        disaster_df = df.filter(col("text").contains("earthquake"))
        disaster_df.show()

kafka_stream.foreachRDD(process_rdd)

# Start streaming
ssc.start()
ssc.awaitTermination()