'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './ui/toaster';
import { WalletProvider } from '@/contexts/WalletContext';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
        <Toaster />
      </WalletProvider>
    </QueryClientProvider>
  );
}
