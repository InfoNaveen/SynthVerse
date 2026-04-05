"use client";

import { useWallet } from "@/hooks/useWallet";
import { useSocket } from "@/hooks/useSocket";
import AgentPanel from "@/components/AgentPanel";
import { ShieldPlus } from "lucide-react";
import WalletConnect from "@/components/WalletConnect";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AgentsPage() {
  const { connected } = useWallet();
  const { triggerAnchorTx } = useSocket();
  const [isAnchoring, setIsAnchoring] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-4xl mx-auto w-full pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black font-mono tracking-tighter mb-2 text-white">
            AGENT OPERATOR
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Connect your wallet to assume control as a decentralized security agent.
            Complete quests, maintain network integrity, and earn AGVT rewards.
          </p>
        </motion.div>

        {!connected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="soc-panel p-12 text-center flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full border-2 border-muted flex items-center justify-center mb-6">
              <ShieldPlus className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-mono text-white mb-2">
              AWAITING AGENT CONNECTION
            </h2>
            <p className="text-xs font-mono text-muted-foreground mb-6">
              Connect MetaMask to view your agent profile
            </p>
            <WalletConnect />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="h-[600px]">
              <AgentPanel />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="soc-panel"
            >
              <div className="soc-panel-header">
                <h3 className="text-sm font-mono font-bold flex items-center gap-2">
                  <ShieldPlus className="text-primary w-5 h-5" />
                  MANUAL ANCHOR PUSH
                </h3>
              </div>
              <div className="soc-panel-body">
                <p className="text-sm font-mono text-muted-foreground mb-6">
                  Manually anchor the latest Merkle root to the Polygon blockchain.
                  Costs MATIC for gas, rewards 100 AGVT upon success.
                </p>
                <button 
                  onClick={async () => {
                    setIsAnchoring(true);
                    await triggerAnchorTx();
                    setTimeout(() => setIsAnchoring(false), 2000);
                  }}
                  disabled={isAnchoring}
                  className={`px-6 py-3 ${isAnchoring ? 'bg-primary/50' : 'bg-primary hover:bg-primary/90'} text-[#0a0a0f] font-bold font-mono transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]`}
                >
                  <span className={`w-2 h-2 rounded-full bg-[#0a0a0f] ${isAnchoring ? 'animate-pulse' : 'animate-pulse-fast'}`} />
                  {isAnchoring ? "ANCHORING..." : "INITIATE ANCHOR TX"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
