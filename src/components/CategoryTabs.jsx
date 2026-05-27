/**
 * CategoryTabs - Tab navigation between product categories
 *
 * Features:
 * - Renders category tabs with visual indicator (📌)
 * - Highlights active tab with blue underline and color
 * - Delete button for each category
 * - "Add category" button for creating new categories
 * - Responsive flex layout
 * - Smooth transitions on hover
 *
 * @param {array} categories - Array of category items {id, name, ...}
 * @param {object} activeCategory - Currently selected category object {id, name, ...}
 * @param {function} onSelectCategory - Callback(category) when tab is clicked
 * @param {function} onAddCategory - Callback() when "+ Kategorie" button clicked
 * @param {function} onDeleteCategory - Callback(categoryId) to delete a category
 * @returns {JSX.Element}
 */
export default function CategoryTabs({
  categories = [],
  activeCategory = null,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory
}) {
  // Handle error cases
  if (!Array.isArray(categories)) {
    return <div className="category-tabs"><p>Fehler: Ungültige Kategoriedaten</p></div>
  }

  return (
    <div className="category-tabs">
      <div className="tabs-list">
        {categories.map(cat => (
          <div key={cat.id} className="tab-wrapper">
            <button
              className={`tab ${activeCategory?.id === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
              type="button"
              title={cat.name}
            >
              📌 {cat.name}
            </button>
            {onDeleteCategory && (
              <button
                className="btn-icon btn-delete-tab"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteCategory(cat.id)
                }}
                title="Kategorie löschen"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="add-category-btn"
        onClick={onAddCategory}
        type="button"
        title="Neue Kategorie hinzufügen"
      >
        + Kategorie
      </button>
    </div>
  )
}
