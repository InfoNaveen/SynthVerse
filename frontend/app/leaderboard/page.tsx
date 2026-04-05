"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Trophy, Medal, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import Navbar from "@/components/Navbar";
import { useReadContract } from "wagmi";
import { AGVT_ABI, CONTRACTS } from "@/lib/contracts";

export default function LeaderboardPage() {
  const { connected } = useSocket();
  const { address } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: leaderboardData, isLoading } = useReadContract({
    address: CONTRACTS.AGVT_TOKEN as `0x${string}`,
    abi: AGVT_ABI,
    functionName: 'getLeaderboard',
    query: {
      refetchInterval: 5000,
    }
  });

  // Calculate ranks from contract return tuples
  const leaderboard = (leaderboardData as [string[], bigint[]])?.[0]?.map((addr: string, i: number) => {
    const scoreVal = Number((leaderboardData as [string[], bigint[]])[1][i]) / 1e18;
    // Basic rules from Token contract logic
    let badge = "GHOST";
    if (scoreVal >= 20000) badge = "SPECTER";
    else if (scoreVal >= 5000) badge = "WRAITH";
    else if (scoreVal >= 1000) badge = "PHANTOM";
    
    return {
      rank: i + 1,
      address: addr,
      score: scoreVal,
      badge: badge,
      anchors: Math.floor(scoreVal / 100), // Approximate anchors since we display it
    };
  }).filter((a: any) => a.address && a.address !== "0x0000000000000000000000000000000000000000") || [];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-5xl mx-auto w-full pb-12">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-black font-mono tracking-tighter mb-2 text-white flex items-center gap-3">
              <Trophy className="text-warning w-8 h-8" />
              GLOBAL <span className="text-primary">LEADERBOARD</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl">
              Top agents actively protecting the metaverse infrastructure.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-xs px-3 py-1.5 bg-card border border-border">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse-fast" : "bg-muted"}`} />
            {connected ? "LIVE UPDATES ON" : "WAITING FOR SYNC"}
          </div>
        </div>

        <div className="soc-panel overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-[#0d1117] text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-4">AGENT ADDRESS</div>
            <div className="col-span-3">BADGE</div>
            <div className="col-span-2 text-right">ANCHORS</div>
            <div className="col-span-2 text-right">TOTAL AGVT</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border/30">
            {isLoading ? (
               <div className="p-4 text-center text-muted-foreground font-mono text-sm">LOADING ON-CHAIN DATA...</div>
            ) : leaderboard.length === 0 ? (
               <div className="p-4 text-center text-muted-foreground font-mono text-sm">NO AGENTS REGISTERED YET</div>
            ) : leaderboard.map((agent: any, i: number) => {
              const isCurrentUser = address && agent.address.toLowerCase() === address.toLowerCase();
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`grid grid-cols-12 gap-4 px-4 py-3.5 items-center font-mono text-sm transition-colors ${
                    isCurrentUser
                      ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/30 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    {agent.rank === 1 ? <Medal className="w-5 h-5 text-warning" /> :
                     agent.rank === 2 ? <Medal className="w-5 h-5 text-zinc-300" /> :
                     agent.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" /> :
                     <span className="text-muted-foreground">#{agent.rank}</span>}
                  </div>
                  <div className={`col-span-4 flex items-center gap-2 ${isCurrentUser ? "text-primary font-bold" : "text-white"}`}>
                    {isCurrentUser && <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast" />}
                    {agent.address.slice(0,6)}...{agent.address.slice(-4)} {isCurrentUser && <span className="text-[10px] text-primary/70">(YOU)</span>}
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-xs">
                    <Hexagon className={`w-3 h-3 ${
                      agent.badge === "SPECTER" ? "text-purple-500" :
                      agent.badge === "WRAITH" ? "text-secondary" :
                      agent.badge === "PHANTOM" ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <span className="text-muted-foreground">{agent.badge}</span>
                  </div>
                  <div className="col-span-2 text-right text-muted-foreground">
                    ~{agent.anchors}
                  </div>
                  <div className="col-span-2 text-right font-bold text-primary">
                    {agent.score.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
