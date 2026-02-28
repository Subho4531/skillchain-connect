'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Transaction } from 'algosdk';
import LuteConnect from '@/lib/lute-connect';

export interface WalletAccount {
  name: string;
  address: string;
}

interface WalletContextType {
  // Wallet state
  activeAccount: WalletAccount | null;
  activeAddress: string | null;
  isConnected: boolean;
  walletName: string | null;

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  reconnectWallet: () => Promise<void>;

  // Transaction signing
  signTransactions: (txnGroup: Transaction[], indexesToSign?: number[]) => Promise<Uint8Array[]>;
  transactionSigner: (txnGroup: Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>;

  // Providers (empty since we only use Lute directly now)
  providers: any[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const luteConnect = new LuteConnect("SkillchainConnect");
const TESTNET_GENESIS_ID = "testnet-v1.0";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<WalletAccount | null>(null);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('luteWalletAddress');
    if (savedAddress) {
      setActiveAddress(savedAddress);
      setActiveAccount({ name: 'Lute', address: savedAddress });
      setIsConnected(true);
      setWalletName('Lute');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const addrs = await luteConnect.connect(TESTNET_GENESIS_ID);
      if (addrs && addrs.length > 0) {
        const address = addrs[0];
        setActiveAddress(address);
        setActiveAccount({ name: 'Lute', address });
        setIsConnected(true);
        setWalletName('Lute');
        localStorage.setItem('luteWalletAddress', address);
      }
    } catch (error) {
      console.error('Failed to connect Lute wallet:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setActiveAddress(null);
    setActiveAccount(null);
    setIsConnected(false);
    setWalletName(null);
    localStorage.removeItem('luteWalletAddress');
  }, []);

  const reconnectWallet = useCallback(async () => {
    // Handled by the initialization useEffect
  }, []);

  const transactionSigner = useCallback(async (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ): Promise<Uint8Array[]> => {
    if (!activeAddress) {
      throw new Error('No active account');
    }

    try {
      // Encode transactions to base64
      const txnsToSign = txnGroup.map((txn, idx) => {
        const shouldSign = indexesToSign.includes(idx);
        return {
          txn: Buffer.from(txn.toByte()).toString('base64'),
          signers: shouldSign ? [activeAddress] : [],
        };
      });

      // Sign with Lute
      const signedTxns = await luteConnect.signTxns(txnsToSign);

      // Convert back to Uint8Array 
      // AlgoKit TransactionSigner returns an array containing only the signed transactions
      const result: Uint8Array[] = [];
      signedTxns.forEach((signedTxn, idx) => {
        if (indexesToSign.includes(idx)) {
          if (!signedTxn) {
            throw new Error(`Transaction at index ${idx} signing failed (returned null)`);
          }
          result.push(new Uint8Array(signedTxn));
        }
      });
      return result;
    } catch (error) {
      console.error('Failed to sign transactions:', error);
      throw error;
    }
  }, [activeAddress]);

  const signTransactions = useCallback(async (
    txnGroup: Transaction[],
    indexesToSign?: number[]
  ): Promise<Uint8Array[]> => {
    const indexes = indexesToSign || txnGroup.map((_, idx) => idx);
    return transactionSigner(txnGroup, indexes);
  }, [transactionSigner]);

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
    providers: [],
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
