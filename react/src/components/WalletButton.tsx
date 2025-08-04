import { useWallet } from '../hooks/useWallet';

export function WalletButton() {
  const { isSignedIn, accountId, isLoading, signIn, signOut } = useWallet();

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button
      onClick={isSignedIn ? signOut : signIn}
      style={{
        backgroundColor: isSignedIn ? '#4CAF50' : '',
        padding: '10px 20px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      title={isSignedIn ? `Logged in as ${accountId}` : 'Connect your NEAR wallet'}
    >
      {isSignedIn ? 'LOGOUT' : 'LOGIN'}
    </button>
  );
}