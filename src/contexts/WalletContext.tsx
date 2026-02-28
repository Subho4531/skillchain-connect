'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useWallet, WalletAccount } from '@txnlab/use-wallet';
import { Transaction } from 'algosdk';

interface WalletContextType {
  // Wallet state
  activeAccount: WalletAccount | null;
  activeAddress: string | null;
  isConnected: boolean;
  walletName: string | null;
  
  // Wallet actions
  connectWallet: (providerId: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  reconnectWallet: () => Promise<void>;
  
  // Transaction signing
  signTransactions: (txnGroup: Transaction[], indexesToSign?: number[]) => Promise<Uint8Array[]>;
  transactionSigner: (txnGroup: Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>;
  
  // Providers
  providers: any[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { providers, activeAccount } = useWallet();
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);

  useEffect(() => {
    console.log('WalletProvider - providers from useWallet:', providers);
    console.log('WalletProvider - activeAccount:', activeAccount);
  }, [providers, activeAccount]);

  // Update active address when account changes
  useEffect(() => {
    if (activeAccount) {
      setActiveAddress(activeAccount.address);
      setIsConnected(true);
      
      // Get wallet name from active provider
      const activeProvider = providers?.find((p) => p.isActive);
      if (activeProvider) {
        setWalletName(activeProvider.metadata.name);
        // Store wallet info in localStorage for reconnection
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('lastWalletId', activeProvider.metadata.id);
        localStorage.setItem('lastWalletAddress', activeAccount.address);
      }
    } else {
      setActiveAddress(null);
      setIsConnected(false);
      setWalletName(null);
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('lastWalletId');
      localStorage.removeItem('lastWalletAddress');
    }
  }, [activeAccount, providers]);

  // Auto-reconnect on mount
  const reconnectWallet = useCallback(async () => {
    const wasConnected = localStorage.getItem('walletConnected');
    const lastWalletId = localStorage.getItem('lastWalletId');
    
    if (wasConnected && lastWalletId && !activeAccount) {
      console.log('Attempting to reconnect wallet:', lastWalletId);
      try {
        const provider = providers?.find((p) => p.metadata.id === lastWalletId);
        if (provider) {
          await provider.connect();
        }
      } catch (error) {
        console.error('Failed to reconnect wallet:', error);
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('lastWalletId');
        localStorage.removeItem('lastWalletAddress');
      }
    }
  }, [activeAccount, providers]);

  useEffect(() => {
    reconnectWallet();
  }, []);

  const connectWallet = useCallback(async (providerId: string) => {
    try {
      const provider = providers?.find((p) => p.metadata.id === providerId);
      if (provider) {
        await provider.connect();
      } else {
        throw new Error(`Provider ${providerId} not found`);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [providers]);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = providers?.find((p) => p.isActive);
      if (provider) {
        await provider.disconnect();
      }
      
      // Clear localStorage
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('lastWalletId');
      localStorage.removeItem('lastWalletAddress');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, [providers]);

  // Transaction signer compatible with AlgoKit TransactionSigner type
  const transactionSigner = useCallback(async (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ): Promise<Uint8Array[]> => {
    const provider = providers?.find((p) => p.isActive);
    
    if (!provider) {
      throw new Error('No active wallet provider');
    }

    if (!activeAccount) {
      throw new Error('No active account');
    }

    try {
      // Encode transactions to base64
      const txnsToSign = txnGroup.map((txn, idx) => {
        const shouldSign = indexesToSign.includes(idx);
        return {
          txn: Buffer.from(txn.toByte()).toString('base64'),
          signers: shouldSign ? [activeAccount.address] : [],
        };
      });

      // Sign with the provider
      const signedTxns = await provider.signTransactions(txnsToSign);

      // Convert back to Uint8Array
      return signedTxns.map((signedTxn) => {
        if (!signedTxn) {
          throw new Error('Transaction signing failed');
        }
        return new Uint8Array(Buffer.from(signedTxn, 'base64'));
      });
    } catch (error) {
      console.error('Failed to sign transactions:', error);
      throw error;
    }
  }, [providers, activeAccount]);

  // Alias for compatibility
  const signTransactions = useCallback(async (
    txnGroup: Transaction[],
    indexesToSign?: number[]
  ): Promise<Uint8Array[]> => {
    const indexes = indexesToSign || txnGroup.map((_, idx) => idx);
    return transactionSigner(txnGroup, indexes);
  }, [transactionSigner]);

  // Create TransactionSignerAccount compatible object
  const transactionSignerAccount = useMemo(() => {
    if (!activeAddress) return null;
    return {
      addr: activeAddress,
      signer: transactionSigner,
    };
  }, [activeAddress, transactionSigner]);

  const value: WalletContextType = {
    activeAccount,
    activeAddress,
    isConnected,
    walletName,
    connectWallet,
    disconnectWallet,
    reconnectWallet,
    signTransactions,
    transactionSigner,
    providers: providers || [],
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}
