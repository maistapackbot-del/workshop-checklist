import ProductCard from './ProductCard'

/**
 * ProductGrid - Displays products in a responsive grid with filtering and sorting
 *
 * Features:
 * - Responsive CSS Grid layout (auto-fill, minmax)
 * - Filters out purchased items based on showPurchased prop
 * - Sorts unpurchased items first, then by creation date (newest first)
 * - Shows empty state when no products available
 *
 * @param {array} products - Array of product items {id, name, description, purchased_at, created_at, order_index}
 * @param {object} links - Mapping of product IDs to their links {[productId]: [{...}]}
 * @param {object} tracking - Mapping of link IDs to tracking links {[linkId]: [{...}]}
 * @param {boolean} showPurchased - Whether to show purchased items (default: true)
 * @param {function} onAddLink - Callback(productId) when adding a link
 * @param {function} onPurchase - Callback(productId) when marking as purchased
 * @param {function} onRemove - Callback(productId) when removing a product
 * @param {function} onRemoveLink - Callback(linkId) when removing a link
 * @param {function} onLinkClick - Callback(link) when clicking on a link to view details
 * @returns {JSX.Element}
 */
export default function ProductGrid({
  products = [],
  links = {},
  tracking = {},
  showPurchased = true,
  onAddLink,
  onPurchase,
  onRemove,
  onRemoveLink,
  onLinkClick
}) {
  // Filter products based on showPurchased flag
  const filteredProducts = showPurchased
    ? products
    : products.filter(p => !p.purchased_at)

  // Sort: unpurchased first, then by newest created_at
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Unpurchased items come first
    if (!a.purchased_at && b.purchased_at) return -1
    if (a.purchased_at && !b.purchased_at) return 1

    // Within same purchase status, sort by creation date (newest first)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  // Handle error cases
  if (!Array.isArray(products)) {
    return <div className="product-grid"><p className="empty-state">Fehler: Ungültige Produktdaten</p></div>
  }

  return (
    <div className="product-grid">
      {sortedProducts.length === 0 ? (
        <p className="empty-state">
          {products.length === 0
            ? 'Noch keine Produkte. Klick "+ Produkt" um zu starten.'
            : 'Keine Produkte in dieser Kategorie.'}
        </p>
      ) : (
        sortedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            links={links[product.id] || []}
            tracking={tracking}
            onAddLink={onAddLink}
            onPurchase={onPurchase}
            onRemove={onRemove}
            onRemoveLink={onRemoveLink}
            onLinkClick={onLinkClick}
          />
        ))
      )}
    </div>
  )
}
