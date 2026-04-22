import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { DisasterEvent, DisasterType, SeverityLevel, mockDisasters } from "@/data/mockDisasters";

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
}

const DisasterContext = createContext<DisasterContextType>({
  selectedEventId: null,
  setSelectedEventId: () => {},
  fullscreenAlerts: false,
  setFullscreenAlerts: () => {},
  disasters: [],
  pipelineLive: { kafkaMessagesPerSec: 0, sparkJobsRunning: 0, totalEventsToday: 0, alertsTriggered: 0 },
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
    titles: ["Multi-vehicle collision reported", "Train derailment alert", "Industrial accident detected"],
    sources: ["Twitter NLP Detection", "News API"],
    descriptions: ["Emergency services responding.", "Casualties feared, details awaited.", "Traffic diverted from affected area."],
  },
];

const SEVERITIES: SeverityLevel[] = ["critical", "severe", "moderate", "low"];
const INITIAL_EVENT_COUNT = 90;
const MAX_EVENT_COUNT = 140;

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

function buildInitialDisasters(): DisasterEvent[] {
  const generatedCount = Math.max(0, INITIAL_EVENT_COUNT - mockDisasters.length);
  const generated = Array.from({ length: generatedCount }, () => generateRandomEvent()).map((event, index) => ({
    ...event,
    // Spread initial events over time so feed ordering looks natural.
    timestamp: new Date(Date.now() - (index + 1) * 60000),
  }));

  return [...generated, ...mockDisasters].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const DisasterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [fullscreenAlerts, setFullscreenAlerts] = useState(false);
  const [disasters, setDisasters] = useState<DisasterEvent[]>(() => buildInitialDisasters());
  const [pipelineLive, setPipelineLive] = useState({
    kafkaMessagesPerSec: 12847,
    sparkJobsRunning: 8,
    totalEventsToday: 847293,
    alertsTriggered: 47,
  });

  // Real-time simulation: sometimes adds event, sometimes just updates stats
  useEffect(() => {
    const tick = () => {
      const shouldAddEvent = Math.random() > 0.35; // ~65% chance each tick

      if (shouldAddEvent) {
        const newEvent = generateRandomEvent();
        setDisasters((prev) => [newEvent, ...prev].slice(0, MAX_EVENT_COUNT));
      }

      // Always jitter pipeline stats
      setPipelineLive((prev) => ({
        kafkaMessagesPerSec: prev.kafkaMessagesPerSec + Math.floor((Math.random() - 0.4) * 500),
        sparkJobsRunning: Math.max(3, Math.min(15, prev.sparkJobsRunning + Math.floor((Math.random() - 0.5) * 3))),
        totalEventsToday: prev.totalEventsToday + Math.floor(Math.random() * 2000),
        alertsTriggered: prev.alertsTriggered + (shouldAddEvent ? 1 : 0),
      }));
    };

    // Random interval between 30-90 seconds
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 30000 + Math.random() * 60000; // 30s to 90s
      timeout = setTimeout(() => {
        tick();
        schedule();
      }, delay);
    };
    schedule();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <DisasterContext.Provider
      value={{
        selectedEventId,
        setSelectedEventId,
        fullscreenAlerts,
        setFullscreenAlerts,
        disasters,
        pipelineLive,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};
