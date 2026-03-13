-- Hive Queries for Analytics

-- Create table for disaster data
CREATE TABLE IF NOT EXISTS disaster_data (
    id STRING,
    text STRING,
    timestamp STRING,
    location STRING,
    severity INT
)
STORED AS PARQUET;

-- Load data into the table
LOAD DATA INPATH '/user/indiashield/data/disaster_data.json' INTO TABLE disaster_data;

-- Query to get top disaster-prone locations
SELECT location, COUNT(*) AS disaster_count
FROM disaster_data
GROUP BY location
ORDER BY disaster_count DESC
LIMIT 10;