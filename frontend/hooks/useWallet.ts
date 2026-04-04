"use client";

import { useState, useCallback } from "react";
import { AMOY_CHAIN } from "@/lib/contracts";

interface WalletState {
  connected: boolean;
  address: string;
  agvtBalance: number;
  agentRank: string;
  anchors: number;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: "",
    agvtBalance: 0,
    agentRank: "GHOST",
    anchors: 0,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          // Try to switch to Amoy
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: AMOY_CHAIN.chainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [AMOY_CHAIN],
                });
              } catch {}
            }
          }

          setState({
            connected: true,
            address: accounts[0],
            agvtBalance: 5200,
            agentRank: "GHOST",
            anchors: 52,
          });
        }
      } else {
        // No MetaMask — simulate for demo
        setState({
          connected: true,
          address: "0x4F9a2B7c8D3e1A5f6E0C9B8D7A6F5E4D3C2B1A0F",
          agvtBalance: 5200,
          agentRank: "GHOST",
          anchors: 52,
        });
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      address: "",
      agvtBalance: 0,
      agentRank: "GHOST",
      anchors: 0,
    });
  }, []);

  return { ...state, isConnecting, connect, disconnect };
}
