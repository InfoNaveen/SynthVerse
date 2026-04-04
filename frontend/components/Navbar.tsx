"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";
import { useSocket } from "@/hooks/useSocket";
import { Activity } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { connected } = useSocket();

  const links = [
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/agents", label: "AGENTS" },
    { href: "/leaderboard", label: "LEADERBOARD" },
  ];

  return (
    <nav className="fixed top-0 w-full h-16 border-b border-border bg-[#0a0a0f]/80 backdrop-blur-md z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter flex items-center gap-2"
          >
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-white">
              Anti<span className="text-primary">Gravity</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-sm transition-colors ${
                  pathname === link.href
                    ? "text-primary font-bold shadow-[0_2px_0_0_#00ff88]"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                connected
                  ? "bg-primary animate-pulse-fast"
                  : "bg-destructive"
              }`}
            />
            <span className={connected ? "text-primary" : "text-destructive"}>
              {connected ? "SOCKET CONNECTED" : "BACKEND OFFLINE"}
            </span>
          </div>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
