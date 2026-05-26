import { useState, useEffect } from 'react'
import './styles/App.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="app">
      {!isLoggedIn ? (
        <div className="login-page">
          <h1>🛠️ Workshop Einkaufsliste</h1>
          <button onClick={() => setIsLoggedIn(true)}>
            Anmelden / Registrieren
          </button>
        </div>
      ) : (
        <div className="dashboard">
          <p>Dashboard kommt bald...</p>
        </div>
      )}
    </div>
  )
}
