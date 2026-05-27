import { useState } from 'react'

/**
 * ProductCard - Displays a single product with links and actions
 *
 * @param {object} product - Product item {id, name, description, purchased_at, order_index}
 * @param {array} links - Product links [{id, url, title, price, image_url, platform}]
 * @param {function} onAddLink - Callback to add new link
 * @param {function} onPurchase - Callback when marking as purchased
 * @param {function} onRemove - Callback to delete product
 * @param {function} onRemoveLink - Callback to delete a link
 * @param {function} onLinkClick - Callback when clicking on a link to view details
 */
export default function ProductCard({
  product,
  links = [],
  onAddLink,
  onPurchase,
  onRemove,
  onRemoveLink,
  onLinkClick
}) {
  const [expanded, setExpanded] = useState(false)
  const isPurchased = !!product.purchased_at

  return (
    <div className={`product-card ${isPurchased ? 'purchased' : ''}`}>
      {/* Header with product name and status */}
      <div className="product-card-header">
        <div className="product-name-section" onClick={() => setExpanded(!expanded)}>
          <span className="product-checkbox">
            {isPurchased ? '✓' : '○'}
          </span>
          <h3 className="product-name">{product.name}</h3>
        </div>
        <div className="product-actions">
          <button
            className="btn-icon btn-purchase"
            onClick={() => onPurchase(product.id)}
            title={isPurchased ? 'Gekauft rückgängig machen' : 'Als gekauft markieren'}
          >
            {isPurchased ? '✓ Gekauft' : '◯ Kaufen'}
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={() => onRemove(product.id)}
            title="Produkt löschen"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Product description if available */}
      {product.description && (
        <p className="product-description">{product.description}</p>
      )}

      {/* Product links section (collapsible) */}
      {expanded && (
        <div className="product-links-section">
          {links.length > 0 ? (
            <div className="links-list">
              {links.map(link => (
                <div
                  key={link.id}
                  className="product-link"
                >
                  <div
                    className="link-content"
                    onClick={() => onLinkClick && onLinkClick(link)}
                    role="button"
                    tabIndex={0}
                  >
                    {link.image_url && (
                      <img src={link.image_url} alt={link.title} className="link-image" />
                    )}
                    <div className="link-info">
                      <span className="link-title">{link.title || 'Link'}</span>
                      {link.price && <span className="link-price">€{link.price}</span>}
                      <span className="link-platform">{link.platform}</span>
                    </div>
                  </div>
                  {onRemoveLink && (
                    <button
                      className="btn-icon btn-delete-link"
                      onClick={() => onRemoveLink(link.id)}
                      title="Link löschen"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-links">Noch keine Links hinzugefügt</p>
          )}

          <button
            className="btn-add-link"
            onClick={() => onAddLink(product.id)}
          >
            + Link hinzufügen
          </button>
        </div>
      )}
    </div>
  )
}
