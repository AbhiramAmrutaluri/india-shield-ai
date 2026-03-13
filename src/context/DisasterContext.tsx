import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { DisasterEvent, DisasterType, SeverityLevel, mockDisasters } from "@/data/mockDisasters";

const API_BASE = "http://localhost:8001";

interface DisasterContextType {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  fullscreenAlerts: boolean;
  setFullscreenAlerts: (v: boolean) => void;
  disasters: DisasterEvent[];
  pipelineLive: {
    kafkaMessagesPerSec: number;
    sparkJobsRunning: number;
    totalEventsToday: number;
    alertsTriggered: number;
  };
  apiConnected: boolean;
  apiSources: { usgs: number; owm: number; eonet: number; gdacs: number; gemini: number };
}

const DisasterContext = createContext<DisasterContextType>({
  selectedEventId: null,
  setSelectedEventId: () => {},
  fullscreenAlerts: false,
  setFullscreenAlerts: () => {},
  disasters: [],
  pipelineLive: { kafkaMessagesPerSec: 0, sparkJobsRunning: 0, totalEventsToday: 0, alertsTriggered: 0 },
  apiConnected: false,
  apiSources: { usgs: 0, owm: 0, eonet: 0, gdacs: 0, gemini: 0 },
});

export const useDisasterContext = () => useContext(DisasterContext);

const INDIAN_LOCATIONS: { location: string; lat: number; lng: number }[] = [
  { location: "Mumbai, Maharashtra", lat: 19.076, lng: 72.878 },
  { location: "Kolkata, West Bengal", lat: 22.572, lng: 88.364 },
  { location: "Bengaluru, Karnataka", lat: 12.972, lng: 77.594 },
  { location: "Hyderabad, Telangana", lat: 17.385, lng: 78.487 },
  { location: "Ahmedabad, Gujarat", lat: 23.023, lng: 72.571 },
  { location: "Patna, Bihar", lat: 25.612, lng: 85.145 },
  { location: "Lucknow, Uttar Pradesh", lat: 26.847, lng: 80.947 },
  { location: "Bhopal, Madhya Pradesh", lat: 23.259, lng: 77.413 },
  { location: "Guwahati, Assam", lat: 26.144, lng: 91.736 },
  { location: "Visakhapatnam, Andhra Pradesh", lat: 17.687, lng: 83.218 },
  { location: "Jaipur, Rajasthan", lat: 26.912, lng: 75.787 },
  { location: "Dehradun, Uttarakhand", lat: 30.317, lng: 78.032 },
];

const TEMPLATES: { type: DisasterType; titles: string[]; sources: string[]; descriptions: string[] }[] = [
  {
    type: "earthquake",
    titles: ["Seismic activity detected", "Tremors reported", "Earthquake alert issued"],
    sources: ["USGS Seismic Network", "IMD Seismology"],
    descriptions: ["Moderate tremors felt across the region.", "Earthquake at shallow depth causing concern.", "Multiple aftershocks expected."],
  },
  {
    type: "flood",
    titles: ["River level rising dangerously", "Flash flood warning issued", "Waterlogging reported"],
    sources: ["CWC Flood Alert", "Social Media NLP", "IMD Weather"],
    descriptions: ["Water levels above danger mark.", "Heavy rainfall causing urban flooding.", "Low-lying areas submerged."],
  },
  {
    type: "fire",
    titles: ["Fire outbreak reported", "Industrial fire detected", "Forest fire spreading"],
    sources: ["Twitter NLP Detection", "Satellite Detection", "News API"],
    descriptions: ["Fire brigade dispatched to the scene.", "Thick smoke visible from multiple areas.", "Containment efforts underway."],
  },
  {
    type: "cyclone",
    titles: ["Cyclonic depression forming", "Storm surge warning", "High wind alert"],
    sources: ["IMD Weather Alert", "JTWC Advisory"],
    descriptions: ["Fishermen advised not to venture into sea.", "Coastal areas on high alert.", "Wind speeds expected to increase."],
  },
  {
    type: "landslide",
    titles: ["Landslide blocks highway", "Hill collapse reported", "Debris flow warning"],
    sources: ["News API Detection", "GSI Alert"],
    descriptions: ["Road blocked due to debris.", "Rescue operations initiated.", "Continuous rainfall triggering slope instability."],
  },
  {
    type: "accident",
    titles: ["Multi-vehicle collision reported", "Train derailment alert", "Bridge accident detected"],
    sources: ["Twitter NLP Detection", "News API"],
    descriptions: ["Emergency services responding.", "Casualties feared, details awaited.", "Traffic diverted from affected area."],
  },
  {
    type: "heatwave",
    titles: ["Severe heat wave alert issued", "Extreme temperature warning", "Heatstroke risk — red alert"],
    sources: ["IMD Weather Alert", "OpenWeatherMap API"],
    descriptions: ["Temperatures exceeding 45°C — vulnerable populations at risk.", "Hospitals on standby for heatstroke cases.", "Government advises staying indoors between 11am–4pm."],
  },
  {
    type: "drought",
    titles: ["Drought conditions worsening", "Water scarcity alert", "Reservoir levels critically low"],
    sources: ["CWC Water Alert", "IMD Weather Alert"],
    descriptions: ["Rainfall deficiency exceeding 40% of normal.", "Groundwater depletion reported across districts.", "Crop failure risk in affected regions."],
  },
  {
    type: "dust_storm",
    titles: ["Dust storm approaching", "Severe sandstorm warning", "Haze reduces visibility to near zero"],
    sources: ["IMD Weather Alert", "OpenWeatherMap API"],
    descriptions: ["Visibility dropped to under 500m.", "Wind-driven dust particles posing health hazard.", "Flight operations and road transport affected."],
  },
  {
    type: "tsunami",
    titles: ["Tsunami watch issued for coastline", "Coastal evacuation advisory", "Sea level anomaly detected"],
    sources: ["INCOIS Tsunami Alert", "USGS Seismic Network"],
    descriptions: ["Coastal residents advised to move to higher ground immediately.", "Underwater earthquake may trigger wave activity.", "Fishermen and tourists warned to leave beaches."],
  },
  {
    type: "cold_wave",
    titles: ["Cold wave sweeping North India", "Dense fog disrupts transport", "Severe frost alert"],
    sources: ["IMD Weather Alert", "OpenWeatherMap API"],
    descriptions: ["Temperatures plunging to near 0°C in plains.", "Dense fog causing zero visibility on major highways.", "Homeless shelters on high alert, blanket distribution underway."],
  },
  {
    type: "industrial",
    titles: ["Chemical plant leak detected", "Factory explosion reported", "Gas pipeline rupture alert"],
    sources: ["Twitter NLP Detection", "News API", "NDMA Alert"],
    descriptions: ["Toxic fumes spreading in surrounding area.", "NDRF teams deployed for rescue and containment.", "Residents within 2km radius asked to evacuate."],
  },
];

const SEVERITIES: SeverityLevel[] = ["critical", "severe", "moderate", "low"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let eventCounter = 100;

function generateRandomEvent(): DisasterEvent {
  const template = randomItem(TEMPLATES);
  const loc = randomItem(INDIAN_LOCATIONS);
  eventCounter++;
  return {
    id: `ev-live-${eventCounter}`,
    type: template.type,
    title: randomItem(template.titles) + ` near ${loc.location.split(",")[0]}`,
    location: loc.location,
    lat: loc.lat + (Math.random() - 0.5) * 0.5,
    lng: loc.lng + (Math.random() - 0.5) * 0.5,
    severity: randomItem(SEVERITIES),
    timestamp: new Date(),
    source: randomItem(template.sources),
    description: randomItem(template.descriptions),
    affectedPeople: Math.floor(Math.random() * 200000 + 500),
    confidence: Math.round((Math.random() * 0.2 + 0.78) * 100) / 100,
  };
}

export const DisasterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [fullscreenAlerts, setFullscreenAlerts] = useState(false);
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiSources, setApiSources] = useState({ usgs: 0, owm: 0, eonet: 0, gdacs: 0, gemini: 0 });
  const [pipelineLive, setPipelineLive] = useState({
    kafkaMessagesPerSec: 12847,
    sparkJobsRunning: 8,
    totalEventsToday: 847293,
    alertsTriggered: 47,
  });

  // ── Fetch real events from our Flask API server ────────────
  const fetchRealEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw: [] = data.events ?? [];

      const realEvents: DisasterEvent[] = raw.map((e: any) => ({
        id:            e.id,
        type:          e.type as DisasterType,
        title:         e.title,
        location:      e.location,
        lat:           e.lat,
        lng:           e.lng,
        severity:      e.severity as SeverityLevel,
        timestamp:     new Date(e.timestamp),
        source:        e.source,
        description:   e.description,
        affectedPeople: e.affectedPeople ?? 0,
        confidence:    e.confidence ?? 0.9,
      }));

      // When API is connected, use ONLY real events (drop all mock data)
      setDisasters(realEvents.slice(0, 200));

      setApiConnected(true);
      setApiSources({
        usgs:   data.sources?.usgs_earthquakes ?? 0,
        owm:    data.sources?.owm_weather ?? 0,
        eonet:  data.sources?.eonet_events ?? 0,
        gdacs:  data.sources?.gdacs_events ?? 0,
        gemini: data.sources?.gemini_alerts ?? 0,
      });
      setPipelineLive((prev) => ({
        ...prev,
        kafkaMessagesPerSec: prev.kafkaMessagesPerSec + Math.floor((Math.random() - 0.3) * 400),
        totalEventsToday:    prev.totalEventsToday + realEvents.length * 10,
        alertsTriggered:     prev.alertsTriggered + realEvents.filter((e) => e.severity === "critical" || e.severity === "severe").length,
      }));
      console.log(`[IndiaShield] Fetched ${realEvents.length} real events (USGS: ${data.sources?.usgs_earthquakes}, OWM: ${data.sources?.owm_weather}, Gemini: ${data.sources?.gemini_alerts})`);
    } catch (err) {
      console.warn("[IndiaShield] API unreachable, using simulation:", err);
      setApiConnected(false);
    }
  }, []);

  // ── Real-time SSE connection (replaces 90s polling) ────────────
  useEffect(() => {
    fetchRealEvents(); // immediate first load while SSE handshakes
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const handleData = (data: any) => {
      const raw: any[] = data.events ?? [];
      const realEvents: DisasterEvent[] = raw.map((e: any) => ({
        id:             e.id,
        type:           e.type as DisasterType,
        title:          e.title,
        location:       e.location,
        lat:            e.lat,
        lng:            e.lng,
        severity:       e.severity as SeverityLevel,
        timestamp:      new Date(e.timestamp),
        source:         e.source,
        description:    e.description,
        affectedPeople: e.affectedPeople ?? 0,
        confidence:     e.confidence ?? 0.9,
      }));
      // SSE handler: replace with fresh real events, drop all old mock data
      setDisasters(realEvents.slice(0, 200));
      setApiConnected(true);
      setApiSources({
        usgs:   data.sources?.usgs_earthquakes ?? 0,
        owm:    data.sources?.owm_weather ?? 0,
        eonet:  data.sources?.eonet_events ?? 0,
        gdacs:  data.sources?.gdacs_events ?? 0,
        gemini: data.sources?.gemini_alerts ?? 0,
      });
      setPipelineLive((prev) => ({
        ...prev,
        kafkaMessagesPerSec: prev.kafkaMessagesPerSec + Math.floor((Math.random() - 0.3) * 400),
        totalEventsToday:    prev.totalEventsToday + realEvents.length * 10,
        alertsTriggered:     prev.alertsTriggered + realEvents.filter(
          (e) => e.severity === "critical" || e.severity === "severe",
        ).length,
      }));
    };

    const connect = () => {
      es = new EventSource(`${API_BASE}/api/stream`);
      es.onmessage = (event) => {
        try { handleData(JSON.parse(event.data)); } catch { /* ignore parse errors */ }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        setApiConnected(false);
        retryTimer = setTimeout(connect, 30_000); // retry after 30s
      };
    };

    connect();
    // Fallback: poll REST endpoint every 60s in case SSE is unavailable
    const pollId = setInterval(fetchRealEvents, 60_000);
    return () => {
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
      clearInterval(pollId);
    };
  }, [fetchRealEvents]);

  // ── Simulation fallback (still runs, fills gaps) ──────────
  useEffect(() => {
    const tick = () => {
      const shouldAddEvent = Math.random() > 0.5;
      if (shouldAddEvent && !apiConnected) {
        const newEvent = generateRandomEvent();
        setDisasters((prev) => [newEvent, ...prev].slice(0, 200));
      }
      setPipelineLive((prev) => ({
        kafkaMessagesPerSec: Math.max(8000, prev.kafkaMessagesPerSec + Math.floor((Math.random() - 0.4) * 500)),
        sparkJobsRunning: Math.max(3, Math.min(15, prev.sparkJobsRunning + Math.floor((Math.random() - 0.5) * 3))),
        totalEventsToday: prev.totalEventsToday + Math.floor(Math.random() * 2000),
        alertsTriggered: prev.alertsTriggered + (shouldAddEvent ? 1 : 0),
      }));
    };
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 30000 + Math.random() * 60000;
      timeout = setTimeout(() => { tick(); schedule(); }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [apiConnected]);

  return (
    <DisasterContext.Provider
      value={{
        selectedEventId,
        setSelectedEventId,
        fullscreenAlerts,
        setFullscreenAlerts,
        disasters,
        pipelineLive,
        apiConnected,
        apiSources,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};
