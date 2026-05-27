import { useState } from 'react'

/**
 * LinkDetailModal - Show link details with large image and price
 *
 * @param {object} link - Link object {id, url, title, price, image_url, platform, description}
 * @param {function} onClose - Callback when modal should close
 */
export default function LinkDetailModal({ link, onClose }) {
  if (!link) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container link-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{link.title || 'Link'}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="modal-body link-detail-body">
          {link.image_url && (
            <div className="link-detail-image-container">
              <img src={link.image_url} alt={link.title} className="link-detail-image" />
            </div>
          )}

          <div className="link-detail-info">
            {link.price && (
              <div className="link-detail-price">
                <span className="price-label">Preis:</span>
                <span className="price-value">€{link.price}</span>
              </div>
            )}

            {link.description && (
              <div className="link-detail-description">
                <span className="description-label">Beschreibung:</span>
                <p>{link.description}</p>
              </div>
            )}

            {link.platform && (
              <div className="link-detail-platform">
                <span className="platform-label">Plattform:</span>
                <span className="platform-value">{link.platform}</span>
              </div>
            )}

            <div className="link-detail-url">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Zur Website öffnen ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
