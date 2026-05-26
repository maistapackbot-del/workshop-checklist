import { useState } from 'react'

/**
 * AddItemModal - Modal to add new checklist items (hauptpunkt, kategorie, or produkt)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {function} onAddItem - Callback with item data {name, type, parentId}
 * @param {array} parentItems - Available parent items for selection
 * @param {boolean} isLoading - Whether item is being created
 */
export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  parentItems = [],
  isLoading = false
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('produkt')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')

  const itemTypes = [
    { value: 'hauptpunkt', label: 'Hauptpunkt' },
    { value: 'kategorie', label: 'Kategorie' },
    { value: 'produkt', label: 'Produkt' }
  ]

  const handleTypeChange = (newType) => {
    setType(newType)
    setParentId('')
    setError('')
  }

  const handleAddItem = () => {
    if (!name.trim()) {
      setError('Name erforderlich')
      return
    }

    if (name.trim().length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein')
      return
    }

    if (type !== 'hauptpunkt' && !parentId) {
      setError('Bitte wählen Sie ein übergeordnetes Element')
      return
    }

    const itemData = {
      name: name.trim(),
      type,
      parentId: type === 'hauptpunkt' ? null : parentId
    }

    onAddItem(itemData)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setType('produkt')
    setParentId('')
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
          <h2>Neues Element hinzufügen</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="item-name">Name:</label>
            <input
              id="item-name"
              type="text"
              placeholder="z.B. Elektrowerkzeuge, Bohrschrauber"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="item-type">Typ:</label>
            <div className="type-buttons">
              {itemTypes.map(itemType => (
                <button
                  key={itemType.value}
                  className={`type-btn ${type === itemType.value ? 'active' : ''}`}
                  onClick={() => handleTypeChange(itemType.value)}
                  disabled={isLoading}
                >
                  {itemType.label}
                </button>
              ))}
            </div>
          </div>

          {type !== 'hauptpunkt' && (
            <div className="form-group">
              <label htmlFor="parent-select">Übergeordnetes Element:</label>
              <select
                id="parent-select"
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value)
                  setError('')
                }}
                disabled={isLoading}
              >
                <option value="">-- Wählen Sie ein Element --</option>
                {parentItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            onClick={handleAddItem}
            disabled={isLoading}
          >
            {isLoading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}
