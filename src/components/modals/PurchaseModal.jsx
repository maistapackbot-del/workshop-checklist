import { useState } from 'react'

/**
 * PurchaseModal - First step in purchase flow: confirm purchase with optional notes
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {function} onConfirm - Callback with purchase confirmation {notes}
 * @param {string} productName - Name of product being purchased
 * @param {boolean} isLoading - Whether purchase is being processed
 */
export default function PurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  productName = 'Produkt',
  isLoading = false
}) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    try {
      onConfirm({
        notes: notes.trim()
      })
      resetForm()
    } catch (err) {
      setError(err.message || 'Fehler beim Bestätigen des Kaufs')
    }
  }

  const resetForm = () => {
    setNotes('')
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
          <h2>Kauf bestätigen</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="purchase-confirmation">
            Ist "{productName}" gekauft?
          </p>

          <div className="form-group">
            <label htmlFor="purchase-notes">Notizen (optional):</label>
            <textarea
              id="purchase-notes"
              placeholder="z.B. Rechnungsnummer, Bestelldatum, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows="3"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Wird verarbeitet...' : 'Ja, gekauft'}
          </button>
        </div>
      </div>
    </div>
  )
}
