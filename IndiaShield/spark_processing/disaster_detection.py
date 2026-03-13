# IndiaShield — Disaster Detection via Spark Structured Streaming
# Uses the modern readStream API (replaces the deprecated DStream/KafkaUtils approach).

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, udf, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, FloatType, IntegerType

# ── Spark session ──────────────────────────────────────────────────────────────
spark = SparkSession.builder \
    .appName("IndiaShield-DisasterDetection") \
    .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# ── Config ─────────────────────────────────────────────────────────────────────
KAFKA_BROKER = "localhost:9092"
TOPICS       = "twitter_stream,weather_stream"

DISASTER_KEYWORDS = [
    "earthquake", "flood", "fire", "cyclone", "landslide",
    "disaster", "alert", "emergency", "tsunami", "drought",
]

# ── Schema for incoming Kafka JSON messages ────────────────────────────────────
message_schema = StructType([
    StructField("text",          StringType(),  True),
    StructField("location",      StringType(),  True),
    StructField("source",        StringType(),  True),
    StructField("lat",           FloatType(),   True),
    StructField("lng",           FloatType(),   True),
    StructField("type",          StringType(),  True),
    StructField("severity",      StringType(),  True),
    StructField("affectedPeople", IntegerType(), True),
])

# ── UDF: infer severity from tweet / message text ─────────────────────────────
@udf(returnType=StringType())
def detect_severity(text: str) -> str:
    if text is None:
        return "low"
    t = text.lower()
    if any(w in t for w in ["critical", "catastrophic", "major", "devastating"]):
        return "critical"
    if any(w in t for w in ["severe", "serious", "heavy", "intense", "high"]):
        return "severe"
    if any(w in t for w in ["moderate", "warning", "alert", "caution"]):
        return "moderate"
    return "low"

# ── Micro-batch processor ──────────────────────────────────────────────────────
def process_batch(df, epoch_id: int):
    count = df.count()
    if count > 0:
        print(f"[Spark] Epoch {epoch_id}: {count} disaster event(s) detected")
        df.show(truncate=False)

# ── Read from Kafka as a structured streaming DataFrame ───────────────────────
raw_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BROKER)
    .option("subscribe", TOPICS)
    .option("startingOffsets", "latest")
    .option("failOnDataLoss", "false")
    .load()
)

# ── Parse JSON value column ────────────────────────────────────────────────────
parsed = (
    raw_stream
    .select(
        from_json(col("value").cast("string"), message_schema).alias("data"),
        col("topic"),
    )
    .select("topic", "data.*")
)

# ── Filter for disaster-related messages and enrich with severity ──────────────
keyword_pattern = "|".join(DISASTER_KEYWORDS)

disaster_events = (
    parsed
    .filter(col("text").isNotNull())
    .filter(col("text").rlike(keyword_pattern))
    .withColumn("detected_severity", detect_severity(col("text")))
    .withColumn("processed_at", current_timestamp())
)

# ── Write micro-batches to console every 10 seconds ───────────────────────────
# Replace .format("console") with a Kafka sink or JDBC sink for production use.
query = (
    disaster_events.writeStream
    .outputMode("append")
    .format("console")
    .option("truncate", False)
    .foreachBatch(process_batch)
    .trigger(processingTime="10 seconds")
    .start()
)

print(f"[IndiaShield Spark] Structured Streaming started. Topics: {TOPICS}")
query.awaitTermination()