import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";
import { getCurrentNetworkId } from '../config';
import type { SignInEvent, NearWallet, WalletModal, LibraryWallet } from '../types/wallet';
import { WalletContext } from './WalletContext';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<NearWallet | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletModal | null>(null);

  useEffect(() => {
    initWallet();
  }, []);

  const initWallet = async () => {
    try {
      const networkId = getCurrentNetworkId();

      const walletSelector = new WalletSelector({
        network: networkId
      });

      const walletModal = new WalletSelectorUI(walletSelector);

      setSelector(walletSelector);
      setModal(walletModal as WalletModal);

      // Set up event listeners
      walletSelector.on("wallet:signOut", async () => {
        console.log("Wallet signed out");
        setWallet(null);
        setIsSignedIn(false);
        setAccountId(null);
      });

      walletSelector.on("wallet:signIn", async (t: SignInEvent) => {
        console.log("Wallet signed in:", t);
        const connectedWallet = await walletSelector.wallet() as LibraryWallet;
        const address = t.accounts[0].accountId;
        console.log("Connected account:", address);

        setWallet(connectedWallet);
        setIsSignedIn(true);
        setAccountId(address);
      });

      // Check if already signed in - this is crucial for persistence
      try {
        const existingWallet = await walletSelector.wallet() as LibraryWallet;
        if (existingWallet && existingWallet.accountId) {
          console.log("Restored wallet session:", existingWallet.accountId);
          setWallet(existingWallet);
          setIsSignedIn(true);
          setAccountId(existingWallet.accountId);
        }
      } catch {
        console.log("No existing wallet session");
      }

      setIsLoading(false);
      console.log("Wallet initialized successfully");
    } catch (initError) {
      console.error("Failed to initialize wallet:", initError);
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    if (!modal) return;
    
    try {
      // Try different methods that might be available
      if (modal.show) {
        modal.show();
      } else if (modal.open) {
        modal.open();
      } else {
        // Fallback - cast to any for unknown methods
        (modal as unknown as { show: () => void }).show();
      }
    } catch (signInError) {
      console.error('Sign in error:', signInError);
    }
  };

  const signOut = async () => {
    if (!wallet) return;

    try {
      await wallet.signOut();
      setWallet(null);
      setIsSignedIn(false);
      setAccountId(null);
    } catch (signOutError) {
      console.error("SignOut failed:", signOutError);
      // Force logout
      setWallet(null);
      setIsSignedIn(false);
      setAccountId(null);
      window.location.reload();
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      isSignedIn,
      accountId,
      isLoading,
      signIn,
      signOut,
      selector,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

