import { useState, useEffect } from 'react'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'

/**
 * MainPointCard - Collapsible card with categories and product grid
 *
 * Features:
 * - Accordion collapse/expand functionality
 * - Category tab navigation with automatic first-tab selection
 * - Nested product grid for active category
 * - Item count in header
 * - Add product button at bottom
 * - Dark theme styling with proper contrast
 *
 * @param {object} mainPoint - Main point item {id, name, ...}
 * @param {array} categories - Categories for this main point [{id, name, ...}]
 * @param {object} products - Mapping of category IDs to products {[categoryId]: [{...}]}
 * @param {object} links - Mapping of product IDs to links {[productId]: [{...}]}
 * @param {boolean} showPurchased - Whether to display purchased items
 * @param {function} onAddCategory - Callback(mainPointId) to add new category
 * @param {function} onSelectCategory - Callback(category) when category tab selected
 * @param {function} onAddProduct - Callback(categoryId) to add new product
 * @param {function} onAddLink - Callback(productId) to add link to product
 * @param {function} onPurchase - Callback(productId) to mark as purchased
 * @returns {JSX.Element}
 */
export default function MainPointCard({
  mainPoint,
  categories = [],
  products = {},
  links = {},
  showPurchased = true,
  onAddCategory,
  onSelectCategory,
  onAddProduct,
  onAddLink,
  onPurchase
}) {
  const [expanded, setExpanded] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  // Auto-select first category on mount or when categories change
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  // Get products for active category
  const activeProducts = activeCategory
    ? products[activeCategory.id] || []
    : []

  // Calculate total product count across all categories
  const totalProducts = Object.values(products).flat().length

  // Handle error cases
  if (!mainPoint) {
    return <div className="main-point-card"><p>Fehler: Hauptpunkt nicht verfügbar</p></div>
  }

  return (
    <div className="main-point-card">
      {/* Header with expand/collapse */}
      <div
        className="main-point-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
      >
        <span className="main-point-name">{mainPoint.name}</span>
        <span className="item-count">↓ {totalProducts} Produkte</span>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      {/* Expandable content */}
      {expanded && (
        <>
          {/* Category tabs */}
          {categories.length > 0 && (
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onAddCategory={() => onAddCategory(mainPoint.id)}
            />
          )}

          {/* Products section */}
          <div className="products-section">
            <ProductGrid
              products={activeProducts}
              links={links}
              showPurchased={showPurchased}
              onAddLink={onAddLink}
              onPurchase={onPurchase}
            />

            {/* Add product button */}
            <button
              className="add-product-inline"
              onClick={() => onAddProduct(activeCategory?.id || mainPoint.id)}
              type="button"
            >
              + Produkt hinzufügen
            </button>
          </div>
        </>
      )}
    </div>
  )
}
