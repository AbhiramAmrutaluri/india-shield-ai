import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DISASTER_LABELS, type DisasterType } from "@/data/mockDisasters";
import { useDisasterContext } from "@/context/DisasterContext";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

const typeColors: Record<string, string> = {
  earthquake: "#e63946",
  flood: "#3b82f6",
  fire: "#e67635",
  cyclone: "#a855f7",
  landslide: "#92400e",
  accident: "#e6a817",
  heatwave: "#ff4500",
  drought: "#c17f24",
  dust_storm: "#b8a080",
  tsunami: "#0ea5e9",
  cold_wave: "#93c5fd",
  industrial: "#6b7280",
};

const SeverityBreakdown = () => {
  const { disasters } = useDisasterContext();
  const { theme } = useTheme();

  const typeCounts = disasters.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(typeCounts).map(([type, count]) => ({
    name: DISASTER_LABELS[type as DisasterType],
    value: count,
    color: typeColors[type],
  }));

  const sevCounts = disasters.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-card border border-border rounded-lg p-4 h-full flex flex-col"
    >
      <span className="text-xs font-mono font-semibold text-foreground tracking-wider mb-2">
        EVENT BREAKDOWN
      </span>
      <div className="flex-1 flex items-center">
        <ResponsiveContainer width="50%" height={140}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "hsl(220 20% 8%)" : "hsl(0 0% 100%)",
                border: `1px solid ${theme === "dark" ? "hsl(220 15% 18%)" : "hsl(220 15% 82%)"}`,
                borderRadius: "6px",
                fontSize: 11,
                fontFamily: "JetBrains Mono",
                color: theme === "dark" ? "#e2e8f0" : "#1e293b",
              }}
              itemStyle={{ color: theme === "dark" ? "#e2e8f0" : "#1e293b" }}
              labelStyle={{ color: theme === "dark" ? "#e2e8f0" : "#1e293b" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] font-mono text-muted-foreground">{d.name}</span>
              <span className="text-[10px] font-mono text-foreground ml-auto">{d.value}</span>
            </div>
          ))}
          <div className="border-t border-border pt-1.5 mt-2 space-y-0.5">
            {Object.entries(sevCounts).map(([sev, count]) => (
              <div key={sev} className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase text-severity-${sev}`}>{sev}</span>
                <span className="text-[10px] font-mono text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SeverityBreakdown;
