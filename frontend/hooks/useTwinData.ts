"use client";

import { useSocket } from "./useSocket";

export function useTwinData() {
  const { twinData, twinHistory, lastAnchorTime } = useSocket();
  return {
    current: twinData,
    history: twinHistory,
    lastUpdated: lastAnchorTime,
  };
}
