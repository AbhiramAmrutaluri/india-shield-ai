import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DISASTER_LABELS } from "@/data/mockDisasters";
import { motion } from "framer-motion";
import { useDisasterContext } from "@/context/DisasterContext";

const severityColors: Record<string, string> = {
  critical: "#e63946",
  severe: "#e67635",
  moderate: "#e6a817",
  low: "#00d4ff",
};

const severityRadius: Record<string, number> = {
  critical: 18,
  severe: 14,
  moderate: 10,
  low: 7,
};

const DisasterMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const highlightRef = useRef<L.CircleMarker | null>(null);
  const { selectedEventId, disasters } = useDisasterContext();

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [22.5, 82.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Sync markers with disasters array
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove old markers not in current disasters
    const currentIds = new Set(disasters.map((d) => d.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add new markers
    disasters.forEach((event) => {
      if (markersRef.current[event.id]) return;
      const color = severityColors[event.severity];
      const marker = L.circleMarker([event.lat, event.lng], {
        radius: severityRadius[event.severity],
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      })
        .bindPopup(
          `<div style="font-size:12px;min-width:200px">
            <div style="font-weight:bold;font-size:13px;margin-bottom:4px">${event.title}</div>
            <div>${event.location}</div>
            <div style="display:flex;justify-content:space-between;margin-top:4px">
              <span>Type: ${DISASTER_LABELS[event.type]}</span>
              <span style="font-weight:bold;text-transform:uppercase">${event.severity}</span>
            </div>
            <div>Affected: ${event.affectedPeople.toLocaleString()}</div>
            <div>Confidence: ${(event.confidence * 100).toFixed(0)}%</div>
            <div style="color:#888;margin-top:4px">Source: ${event.source}</div>
          </div>`
        )
        .addTo(map);
      markersRef.current[event.id] = marker;
    });
  }, [disasters]);

  // Highlight selected event
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }

    if (selectedEventId) {
      const event = disasters.find((e) => e.id === selectedEventId);
      if (event) {
        const color = severityColors[event.severity];
        highlightRef.current = L.circleMarker([event.lat, event.lng], {
          radius: severityRadius[event.severity] + 12,
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 3,
          dashArray: "5 5",
        }).addTo(map);

        map.flyTo([event.lat, event.lng], 7, { duration: 0.8 });

        const marker = markersRef.current[selectedEventId];
        if (marker) marker.openPopup();
      }
    }
  }, [selectedEventId, disasters]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-full rounded-lg border border-border overflow-hidden"
    >
      <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm rounded px-3 py-1.5 border border-border">
        <span className="text-xs font-mono text-primary">LIVE THREAT MAP</span>
      </div>
      <div ref={mapRef} className="h-full w-full" />
      <div className="absolute bottom-3 right-3 z-[1000] bg-card/90 backdrop-blur-sm rounded px-3 py-2 border border-border space-y-1">
        {Object.entries(severityColors).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{level}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DisasterMap;
