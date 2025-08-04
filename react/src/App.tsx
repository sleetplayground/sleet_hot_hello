import './App.css'
import { WalletButton } from './components/WalletButton'
import { GreetingDisplay } from './components/GreetingDisplay'
import { GreetingUpdate } from './components/GreetingUpdate'
import { NetworkToggle } from './components/NetworkToggle'
import { WalletDebug } from './components/WalletDebug'

function App() {
  return (
    <>
      <NetworkToggle />
      
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>hello.sleet.near</h1>
        </header>

        <GreetingDisplay />
        
        <GreetingUpdate />

        <footer style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>copyright: 2025 by sleet.near</p>
        </footer>
      </article>

      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px' 
      }}>
        <WalletButton />
      </div>

      <WalletDebug />
    </>
  )
}

export default App
