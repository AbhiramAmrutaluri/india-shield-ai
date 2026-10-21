# 🇮🇳 India Shield AI

### Real-Time Disaster Intelligence and Early Warning Dashboard for India

India Shield AI is a real-time disaster monitoring and intelligence platform designed to collect, process, visualize, and analyze disaster-related data across India.

The platform combines live data from earthquake, weather, satellite, global disaster-alert, AI, and streaming sources into a unified dashboard. It helps users monitor potential hazards, view affected locations on an interactive map, understand severity levels, and access continuously refreshed disaster information.

> **Important:** India Shield AI is an experimental intelligence and visualization platform. It should not replace official emergency alerts, government advisories, or professional disaster-response organizations.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Data Sources](#-data-sources)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
- [Kafka Integration](#-kafka-integration)
- [Severity Classification](#-severity-classification)
- [Testing and Code Quality](#-testing-and-code-quality)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Developer](#-developer)

---

## 🌍 Overview

Natural disasters can develop quickly and affect large populations. Important information is often distributed across multiple APIs, news sources, alert systems, and monitoring platforms.

India Shield AI provides a centralized dashboard for monitoring disaster-related events in and around India. It aggregates information from multiple sources and converts the data into a common event format containing:

- Disaster type
- Event title
- Location
- Latitude and longitude
- Severity
- Timestamp
- Data source
- Description
- Estimated affected population
- Confidence score

The frontend presents the information through an interactive web dashboard, while the Python backend fetches and processes live data.

---

## ✨ Key Features

### Real-Time Disaster Monitoring

India Shield AI continuously retrieves and displays disaster-related information from multiple sources, including:

- Earthquakes
- Floods
- Cyclones and severe storms
- Heavy rainfall
- Heat waves
- Cold waves
- Wildfires
- Landslides
- Droughts
- Dust storms
- Industrial incidents
- Other natural and environmental hazards

### Interactive Disaster Dashboard

The dashboard provides:

- Interactive map-based event visualization
- Disaster event cards
- Severity indicators
- Source attribution
- Event timestamps
- Event filtering
- Disaster statistics
- Live event updates
- Historical and analytical views

### Multiple Data Sources

The backend combines data from:

- USGS Earthquake API
- OpenWeatherMap API
- NASA EONET
- GDACS
- Gemini AI with Google Search grounding
- Kafka-ingested internal events

### AI-Assisted Alerts

Google Gemini is used to identify current disaster and emergency information from web-search-grounded results. AI-generated events are normalized into the same format as other data sources.

### Server-Sent Events

The backend exposes a Server-Sent Events endpoint that allows the frontend to receive refreshed disaster information without repeatedly reloading the page.

### Kafka Event Ingestion

External services and streaming applications can send events to India Shield AI through the Kafka ingestion API.

### Region-Aware Detection

Weather events are interpreted using regional information such as:

- Coastal regions
- Mountain regions
- Northeast India
- Dry plains
- Major Indian cities and states

### Caching

The backend uses in-memory caching and disk caching for selected AI results to reduce unnecessary API requests and avoid excessive API quota usage.

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │    External Data Sources │
                         ├─────────────────────────┤
                         │ USGS Earthquake API     │
                         │ OpenWeatherMap API      │
                         │ NASA EONET              │
                         │ GDACS RSS               │
                         │ Gemini AI Search        │
                         │ Kafka Streams           │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     Python API Server    │
                         │      Flask Backend       │
                         ├─────────────────────────┤
                         │ Data Collection          │
                         │ Event Normalization      │
                         │ Severity Classification  │
                         │ Caching                  │
                         │ REST API                 │
                         │ Server-Sent Events       │
                         └────────────┬────────────┘
                                      │
                         REST / SSE   │
                                      ▼
                         ┌─────────────────────────┐
                         │     React Frontend       │
                         │ TypeScript + Vite        │
                         ├─────────────────────────┤
                         │ Interactive Dashboard    │
                         │ Disaster Map             │
                         │ Analytics                │
                         │ Alerts                   │
                         │ Event Details             │
                         └─────────────────────────┘
```

---

## 📡 Data Sources

### USGS Earthquake API

Provides earthquake events within the India region, including:

- Magnitude
- Location
- Coordinates
- Timestamp
- Estimated severity

Earthquake events are periodically refreshed from the USGS GeoJSON feed.

### OpenWeatherMap API

Provides weather information for a collection of Indian cities, including:

- Temperature
- Humidity
- Wind speed
- Weather condition
- Geographic coordinates

The backend uses weather thresholds to identify potentially hazardous conditions.

### NASA EONET

NASA's Earth Observatory Natural Event Tracker provides information about open natural events such as:

- Wildfires
- Floods
- Severe storms
- Earthquakes
- Landslides
- Droughts
- Dust and haze
- Temperature extremes

### GDACS

The Global Disaster Alert and Coordination System provides disaster alerts through an RSS feed.

### Gemini AI

Gemini AI with Google Search grounding is used to identify current disaster-related news and alerts in India.

AI-generated results should be treated as supplementary intelligence and verified against official sources before being used for emergency response decisions.

### Kafka

Kafka can be used to ingest events generated by internal systems, stream processors, sensor networks, or other data pipelines.

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Leaflet
- Recharts
- Framer Motion
- Radix UI
- Lucide React
- Vitest
- Testing Library

### Backend

- Python
- Flask
- Flask-CORS
- Requests
- Python dotenv
- Google Gemini SDK
- XML parsing for GDACS RSS data

### Data Engineering and Streaming

- Apache Kafka
- Apache ZooKeeper
- Apache Spark
- Kafka Python
- Stream processing modules

### Analytics and Machine Learning

- Pandas
- NumPy
- Scikit-learn
- Joblib
- Plotly
- Streamlit

### Infrastructure

- Docker Compose
- Apache Kafka
- Apache ZooKeeper

---

## 📂 Project Structure

```text
india-shield-ai/
│
├── .env.example                 # Example environment configuration
├── .gitignore
├── README.md
├── docker-compose.yml            # Kafka and ZooKeeper services
├── package.json                  # Frontend dependencies and scripts
├── package-lock.json
├── bun.lock
├── bun.lockb
├── components.json
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
│
├── public/                       # Static frontend assets
│
├── src/
│   ├── App.tsx                   # Frontend routes and application shell
│   ├── main.tsx                  # Frontend entry point
│   ├── App.css
│   ├── index.css
│   ├── components/               # Reusable UI components
│   ├── context/                  # React context providers
│   ├── data/                     # Frontend data and configuration
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Shared frontend utilities
│   ├── pages/                    # Application pages
│   ├── test/                     # Frontend tests
│   └── vite-env.d.ts
│
├── IndiaShield/
│   ├── api_server.py             # Flask API server
│   ├── requirements.txt          # Python dependencies
│   ├── test_gemini.py            # Gemini integration test
│   ├── analytics/                # Analytics modules
│   ├── dashboard/                # Dashboard-related Python modules
│   ├── data_ingestion/           # Data ingestion modules
│   ├── datasets/                 # Dataset storage
│   ├── kafka/                    # Kafka producers and consumers
│   ├── machine_learning/         # Machine-learning modules
│   ├── spark_processing/         # Apache Spark processing jobs
│   └── storage/                  # Storage and persistence modules
│
└── PPT/                          # Project presentation materials
```

---

## ✅ Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm, Bun, or another Node.js package manager
- Python 3.9 or later
- pip
- Git
- Docker and Docker Compose, if Kafka is required

Optional services and credentials:

- OpenWeatherMap API key
- Google Gemini API key
- Twitter/X API credentials
- Docker for Kafka and ZooKeeper

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AbhiramAmrutaluri/india-shield-ai.git
cd india-shield-ai
```

### 2. Install Frontend Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Create a Python Virtual Environment

Linux or macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 4. Install Backend Dependencies

```bash
pip install -r IndiaShield/requirements.txt
```

---

## 🔐 Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

On Windows, create the file manually if the `cp` command is unavailable.

Configure the required variables:

```dotenv
# OpenWeatherMap API
OWM_API_KEY=your_openweathermap_api_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Optional weather configuration
WEATHER_CITY=Delhi

# Optional Twitter/X configuration
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Kafka configuration
KAFKA_TOPIC_WEATHER=weather_stream
KAFKA_TOPIC_TWITTER=twitter_stream
KAFKA_BROKER=localhost:9092
KAFKA_BROKER_WITH_PORT=localhost:9092
```

### Required Variables

The current Flask API server requires:

```dotenv
OWM_API_KEY=your_openweathermap_api_key
GEMINI_API_KEY=your_gemini_api_key
```

The following data sources do not require API keys:

- USGS Earthquake API
- NASA EONET
- GDACS

### Security Warning

Never commit your real `.env` file or API keys to GitHub.

The `.env` file should remain local and should be excluded by `.gitignore`.

---

## ▶️ Running the Application

India Shield AI contains two main services:

1. React frontend
2. Flask backend API

Run both services in separate terminal windows.

### Terminal 1: Start the Backend

From the project root:

```bash
python IndiaShield/api_server.py
```

The backend starts on:

```text
http://localhost:8001
```

Available backend endpoints include:

```text
http://localhost:8001/api/status
http://localhost:8001/api/events
http://localhost:8001/api/stream
```

### Terminal 2: Start the Frontend

```bash
npm run dev
```

The Vite development server normally starts on:

```text
http://localhost:5173
```

Open the application at:

```text
http://localhost:5173
```

The dashboard is available at:

```text
http://localhost:5173/dashboard
```

---

## 🐳 Running Kafka with Docker Compose

Kafka and ZooKeeper can be started with Docker Compose:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f kafka
```

Stop the services:

```bash
docker compose down
```

The Docker Compose configuration exposes Kafka on:

```text
localhost:9093
```

If your Kafka producer or consumer runs inside the Docker network, use the internal Kafka hostname and port configured in `docker-compose.yml`.

---

## 🔌 API Reference

The Flask backend runs on port `8001` by default.

### Get All Disaster Events

```http
GET /api/events
```

Example:

```bash
curl http://localhost:8001/api/events
```

Example response structure:

```json
{
  "events": [
    {
      "id": "usgs-example",
      "type": "earthquake",
      "title": "M4.5 Earthquake",
      "location": "India region",
      "lat": 20.59,
      "lng": 78.96,
      "severity": "moderate",
      "timestamp": "2026-01-01T12:00:00+00:00",
      "source": "USGS Earthquake API",
      "description": "Earthquake information",
      "affectedPeople": 10000,
      "confidence": 0.97
    }
  ],
  "count": 1,
  "sources": {
    "usgs_earthquakes": 1,
    "owm_weather": 0,
    "eonet_events": 0,
    "gdacs_events": 0,
    "gemini_alerts": 0,
    "kafka_events": 0
  },
  "fetched_at": "2026-01-01T12:00:00+00:00"
}
```

### Stream Live Events

```http
GET /api/stream
```

This endpoint uses Server-Sent Events and periodically sends updated event data to connected clients.

Example:

```bash
curl -N http://localhost:8001/api/stream
```

### Get API Status

```http
GET /api/status
```

Example:

```bash
curl http://localhost:8001/api/status
```

The response contains:

- Backend status
- Enabled data sources
- Current server time
- Number of cached events by source

### Get Earthquake Events

```http
GET /api/earthquakes
```

Example:

```bash
curl http://localhost:8001/api/earthquakes
```

### Get Weather Events

```http
GET /api/weather
```

Example:

```bash
curl http://localhost:8001/api/weather
```

### Ingest a Custom Event

```http
POST /api/ingest
Content-Type: application/json
```

Example:

```bash
curl -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "flood",
    "title": "Flood warning",
    "location": "Mumbai, Maharashtra",
    "lat": 19.076,
    "lng": 72.8777,
    "severity": "severe",
    "source": "Internal Stream",
    "description": "Heavy rainfall detected.",
    "affectedPeople": 25000,
    "confidence": 0.85
  }'
```

The ingestion endpoint returns an event ID after successfully accepting the event.

---

## 📊 Event Data Format

Events are normalized into a common structure:

```json
{
  "id": "unique-event-id",
  "type": "earthquake",
  "title": "Event title",
  "location": "City, State",
  "lat": 20.5937,
  "lng": 78.9629,
  "severity": "moderate",
  "timestamp": "2026-01-01T12:00:00+00:00",
  "source": "Data source",
  "description": "Event description",
  "affectedPeople": 10000,
  "confidence": 0.9
}
```

### Supported Event Types

- `earthquake`
- `flood`
- `fire`
- `cyclone`
- `landslide`
- `accident`
- `heatwave`
- `drought`
- `dust_storm`
- `tsunami`
- `cold_wave`
- `industrial`

### Supported Severity Levels

- `low`
- `moderate`
- `severe`
- `critical`

---

## 🧠 Severity Classification

### Earthquakes

Earthquake severity is estimated from magnitude:

| Magnitude | Severity |
|---|---|
| Below 4.5 | Low |
| 4.5 to 5.4 | Moderate |
| 5.5 to 6.4 | Severe |
| 6.5 and above | Critical |

### Weather Events

Weather severity considers:

- Temperature
- Wind speed
- Humidity
- Rainfall intensity
- Thunderstorms
- Snow or ice
- Smoke, haze, dust, and fog

The thresholds are intended for application-level monitoring and are not official government classifications.

### GDACS Alerts

GDACS alert levels are mapped approximately as follows:

| GDACS Alert | India Shield AI Severity |
|---|---|
| Green | Moderate |
| Orange | Severe |
| Red | Critical |

---

## 🧪 Testing and Code Quality

### Run Frontend Tests

```bash
npm test
```

### Run Frontend Tests in Watch Mode

```bash
npm run test:watch
```

### Run ESLint

```bash
npm run lint
```

### Build the Frontend

```bash
npm run build
```

### Build Using Development Mode

```bash
npm run build:dev
```

### Preview the Production Build

```bash
npm run preview
```

### Test the Gemini Integration

From the project root:

```bash
python IndiaShield/test_gemini.py
```

---

## 🛠️ Troubleshooting

### Backend Does Not Start

Verify that:

- Python is installed.
- The virtual environment is activated.
- Backend dependencies are installed.
- The `.env` file exists in the repository root.
- `OWM_API_KEY` is configured.
- `GEMINI_API_KEY` is configured.

### Frontend Cannot Fetch Backend Data

Verify that:

- The backend is running on port `8001`.
- The frontend is running on port `5173`.
- The browser can access `http://localhost:8001/api/status`.
- No firewall is blocking port `8001`.
- CORS is not being blocked by a proxy or browser extension.

### No Weather Events Appear

The backend filters out normal weather conditions. Weather events are only returned when the detected conditions meet the configured hazard thresholds.

Examples include:

- Thunderstorms
- Heavy rainfall
- Extreme heat
- Extreme cold
- Strong winds
- Dust or haze
- High humidity combined with high temperature

### Gemini Alerts Are Unavailable

Possible causes include:

- Missing `GEMINI_API_KEY`
- Invalid Gemini API key
- API quota exhaustion
- Temporary API failure
- Network connectivity problems
- Invalid or unexpected AI response formatting

The backend uses cached Gemini results when available.

### Kafka Does Not Start

Verify that:

- Docker is running.
- ZooKeeper started successfully.
- Kafka started successfully.
- Ports `9093` and `2181` are available.
- No other Kafka or ZooKeeper processes are using the same ports.

View service logs:

```bash
docker compose logs zookeeper
docker compose logs kafka
```

### Port Already in Use

Check which process is using port `8001` or `5173`.

Linux or macOS:

```bash
lsof -i :8001
lsof -i :5173
```

Windows PowerShell:

```powershell
netstat -ano | findstr :8001
netstat -ano | findstr :5173
```

---

## 🔒 Security Considerations

- Never commit API keys or access tokens.
- Keep `.env` files out of version control.
- Rotate exposed keys immediately.
- Validate all externally received event data.
- Use HTTPS in production.
- Add authentication before exposing `/api/ingest` publicly.
- Restrict CORS origins in production.
- Add rate limiting to public API endpoints.
- Do not rely solely on AI-generated alerts for emergency decisions.
- Verify events using official government and emergency-management sources.

---

## ⚠️ Limitations

India Shield AI is an experimental monitoring and visualization system. It has several limitations:

- External APIs may be unavailable or rate-limited.
- Data sources may contain delays or incomplete information.
- Weather-based event classification is heuristic.
- Estimated affected-population values may not represent verified counts.
- AI-generated alerts may contain incorrect or incomplete information.
- Geographic coordinates may be approximate.
- Kafka and Spark processing require additional operational configuration.
- The current backend is not intended to replace a production emergency-management system.
- Official warnings should always be treated as authoritative.

---

## 🚧 Future Enhancements

Potential future improvements include:

- Integration with official Indian government alert systems
- Integration with IMD, NDMA, NDRF, and state disaster-management APIs
- SMS and email notifications
- WhatsApp and mobile push notifications
- Satellite imagery analysis
- Computer-vision-based flood and wildfire detection
- IoT sensor integration
- Drone data integration
- Automatic multilingual translations
- Hindi and regional-language support
- Improved machine-learning prediction models
- Historical event storage and trend analysis
- Role-based access control
- User authentication
- Alert subscription preferences
- Production-grade monitoring and observability
- Cloud deployment
- Kubernetes support
- Automated CI/CD pipelines

---

## 🤝 Contributing

Contributions are welcome.

### Contribution Workflow

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Install dependencies.
4. Make your changes.
5. Run tests and lint checks:

   ```bash
   npm test
   npm run lint
   npm run build
   ```

6. Commit your changes:

   ```bash
   git add .
   git commit -m "Add your feature"
   ```

7. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

8. Open a pull request.

### Contribution Guidelines

- Keep changes focused and reviewable.
- Follow existing TypeScript and Python conventions.
- Do not commit secrets or credentials.
- Add tests for new functionality where possible.
- Update this README when setup or behavior changes.
- Include clear descriptions in pull requests.

---

## 📄 License

No license has currently been specified for this repository.

Until a license is added, the project should be treated as **all rights reserved**. Others may view the repository on GitHub, but they should not assume they have permission to copy, modify, distribute, or use the code commercially.

To make the project open source, add an appropriate license file, such as:

- MIT License
- Apache License 2.0
- GNU General Public License v3.0

---

## 👨‍💻 Developer

**Abhiram Amrutaluri**

B.Tech — Data Engineering

GitHub: [@AbhiramAmrutaluri](https://github.com/AbhiramAmrutaluri)

Repository: [india-shield-ai](https://github.com/AbhiramAmrutaluri/india-shield-ai)

---

## ⭐ Support the Project

If you find India Shield AI useful:

- Star the repository
- Report bugs through GitHub Issues
- Suggest new features
- Contribute improvements
- Share the project with others

---

## 📚 Disclaimer

India Shield AI is intended for research, education, experimentation, and situational awareness.

It is not an official emergency-warning service. Always follow information and instructions issued by authorized government agencies and emergency-management organizations.
