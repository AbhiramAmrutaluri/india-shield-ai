import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Activity, Wifi, Sun, Moon, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useDisasterContext } from "@/context/DisasterContext";

const HeaderBar = () => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();
  const { apiConnected, apiSources } = useDisasterContext();
  const logoRef = useRef<HTMLDivElement>(null);

  // Raw mouse position relative to logo container
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  // Smooth spring for glow position
  const glowX = useSpring(rawX, { stiffness: 200, damping: 22 });
  const glowY = useSpring(rawY, { stiffness: 200, damping: 22 });

  // Scale logo on hover
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = logoRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      {/* Logo + Title with cursor glow */}
      <motion.div
        ref={logoRef}
        className="relative flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-default overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Cursor-tracking spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(120px circle at ${x}px ${y}px, hsl(190 100% 50% / 0.18), transparent 70%)`
            ),
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />

        {/* Border glow on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl border"
          animate={{
            borderColor: hovered
              ? "hsl(190 100% 50% / 0.5)"
              : "hsl(190 100% 50% / 0)",
            boxShadow: hovered
              ? "0 0 18px hsl(190 100% 50% / 0.2), inset 0 0 18px hsl(190 100% 50% / 0.05)"
              : "0 0 0px transparent",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Logo */}
        <motion.div
          onHoverStart={() => setLogoHovered(true)}
          onHoverEnd={() => setLogoHovered(false)}
          animate={
            logoHovered
              ? { rotate: [0, -15, 15, -8, 8, 0], scale: 1.18 }
              : { rotate: [0, 8, -8, 0], scale: 1 }
          }
          transition={
            logoHovered
              ? { duration: 0.5, ease: "easeInOut" }
              : { duration: 3, repeat: Infinity, repeatDelay: 4 }
          }
          className="relative z-10"
        >
          {/* Pulse ring around logo on hover */}
          {logoHovered && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ background: "radial-gradient(circle, hsl(190 100% 50% / 0.4), transparent 70%)" }}
            />
          )}
          <img
            src="/logo.svg"
            alt="IndiaShield Logo"
            className="h-8 w-8 relative z-10"
            style={{
              filter: logoHovered
                ? "drop-shadow(0 0 12px hsl(190,100%,50%)) drop-shadow(0 0 24px hsl(190,100%,50%/0.6))"
                : "drop-shadow(0 0 8px hsl(190,100%,50%/0.7))",
              transition: "filter 0.3s",
            }}
          />
        </motion.div>

        {/* Title */}
        <div className="relative z-10">
          <motion.h1
            className="text-lg font-bold tracking-wider text-foreground"
            animate={{ textShadow: hovered ? "0 0 20px hsl(190 100% 50% / 0.5)" : "none" }}
            transition={{ duration: 0.3 }}
          >
            INDIA<span className="text-gradient-primary">SHIELD</span>
          </motion.h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Disaster Intelligence System v2.0
          </p>
        </div>
      </motion.div>

      <div className="flex items-center gap-6">
        {/* Live API status badge */}
        <motion.div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${
            apiConnected
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning"
          }`}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          title={apiConnected ? `USGS: ${apiSources.usgs} quakes · OWM: ${apiSources.owm} weather · Gemini: ${apiSources.gemini} live alerts` : "Using simulated data"}
        >
          <Radio className="h-3 w-3" />
          {apiConnected ? `LIVE · ${apiSources.usgs + apiSources.owm + apiSources.gemini} EVENTS` : "SIMULATED"}
        </motion.div>
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
