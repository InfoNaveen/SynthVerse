"use client";

import { useWallet } from "@/hooks/useWallet";
import { useSocket } from "@/hooks/useSocket";
import { motion } from "framer-motion";
import { User, Award, ShieldAlert, Zap, Search } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

export default function AgentPanel() {
  const { address, connected, agvtBalance, agentRank, anchors } = useWallet();
  const { isAttackActive } = useSocket();

  const quests = [
    { title: "FIRST ANCHOR", desc: "Anchor the Merkle root", reward: "+100 AGVT", progress: 80, icon: <Zap className="w-4 h-4" /> },
    { title: "DARK SURVIVOR", desc: "Maintain node during attack", reward: "+500 AGVT", progress: 30, icon: <ShieldAlert className="w-4 h-4" /> },
    { title: "EVIDENCE COLLECTOR", desc: "Submit forensics report", reward: "+1000 AGVT", progress: 0, icon: <Search className="w-4 h-4" /> },
  ];

  if (!connected) {
    return (
      <div className="soc-panel h-full flex flex-col items-center justify-center text-center p-8">
        <User className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-mono font-bold text-muted-foreground mb-2">AGENT OFFLINE</h3>
        <p className="text-xs font-mono text-muted-foreground/60 max-w-[220px]">
          Connect wallet to sync agent profile and view active quests.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={`soc-panel h-full flex flex-col ${
        isAttackActive ? "!border-t-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]" : ""
      }`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="soc-panel-header">
        <div className="flex items-center gap-3">
          <div className={`p-2 border ${isAttackActive ? "bg-primary/20 border-primary text-primary" : "bg-muted border-border text-white"}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground font-mono">AGENT ID</div>
            <div className="font-mono text-sm text-white">{truncateAddress(address)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-xs font-mono text-primary mb-1">
            <Award className="w-3 h-3" /> {agentRank}
          </div>
          <div className="font-mono font-bold text-lg text-white">{agvtBalance.toFixed(0)} AGVT</div>
        </div>
      </div>

      <div className="soc-panel-body flex-1 flex flex-col">
        {/* XP bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-2">
            <span>XP PROGRESS</span>
            <span>{anchors}/100 ANCHORS</span>
          </div>
          <div className="w-full bg-[#0d1117] h-2 overflow-hidden border border-border/50">
            <motion.div
              className="bg-primary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, anchors)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Quests */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-[10px] font-mono text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
            Active Quests
            {isAttackActive && (
              <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary border border-primary/50 animate-pulse-fast">
                RECORDING
              </span>
            )}
          </h3>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {quests.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-3 border border-border bg-[#0d1117] hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
                    {q.icon}
                    {q.title}
                  </div>
                  <div className="text-xs text-primary font-mono">{q.reward}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{q.desc}</div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <div className="flex-1 h-1.5 bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${q.progress}%` }} />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">{q.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
