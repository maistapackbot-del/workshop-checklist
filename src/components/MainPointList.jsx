import MainPointCard from './MainPointCard'

/**
 * MainPointList - List of main point cards with full hierarchy
 *
 * Features:
 * - Maps main points to expandable cards
 * - Passes category, product, and link data to each card
 * - Shows empty state when no main points exist
 * - Handles all CRUD callbacks
 * - Dark theme compatible
 *
 * @param {array} mainPoints - Array of main point items [{id, name, ...}]
 * @param {object} categories - Mapping of mainPointId to categories {[mainPointId]: [{...}]}
 * @param {object} products - Mapping of categoryId to products {[categoryId]: [{...}]}
 * @param {object} links - Mapping of productId to links {[productId]: [{...}]}
 * @param {object} tracking - Mapping of linkId to tracking links {[linkId]: [{...}]}
 * @param {boolean} showPurchased - Whether to display purchased items
 * @param {function} onAddCategory - Callback(mainPointId) to add new category
 * @param {function} onAddProduct - Callback(categoryId) to add new product
 * @param {function} onAddLink - Callback(productId) to add link to product
 * @param {function} onPurchase - Callback(productId) to mark as purchased
 * @param {function} onRemove - Callback(productId) to delete product
 * @param {function} onRemoveLink - Callback(linkId) to delete a link
 * @param {function} onLinkClick - Callback(link) when clicking on a link to view details
 * @returns {JSX.Element}
 */
export default function MainPointList({
  mainPoints = [],
  categories = {},
  products = {},
  links = {},
  tracking = {},
  showPurchased = true,
  onAddCategory,
  onAddProduct,
  onAddLink,
  onPurchase,
  onRemove,
  onRemoveLink,
  onLinkClick
}) {
  // Handle error cases
  if (!Array.isArray(mainPoints)) {
    return <div className="main-point-list"><p>Fehler: Ungültige Daten</p></div>
  }

  return (
    <div className="main-point-list">
      {mainPoints.length === 0 ? (
        <div className="empty-state">
          <p>Keine Hauptpunkte. Klick "+ Hauptpunkt" um zu starten.</p>
        </div>
      ) : (
        mainPoints.map(mainPoint => (
          <MainPointCard
            key={mainPoint.id}
            mainPoint={mainPoint}
            categories={categories[mainPoint.id] || []}
            products={products}
            links={links}
            tracking={tracking}
            showPurchased={showPurchased}
            onAddCategory={onAddCategory}
            onAddProduct={onAddProduct}
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
