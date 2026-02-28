'use client';

import { useWalletContext } from '@/contexts/WalletContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect } from 'react';

export function WalletConnect() {
  const { activeAddress, isConnected, connectWallet, disconnectWallet, providers } = useWalletContext();

  useEffect(() => {
    console.log('WalletConnect - Providers:', providers);
    console.log('WalletConnect - Active Address:', activeAddress);
    console.log('WalletConnect - Is Connected:', isConnected);
  }, [providers, activeAddress, isConnected]);

  const handleConnect = async (providerId: string) => {
    console.log('Attempting to connect to:', providerId);
    try {
      await connectWallet(providerId);
      console.log('Connected successfully!');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (isConnected && activeAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDisconnect} className="gap-2 cursor-pointer">
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {providers && providers.length > 0 ? (
          providers.map((provider) => (
            <DropdownMenuItem
              key={provider.metadata.id}
              onClick={() => handleConnect(provider.metadata.id)}
              className="cursor-pointer"
            >
              {provider.metadata.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            Loading wallets...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
