"use client";

import { useSocket } from "@/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { RadioTower, AlertCircle, ShieldCheck } from "lucide-react";

export default function ThreatPanel() {
  const { threatData, isAttackActive } = useSocket();

  const getLevelStyle = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return { text: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", dot: "bg-destructive animate-pulse-red" };
      case "HIGH":
        return { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive", dot: "bg-destructive animate-pulse-fast" };
      case "MEDIUM":
        return { text: "text-warning", bg: "bg-warning/10", border: "border-warning", dot: "bg-warning animate-pulse-fast" };
      default:
        return { text: "text-primary", bg: "bg-primary/10", border: "border-primary", dot: "bg-primary" };
    }
  };

  const data = threatData || {
    level: "LOW" as const,
    activeUrls: 0,
    recent: [],
    blockedToday: 0,
    lastUpdated: Date.now(),
  };

  const style = getLevelStyle(data.level);

  return (
    <motion.div
      className={`soc-panel ${isAttackActive ? "!border-t-destructive shadow-[0_0_30px_rgba(255,34,68,0.15)]" : ""}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="soc-panel-header">
        <h2 className="text-sm font-bold font-mono flex items-center gap-2">
          <RadioTower className={style.text} />
          ◈ THREAT INTELLIGENCE // LIVE
        </h2>
        <div className={`flex items-center gap-2 font-mono text-xs border px-2 py-1 ${style.border} ${style.bg}`}>
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className={style.text}>LEVEL: {data.level}</span>
        </div>
      </div>

      <div className="soc-panel-body">
        {/* Active URLs count */}
        <div className="mb-4">
          <div className="text-2xl font-mono text-white font-bold">
            {data.activeUrls || "—"}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            Active Malicious URLs
          </div>
        </div>

        {/* Recent threat feed */}
        <div className="space-y-1.5 mb-4">
          <AnimatePresence mode="popLayout">
            {data.recent.length > 0 ? (
              data.recent.map((item, i) => (
                <motion.div
                  key={`${item.time}-${item.url}-${i}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 border border-border/50 bg-[#0d1117] font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.time}</span>
                    <span className="text-white">{item.url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] border ${
                      item.status === "BLOCKED" ? "border-primary/30 text-primary bg-primary/10" : "border-destructive/30 text-destructive bg-destructive/10"
                    }`}>
                      {item.status || "ACTIVE"}
                    </span>
                    <span className="text-destructive flex items-center gap-1">
                      {item.threat} <AlertCircle className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground font-mono text-xs flex flex-col items-center gap-2">
                <ShieldCheck className="w-6 h-6 opacity-30" />
                No threats detected
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground border-t border-border pt-3">
          <span>Active: {data.activeUrls || "—"}</span>
          <span className="text-border">|</span>
          <span>Blocked today: {data.blockedToday || "—"}</span>
          <span className="text-border">|</span>
          <span>Updated: {data.lastUpdated ? `${Math.floor((Date.now() - data.lastUpdated) / 1000)}s ago` : "—"}</span>
        </div>
      </div>
    </motion.div>
  );
}
