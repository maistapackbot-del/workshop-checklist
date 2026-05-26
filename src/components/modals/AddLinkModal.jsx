import { useState } from 'react'

/**
 * AddLinkModal - Modal to add a product link with URL and metadata
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback when modal should close
 * @param {function} onAddLink - Callback with link data {url, title, price, image_url, platform}
 * @param {boolean} isLoading - Whether metadata is being scraped
 */
export default function AddLinkModal({
  isOpen,
  onClose,
  onAddLink,
  isLoading = false
}) {
  const [url, setUrl] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [error, setError] = useState('')

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setError('')
    setMetadata(null)
  }

  const handleScrapMetadata = async () => {
    if (!url.trim()) {
      setError('URL erforderlich')
      return
    }

    try {
      // Validate URL format
      new URL(url)
    } catch {
      setError('Gültige URL erforderlich')
      return
    }

    setError('')
    // In a real app, this would call an API to scrape metadata
    // For now, we'll set a mock metadata object
    setMetadata({
      title: 'Product Title',
      price: 99.99,
      image_url: null,
      platform: 'Online'
    })
  }

  const handleAddLink = () => {
    if (!url.trim()) {
      setError('URL erforderlich')
      return
    }

    const linkData = {
      url,
      title: metadata?.title || 'Link',
      price: metadata?.price || null,
      image_url: metadata?.image_url || null,
      platform: metadata?.platform || 'Online'
    }

    onAddLink(linkData)
    resetForm()
  }

  const resetForm = () => {
    setUrl('')
    setMetadata(null)
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
          <h2>Link hinzufügen</h2>
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
            <label htmlFor="link-url">URL:</label>
            <input
              id="link-url"
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          {metadata && (
            <div className="metadata-preview">
              <h3>Metadaten Vorschau</h3>
              {metadata.image_url && (
                <img src={metadata.image_url} alt="Produktbild" className="metadata-image" />
              )}
              <p><strong>Titel:</strong> {metadata.title}</p>
              {metadata.price && <p><strong>Preis:</strong> €{metadata.price}</p>}
              <p><strong>Plattform:</strong> {metadata.platform}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Abbrechen
          </button>
          {!metadata && (
            <button
              className="btn-primary"
              onClick={handleScrapMetadata}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? 'Wird geladen...' : 'Metadaten laden'}
            </button>
          )}
          {metadata && (
            <button
              className="btn-primary"
              onClick={handleAddLink}
              disabled={isLoading}
            >
              {isLoading ? 'Wird hinzugefügt...' : 'Link hinzufügen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
