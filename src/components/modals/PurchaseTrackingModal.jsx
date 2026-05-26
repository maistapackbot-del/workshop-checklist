import { useState } from 'react'

/**
 * PurchaseTrackingModal - Second step: enter tracking information
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {function} onAddTracking - Callback with tracking data {trackingUrl, carrier}
 * @param {function} onSkip - Callback to skip tracking
 * @param {boolean} isLoading - Whether tracking is being processed
 */
export default function PurchaseTrackingModal({
  isOpen,
  onClose,
  onAddTracking,
  onSkip,
  isLoading = false
}) {
  const [trackingUrl, setTrackingUrl] = useState('')
  const [carrier, setCarrier] = useState('dhl')
  const [error, setError] = useState('')

  const carriers = [
    { value: 'dhl', label: 'DHL' },
    { value: 'dpdhl', label: 'Deutsche Post DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'gls', label: 'GLS' },
    { value: 'hermes', label: 'Hermes' },
    { value: 'other', label: 'Sonstige' }
  ]

  const handleAddTracking = () => {
    if (!trackingUrl.trim()) {
      setError('Tracking-URL erforderlich')
      return
    }

    try {
      new URL(trackingUrl)
    } catch {
      setError('Gültige URL erforderlich')
      return
    }

    onAddTracking({
      trackingUrl: trackingUrl.trim(),
      carrier
    })
    resetForm()
  }

  const handleSkip = () => {
    resetForm()
    onSkip()
  }

  const resetForm = () => {
    setTrackingUrl('')
    setCarrier('dhl')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Versand-Tracking hinzufügen</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-info">Versandverfolgung hinzufügen (optional):</p>

          <div className="form-group">
            <label htmlFor="tracking-url">Tracking-URL:</label>
            <input
              id="tracking-url"
              type="url"
              placeholder="https://tracking.carrier.com/123456"
              value={trackingUrl}
              onChange={(e) => {
                setTrackingUrl(e.target.value)
                setError('')
              }}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="carrier-select">Versandunternehmen:</label>
            <select
              id="carrier-select"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              disabled={isLoading}
            >
              {carriers.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Überspringen
          </button>
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button
            className="btn-primary"
            onClick={handleAddTracking}
            disabled={isLoading || !trackingUrl.trim()}
          >
            {isLoading ? 'Wird hinzugefügt...' : 'Tracking hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}
