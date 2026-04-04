"use client";

import { formatHash } from "@/lib/utils";
import { Box, ExternalLink } from "lucide-react";

interface AnchorEntry {
  root: string;
  timestamp: number;
}

export default function MerkleViewer({ history = [] }: { history?: AnchorEntry[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="border border-border p-3 bg-[#0d1117]">
        <div className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-widest">
          Recent Anchors
        </div>
        <div className="text-xs font-mono text-muted-foreground/50">
          Waiting for anchors...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-3 bg-[#0d1117]">
      <div className="text-[10px] text-muted-foreground font-mono mb-2 flex items-center gap-2 uppercase tracking-widest">
        <Box className="w-3 h-3" /> Recent Anchors
      </div>
      <div className="space-y-1.5">
        {history.slice(0, 3).map((item, i) => (
          <div key={i} className="flex justify-between items-center font-mono text-xs">
            <span className="text-muted-foreground">
              {new Date(item.timestamp).toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <a
              href={`https://amoy.polygonscan.com/tx/${item.root}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-white transition-colors flex items-center gap-1"
            >
              {formatHash(item.root)}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
