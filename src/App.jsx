import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useChecklist } from './hooks/useChecklist'
import { useImageScraping } from './hooks/useImageScraping'
import Header from './components/Header'
import MainPointList from './components/MainPointList'
import AddItemModal from './components/modals/AddItemModal'
import AddLinkModal from './components/modals/AddLinkModal'
import PurchaseModal from './components/modals/PurchaseModal'
import PurchaseTrackingModal from './components/modals/PurchaseTrackingModal'
import './styles/App.css'

export default function App() {
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    mainPoints,
    categories,
    products,
    links,
    loading: checklistLoading,
    error: checklistError,
    showPurchased,
    setShowPurchased,
    createMainPoint,
    createCategory,
    createProduct,
    addProductLink,
    markPurchased,
    deleteItem
  } = useChecklist()

  const { scrapeUrl, loading: scrapingLoading } = useImageScraping()

  // Modal states
  const [modals, setModals] = useState({
    addItem: { open: false, type: null, parentId: null },
    addLink: { open: false, productId: null },
    purchase: { open: false, productId: null },
    purchaseTracking: { open: false, linkId: null }
  })

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

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <div className="login-page">
          <h1>Workshop Einkaufsliste</h1>
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

  if (checklistLoading) {
    return (
      <div className="app">
        <Header user={user} onSignOut={signOut} showPurchased={showPurchased} onTogglePurchased={setShowPurchased} />
        <div className="loading">Loading checklists...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header
        user={user}
        onSignOut={signOut}
        showPurchased={showPurchased}
        onTogglePurchased={setShowPurchased}
      />

      <main className="dashboard">
        <div className="dashboard-header">
          <h2>Meine Einkaufslisten</h2>
          <button
            className="btn-primary"
            onClick={() =>
              setModals(prev => ({
                ...prev,
                addItem: { open: true, type: 'hauptpunkt', parentId: null }
              }))
            }
          >
            + Hauptpunkt
          </button>
        </div>

        {checklistError && <div className="error-message">{checklistError}</div>}

        <MainPointList
          mainPoints={mainPoints}
          categories={categories}
          products={products}
          links={links}
          showPurchased={showPurchased}
          onAddCategory={(mainPointId) =>
            setModals(prev => ({
              ...prev,
              addItem: { open: true, type: 'kategorie', parentId: mainPointId }
            }))
          }
          onAddProduct={(parentId) =>
            setModals(prev => ({
              ...prev,
              addItem: { open: true, type: 'produkt', parentId }
            }))
          }
          onAddLink={(productId) =>
            setModals(prev => ({
              ...prev,
              addLink: { open: true, productId }
            }))
          }
          onPurchase={(productId) =>
            setModals(prev => ({
              ...prev,
              purchase: { open: true, productId }
            }))
          }
          onRemove={deleteItem}
        />
      </main>

      {/* Add Item Modal */}
      {modals.addItem.open && (
        <AddItemModal
          type={modals.addItem.type}
          parentId={modals.addItem.parentId}
          onSave={async (name) => {
            try {
              if (modals.addItem.type === 'hauptpunkt') {
                await createMainPoint(name)
              } else if (modals.addItem.type === 'kategorie') {
                await createCategory(modals.addItem.parentId, name)
              } else {
                await createProduct(modals.addItem.parentId, name)
              }
              setModals(prev => ({ ...prev, addItem: { open: false } }))
            } catch (err) {
              console.error('Error creating item:', err)
            }
          }}
          onClose={() => setModals(prev => ({ ...prev, addItem: { open: false } }))}
        />
      )}

      {/* Add Link Modal */}
      {modals.addLink.open && (
        <AddLinkModal
          productId={modals.addLink.productId}
          onSave={async (url, metadata) => {
            try {
              await addProductLink(modals.addLink.productId, url, metadata)
              setModals(prev => ({ ...prev, addLink: { open: false } }))
            } catch (err) {
              console.error('Error adding link:', err)
            }
          }}
          onClose={() => setModals(prev => ({ ...prev, addLink: { open: false } }))}
          scrapeUrl={scrapeUrl}
          scrapingLoading={scrapingLoading}
        />
      )}

      {/* Purchase Modal */}
      {modals.purchase.open && (
        <PurchaseModal
          onConfirm={async (notes) => {
            try {
              await markPurchased(modals.purchase.productId, notes)
              setModals(prev => ({
                ...prev,
                purchase: { open: false },
                purchaseTracking: { open: true, linkId: modals.purchase.productId }
              }))
            } catch (err) {
              console.error('Error marking purchased:', err)
            }
          }}
          onCancel={() => setModals(prev => ({ ...prev, purchase: { open: false } }))}
        />
      )}

      {/* Purchase Tracking Modal */}
      {modals.purchaseTracking.open && (
        <PurchaseTrackingModal
          onSave={async (trackingUrl, carrier) => {
            // Note: This will be implemented with the tracking link functionality
            setModals(prev => ({ ...prev, purchaseTracking: { open: false } }))
          }}
          onSkip={() => setModals(prev => ({ ...prev, purchaseTracking: { open: false } }))}
        />
      )}
    </div>
  )
}
