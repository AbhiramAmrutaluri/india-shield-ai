import { useState } from "react";
import AlertFeed from "./AlertFeed";
import SystemPipeline from "./SystemPipeline";

const tabs = [
  { id: "alerts", label: "ALERTS" },
  { id: "pipeline", label: "PIPELINE" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState<TabId>("alerts");

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-mono font-semibold tracking-wider transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "alerts" ? <AlertFeed /> : <SystemPipeline />}
      </div>
    </div>
  );
};

export default RightPanel;
