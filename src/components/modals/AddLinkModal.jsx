import { useState } from 'react'
import { scrapingService } from '../../services/scrapingService'
import { imageService } from '../../services/imageService'

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

  const extractTitleFromUrl = (urlString) => {
    try {
      const urlObj = new URL(urlString)
      // Try to extract from query params or path
      const pathname = urlObj.pathname.split('/').filter(p => p).pop() || ''
      return pathname.replace(/[-_]/g, ' ').substring(0, 50) || 'Link'
    } catch {
      return 'Link'
    }
  }

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
        const platform = scrapingService.detectPlatform(url)
        setMetadata({
          title: scrapedMetadata.title || 'Link',
          description: scrapedMetadata.description || null,
          price: scrapedMetadata.price || null,
          image_url: scrapedMetadata.image_url || imageService.getScreenshotUrl(url),
          platform: platform
        })
      } catch (err) {
        // Fallback: parse from URL
        const platform = scrapingService.detectPlatform(url)
        const title = extractTitleFromUrl(url)
        setMetadata({
          title: title || 'Link',
          description: null,
          price: null,
          image_url: imageService.getScreenshotUrl(url),
          platform: platform
        })
        console.error('Error scraping metadata:', err)
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
