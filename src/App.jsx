import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import './styles/App.css'

export default function App() {
  const { user, loading, error, signUp, signIn, signOut } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateForm = () => {
    const errors = []

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Gültige Email erforderlich')
    }

    // Password validation
    if (password.length < 6) {
      errors.push('Passwort muss mindestens 6 Zeichen lang sein')
    }

    if (errors.length > 0) {
      setAuthError(errors[0])
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setEmail('')
        setPassword('')
        setIsSignUp(false)
      } else {
        await signIn(email, password)
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="app"><div className="loading">Loading...</div></div>
  }

  if (!user) {
    return (
      <div className="app">
        <div className="login-page">
          <h1>🛠️ Workshop Einkaufsliste</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Passwort (min. 6 Zeichen)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            {authError && <p className="error-text">{authError}</p>}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Wird verarbeitet...' : isSignUp ? 'Registrieren' : 'Anmelden'}
            </button>
          </form>
          <p className="auth-toggle">
            {isSignUp ? 'Bereits registriert? ' : 'Noch kein Konto? '}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={submitting}
            >
              {isSignUp ? 'Anmelden' : 'Registrieren'}
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="dashboard">
        <header className="app-header">
          <h1>🛠️ Workshop Einkaufsliste</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={signOut} className="btn-logout">
              Abmelden
            </button>
          </div>
        </header>
        <main>
          <p>Dashboard kommt bald...</p>
        </main>
      </div>
    </div>
  )
}
