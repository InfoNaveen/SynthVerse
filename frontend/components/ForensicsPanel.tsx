"use client";

import { useSocket } from "@/hooks/useSocket";
import { motion } from "framer-motion";
import { Microscope, FileSearch, Database, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { formatHash } from "@/lib/utils";
import { useState, useEffect } from "react";

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <>{displayed}<span className="border-r-2 border-primary animate-type-cursor">&nbsp;</span></>;
}

export default function ForensicsPanel() {
  const { forensicsData, isAttackActive, isRecovered } = useSocket();

  // Gathering evidence state
  if (isAttackActive) {
    return (
      <div className="soc-panel h-full !border-t-destructive">
        <div className="soc-panel-header">
          <h2 className="text-sm font-bold font-mono flex items-center gap-2 text-muted-foreground">
            <Microscope className="w-4 h-4" /> ◈ FORENSIC ANALYSIS
          </h2>
        </div>
        <div className="soc-panel-body flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
          <Loader2 className="w-10 h-10 text-destructive mb-4 animate-spin" />
          <h3 className="text-sm font-mono text-muted-foreground mb-2">GATHERING EVIDENCE...</h3>
          <p className="text-xs font-mono text-muted-foreground/50">
            AI Forensics will compile report after recovery.
          </p>
        </div>
      </div>
    );
  }

  // Awaiting state (no data yet, no attack)
  if (!forensicsData) {
    return (
      <div className="soc-panel h-full">
        <div className="soc-panel-header">
          <h2 className="text-sm font-bold font-mono flex items-center gap-2 text-muted-foreground">
            <Microscope className="w-4 h-4" /> ◈ FORENSIC ANALYSIS
          </h2>
        </div>
        <div className="soc-panel-body flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
          <CheckCircle2 className="w-10 h-10 text-primary/20 mb-4" />
          <h3 className="text-sm font-mono text-muted-foreground mb-2">
            {isRecovered ? "ANALYSIS COMPLETE" : "SYSTEM SECURE"}
          </h3>
          <p className="text-xs font-mono text-muted-foreground/50">
            Awaiting dark period event...
          </p>
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse-fast" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Report available
  const confidenceColor =
    forensicsData.confidence >= 90 ? "text-destructive" :
    forensicsData.confidence >= 70 ? "text-warning" : "text-primary";

  return (
    <motion.div
      className="soc-panel h-full !border-t-secondary flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="soc-panel-header">
        <h2 className="text-sm font-bold font-mono text-secondary flex items-center gap-2">
          <FileSearch className="w-4 h-4" /> FORENSIC REPORT
        </h2>
        <div className={`text-xs font-mono px-2 py-1 border border-current ${confidenceColor}`}>
          CONFIDENCE: {forensicsData.confidence}%
        </div>
      </div>

      <div className="soc-panel-body flex-1 flex flex-col overflow-y-auto">
        {/* Tampered fields */}
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-widest">
            Tampered Fields:
          </div>
          <div className="space-y-2">
            {forensicsData.tampered.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center justify-between p-2.5 bg-destructive/5 border border-destructive/20 font-mono text-xs"
              >
                <span className="text-white font-bold">{t.field}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through opacity-50">{t.from}</span>
                  <span className="text-destructive">→</span>
                  <span className="text-destructive font-bold">{t.to}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Verdict */}
        <div className="p-3 border border-destructive/50 bg-destructive/10 mb-4">
          <div className="text-[10px] text-destructive font-mono font-bold mb-1 uppercase tracking-widest">
            AI Verdict:
          </div>
          <div className="text-sm font-mono text-white break-words leading-relaxed">
            <TypewriterText text={forensicsData.verdict} speed={15} />
          </div>
        </div>

        {/* Links */}
        <div className="mt-auto space-y-2 pt-3 border-t border-border">
          <a
            href={`https://amoy.polygonscan.com/tx/${forensicsData.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 border border-border hover:bg-secondary/10 hover:border-secondary transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Database className="w-3 h-3 text-secondary" /> MINT TX
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-secondary">
              {formatHash(forensicsData.txHash)}{" "}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
          <a
            href={`https://ipfs.io/ipfs/${forensicsData.ipfsCid}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 border border-border hover:bg-primary/10 hover:border-primary transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <FileSearch className="w-3 h-3 text-primary" /> IPFS EVIDENCE
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-primary">
              {formatHash(forensicsData.ipfsCid)}{" "}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
