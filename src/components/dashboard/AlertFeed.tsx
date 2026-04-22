import { motion, AnimatePresence } from "framer-motion";
import { DISASTER_ICONS, DISASTER_LABELS } from "@/data/mockDisasters";
import { AlertTriangle, Clock, Maximize2 } from "lucide-react";
import { useDisasterContext } from "@/context/DisasterContext";

const severityClasses: Record<string, string> = {
  critical: "border-l-severity-critical bg-severity-critical/5",
  severe: "border-l-severity-severe bg-severity-severe/5",
  moderate: "border-l-severity-moderate bg-severity-moderate/5",
  low: "border-l-severity-low bg-severity-low/5",
};

const timeAgo = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const AlertFeed = () => {
  const { selectedEventId, setSelectedEventId, setFullscreenAlerts, disasters } = useDisasterContext();

  const sorted = [...disasters].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-xs font-mono font-semibold text-foreground tracking-wider">
            LIVE ALERTS
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-1">
            ({disasters.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className="h-2 w-2 rounded-full bg-destructive"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <button
            onClick={() => setFullscreenAlerts(true)}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Full screen view"
          >
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 p-2">
        <AnimatePresence>
          {sorted.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              layout
              onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
              className={`border-l-2 rounded-r-md px-3 py-3.5 cursor-pointer hover:brightness-125 transition-all ${severityClasses[event.severity]} ${
                selectedEventId === event.id ? "ring-1 ring-primary brightness-125" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{DISASTER_ICONS[event.type]}</span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      {DISASTER_LABELS[event.type]}
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase text-foreground ml-auto">
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {timeAgo(event.timestamp)}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      📍 {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertFeed;
