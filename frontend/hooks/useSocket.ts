"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface TwinData {
  temperature?: number;
  humidity?: number;
  pm25?: number;
  traffic?: number;
  wind?: number;
  description?: string;
  temp?: number;
}

interface ThreatEntry {
  url: string;
  threat: string;
  url_status?: string;
  date_added?: string;
}

interface ThreatData {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  activeThreats: number;
  totalCached: number;
  recentUrls: ThreatEntry[];
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
  twinData: any | null;
  twinHistory: any[];
  threatData: ThreatData | null;
  forensicsData: ForensicsReport | null;
  lastAnchorTime: number;
  darkPeriods: number;
  tamperCount: number;
  attackBanner: string | null;
}

let globalSocket: Socket | null = null;
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
function notify() { listeners.forEach((fn) => fn()); }
function updateState(partial: Partial<SocketState>) {
  globalState = { ...globalState, ...partial };
  notify();
}

function initSocket() {
  if (globalSocket) return;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  globalSocket = io(backendUrl, { transports: ["websocket", "polling"] });

  globalSocket.on("connect", () => {
    updateState({ connected: true });
  });

  globalSocket.on("disconnect", () => {
    updateState({ connected: false });
  });

  globalSocket.on("twin_update", (data) => {
    // Map backend live structure to UI expected shape
    const uiData = {
      temperature: data.weather?.temp ?? data.temperature ?? 0,
      humidity: data.weather?.humidity ?? data.humidity ?? 0,
      pm25: data.airQuality?.pm25 ?? data.pm25 ?? 0,
      traffic: data.traffic?.congestionLevel ? (data.traffic.congestionLevel === 'FREE' ? 1 : data.traffic.congestionLevel === 'LIGHT' ? 2 : data.traffic.congestionLevel === 'MODERATE' ? 3 : 5) : 1,
      wind: data.weather?.wind_speed ? data.weather.wind_speed * 3.6 : 0, // m/s to km/h
    };
    const history = [...globalState.twinHistory, uiData].slice(-20);
    updateState({ twinData: uiData, twinHistory: history, lastAnchorTime: data.timestamp || Date.now() });
  });

  globalSocket.on("threat_update", (data) => {
    updateState({ threatData: data });
  });

  globalSocket.on("ATTACK_STARTED", (data) => {
    updateState({
      isAttackActive: true,
      isTamperInjected: false,
      isRecovered: false,
      forensicsData: null,
      darkPeriods: globalState.darkPeriods + 1,
      attackBanner: "⚠ INFRASTRUCTURE ATTACK IN PROGRESS",
    });
    if (typeof document !== "undefined") document.body.classList.add("attack-active");
  });

  globalSocket.on("RECOVERY_COMPLETE", (payload) => {
    updateState({
      isAttackActive: false,
      isTamperInjected: false,
      isRecovered: true,
      attackBanner: payload.divergenceDetected ? "✓ SYSTEM RESTORED // EVIDENCE ANCHORED ON-CHAIN" : "✓ SYSTEM RESTORED // NO TAMPERING DETECTED",
    });
    if (typeof document !== "undefined") document.body.classList.remove("attack-active");
    setTimeout(() => updateState({ attackBanner: null }), 5000);
  });

  globalSocket.on("FORENSIC_REPORT", (data) => {
    updateState({
      forensicsData: {
        confidence: data.analysis.confidenceScore,
        tampered: (data.analysis.tamperedFields || []).map((f: any) => ({
          field: f.field, from: f.originalValue?.toString() || "unknown", to: f.tamperedValue?.toString() || "unknown"
        })),
        verdict: data.analysis.verdict,
        txHash: data.polygonScanUrl ? data.polygonScanUrl.split('/').pop() : '0x...',
        ipfsCid: data.ipfsCID,
      }
    });
  });
}

if (typeof window !== "undefined") {
  initSocket();
}

export function useSocket() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const simulateAttack = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    try {
      await fetch(`${backendUrl}/api/simulate/attack`, { method: "POST" });
    } catch (e) { console.error(e); }
  }, []);

  const simulateTamper = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    try {
      await fetch(`${backendUrl}/api/simulate/inject-tamper`, { method: "POST" });
    } catch (e) { console.error(e); }
    updateState({ isTamperInjected: true, tamperCount: globalState.tamperCount + 1 });
  }, []);

  const simulateRecovery = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    try {
      await fetch(`${backendUrl}/api/simulate/recover`, { method: "POST" });
    } catch (e) { console.error(e); }
  }, []);

  const triggerAnchorTx = useCallback(async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    try {
      const res = await fetch(`${backendUrl}/api/agent/anchor`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        console.log("Anchor successful", data);
      }
    } catch (e) { console.error(e); }
  }, []);

  const dismissBanner = useCallback(() => {
    updateState({ attackBanner: null });
  }, []);

  return {
    ...globalState,
    simulateAttack,
    simulateTamper,
    simulateRecovery,
    triggerAnchorTx,
    dismissBanner,
  };
}
