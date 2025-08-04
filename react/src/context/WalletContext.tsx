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
      console.log("Initializing wallet for network:", networkId);

      const walletSelector = new WalletSelector({
        network: networkId
      });

      const walletModal = new WalletSelectorUI(walletSelector);

      setSelector(walletSelector);
      setModal(walletModal as WalletModal);

      // Set up event listeners
      walletSelector.on("wallet:signOut", async () => {
        console.log("Wallet signed out event");
        setWallet(null);
        setIsSignedIn(false);
        setAccountId(null);
      });

      walletSelector.on("wallet:signIn", async (t: SignInEvent) => {
        console.log("Wallet signed in event:", t);
        const connectedWallet = await walletSelector.wallet() as LibraryWallet;
        const address = t.accounts[0].accountId;
        console.log("Connected account:", address);

        setWallet(connectedWallet);
        setIsSignedIn(true);
        setAccountId(address);
      });

      // Check if already signed in - this is crucial for persistence
      try {
        console.log("Checking for existing wallet session...");
        const existingWallet = await walletSelector.wallet() as LibraryWallet;
        console.log("Existing wallet check result:", existingWallet);
        
        if (existingWallet) {
          // The wallet exists, check if it has an accountId
          const accountIdValue = existingWallet.accountId;
          console.log("Wallet accountId:", accountIdValue);
          
          if (accountIdValue) {
            console.log("Restored wallet session:", accountIdValue);
            setWallet(existingWallet);
            setIsSignedIn(true);
            setAccountId(accountIdValue);
          } else {
            console.log("Wallet exists but no accountId");
          }
        } else {
          console.log("No existing wallet found");
        }
      } catch (walletError) {
        console.log("No existing wallet session, error:", walletError);
      }

      setIsLoading(false);
      console.log("Wallet initialized successfully");
    } catch (initError) {
      console.error("Failed to initialize wallet:", initError);
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    if (!modal) {
      console.error('Modal not available');
      return;
    }
    
    try {
      console.log('Attempting to show wallet modal');
      // Based on the HTML version, try show method first
      const modalWithMethods = modal as unknown as { 
        show?: () => void; 
        open?: () => void; 
      };
      
      if (typeof modalWithMethods.show === 'function') {
        console.log('Using modal.show()');
        modalWithMethods.show();
      } else if (typeof modalWithMethods.open === 'function') {
        console.log('Using modal.open()');
        modalWithMethods.open();
      } else {
        console.log('Fallback: trying show method');
        // Force call show method as last resort
        (modalWithMethods as any).show();
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

  // Manual refresh function similar to HTML version
  const refreshWalletState = async () => {
    if (!selector) return null;
    
    try {
      console.log("Manually refreshing wallet state...");
      const wallet = await selector.wallet() as LibraryWallet;
      if (wallet && wallet.accountId) {
        console.log("Manual refresh - wallet found:", wallet.accountId);
        setWallet(wallet);
        setIsSignedIn(true);
        setAccountId(wallet.accountId);
        return wallet;
      } else {
        console.log("Manual refresh - no wallet");
        setWallet(null);
        setIsSignedIn(false);
        setAccountId(null);
        return null;
      }
    } catch (error) {
      console.log("Manual refresh - error:", error);
      setWallet(null);
      setIsSignedIn(false);
      setAccountId(null);
      return null;
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
      refreshWalletState,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

