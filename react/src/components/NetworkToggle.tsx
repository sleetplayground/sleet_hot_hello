import { useState, useEffect } from 'react';
import { getCurrentNetworkId } from '../config';

export function NetworkToggle() {
  const [networkId, setNetworkId] = useState<'mainnet' | 'testnet'>('testnet');

  useEffect(() => {
    setNetworkId(getCurrentNetworkId());
  }, []);

  const toggleNetwork = () => {
    const newNetwork = networkId === 'mainnet' ? 'testnet' : 'mainnet';
    localStorage.setItem('networkId', newNetwork);
    setNetworkId(newNetwork);
    // Reload page to reinitialize wallet with new network
    window.location.reload();
  };

  return (
    <button
      onClick={toggleNetwork}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: networkId === 'mainnet' ? '#ff6b6b' : '#4ecdc4',
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      {networkId.toUpperCase()}
    </button>
  );
}