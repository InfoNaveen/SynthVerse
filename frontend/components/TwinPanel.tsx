"use client";

import { useSocket } from "@/hooks/useSocket";
import { useTwinData } from "@/hooks/useTwinData";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Car,
  CloudFog,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import MerkleViewer from "./MerkleViewer";

export default function TwinPanel() {
  const { isAttackActive, connected } = useSocket();
  const { current, history, lastUpdated } = useTwinData();

  const chartData =
    history.length > 0
      ? history.map((d, i) => ({ time: i, temp: d.temperature ?? 0 }))
      : [];

  const mockAnchors = [
    { root: "0x12bcf456def7890a123abc456def7890", timestamp: Date.now() - 60000 },
    { root: "0x890a123abc456def789012bcf456def7", timestamp: Date.now() - 120000 },
    { root: "0xdef789012bcf456def7890a123abc456", timestamp: Date.now() - 180000 },
  ];

  const rows = [
    { icon: <Thermometer className="w-4 h-4" />, label: "TEMPERATURE", value: current ? formatNumber(current.temperature, 1) : "—", unit: "°C" },
    { icon: <Droplets className="w-4 h-4" />, label: "HUMIDITY", value: current ? formatNumber(current.humidity, 0) : "—", unit: "%" },
    { icon: <CloudFog className="w-4 h-4" />, label: "PM2.5", value: current ? formatNumber(current.pm25, 0) : "—", unit: "µg/m³" },
    { icon: <Car className="w-4 h-4" />, label: "TRAFFIC", value: current ? `Level ${current.traffic}` : "—", unit: "" },
    { icon: <Wind className="w-4 h-4" />, label: "WIND", value: current ? formatNumber(current.wind, 1) : "—", unit: "km/h" },
  ];

  return (
    <motion.div
      className={`soc-panel h-full flex flex-col relative overflow-hidden ${
        isAttackActive ? "!border-t-destructive shadow-[0_0_30px_rgba(255,34,68,0.15)]" : ""
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scan line */}
      {connected && !isAttackActive && <div className="scan-overlay absolute inset-0 pointer-events-none" />}

      <div className="soc-panel-header">
        <h2 className="text-sm font-bold font-mono tracking-wider flex items-center gap-2">
          <Activity className={isAttackActive ? "text-destructive" : "text-primary"} />
          ◈ LIVE DIGITAL TWIN // BANGALORE
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2 ${
            isAttackActive
              ? "border-destructive text-destructive bg-destructive/10"
              : "border-primary text-primary bg-primary/10"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isAttackActive ? "bg-destructive animate-pulse-fast" : "bg-primary animate-pulse-fast"
            }`}
          />
          {isAttackActive ? "DARK PERIOD" : "LIVE"}
        </div>
      </div>

      <div className="soc-panel-body flex-1 flex flex-col">
        {/* Data rows */}
        <div
          className={`relative space-y-2 ${
            isAttackActive ? "opacity-20 grayscale" : ""
          } transition-all duration-700`}
        >
          {isAttackActive && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-destructive font-black text-xl font-mono tracking-widest uppercase rotate-[-12deg] border-2 border-destructive px-4 py-1 animate-pulse-fast">
                NO COMMS
              </span>
            </div>
          )}

          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-border/50 font-mono text-sm"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                {row.icon} {row.label}
              </span>
              <span className="text-white font-bold">
                {row.value}
                {row.unit && <span className="text-muted-foreground text-xs ml-1">{row.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-4">
          <div className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-widest">
            Temperature History
          </div>
          <div className="h-24 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke={isAttackActive ? "#ff2244" : "#00ff88"}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-xs">
                Awaiting data...
              </div>
            )}
          </div>
        </div>

        {/* Merkle Anchors */}
        <div className="mt-auto pt-4">
          <div className="text-[10px] text-muted-foreground font-mono mb-1">
            LAST UPDATED: {new Date(lastUpdated).toISOString()}
          </div>
          <MerkleViewer history={mockAnchors} />
        </div>
      </div>
    </motion.div>
  );
}
