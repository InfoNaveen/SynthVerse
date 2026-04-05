'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { ANCHOR_ABI, CONTRACTS } from '@/lib/contracts';

const STATS = [
  { value: "< 90s", label: "Detection Time" },
  { value: "100%", label: "On-Chain Proof" },
  { value: "∞", label: "Dark Periods Survived" },
];

export default function Home() {
  const [tick, setTick] = useState(0);

  const { data: tamperCount } = useReadContract({
    address: CONTRACTS.ANCHOR as `0x${string}`,
    abi: ANCHOR_ABI,
    functionName: 'getTamperCount',
  });

  useEffect(() => {
    // Tick for terminal cursor
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden relative">
      
      {/* Background grid */}
      <div className="bg-grid opacity-30"/>
      
      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none"/>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[#0088ff]/5 rounded-full blur-3xl pointer-events-none"/>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/5 border border-[#00ff88]/20">
            <div className="status-dot"/>
            <span className="text-[#00ff88] text-xs font-mono tracking-widest">
              SYSTEM ONLINE // POLYGON AMOY
            </span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-white"
            style={{
              textShadow: '0 0 80px rgba(0,255,136,0.1)'
            }}
          >
            ECLIPSIS
          </h1>
          <div className="text-[#00ff88] font-mono text-sm tracking-[0.3em] mt-4 opacity-70">
            // DARK PERIOD FORENSICS
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            When cloud infrastructure collapses under attack,
            <span className="text-white"> ECLIPSIS </span>
            ensures every dark period is forensically recorded,
            tamper-proof, and permanently on-chain.
          </p>
        </motion.div>

        {/* Live counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="glass px-8 py-4 border border-[#00ff88]/10 flex items-center gap-4">
            <span className="text-4xl font-bold font-mono text-[#00ff88]"
              style={{
                textShadow: '0 0 20px rgba(0,255,136,0.5)'
              }}
            >
              {tamperCount !== undefined ? Number(tamperCount) : '—'}
            </span>
            <div>
              <div className="text-white text-sm font-mono">
                TAMPER EVENTS
              </div>
              <div className="text-gray-500 text-xs tracking-widest uppercase mt-1">
                DETECTED & ANCHORED
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center mb-20"
        >
          <Link href="/dashboard">
            <button className="px-8 py-4 rounded-xl bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:-translate-y-0.5 font-mono tracking-wider text-sm flex items-center gap-2">
              <span className="animate-pulse">◉</span> INITIALIZE SOC
            </button>
          </Link>
          <Link href="/agents">
            <button className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all hover:-translate-y-0.5 font-mono tracking-wider text-sm">
              ◈ VIEW AGENTS
            </button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-20"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="glass p-6 text-center border border-white/5 hover:border-[#00ff88]/20 transition-all">
              <div className="text-2xl font-bold font-mono text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {[
            "⛓ Blockchain Anchored",
            "🔬 AI Forensics",
            "🌐 Real-time Data",
            "🎮 Gamified Agents",
            "🔴 Attack Detection",
            "📊 Live Leaderboard",
          ].map((pill, i) => (
            <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-mono hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              {pill}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl py-2 overflow-hidden z-20">
        <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-mono text-gray-500 tracking-widest">
          {Array(5).fill([
            "BLOCKCHAIN ANCHORED",
            "DARK PERIOD FORENSICS",
            "REAL-TIME THREAT DETECTION",
            "POLYGON AMOY TESTNET",
            "AI POWERED ANALYSIS",
            "ECLIPSIS PROTOCOL ACTIVE",
          ]).flat().map((text, i) => (
            <span key={i} className="flex items-center gap-8">
              {text}
              <span className="text-[#00ff88] opacity-50">◆</span>
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
