#!/bin/bash
# Script to upload data to HDFS

HDFS_DIR=/user/indiashield/data
LOCAL_DIR=../datasets

# Create HDFS directory if it doesn't exist
hdfs dfs -mkdir -p $HDFS_DIR

# Upload files to HDFS
hdfs dfs -put -f $LOCAL_DIR/* $HDFS_DIR

echo "Data uploaded to HDFS at $HDFS_DIR"