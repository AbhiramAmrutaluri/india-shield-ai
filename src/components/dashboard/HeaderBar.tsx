import { motion } from "framer-motion";
import { Shield, Activity, Wifi, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const HeaderBar = () => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="group flex items-center gap-3 rounded-md px-1.5 py-1 cursor-pointer"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          <Shield className="h-8 w-8 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_12px_hsl(190_100%_50%/0.85)]" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold tracking-wider text-foreground transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_10px_hsl(190_100%_50%/0.5)]">
            INDIA<span className="text-gradient-primary">SHIELD</span>
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Disaster Intelligence System v2.0
          </p>
        </div>
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <motion.div
            className="h-2 w-2 rounded-full bg-success"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-success">KAFKA ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary">SPARK ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-mono text-muted-foreground">12 HDFS NODES</span>
        </div>
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card/60 hover:bg-card transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-mono text-muted-foreground">LIGHT</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">DARK</span>
            </>
          )}
        </motion.button>
        <div className="text-right">
          <div className="text-sm font-mono text-foreground">
            {time.toLocaleTimeString("en-IN", { hour12: false })}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            IST {time.toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
