# Streamlit Dashboard for IndiaShield
# This script creates a live dashboard to display disaster data.

import os
import streamlit as st
import pandas as pd
import plotly.express as px

logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "indiashield-logo.svg"))

st.set_page_config(page_title="India Shield Backend", page_icon=logo_path, layout="wide")

# Load data
data_path = os.path.join(os.path.dirname(__file__), '../datasets/disaster_data.csv')
data = pd.read_csv(data_path)

# Dashboard title
st.title("India Shield Backend")

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