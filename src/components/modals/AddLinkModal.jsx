import { useState } from 'react'

/**
 * AddLinkModal - Modal to add a product link with URL and metadata scraping
 *
 * @param {string} productId - Product ID to add link to
 * @param {function} onSave - Callback(url, metadata) when link is added
 * @param {function} onClose - Callback when modal should close
 * @param {function} scrapeUrl - Function to scrape URL metadata
 * @param {boolean} scrapingLoading - Whether metadata is being scraped
 */
export default function AddLinkModal({
  productId,
  onSave,
  onClose,
  scrapeUrl,
  scrapingLoading = false
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
      new URL(url)
    } catch {
      setError('Gültige URL erforderlich')
      return
    }

    setError('')

    if (scrapeUrl) {
      try {
        const scrapedMetadata = await scrapeUrl(url)
        setMetadata(scrapedMetadata)
      } catch (err) {
        setError(`Fehler beim Laden: ${err.message}`)
      }
    }
  }

  const handleAddLink = () => {
    if (!url.trim()) {
      setError('URL erforderlich')
      return
    }

    onSave(url, metadata || {})
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
              disabled={scrapingLoading}
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
            disabled={scrapingLoading}
          >
            Abbrechen
          </button>
          {!metadata && (
            <button
              className="btn-primary"
              onClick={handleScrapMetadata}
              disabled={scrapingLoading || !url.trim()}
            >
              {scrapingLoading ? 'Wird geladen...' : 'Metadaten laden'}
            </button>
          )}
          {metadata && (
            <button
              className="btn-primary"
              onClick={handleAddLink}
              disabled={scrapingLoading}
            >
              {scrapingLoading ? 'Wird hinzugefügt...' : 'Link hinzufügen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
