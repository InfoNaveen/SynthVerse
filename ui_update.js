const fs = require('fs');
const path = require('path');

// 1. Append to globals.css
let globalsCss = fs.readFileSync('frontend/app/globals.css', 'utf8');
const appendedCss = `
/* UI Overhaul Append */
body::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(
      ellipse at 20% 50%,
      rgba(0,255,136,0.03) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 20%,
      rgba(0,136,255,0.03) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 60% 80%,
      rgba(255,34,68,0.02) 0%,
      transparent 40%
    );
  pointer-events: none;
  z-index: 0;
}

.glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}

.bg-grid {
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0,255,136,0); }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse-glow 2s infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}
`;
if (!globalsCss.includes('.bg-grid')) {
  fs.writeFileSync('frontend/app/globals.css', globalsCss + '\n' + appendedCss, 'utf8');
}

// 2. tailwind.config.ts update
let tailwindConfig = fs.readFileSync('frontend/tailwind.config.ts', 'utf8');
if (!tailwindConfig.includes('marquee 30s linear infinite')) {
    tailwindConfig = tailwindConfig.replace(
        /animation: \{/g, 
        "animation: {\n        marquee: 'marquee 30s linear infinite',"
    );
    tailwindConfig = tailwindConfig.replace(
        /keyframes: \{/g,
        `keyframes: {\n        marquee: {\n          '0%': { transform: 'translateX(0)' },\n          '100%': { transform: 'translateX(-50%)' },\n        },`
    );
    fs.writeFileSync('frontend/tailwind.config.ts', tailwindConfig, 'utf8');
}

// 3. Create components/ui/Panel.tsx
const panelContent = `'use client';
import { motion } from 'framer-motion';

interface PanelProps {
  title: string;
  status?: 'live' | 'warning' | 'danger' | 'offline';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function Panel({ 
  title, status = 'live', children, 
  className = '', delay = 0 
}: PanelProps) {
  const statusColors = {
    live: '#00ff88',
    warning: '#ffaa00',
    danger: '#ff2244',
    offline: '#64748b',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={\`relative rounded-2xl overflow-hidden h-full \${className}\`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: \`0 0 40px rgba(0,255,136,0.03), inset 0 1px 0 rgba(255,255,255,0.05)\`
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: \`linear-gradient(90deg, transparent, \${statusColors[status]}80, transparent)\`
        }}
      />
      
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div 
            className="w-1.5 h-4 rounded-full"
            style={{ background: statusColors[status], boxShadow: \`0 0 10px \${statusColors[status]}80\` }}
          />
          <span className="text-sm font-mono tracking-[0.2em] text-gray-400 uppercase">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full status-dot"
            style={{ background: statusColors[status] }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 h-[calc(100%-60px)] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
`;
fs.mkdirSync('frontend/components/ui', { recursive: true });
fs.writeFileSync('frontend/components/ui/Panel.tsx', panelContent, 'utf8');

// 4. Update landing page (app/page.tsx)
const pageContent = `'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATS = [
  { value: "< 90s", label: "Detection Time" },
  { value: "100%", label: "On-Chain Proof" },
  { value: "∞", label: "Dark Periods Survived" },
];

export default function Home() {
  const [tamperCount, setTamperCount] = useState<number|null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Fetch real tamper count from backend
    fetch(\`\${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forensics/tamper-count\`)
      .then(r => r.json())
      .then(d => setTamperCount(d.count || 0))
      .catch(() => setTamperCount(0));

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
              {tamperCount !== null ? tamperCount : '—'}
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
`;
fs.writeFileSync('frontend/app/page.tsx', pageContent, 'utf8');

// 5. Update Navbar.tsx
const navbarContent = `'use client';
import { motion } from 'framer-motion';
import WalletConnect from './WalletConnect';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <span className="text-black font-bold text-xs">
              EC
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="font-black tracking-widest text-white text-lg">
              ECLIPSIS
            </span>
            <span className="text-[#00ff88] text-[10px] font-mono ml-2 opacity-80 tracking-widest">
              v1.0
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {[
            { href: '/dashboard', label: 'SOC' },
            { href: '/agents', label: 'AGENTS' },
            { href: '/leaderboard', label: 'BOARD' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={\`px-5 py-2 rounded-lg text-xs font-mono tracking-[0.2em] transition-all \${pathname === link.href ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}\`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="status-dot"/>
            <span className="text-[10px] font-mono text-gray-400 tracking-widest">
              LIVE
            </span>
          </div>
          <WalletConnect />
        </div>
      </div>
    </motion.nav>
  );
}
`;
fs.writeFileSync('frontend/components/Navbar.tsx', navbarContent, 'utf8');

// 6. Update dashboard/page.tsx to wrap panels
let dashboardPage = fs.readFileSync('frontend/app/dashboard/page.tsx', 'utf8');
if (!dashboardPage.includes('import Panel')) {
    dashboardPage = dashboardPage.replace(/(import ForensicsPanel from "@\/components\/ForensicsPanel";)/, "$1\nimport Panel from \"@/components/ui/Panel\";");
    
    // Replace <TwinPanel />
    dashboardPage = dashboardPage.replace(
        /<TwinPanel \/>/g,
        '<Panel title="LIVE DIGITAL TWIN" status="live" delay={0}>\n              <TwinPanel />\n            </Panel>'
    );
    // Replace <AgentPanel />
    dashboardPage = dashboardPage.replace(
        /<AgentPanel \/>/g,
        '<Panel title="AGENT PROFILE" status="live" delay={0.1}>\n                <AgentPanel />\n              </Panel>'
    );
    // Replace <AttackSimulator />
    dashboardPage = dashboardPage.replace(
        /<AttackSimulator \/>/g,
        '<Panel title="THREAT SIMULATION" status="danger" delay={0.2}>\n              <AttackSimulator />\n            </Panel>'
    );
    // Replace <ThreatPanel />
    dashboardPage = dashboardPage.replace(
        /<ThreatPanel \/>/g,
        '<Panel title="THREAT INTELLIGENCE" status="warning" delay={0.3}>\n              <ThreatPanel />\n            </Panel>'
    );
    // Replace <ForensicsPanel />
    dashboardPage = dashboardPage.replace(
        /<ForensicsPanel \/>/g,
        '<Panel title="AI FORENSICS ENGINE" status="live" delay={0.4}>\n                <ForensicsPanel />\n              </Panel>'
    );

    fs.writeFileSync('frontend/app/dashboard/page.tsx', dashboardPage, 'utf8');
}
