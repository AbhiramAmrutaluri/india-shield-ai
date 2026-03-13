# IndiaShield AI

<p align="center">
  <img src="public/logo.svg" alt="IndiaShield Logo" width="120" />
</p>

<p align="center">
  <strong>AI-Powered Real-Time Disaster & Emergency Intelligence System for India</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-Streaming-231F20?style=flat-square&logo=apache-kafka" />
  <img src="https://img.shields.io/badge/Apache%20Spark-3.5-E25A1C?style=flat-square&logo=apache-spark" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Powered-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## Overview

**IndiaShield AI** is a full-stack, real-time disaster monitoring and emergency alert platform for India. It ingests live disaster signals from 6+ data sources — earthquakes, extreme weather, natural events, global disaster feeds, social media, and AI insights — processes them through a big data pipeline (Kafka + Apache Spark), and visualizes them on an interactive geospatial dashboard.

The system covers **120+ Indian cities** with color-coded severity classification, affected population tracking, ML-powered severity prediction, and live AI alerts via Google Gemini.

---

## Features

- **Real-Time Multi-Source Aggregation** — Live data from USGS, OpenWeatherMap, NASA EONET, GDACS, Twitter/X, and Google Gemini
- **Interactive Map** — Leaflet.js map centered on India with color-coded disaster markers, severity indicators, and clickable popups
- **Kafka Streaming Pipeline** — Twitter & weather streams ingested via Kafka topics and forwarded to the Flask API
- **Apache Spark Processing** — Structured streaming for disaster keyword detection and severity classification in real time
- **ML Severity Prediction** — RandomForest classifier trained on disaster data (94.7% accuracy)
- **Google Gemini Insights** — AI-powered anomaly detection and contextual alerts with Google Search grounding
- **Server-Sent Events (SSE)** — Real-time push from Flask API to React frontend without polling
- **Smart Caching** — Multi-tier in-memory + disk cache with configurable TTLs to avoid API quota exhaustion
- **Dark / Light Mode** — Full theme support with animated cursor glow effects
- **Fully Responsive** — Mobile-friendly React dashboard with Tailwind CSS

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
│  USGS Earthquakes │ OpenWeatherMap │ NASA EONET │ GDACS RSS     │
│  Twitter/X Stream │ Google Gemini AI                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   KAFKA MESSAGE BROKER                          │
│          Topics: twitter_stream  │  weather_stream             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              APACHE SPARK STRUCTURED STREAMING                  │
│   Disaster keyword detection │ Severity UDF │ 10s micro-batches │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              FLASK REST API  (port 8000)                        │
│   Event aggregation │ Severity scoring │ SSE streaming          │
│   Gemini AI insights │ Cache management │ CORS                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              REACT DASHBOARD  (port 5173)                       │
│   DisasterMap │ AlertFeed │ StreamChart │ SeverityBreakdown     │
│   PipelineStats │ FullscreenAlerts │ Dark/Light Theme           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui + Radix UI | latest | Accessible component library |
| Leaflet.js | 1.9.4 | Interactive maps |
| Recharts | 2.15.4 | Data visualization |
| Framer Motion | 12.x | Animations |
| React Router | v6 | Client-side routing |
| React Query | 5.x | Server-state management |
| React Hook Form + Zod | 7.x | Form validation |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Flask | 3.0.0 | REST API + SSE server |
| Flask-CORS | 4.0.0 | Cross-origin requests |
| kafka-python | 2.0.0 | Kafka consumer/producer |
| Tweepy | 4.14.0 | Twitter/X streaming |
| Google Generative AI | latest | Gemini AI insights |
| python-dotenv | 1.0.0 | Environment variables |
| Requests + Certifi | latest | HTTP client with SSL |

### Data & ML
| Technology | Purpose |
|---|---|
| Apache Kafka (Confluent) | Message broker for streaming |
| Apache Spark 3.5 | Structured stream processing |
| scikit-learn | RandomForest severity prediction |
| pandas | Data manipulation |
| Apache Hive | Analytical SQL queries |
| Hadoop HDFS | Distributed data archival |

---

## Data Sources

| Source | Auth Required | Refresh Rate | Coverage |
|---|---|---|---|
| USGS Earthquake API | None | 60s | Global |
| OpenWeatherMap API | API Key | 180s | 120+ Indian cities |
| NASA EONET | None | 300s | Global natural events |
| GDACS RSS Feed | None | 600s | Global disaster alerts |
| Google Gemini AI | API Key | 2 hours | AI insights |
| Twitter/X Streaming | Bearer Token | Real-time | Social media |

---

## Project Structure

```
india-shield-ai/
├── src/                          # React frontend
│   ├── pages/
│   │   ├── Landing.tsx           # Hero landing page
│   │   ├── Index.tsx             # Main dashboard page
│   │   └── NotFound.tsx          # 404 page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DisasterMap.tsx   # Leaflet.js map
│   │   │   ├── AlertFeed.tsx     # Live alert list
│   │   │   ├── HeaderBar.tsx     # Top nav + status
│   │   │   ├── StreamChart.tsx   # Streaming data chart
│   │   │   ├── SeverityBreakdown.tsx
│   │   │   ├── PipelineStats.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   └── FullscreenAlerts.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── context/
│   │   └── DisasterContext.tsx   # Global state
│   └── data/
│       └── mockDisasters.ts      # Fallback mock data
│
├── IndiaShield/                  # Python backend
│   ├── api_server.py             # Flask REST + SSE server (port 8000)
│   ├── requirements.txt
│   ├── kafka/
│   │   ├── producer.py           # Publishes to Kafka topics
│   │   └── consumer.py           # Consumes + forwards to API
│   ├── data_ingestion/
│   │   ├── weather_stream.py     # OWM → Kafka weather_stream
│   │   └── twitter_stream.py     # Twitter/X → Kafka twitter_stream
│   ├── spark_processing/
│   │   └── disaster_detection.py # Spark Structured Streaming
│   ├── machine_learning/
│   │   └── severity_prediction.py # RandomForest ML model
│   ├── analytics/
│   │   └── hive_queries.sql      # Hive analytical queries
│   ├── storage/
│   │   └── hdfs_upload.sh        # HDFS archival script
│   └── datasets/
│       └── disaster_data.csv     # Training dataset
│
├── docker-compose.yml            # Zookeeper + Kafka setup
├── .env.example                  # Environment variable template
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x and **npm** >= 9.x
- **Python** >= 3.10
- **Docker Desktop** (for Kafka/Zookeeper)
- **Java 11+** (for Apache Spark, optional)

---

### 1. Clone the Repository

```bash
git clone https://github.com/AbhiramAmrutaluri/india-shield-ai.git
cd india-shield-ai
```

---

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```env
OWM_API_KEY=your_openweathermap_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

- **OpenWeatherMap** — Free key at https://openweathermap.org/api
- **Google Gemini** — API key at https://ai.google.dev

---

### 3. Start Kafka (Docker)

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** on port `2181`
- **Kafka broker** on port `9093`

---

### 4. Install & Start the Python Backend

```bash
# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r IndiaShield/requirements.txt

# Start the Flask API server
python IndiaShield/api_server.py
```

The API server runs at **http://localhost:8000** and immediately begins fetching live disaster data.

---

### 5. Install & Start the React Frontend

```bash
npm install
npm run dev
```

The dashboard is available at **http://localhost:5173**

---

### 6. (Optional) Start Data Ingestion Streams

```bash
# Weather stream → Kafka
python IndiaShield/data_ingestion/weather_stream.py

# Twitter/X stream → Kafka (requires Twitter API credentials)
python IndiaShield/data_ingestion/twitter_stream.py

# Kafka consumer → Flask API
python IndiaShield/kafka/consumer.py
```

---

### 7. (Optional) Start the Streamlit Dashboard

```bash
cd IndiaShield/dashboard
streamlit run app.py --server.port 8501
```

Available at **http://localhost:8501**

---

### 8. (Optional) Train the ML Model

```bash
python IndiaShield/machine_learning/severity_prediction.py
```

Outputs `severity_model.pkl` used for severity prediction.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Fetch all current disaster events |
| `GET` | `/api/events/stream` | SSE stream of live events |
| `POST` | `/api/ingest` | Ingest a new event (from Kafka consumer) |
| `GET` | `/api/stats` | Pipeline statistics |

---

## Severity Classification

| Level | Color | Criteria |
|---|---|---|
| **Critical** | 🔴 Red | Magnitude ≥ 6.0 / Extreme weather / Major GDACS event |
| **Severe** | 🟠 Orange | Magnitude 5.0–5.9 / Severe weather advisory |
| **Moderate** | 🟡 Yellow | Magnitude 4.0–4.9 / Weather warning |
| **Low** | 🔵 Cyan | Magnitude < 4.0 / Minor weather event |

---

## Running Tests

```bash
# Frontend unit tests
npm run test

# Frontend tests in watch mode
npm run test:watch

# Lint check
npm run lint
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `OWM_API_KEY` | Yes | OpenWeatherMap API key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

> Twitter/X credentials are configured directly in `IndiaShield/data_ingestion/twitter_stream.py`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

## Acknowledgements

- [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/fdsnws/event/1/)
- [OpenWeatherMap](https://openweathermap.org/)
- [NASA EONET](https://eonet.gsfc.nasa.gov/)
- [GDACS](https://www.gdacs.org/)
- [Google Gemini AI](https://ai.google.dev/)
- [Apache Kafka](https://kafka.apache.org/)
- [Apache Spark](https://spark.apache.org/)
- [Leaflet.js](https://leafletjs.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [shadcn/ui](https://ui.shadcn.com/)
