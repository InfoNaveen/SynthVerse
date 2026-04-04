"use client";

import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";
import { Wallet, Shield } from "lucide-react";

export default function WalletConnect() {
  const { connected, address, connect, disconnect, agvtBalance, agentRank, isConnecting } =
    useWallet();

  if (connected) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-xs text-primary font-mono font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> {agentRank}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {agvtBalance.toFixed(0)} AGVT
          </span>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-[#e2e8f0] hover:bg-muted font-mono text-sm transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast" />
          {truncateAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-[#0a0a0f] font-mono font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
