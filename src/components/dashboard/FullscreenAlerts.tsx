import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDisasterContext } from "@/context/DisasterContext";
import DisasterMap from "./DisasterMap";
import AlertFeed from "./AlertFeed";

const FullscreenAlerts = () => {
  const { fullscreenAlerts, setFullscreenAlerts } = useDisasterContext();

  if (!fullscreenAlerts) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <span className="text-sm font-mono font-bold text-primary tracking-wider">
          INDIASHIELD — THREAT OVERVIEW
        </span>
        <button
          onClick={() => setFullscreenAlerts(false)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      {/* Split view */}
      <div className="flex-1 grid grid-cols-2 gap-0 min-h-0">
        <div className="border-r border-border min-h-0">
          <DisasterMap />
        </div>
        <div className="min-h-0 overflow-hidden bg-card">
          <AlertFeed />
        </div>
      </div>
    </motion.div>
  );
};

export default FullscreenAlerts;
