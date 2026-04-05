import { createConfig, http, createStorage } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

export const polygonAmoy = defineChain({
  id: 31337,
  name: 'Local Hardhat',
  nativeCurrency: { name: 'EVM', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] }
  },
  blockExplorers: {
    default: { 
      name: 'Localscan', 
      url: 'http://localhost:8545' 
    }
  },
  testnet: true
});

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected({ target: 'metaMask' }),
    metaMask()
  ],
  transports: {
    [polygonAmoy.id]: http('http://127.0.0.1:8545')
  },
  storage: createStorage({ storage: typeof window !== 'undefined' ? window.localStorage : undefined }),
  ssr: false
});
