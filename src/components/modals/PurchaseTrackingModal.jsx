import { useState } from 'react'

/**
 * PurchaseTrackingModal - Add tracking information for purchase
 *
 * @param {string} productId - Product ID
 * @param {array} productLinks - Links for this product
 * @param {function} onSave - Callback(trackingUrl, carrier, linkId) when tracking is added
 * @param {function} onSkip - Callback to skip tracking
 */
export default function PurchaseTrackingModal({
  productId,
  productLinks = [],
  onSave,
  onSkip
}) {
  const [selectedLinkId, setSelectedLinkId] = useState(productLinks[0]?.id || '')
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
    if (!selectedLinkId) {
      setError('Link erforderlich')
      return
    }

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

    onSave(trackingUrl.trim(), carrier, selectedLinkId)
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

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Versand-Tracking hinzufügen</h2>
          <button
            className="modal-close-btn"
            onClick={handleSkip}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-info">Versandverfolgung hinzufügen (optional):</p>

          {productLinks.length > 0 && (
            <div className="form-group">
              <label htmlFor="link-select">Produkt-Link:</label>
              <select
                id="link-select"
                value={selectedLinkId}
                onChange={(e) => {
                  setSelectedLinkId(e.target.value)
                  setError('')
                }}
              >
                <option value="">Wähle einen Link...</option>
                {productLinks.map(link => (
                  <option key={link.id} value={link.id}>
                    {link.title || link.url}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            />
          </div>

          <div className="form-group">
            <label htmlFor="carrier-select">Versandunternehmen:</label>
            <select
              id="carrier-select"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
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
          >
            Überspringen
          </button>
          <button
            className="btn-primary"
            onClick={handleAddTracking}
            disabled={!trackingUrl.trim()}
          >
            Tracking hinzufügen
          </button>
        </div>
      </div>
    </div>
  )
}
