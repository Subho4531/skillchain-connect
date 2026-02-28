import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  isConnecting: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

// For MVP: simulate wallet connection. Replace with @txnlab/use-wallet for production.
const ADMIN_WALLET = "ADMIN_WALLET_PLACEHOLDER";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isAdmin: false,
    isConnecting: false,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true }));
    try {
      // Check if PeraWallet is available
      if (typeof window !== "undefined" && (window as any).algorand) {
        const accounts = await (window as any).algorand.enable();
        const addr = accounts[0];
        const isAdmin = addr === ADMIN_WALLET;

        // Upsert user in DB
        await supabase.from("users").upsert(
          { wallet_address: addr, role: isAdmin ? "admin" : "student" },
          { onConflict: "wallet_address" }
        );

        setState({ address: addr, isConnected: true, isAdmin, isConnecting: false });
        return;
      }

      // Demo mode: generate a mock wallet address
      const mockAddr = "DEMO" + Array.from({ length: 54 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[Math.floor(Math.random() * 32)]).join("");
      
      await supabase.from("users").upsert(
        { wallet_address: mockAddr, role: "student" },
        { onConflict: "wallet_address" }
      );

      setState({ address: mockAddr, isConnected: true, isAdmin: false, isConnecting: false });
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, isConnected: false, isAdmin: false, isConnecting: false });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
