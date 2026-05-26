import './Header.css'

/**
 * Header - App header component
 *
 * Features:
 * - Shows user email
 * - Toggle for showing/hiding purchased items
 * - Logout button
 *
 * @param {object} user - Current user object {email, id}
 * @param {function} onSignOut - Callback for logout
 * @param {boolean} showPurchased - Whether purchased items are shown
 * @param {function} onTogglePurchased - Callback to toggle showing purchased items
 * @returns {JSX.Element}
 */
export default function Header({ user, onSignOut, showPurchased = true, onTogglePurchased }) {
  const handleTogglePurchased = () => {
    onTogglePurchased?.(!showPurchased)
  }

  const handleLogout = async () => {
    try {
      await onSignOut?.()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Workshop Einkaufsliste</h1>
        </div>

        <div className="header-controls">
          {/* Purchased items toggle */}
          <div className="toggle-purchased">
            <label htmlFor="show-purchased-toggle" className="toggle-label">
              <input
                id="show-purchased-toggle"
                type="checkbox"
                checked={showPurchased}
                onChange={handleTogglePurchased}
                className="toggle-checkbox"
                aria-label="Gekaufte Artikel anzeigen"
              />
              <span className="toggle-text">Gekaufte anzeigen</span>
            </label>
          </div>

          {/* User info */}
          {user && (
            <div className="user-section">
              <span className="user-email">{user.email}</span>
              <button
                onClick={handleLogout}
                className="btn-logout"
                aria-label="Abmelden"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
