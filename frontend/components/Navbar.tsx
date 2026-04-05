'use client';
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
              className={`px-5 py-2 rounded-lg text-xs font-mono tracking-[0.2em] transition-all ${pathname === link.href ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
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
