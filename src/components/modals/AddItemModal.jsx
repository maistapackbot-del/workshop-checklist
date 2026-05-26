import { useState } from 'react'

/**
 * AddItemModal - Modal to add new checklist items (hauptpunkt, kategorie, or produkt)
 *
 * @param {string} type - Item type (hauptpunkt, kategorie, produkt)
 * @param {string} parentId - Parent item ID (for kategorie/produkt)
 * @param {function} onSave - Callback with name when item is created
 * @param {function} onClose - Callback when modal should close
 */
export default function AddItemModal({
  type,
  parentId,
  onSave,
  onClose
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getTypeLabel = () => {
    const labels = {
      hauptpunkt: 'Hauptpunkt',
      kategorie: 'Kategorie',
      produkt: 'Produkt'
    }
    return labels[type] || type
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name erforderlich')
      return
    }

    if (name.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein')
      return
    }

    setLoading(true)
    try {
      await onSave(name.trim())
      setName('')
      onClose()
    } catch (err) {
      setError(err.message || 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Neues {getTypeLabel()} hinzufügen</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="item-name">{getTypeLabel()} Name:</label>
            <input
              id="item-name"
              type="text"
              placeholder={`z.B. ${
                type === 'hauptpunkt'
                  ? 'Elektrowerkzeuge'
                  : type === 'kategorie'
                  ? 'Bohrschrauber'
                  : 'DeWalt 18V'
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Wird erstellt...' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
