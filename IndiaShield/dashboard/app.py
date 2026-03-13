# Streamlit Dashboard for IndiaShield
# This script creates a live dashboard to display disaster data.

import streamlit as st
import pandas as pd
import plotly.express as px

# Load data
data = pd.read_csv('../datasets/disaster_data.csv')

# Dashboard title
st.title("IndiaShield: Real-Time Disaster Dashboard")

# Display data table
st.subheader("Disaster Data")
st.dataframe(data)

# Plot disaster locations
st.subheader("Disaster Locations")
fig = px.scatter_map(
    data,
    lat="latitude",
    lon="longitude",
    color="severity",
    size="severity",
    zoom=5,
    map_style="carto-positron"
)
st.plotly_chart(fig)

# Severity breakdown
st.subheader("Severity Breakdown")
severity_counts = data['severity'].value_counts()
st.bar_chart(severity_counts)

# Run the app
if __name__ == "__main__":
    pass