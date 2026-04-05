'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#00ff88',
            accentColorForeground: '#0a0a0f',
            borderRadius: 'small',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          coolMode
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #1e293b',
                fontFamily: 'monospace',
              },
              success: {
                iconTheme: {
                  primary: '#00ff88',
                  secondary: '#0a0a0f',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff2244',
                  secondary: '#0a0a0f',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
