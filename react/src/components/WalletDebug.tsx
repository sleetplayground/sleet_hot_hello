import { useWallet } from '../hooks/useWallet';

export function WalletDebug() {
  const { wallet, isSignedIn, accountId, isLoading, refreshWalletState } = useWallet();

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '200px',
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Debug Info:</div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Signed In: {isSignedIn ? 'true' : 'false'}</div>
      <div>Account ID: {accountId || 'null'}</div>
      <div>Wallet: {wallet ? 'exists' : 'null'}</div>
      <div>Wallet AccountId: {wallet?.accountId || 'null'}</div>
      <button 
        onClick={refreshWalletState}
        style={{
          marginTop: '5px',
          padding: '2px 6px',
          fontSize: '10px',
          background: '#333',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        Refresh
      </button>
    </div>
  );
}