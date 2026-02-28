'use client';

import { WalletProvider as TxnLabWalletProvider, useInitializeProviders, PROVIDER_ID } from '@txnlab/use-wallet';
import { PeraWalletConnect } from '@perawallet/connect';
import { DeflyWalletConnect } from '@blockshake/defly-connect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './ui/toaster';
import { WalletProvider } from '@/contexts/WalletContext';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const walletProviders = mounted ? [
    { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
    { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
    { 
      id: PROVIDER_ID.LUTE,
      clientOptions: {
        siteName: 'CredChain'
      }
    }
  ] : [];

  const providers = useInitializeProviders({
    providers: walletProviders,
    nodeConfig: {
      network: 'testnet',
      nodeServer: 'https://testnet-api.algonode.cloud',
      nodeToken: '',
      nodePort: '443'
    }
  });

  useEffect(() => {
    console.log('Providers initialized:', providers);
  }, [providers]);

  return (
    <QueryClientProvider client={queryClient}>
      <TxnLabWalletProvider value={providers}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </TxnLabWalletProvider>
    </QueryClientProvider>
  );
}
