"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TwinData {
  temperature: number;
  humidity: number;
  pm25: number;
  traffic: number;
  wind: number;
}

interface ThreatEntry {
  time: string;
  url: string;
  threat: string;
  status?: string;
}

interface ThreatData {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  activeUrls: number;
  recent: ThreatEntry[];
  blockedToday: number;
  lastUpdated: number;
}

interface ForensicsReport {
  confidence: number;
  tampered: { field: string; from: string; to: string }[];
  verdict: string;
  txHash: string;
  ipfsCid: string;
}

interface SocketState {
  connected: boolean;
  isAttackActive: boolean;
  isTamperInjected: boolean;
  isRecovered: boolean;
  twinData: TwinData | null;
  twinHistory: TwinData[];
  threatData: ThreatData | null;
  forensicsData: ForensicsReport | null;
  lastAnchorTime: number;
  darkPeriods: number;
  tamperCount: number;
  attackBanner: string | null;
}

// Global state so multiple components share the same socket state
let globalState: SocketState = {
  connected: false,
  isAttackActive: false,
  isTamperInjected: false,
  isRecovered: false,
  twinData: null,
  twinHistory: [],
  threatData: null,
  forensicsData: null,
  lastAnchorTime: Date.now(),
  darkPeriods: 0,
  tamperCount: 0,
  attackBanner: null,
};

let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function updateState(partial: Partial<SocketState>) {
  globalState = { ...globalState, ...partial };
  notify();
}

// Simulate live twin data stream
let twinInterval: ReturnType<typeof setInterval> | null = null;
let threatInterval: ReturnType<typeof setInterval> | null = null;
let anchorInterval: ReturnType<typeof setInterval> | null = null;

function startSimulation() {
  if (twinInterval) return;

  // Twin data every 3s
  twinInterval = setInterval(() => {
    if (globalState.isAttackActive) return;
    const twin: TwinData = {
      temperature: 27 + Math.random() * 4,
      humidity: 60 + Math.random() * 15,
      pm25: 25 + Math.random() * 20,
      traffic: Math.floor(1 + Math.random() * 5),
      wind: 8 + Math.random() * 10,
    };
    const history = [...globalState.twinHistory, twin].slice(-20);
    updateState({ twinData: twin, twinHistory: history });
  }, 3000);

  // Threat data every 5s
  threatInterval = setInterval(() => {
    const threats: ThreatEntry[] = Array.from({ length: 3 }, () => {
      const domains = ["mal.xyz", "c2.hack.io", "phish.cc", "trojan.net", "exfil.bad", "ransom.dark"];
      const types = ["C2", "PAYLOAD", "PHISHING", "EXFIL", "RANSOMWARE"];
      return {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        url: domains[Math.floor(Math.random() * domains.length)],
        threat: types[Math.floor(Math.random() * types.length)],
        status: "BLOCKED",
      };
    });
    updateState({
      threatData: {
        level: globalState.isAttackActive ? "CRITICAL" : "LOW",
        activeUrls: Math.floor(200 + Math.random() * 100),
        recent: threats,
        blockedToday: Math.floor(1200 + Math.random() * 300),
        lastUpdated: Date.now(),
      },
    });
  }, 5000);

  // Anchor timestamp every 20s
  anchorInterval = setInterval(() => {
    updateState({ lastAnchorTime: Date.now() });
  }, 20000);

  // Mark connected
  updateState({ connected: true });
}

function stopSimulation() {
  if (twinInterval) clearInterval(twinInterval);
  if (threatInterval) clearInterval(threatInterval);
  if (anchorInterval) clearInterval(anchorInterval);
  twinInterval = null;
  threatInterval = null;
  anchorInterval = null;
}

// Start on import
if (typeof window !== "undefined") {
  startSimulation();
}

export function useSocket() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    if (!twinInterval) startSimulation();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const simulateAttack = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl.replace("ws", "http")}/simulate/attack`, { method: "POST" });
      } catch {}
    }
    updateState({
      isAttackActive: true,
      isTamperInjected: false,
      isRecovered: false,
      forensicsData: null,
      darkPeriods: globalState.darkPeriods + 1,
      attackBanner: "⚠ INFRASTRUCTURE ATTACK IN PROGRESS",
    });
    if (typeof document !== "undefined") document.body.classList.add("attack-active");
  }, []);

  const simulateTamper = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl.replace("ws", "http")}/simulate/inject-tamper`, { method: "POST" });
      } catch {}
    }
    updateState({
      isTamperInjected: true,
      tamperCount: globalState.tamperCount + 1,
    });
  }, []);

  const simulateRecovery = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl.replace("ws", "http")}/simulate/recover`, { method: "POST" });
      } catch {}
    }
    updateState({
      isAttackActive: false,
      isTamperInjected: false,
      isRecovered: true,
      attackBanner: "✓ SYSTEM RESTORED // EVIDENCE ANCHORED ON-CHAIN",
      forensicsData: {
        confidence: 94,
        tampered: [
          { field: "temperature", from: "28.4°C", to: "450.0°C" },
          { field: "pm25", from: "34 µg/m³", to: "0.001 µg/m³" },
        ],
        verdict: "DELIBERATE MANIPULATION DETECTED — Sensor values exceeded physical bounds during dark period. High confidence of coordinated infrastructure attack.",
        txHash: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
        ipfsCid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      },
    });
    if (typeof document !== "undefined") document.body.classList.remove("attack-active");
    // Clear banner after 5s
    setTimeout(() => updateState({ attackBanner: null }), 5000);
  }, []);

  const dismissBanner = useCallback(() => {
    updateState({ attackBanner: null });
  }, []);

  return {
    ...globalState,
    simulateAttack,
    simulateTamper,
    simulateRecovery,
    dismissBanner,
  };
}
