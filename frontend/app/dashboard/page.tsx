"use client";

import { useSocket } from "@/hooks/useSocket";
import Navbar from "@/components/Navbar";
import TwinPanel from "@/components/TwinPanel";
import AgentPanel from "@/components/AgentPanel";
import AttackSimulator from "@/components/AttackSimulator";
import ThreatPanel from "@/components/ThreatPanel";
import ForensicsPanel from "@/components/ForensicsPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { connected, isAttackActive, attackBanner, lastAnchorTime, darkPeriods, tamperCount } = useSocket();

  const anchorAgo = Math.floor((Date.now() - lastAnchorTime) / 1000);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Navbar />

      {/* Attack Banner */}
      <AnimatePresence>
        {attackBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`overflow-hidden font-mono text-sm text-center py-3 font-bold tracking-wider ${
              isAttackActive
                ? "bg-destructive/20 text-destructive border-b border-destructive/30"
                : "bg-primary/20 text-primary border-b border-primary/30"
            }`}
          >
            {attackBanner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="mt-16 border-b border-border bg-card/40 backdrop-blur-sm px-4 md:px-8 py-3">
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse-fast" : "bg-destructive"}`} />
            <span className={connected ? "text-primary" : "text-destructive"}>
              {connected ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
          <div className="hidden md:block h-4 w-px bg-border" />
          <span>AMOY TESTNET</span>
          <div className="hidden md:block h-4 w-px bg-border" />
          <span>Last anchor: {anchorAgo}s ago</span>
          <div className="hidden md:block h-4 w-px bg-border" />
          <span>Dark periods: {darkPeriods}</span>
          <div className="hidden md:block h-4 w-px bg-border" />
          <span>Tampers: {tamperCount}</span>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="flex-1 p-4 md:p-6 relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[calc(100vh-180px)]">
          {/* LEFT: Twin Panel */}
          <div className="col-span-1">
            <TwinPanel />
          </div>

          {/* CENTER: Agent + Attack */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="flex-1">
              <AgentPanel />
            </div>
            <AttackSimulator />
          </div>

          {/* RIGHT: Threat + Forensics */}
          <div className="col-span-1 flex flex-col gap-4">
            <ThreatPanel />
            <div className="flex-1">
              <ForensicsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
