import { motion } from "framer-motion";
import { Twitter, CloudRain, Newspaper, Radio, Zap, Flame, HardDrive, Database, Brain, BarChart3 } from "lucide-react";

const pipelineStages = [
  {
    icon: Radio,
    name: "Data Sources",
    description: "Twitter • Weather • News • Sensors",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    name: "Apache Kafka",
    description: "Real-time streaming queue",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Flame,
    name: "Spark Streaming",
    description: "NLP + Emergency detection",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: HardDrive,
    name: "Hadoop HDFS",
    description: "Distributed storage",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Database,
    name: "Hive / Spark SQL",
    description: "Analytics queries",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Brain,
    name: "ML Prediction",
    description: "Severity classification",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: BarChart3,
    name: "Dashboard",
    description: "Real-time visualization",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const SystemPipeline = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-mono font-semibold text-foreground tracking-wider">
          SYSTEM PIPELINE
        </span>
        <span className="text-[10px] font-mono text-success tracking-wider">
          ALL SYSTEMS ONLINE
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pipelineStages.map((stage, i) => (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3 hover:border-primary/30 transition-colors"
          >
            <div className={`p-2 rounded-lg ${stage.bgColor}`}>
              <stage.icon className={`h-5 w-5 ${stage.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">{stage.name}</div>
              <div className="text-xs font-mono text-muted-foreground">{stage.description}</div>
            </div>
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-success flex-shrink-0"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SystemPipeline;
