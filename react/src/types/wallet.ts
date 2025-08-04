// NEAR Wallet types
export interface WalletAccount {
  accountId: string;
}

export interface SignInEvent {
  accounts: WalletAccount[];
}

export interface TransactionAction {
  type: 'FunctionCall';
  params: {
    methodName: string;
    args: Record<string, unknown>;
    gas: string;
    deposit: string;
  };
}

export interface TransactionParams {
  signerId: string;
  receiverId: string;
  actions: TransactionAction[];
}

// Wallet interface that matches the hot-labs/near-connect library
export interface NearWallet {
  accountId?: string;
  signOut(): Promise<void>;
  signAndSendTransaction(params: TransactionParams): Promise<unknown>;
}

// Modal interface for the wallet selector UI
export interface WalletModal {
  show?: () => void;
  open?: () => void;
}

// Library wallet type (what we actually get from the selector)
export interface LibraryWallet {
  accountId?: string;
  signOut(): Promise<void>;
  signAndSendTransaction(params: TransactionParams): Promise<unknown>;
}