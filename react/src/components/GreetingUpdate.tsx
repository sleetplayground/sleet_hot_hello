import { useState } from 'react';
import { useGreeting } from '../hooks/useGreeting';
import { useNearWallet } from '../hooks/useNearWallet';

export function GreetingUpdate() {
  const [newGreeting, setNewGreeting] = useState('');
  const { updateGreeting, isLoading } = useGreeting();
  const { wallet, isSignedIn } = useNearWallet();

  const handleUpdate = async () => {
    if (!newGreeting.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!isSignedIn) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await updateGreeting(newGreeting, wallet);
      setNewGreeting('');
      alert('Greeting updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <section style={{ margin: '20px 0', textAlign: 'center' }}>
      <input
        type="text"
        value={newGreeting}
        onChange={(e) => setNewGreeting(e.target.value)}
        placeholder="Enter new greeting"
        disabled={isLoading}
        style={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginRight: '10px',
          width: '200px',
        }}
      />
      <br />
      <br />
      <button
        onClick={handleUpdate}
        disabled={isLoading || !isSignedIn}
        style={{
          padding: '10px 20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: isLoading || !isSignedIn ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading || !isSignedIn ? '#f0f0f0' : '',
        }}
      >
        {isLoading ? 'Processing...' : 'Update Greeting'}
      </button>
      {!isSignedIn && (
        <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
          Connect your wallet to update the greeting
        </p>
      )}
    </section>
  );
}