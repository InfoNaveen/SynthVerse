"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, Bug, Loader2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function AttackSimulator() {
  const { isAttackActive, isTamperInjected, simulateAttack, simulateTamper, simulateRecovery } = useSocket();
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>, step: string) => {
    setLoadingStep(step);
    await action();
    setTimeout(() => setLoadingStep(null), 600);
  };

  return (
    <div
      className={`soc-panel transition-all duration-500 ${
        isAttackActive ? "!border-t-destructive shadow-[inset_0_0_20px_rgba(255,34,68,0.08)]" : ""
      }`}
    >
      <div className="soc-panel-header">
        <h3 className="text-sm font-mono font-bold flex items-center gap-2">
          <AlertTriangle className={isAttackActive ? "text-destructive animate-pulse-fast" : "text-warning"} />
          ⚠ SIMULATION CONTROLS
        </h3>
      </div>

      <div className="soc-panel-body">
        <p className="text-[10px] text-muted-foreground font-mono mb-4 uppercase tracking-wider">
          For demonstration purposes only
        </p>

        <div className="space-y-2.5">
          {/* Step 1: Attack */}
          <button
            onClick={() => handleAction(simulateAttack, "attack")}
            disabled={loadingStep !== null || isAttackActive}
            className="w-full flex items-center justify-between p-3 border border-destructive/30 bg-[#0d1117] hover:bg-destructive/10 hover:border-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase group"
          >
            <span className="flex items-center gap-2">
              {loadingStep === "attack" ? (
                <Loader2 className="w-4 h-4 text-destructive animate-spin" />
              ) : (
                <Bug className="w-4 h-4 text-destructive" />
              )}
              ◉ SIMULATE ATTACK
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">→</span>
          </button>

          {/* Step 2: Tamper */}
          <button
            onClick={() => handleAction(simulateTamper, "tamper")}
            disabled={loadingStep !== null || !isAttackActive || isTamperInjected}
            className="w-full flex items-center justify-between p-3 border border-warning/30 bg-[#0d1117] hover:bg-warning/10 hover:border-warning disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase group"
          >
            <span className="flex items-center gap-2">
              {loadingStep === "tamper" ? (
                <Loader2 className="w-4 h-4 text-warning animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              ⚡ INJECT TAMPER DATA
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-warning">→</span>
          </button>

          {/* Step 3: Recovery */}
          <button
            onClick={() => handleAction(simulateRecovery, "recover")}
            disabled={loadingStep !== null || !isAttackActive}
            className="w-full flex items-center justify-between p-3 border border-primary/30 bg-[#0d1117] hover:bg-primary/10 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase group"
          >
            <span className="flex items-center gap-2">
              {loadingStep === "recover" ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-primary" />
              )}
              ◈ TRIGGER RECOVERY
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</span>
          </button>
        </div>

        {/* Sequence indicator */}
        <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-muted-foreground">
          <div className={`w-3 h-3 rounded-full border-2 ${isAttackActive ? "border-destructive bg-destructive" : "border-muted"}`} />
          <div className="flex-1 h-px bg-border" />
          <div className={`w-3 h-3 rounded-full border-2 ${isTamperInjected ? "border-warning bg-warning" : "border-muted"}`} />
          <div className="flex-1 h-px bg-border" />
          <div className={`w-3 h-3 rounded-full border-2 ${!isAttackActive && isTamperInjected ? "border-primary bg-primary" : "border-muted"}`} />
        </div>
      </div>
    </div>
  );
}
