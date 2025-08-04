import { createContext } from 'react';
import { WalletSelector } from "@hot-labs/near-connect";
import type { NearWallet } from '../types/wallet';

export interface WalletContextType {
  wallet: NearWallet | null;
  isSignedIn: boolean;
  accountId: string | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  selector: WalletSelector | null;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);