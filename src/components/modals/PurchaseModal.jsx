import { useState } from 'react'

/**
 * PurchaseModal - Confirm purchase with optional notes
 *
 * @param {function} onConfirm - Callback(notes) when purchase is confirmed
 * @param {function} onCancel - Callback when modal should close
 */
export default function PurchaseModal({
  onConfirm,
  onCancel
}) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    try {
      onConfirm(notes.trim())
      resetForm()
    } catch (err) {
      setError(err.message || 'Fehler beim Bestätigen des Kaufs')
    }
  }

  const resetForm = () => {
    setNotes('')
    setError('')
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Kauf bestätigen</h2>
          <button
            className="modal-close-btn"
            onClick={handleCancel}
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
              rows="3"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleCancel}
          >
            Abbrechen
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
          >
            Ja, gekauft
          </button>
        </div>
      </div>
    </div>
  )
}
