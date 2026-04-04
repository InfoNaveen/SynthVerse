"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Users, Activity } from "lucide-react";

export default function Home() {
  const [tamperCount, setTamperCount] = useState<number | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;
    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${backendUrl.replace("ws", "http")}/api/forensics/tamper-count`
        );
        if (res.ok) {
          const data = await res.json();
          setTamperCount(data.count ?? 0);
          setBackendOnline(true);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    fetchCount();
    const iv = setInterval(fetchCount, 10000);
    return () => clearInterval(iv);
  }, []);

  const tickerText =
    "BLOCKCHAIN ANCHORED  //  DARK PERIOD FORENSICS  //  REAL-TIME THREAT DETECTION  //  POLYGON AMOY TESTNET  //  ";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      {/* System Online tag */}
      <div className="relative z-10 px-6 pt-6">
        <div className="flex items-center gap-2 font-mono text-xs text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast" />
          ⚡ SYSTEM ONLINE // GRID ACTIVE
        </div>
      </div>

      {/* Hero Center */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          {/* Glitch title */}
          <h1 className="mb-4">
            <span
              className="glitch-text block text-7xl md:text-9xl font-black tracking-tighter leading-none text-white"
              data-text="ANTI"
            >
              ANTI
            </span>
            <span
              className="glitch-text block text-7xl md:text-9xl font-black tracking-tighter leading-none text-primary"
              data-text="GRAVITY"
            >
              GRAVITY
            </span>
          </h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-1 mb-8"
          >
            <p className="font-mono text-lg md:text-xl text-[#64748b]">
              The metaverse went dark.
            </p>
            <p className="font-mono text-lg md:text-xl text-[#e2e8f0]">
              We made sure nothing went unaccounted for.
            </p>
          </motion.div>

          {/* Tamper counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 border border-border bg-card/60 backdrop-blur-sm mb-10 font-mono text-sm"
          >
            <Activity className="w-4 h-4 text-primary animate-pulse-fast" />
            <span className="text-primary font-bold text-lg">
              [ {backendOnline && tamperCount !== null ? tamperCount : "--"} ]
            </span>
            <span className="text-muted-foreground">TAMPER EVENTS BLOCKED</span>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <button className="group px-8 py-4 border-2 border-primary text-primary font-mono font-bold uppercase tracking-widest hover:bg-primary hover:text-[#0a0a0f] transition-all duration-300 flex items-center gap-3">
                <Shield className="w-5 h-5" />
                INITIALIZE SOC
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            </Link>
            <Link href="/agents">
              <button className="group px-8 py-4 border-2 border-border text-muted-foreground font-mono font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-300 flex items-center gap-3">
                <Users className="w-5 h-5" />
                VIEW AGENTS
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom ticker */}
      <div className="relative z-10 border-t border-border bg-card/40 backdrop-blur-sm overflow-hidden py-3">
        <div className="ticker-scroll font-mono text-xs text-muted-foreground whitespace-nowrap">
          <span>{tickerText.repeat(4)}</span>
          <span>{tickerText.repeat(4)}</span>
        </div>
      </div>
    </div>
  );
}
