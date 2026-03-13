import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateStreamMetrics } from "@/data/mockDisasters";
import { motion } from "framer-motion";

const StreamChart = () => {
  const data = useMemo(() => generateStreamMetrics(), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-lg p-4 h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-semibold text-foreground tracking-wider">
          DATA STREAM VOLUME (24H)
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">Tweets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-[10px] font-mono text-muted-foreground">Weather</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-[10px] font-mono text-muted-foreground">News</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTweets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorWeather" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e6a817" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#e6a817" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ec47a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2ec47a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
          <XAxis dataKey="timestamp" tick={{ fill: "#64748b", fontSize: 10 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220 20% 8%)",
              border: "1px solid hsl(220 15% 18%)",
              borderRadius: "6px",
              fontSize: 11,
              fontFamily: "JetBrains Mono",
            }}
          />
          <Area type="monotone" dataKey="tweets" stroke="#00d4ff" fillOpacity={1} fill="url(#colorTweets)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="weatherAlerts" stroke="#e6a817" fillOpacity={1} fill="url(#colorWeather)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="newsItems" stroke="#2ec47a" fillOpacity={1} fill="url(#colorNews)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default StreamChart;
