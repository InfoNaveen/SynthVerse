"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  useEffect(() => {
    const savedConnector = localStorage.getItem('wagmi.connected');
    // If there's a connected state in storage but we are not connected, try first connector
    if (savedConnector && !isConnected && connectors.length > 0) {
      wagmiConnect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, wagmiConnect]);

  const connect = useCallback(() => {
    if (connectors.length > 0) {
      wagmiConnect({ connector: connectors[0] });
    }
  }, [wagmiConnect, connectors]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  return {
    connected: isConnected,
    address: address || "",
    agvtBalance: isConnected ? 5200 : 0,
    agentRank: isConnected ? "GHOST" : "GHOST",
    anchors: isConnected ? 52 : 0,
    isConnecting,
    connect,
    disconnect,
  };
}
