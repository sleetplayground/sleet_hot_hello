import { useState, useEffect } from 'react';
import { WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";
import { getCurrentNetworkId } from '../config';

interface WalletState {
  wallet: any | null;
  isSignedIn: boolean;
  accountId: string | null;
  isLoading: boolean;
}

export function useNearWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    isSignedIn: false,
    accountId: null,
    isLoading: true,
  });
  
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorUI | null>(null);

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
      setModal(walletModal);

      // Set up event listeners
      walletSelector.on("wallet:signOut", async () => {
        console.log("Wallet signed out");
        setWalletState({
          wallet: null,
          isSignedIn: false,
          accountId: null,
          isLoading: false,
        });
      });

      walletSelector.on("wallet:signIn", async (t) => {
        console.log("Wallet signed in:", t);
        const wallet = await walletSelector.wallet();
        const address = t.accounts[0].accountId;
        console.log("Connected account:", address);

        setWalletState({
          wallet,
          isSignedIn: true,
          accountId: address,
          isLoading: false,
        });
      });

      // Check if already signed in
      try {
        const wallet = await walletSelector.wallet();
        if (wallet && wallet.accountId) {
          setWalletState({
            wallet,
            isSignedIn: true,
            accountId: wallet.accountId,
            isLoading: false,
          });
        } else {
          setWalletState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.log("No wallet connected yet");
        setWalletState(prev => ({ ...prev, isLoading: false }));
      }

      console.log("Wallet initialized successfully");
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async () => {
    if (!modal) return;
    
    try {
      if (typeof modal.show === 'function') {
        modal.show();
      } else if (typeof modal.open === 'function') {
        modal.open();
      } else {
        modal.show();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    if (!walletState.wallet) return;

    try {
      await walletState.wallet.signOut();
      setWalletState({
        wallet: null,
        isSignedIn: false,
        accountId: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("SignOut failed:", error);
      // Force logout
      setWalletState({
        wallet: null,
        isSignedIn: false,
        accountId: null,
        isLoading: false,
      });
      window.location.reload();
    }
  };

  return {
    ...walletState,
    signIn,
    signOut,
    selector,
  };
}