# NEAR Connect - Complete dApp Integration Guide

## Overview

NEAR Connect is a zero-dependency, secure wallet connector for the NEAR blockchain that provides an easily updatable wallet ecosystem. Unlike near-wallet-selector, it executes wallet code in isolated sandboxed environments for enhanced security.

## Installation

```bash
yarn add @hot-labs/near-connect
# or
npm install @hot-labs/near-connect
```

## Basic Integration

### 1. Initialize the Connector

```typescript
import { NearConnector } from "@hot-labs/near-connect";

const connector = new NearConnector({ 
  network: "mainnet" // or "testnet"
});
```

### 2. Set Up Event Listeners

```typescript
// Listen for wallet sign-in events
connector.on("wallet:signIn", async (event) => {
  const wallet = await connector.wallet();
  const accountId = event.accounts[0].accountId;
  
  console.log("User signed in:", accountId);
  // Update your app state
  setUserAccount(accountId);
});

// Listen for wallet sign-out events
connector.on("wallet:signOut", async () => {
  console.log("User signed out");
  // Clear user state
  setUserAccount(null);
});
```

## Advanced Configuration

### Filter Wallets by Features

```typescript
const connector = new NearConnector({
  network: "mainnet",
  features: { 
    signMessage: true,
    testnet: true,
    signAndSendTransaction: true
  }
});
```

### Custom Manifest for Development

```typescript
const connector = new NearConnector({
  network: "testnet",
  manifest: customManifest, // Your custom wallet manifest
  logger: console // Enable logging for debugging
});
```

## Wallet Operations

### Get Connected Wallet

```typescript
const wallet = await connector.wallet();
```

### Sign Messages

```typescript
const message = "Hello NEAR!";
const signature = await wallet.signMessage({
  message,
  recipient: "example.near"
});
```

### Sign and Send Transactions

```typescript
const transaction = {
  receiverId: "contract.near",
  actions: [{
    type: "FunctionCall",
    params: {
      methodName: "my_method",
      args: { key: "value" },
      gas: "30000000000000",
      deposit: "0"
    }
  }]
};

const result = await wallet.signAndSendTransaction(transaction);
```

### Sign Multiple Transactions

```typescript
const transactions = [transaction1, transaction2];
const results = await wallet.signAndSendTransactions(transactions);
```

## Multichain Integration with HotConnector

For applications requiring multiple blockchain support:

```typescript
import { HotConnector, WalletType } from "@hot-labs/near-connect";
import { TonConnectUI, TonConnect } from "@tonconnect/ui";
import { createAppKit } from "@reown/appkit";

const multichainConnector = new HotConnector({
  chains: [WalletType.NEAR, WalletType.EVM, WalletType.SOLANA, WalletType.TON],

  onConnect: async (wallet) => {
    const address = await wallet.getAddress();
    setWallets(prev => ({ ...prev, [wallet.type]: address }));
  },

  onDisconnect: (type) => {
    setWallets(prev => ({ ...prev, [type]: null }));
  },

  // NEAR configuration
  nearConnector: new NearConnector({
    network: "mainnet",
    logger: console,
  }),

  // TON configuration
  tonConnect: new TonConnectUI({ 
    connector: new TonConnect(), 
    buttonRootId: "ton-connect" 
  }),

  // EVM and Solana configuration via Reown
  appKit: createAppKit({
    adapters: [new EthersAdapter(), new SolanaAdapter()],
    networks: [mainnet, solana, base, bsc],
    projectId: "your-project-id",
    metadata: {
      name: "Your dApp Name",
      description: "Your dApp Description",
      url: "https://yourdapp.com",
      icons: ["https://yourdapp.com/icon.png"],
    },
  }),
});
```

## Error Handling

```typescript
try {
  const wallet = await connector.wallet();
  const result = await wallet.signAndSendTransaction(transaction);
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    console.log('User rejected the transaction');
  } else if (error.code === 'WALLET_NOT_CONNECTED') {
    console.log('Please connect your wallet first');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## React Integration Example

```typescript
import React, { useState, useEffect } from 'react';
import { NearConnector } from "@hot-labs/near-connect";

const App = () => {
  const [connector] = useState(() => new NearConnector({ network: "mainnet" }));
  const [account, setAccount] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    connector.on("wallet:signIn", async (event) => {
      const walletInstance = await connector.wallet();
      setWallet(walletInstance);
      setAccount(event.accounts[0].accountId);
    });

    connector.on("wallet:signOut", () => {
      setWallet(null);
      setAccount(null);
    });
  }, [connector]);

  const handleSignIn = async () => {
    // Trigger wallet selection modal
    await connector.signIn();
  };

  const handleSignOut = async () => {
    if (wallet) {
      await wallet.signOut();
    }
  };

  const handleSignMessage = async () => {
    if (wallet) {
      try {
        const signature = await wallet.signMessage({
          message: "Hello from my dApp!",
          recipient: account
        });
        console.log("Message signed:", signature);
      } catch (error) {
        console.error("Failed to sign message:", error);
      }
    }
  };

  return (
    <div>
      {account ? (
        <div>
          <p>Connected as: {account}</p>
          <button onClick={handleSignMessage}>Sign Message</button>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Connect Wallet</button>
      )}
    </div>
  );
};

export default App;
```

## Security Considerations

### Sandboxed Execution
- All wallet scripts run in isolated sandboxed iframes
- Wallets cannot access localStorage directly
- Limited permissions system controls wallet capabilities

### Permissions Validation
Always verify wallet permissions match your requirements:

```typescript
const connector = new NearConnector({
  network: "mainnet",
  features: {
    signMessage: true,
    signAndSendTransaction: true,
    // Only show wallets that support required features
  }
});
```

## Wallet Manifest Structure

Each wallet provides a manifest with capabilities and permissions:

```json
{
  "id": "wallet-id",
  "version": "1.0.0",
  "name": "Wallet Name",
  "description": "Wallet description",
  "icon": "https://wallet.com/icon.png",
  "website": "https://wallet.com",
  "executor": "https://wallet.com/connector.js",
  "type": "sandbox",
  "features": {
    "signMessage": true,
    "signTransaction": true,
    "signAndSendTransaction": true,
    "testnet": false
  },
  "permissions": {
    "storage": true,
    "open": {
      "allows": ["https://wallet.com"]
    }
  }
}
```

## Migration from near-wallet-selector

### Key Differences
1. **Security**: Sandboxed execution vs direct code inclusion
2. **Updates**: Automatic wallet updates vs manual package updates  
3. **Maintenance**: Wallet-managed vs centrally maintained code

### Migration Steps
1. Replace `@near-wallet-selector/core` with `@hot-labs/near-connect`
2. Update initialization code to use `NearConnector`
3. Update event listeners to new event names
4. Test wallet functionality with your existing flows

### API Compatibility
The wallet API remains largely compatible with near-wallet-selector:

```typescript
// Both libraries support similar methods
await wallet.signIn();
await wallet.signOut();
await wallet.signAndSendTransaction(transaction);
await wallet.signMessage(message);
```

## Troubleshooting

### Common Issues

1. **Wallet not appearing**: Check feature requirements match wallet capabilities
2. **Connection failures**: Verify network configuration (mainnet/testnet)
3. **Transaction errors**: Ensure proper gas and deposit amounts
4. **Sandbox errors**: Check wallet permissions in manifest

### Debug Mode

```typescript
const connector = new NearConnector({
  network: "testnet",
  logger: console, // Enable detailed logging
});
```

## Best Practices

1. **Always handle errors gracefully**
2. **Validate user input before transactions**
3. **Use appropriate gas limits**
4. **Implement proper loading states**
5. **Test on both mainnet and testnet**
6. **Keep wallet connections persistent across page reloads**
7. **Implement proper cleanup on component unmount**

## Support and Resources

- **Repository**: Check the `repository/` folder for wallet implementations
- **Examples**: See `example/` and `basic-example/` folders
- **CDN Builds**: Available in `cdn/` folder for direct browser usage
- **TypeScript**: Full TypeScript support with type definitions

This integration guide covers the complete implementation of NEAR Connect in your dApp, from basic setup to advanced multichain configurations.