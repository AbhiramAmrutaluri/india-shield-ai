import { motion } from "framer-motion";
import { pipelineStats } from "@/data/mockDisasters";
import { Zap, Cpu, HardDrive, Database, Brain, Timer, BarChart3, Bell } from "lucide-react";
import { useDisasterContext } from "@/context/DisasterContext";

const PipelineStats = () => {
  const { pipelineLive } = useDisasterContext();

  const stats = [
    { icon: Zap, label: "Kafka msg/s", value: pipelineLive.kafkaMessagesPerSec.toLocaleString(), color: "text-primary" },
    { icon: Cpu, label: "Spark Jobs", value: pipelineLive.sparkJobsRunning.toString(), color: "text-success" },
    { icon: HardDrive, label: "HDFS Nodes", value: pipelineStats.hdfsNodesActive.toString(), color: "text-info" },
    { icon: Database, label: "Hive Queries", value: pipelineStats.hiveQueriesCompleted.toLocaleString(), color: "text-warning" },
    { icon: Brain, label: "ML Accuracy", value: `${pipelineStats.modelAccuracy}%`, color: "text-success" },
    { icon: Timer, label: "Avg Latency", value: `${pipelineStats.avgLatencyMs}ms`, color: "text-primary" },
    { icon: BarChart3, label: "Events Today", value: (pipelineLive.totalEventsToday / 1000).toFixed(0) + "K", color: "text-info" },
    { icon: Bell, label: "Alerts", value: pipelineLive.alertsTriggered.toString(), color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-md p-3 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <motion.div
            key={stat.value}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className={`text-xl font-bold font-mono ${stat.color}`}
          >
            {stat.value}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default PipelineStats;
