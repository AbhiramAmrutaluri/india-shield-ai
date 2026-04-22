import HeaderBar from "@/components/dashboard/HeaderBar";
import DisasterMap from "@/components/dashboard/DisasterMap";
import PipelineStats from "@/components/dashboard/PipelineStats";
import StreamChart from "@/components/dashboard/StreamChart";
import SeverityBreakdown from "@/components/dashboard/SeverityBreakdown";
import RightPanel from "@/components/dashboard/RightPanel";
import FullscreenAlerts from "@/components/dashboard/FullscreenAlerts";
import { DisasterProvider } from "@/context/DisasterContext";

const Index = () => {
  return (
    <DisasterProvider>
      <div className="flex flex-col h-screen bg-background bg-grid overflow-hidden">
        <HeaderBar />
        <PipelineStats />
        <div className="flex-1 grid grid-cols-12 gap-2 p-3 pt-0 min-h-0 overflow-y-auto overflow-x-hidden pb-6">
          {/* Map - left */}
          <div className="col-span-7 min-h-0">
            <div className="flex flex-col gap-2 h-full">
              <div className="flex-1 min-h-0">
                <DisasterMap />
              </div>
              <div className="grid grid-cols-2 gap-2" style={{ height: "200px" }}>
                <StreamChart />
                <SeverityBreakdown />
              </div>
            </div>
          </div>
          {/* Right panel - tabs */}
          <div className="col-span-5 min-h-0">
            <RightPanel />
          </div>
        </div>
        <FullscreenAlerts />
      </div>
    </DisasterProvider>
  );
};

export default Index;
