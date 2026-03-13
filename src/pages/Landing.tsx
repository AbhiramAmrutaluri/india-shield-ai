import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Radio,
  Brain,
  Database,
  Map,
  BarChart2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Real-Time Streaming",
    desc: "Kafka-powered live data ingestion from 20+ sources",
  },
  {
    icon: Brain,
    title: "AI/NLP Detection",
    desc: "Spark NLP + ML for emergency classification",
  },
  {
    icon: Database,
    title: "Big Data Storage",
    desc: "Hadoop HDFS distributed storage at scale",
  },
  {
    icon: Map,
    title: "Live Threat Map",
    desc: "Interactive real-time geospatial threat visualisation",
  },
  {
    icon: BarChart2,
    title: "Analytics Engine",
    desc: "Hive SQL for deep insights and reporting",
  },
  {
    icon: Zap,
    title: "Severity Prediction",
    desc: "ML model with 94.7% accuracy on disaster scoring",
  },
];

const techStack = ["KAFKA", "SPARK", "HADOOP", "HIVE", "NLP", "MACHINE LEARNING"];

const Landing = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center overflow-x-hidden">
      {/* System online pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-10 flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm"
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-success"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs font-mono text-muted-foreground tracking-widest">
          SYSTEM ONLINE —{" "}
          {time.toLocaleTimeString("en-IN", { hour12: false })}
        </span>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-10 flex flex-col items-center text-center px-4"
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <img src="/logo.svg" alt="IndiaShield Logo" className="h-16 w-16 drop-shadow-[0_0_18px_hsl(190_100%_50%/0.6)]" />
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tight text-foreground leading-none select-none">
            INDIA<span className="text-gradient-primary">SHIELD</span>
          </h1>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mt-2">
          AI-Powered Real-Time Disaster &amp; Emergency Intelligence System
        </p>

        {/* Tech stack badges */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-4">
          {techStack.map((t, i) => (
            <span key={t} className="text-xs font-mono text-muted-foreground tracking-widest">
              {t}
              {i < techStack.length - 1 && (
                <span className="ml-3 text-border">•</span>
              )}
            </span>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={() => navigate("/dashboard")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 flex items-center gap-3 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm tracking-[0.15em] uppercase glow-primary hover:brightness-110 transition-all"
        >
          ENTER COMMAND CENTER
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 max-w-5xl w-full pb-16"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            whileHover={{ scale: 1.03, borderColor: "hsl(190 100% 50% / 0.4)" }}
            className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3 cursor-default transition-colors"
          >
            <f.icon className="h-7 w-7 text-primary" />
            <h3 className="font-semibold text-foreground text-base">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Landing;
