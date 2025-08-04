import { useGreeting } from '../hooks/useGreeting';

export function GreetingDisplay() {
  const { greeting, isLoading, error, fetchGreeting } = useGreeting();

  return (
    <section style={{ margin: '20px 0', textAlign: 'center' }}>
      <h3 style={{ minHeight: '24px' }}>
        {greeting || 'Click "GET GREETING" to fetch the current greeting'}
      </h3>
      <br />
      <button
        onClick={fetchGreeting}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#f0f0f0' : '',
        }}
      >
        {isLoading ? 'Loading...' : 'GET GREETING'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </p>
      )}
    </section>
  );
}