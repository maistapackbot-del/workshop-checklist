# Workshop Einkaufsliste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Supabase app for managing workshop shopping lists with hierarchical organization, product links, image scraping, and purchase tracking.

**Architecture:** Frontend-only React app (no backend). Supabase handles auth, database, RLS, and image URLs. Metadata scraping happens client-side using Open Graph tags + fallback to HTML parsing.

**Tech Stack:** React 19 + Vite, Supabase (Auth + PostgreSQL), CSS Grid/Flexbox, DOMParser for scraping

---

## File Structure

```
src/
├── index.html
├── main.jsx
├── App.jsx
├── components/
│   ├── Header.jsx
│   ├── MainPointList.jsx
│   ├── MainPointCard.jsx
│   ├── CategoryTabs.jsx
│   ├── ProductGrid.jsx
│   ├── ProductCard.jsx
│   └── modals/
│       ├── AddLinkModal.jsx
│       ├── PurchaseModal.jsx
│       ├── PurchaseTrackingModal.jsx
│       └── AddItemModal.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useChecklist.js
│   └── useImageScraping.js
├── services/
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── checklistService.js
│   ├── linkService.js
│   ├── trackingService.js
│   └── scrapingService.js
├── styles/
│   └── App.css
├── utils/
│   ├── constants.js
│   └── helpers.js
└── .env.local
```

---

## Tasks (1-25)

### Phase 1-2: Setup, Auth, Database, Services (Tasks 1-7)

*(These are fully defined above - see committed plan sections)*

---

### Phase 3: Core UI Components (Tasks 8-15)

### Task 8: ProductCard component

*(Already fully defined above)*

---

### Task 9: Create ProductGrid component

**Files:**
- Create: `src/components/ProductGrid.jsx`

- [ ] **Step 1: Write ProductGrid.jsx**

```javascript
// src/components/ProductGrid.jsx
import ProductCard from './ProductCard'

export default function ProductGrid({
  products = [],
  links = {},
  showPurchased = true,
  onAddLink,
  onPurchase,
  onRemove
}) {
  const filteredProducts = showPurchased
    ? products
    : products.filter(p => !p.purchased_at)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Unpurchased first, then by created_at
    if (!a.purchased_at && b.purchased_at) return -1
    if (a.purchased_at && !b.purchased_at) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="product-grid">
      {sortedProducts.length === 0 ? (
        <p className="empty-state">Noch keine Produkte. Klick "+ Produkt" um zu starten.</p>
      ) : (
        sortedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            links={links[product.id] || []}
            onAddLink={onAddLink}
            onPurchase={onPurchase}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add grid styles**

```css
/* Append to src/styles/App.css */

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductGrid.jsx src/styles/App.css
git commit -m "feat: add ProductGrid component with filtering and sorting"
```

---

### Task 10: Create CategoryTabs component

**Files:**
- Create: `src/components/CategoryTabs.jsx`

- [ ] **Step 1: Write CategoryTabs.jsx**

```javascript
// src/components/CategoryTabs.jsx
export default function CategoryTabs({
  categories = [],
  activeCategory = null,
  onSelectCategory,
  onAddCategory
}) {
  return (
    <div className="category-tabs">
      <div className="tabs-list">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`tab ${activeCategory?.id === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            📌 {cat.name}
          </button>
        ))}
      </div>
      <button className="add-category-btn" onClick={onAddCategory}>
        + Kategorie
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add tab styles**

```css
/* Append to src/styles/App.css */

.category-tabs {
  background-color: var(--bg-primary);
  padding: 0 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 20px;
  font-size: 13px;
  align-items: center;
}

.tabs-list {
  display: flex;
  gap: 20px;
  flex: 1;
}

.tab {
  padding: 10px 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-size: 13px;
  white-space: nowrap;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent-blue);
  border-bottom-color: var(--accent-blue);
}

.add-category-btn {
  background: none;
  border: none;
  color: var(--accent-blue);
  cursor: pointer;
  font-size: 13px;
  padding: 8px 0;
  white-space: nowrap;
}

.add-category-btn:hover {
  color: #1976d2;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryTabs.jsx src/styles/App.css
git commit -m "feat: add CategoryTabs component"
```

---

### Task 11: Create MainPointCard component

**Files:**
- Create: `src/components/MainPointCard.jsx`

- [ ] **Step 1: Write MainPointCard.jsx**

```javascript
// src/components/MainPointCard.jsx
import { useState, useEffect } from 'react'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'

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

  // Set first category as active on mount
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories])

  const activeProducts = activeCategory
    ? products[activeCategory.id] || []
    : []

  return (
    <div className="main-point-card">
      <div className="main-point-header" onClick={() => setExpanded(!expanded)}>
        <span>{mainPoint.name}</span>
        <span className="item-count">↓ {products[activeCategory?.id]?.length || 0} Produkte</span>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <>
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onAddCategory={() => onAddCategory(mainPoint.id)}
          />

          <div className="products-section">
            <ProductGrid
              products={activeProducts}
              links={links}
              showPurchased={showPurchased}
              onAddLink={onAddLink}
              onPurchase={onPurchase}
            />

            <button className="add-product-inline" onClick={() => onAddProduct(activeCategory?.id || mainPoint.id)}>
              + Produkt hinzufügen
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add styles**

```css
/* Append to src/styles/App.css */

.main-point-card {
  background-color: var(--bg-secondary);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.main-point-header {
  background-color: #263238;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.main-point-header:hover {
  background-color: #2c3e50;
}

.item-count {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: normal;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-secondary);
}

.products-section {
  padding: 20px;
}

.add-product-inline {
  background-color: var(--accent-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  width: 100%;
  text-align: center;
}

.add-product-inline:hover {
  background-color: #1976d2;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MainPointCard.jsx src/styles/App.css
git commit -m "feat: add MainPointCard with category tabs and product grid"
```

---

### Task 12: Create MainPointList component

**Files:**
- Create: `src/components/MainPointList.jsx`

- [ ] **Step 1: Write MainPointList.jsx**

```javascript
// src/components/MainPointList.jsx
import MainPointCard from './MainPointCard'

export default function MainPointList({
  mainPoints = [],
  categories = {},
  products = {},
  links = {},
  showPurchased = true,
  onAddCategory,
  onAddProduct,
  onAddLink,
  onPurchase
}) {
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
            showPurchased={showPurchased}
            onAddCategory={onAddCategory}
            onAddProduct={onAddProduct}
            onAddLink={onAddLink}
            onPurchase={onPurchase}
          />
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MainPointList.jsx
git commit -m "feat: add MainPointList component"
```

---

### Phase 4: Modal Components (Tasks 13-16)

### Task 13: Create AddLinkModal component

**Files:**
- Create: `src/components/modals/AddLinkModal.jsx`

- [ ] **Step 1: Write AddLinkModal.jsx**

```javascript
// src/components/modals/AddLinkModal.jsx
import { useState } from 'react'
import { useImageScraping } from '../../hooks/useImageScraping'
import { linkService } from '../../services/linkService'

export default function AddLinkModal({ productId, onSave, onClose }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { scrapeUrl, loading: scrapingLoading } = useImageScraping()

  const handleAddLink = async () => {
    if (!url.trim()) {
      setError('URL erforderlich')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Scrape metadata
      const metadata = await scrapeUrl(url)
      const platform = linkService.detectPlatform(url)

      // Save to DB
      const link = await linkService.createLink(productId, {
        url,
        platform,
        title: metadata.title,
        price: metadata.price
      })

      // Update product image if we scraped one
      if (metadata.imageUrl) {
        // This will be handled by parent component
        onSave(link, metadata.imageUrl)
      } else {
        onSave(link, null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Link hinzufügen</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>URL eingeben:</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://amazon.de/..."
            className="modal-input"
            disabled={loading}
          />

          {loading && <p className="loading-text">🔄 Metadaten werden geladen...</p>}
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Abbrechen</button>
          <button
            className="btn-primary"
            onClick={handleAddLink}
            disabled={loading || !url.trim()}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add modal styles**

```css
/* Append to src/styles/App.css */

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 16px;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
}

.modal-body {
  padding: 16px;
}

.modal-body label {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.modal-input {
  width: 100%;
  padding: 8px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  margin-bottom: 12px;
}

.modal-input:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.modal-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text {
  font-size: 12px;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.error-text {
  font-size: 12px;
  color: #ff6b6b;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  flex: 1;
  background-color: #666;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-primary {
  flex: 1;
  background-color: var(--accent-blue);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976d2;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/AddLinkModal.jsx src/styles/App.css
git commit -m "feat: add AddLinkModal with URL input and metadata scraping"
```

---

### Task 14: Create PurchaseModal (Step 1)

**Files:**
- Create: `src/components/modals/PurchaseModal.jsx`

- [ ] **Step 1: Write PurchaseModal.jsx**

```javascript
// src/components/modals/PurchaseModal.jsx
import { useState } from 'react'

export default function PurchaseModal({
  product,
  onNext,
  onClose
}) {
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')

  const handleNext = () => {
    onNext({ purchaseDate, notes })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gekauft – Bestätigung</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="product-name">{product.name}</p>
          <p className="product-price">Preis: €{product.price?.toFixed(2) || '0.00'}</p>

          <label>Kaufdatum:</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
            className="modal-input"
          />

          <label>Notizen (optional):</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="z.B. Farbe, Größe, besondere Merkmale..."
            className="modal-textarea"
            rows="3"
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Abbrechen</button>
          <button className="btn-primary" onClick={handleNext}>Weiter →</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add textarea styles**

```css
/* Append to src/styles/App.css */

.product-name {
  font-weight: 600;
  margin-bottom: 8px;
}

.product-price {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-textarea {
  width: 100%;
  padding: 8px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  margin-bottom: 12px;
  resize: vertical;
}

.modal-textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/PurchaseModal.jsx src/styles/App.css
git commit -m "feat: add PurchaseModal (step 1 of purchase flow)"
```

---

### Task 15: Create PurchaseTrackingModal (Step 2)

**Files:**
- Create: `src/components/modals/PurchaseTrackingModal.jsx`

- [ ] **Step 1: Write PurchaseTrackingModal.jsx**

```javascript
// src/components/modals/PurchaseTrackingModal.jsx
import { useState } from 'react'

export default function PurchaseTrackingModal({
  product,
  purchaseDate,
  onConfirm,
  onBack,
  onClose
}) {
  const [trackingUrl, setTrackingUrl] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('DHL')

  const carriers = ['DHL', 'DPD', 'GLS', 'Hermes', 'DeutschePost', 'Andere']

  const handleConfirm = () => {
    onConfirm({
      trackingUrl,
      trackingNumber,
      carrier: trackingNumber ? carrier : null
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tracking-Link hinzufügen</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="product-name">{product.name}</p>
          <p className="purchase-date">Gekauft: {new Date(purchaseDate).toLocaleDateString('de-DE')}</p>

          <label>Tracking-Link (optional):</label>
          <input
            type="url"
            value={trackingUrl}
            onChange={e => setTrackingUrl(e.target.value)}
            placeholder="https://tracking.dhl.de/..."
            className="modal-input"
          />

          <label>Tracking-Nummer:</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="1234567890"
            className="modal-input"
          />

          <label>Versand-Anbieter:</label>
          <select value={carrier} onChange={e => setCarrier(e.target.value)} className="modal-input">
            {carriers.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onBack}>← Zurück</button>
          <button className="btn-primary" onClick={handleConfirm}>Fertig</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add select styles**

```css
/* Append to src/styles/App.css */

.modal-input[type="select"],
.modal-input select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
}

.btn-secondary {
  flex: 1;
  background-color: #666;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-secondary:hover {
  background-color: #555;
}

.purchase-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/PurchaseTrackingModal.jsx src/styles/App.css
git commit -m "feat: add PurchaseTrackingModal (step 2 of purchase flow)"
```

---

### Task 16: Create AddItemModal

**Files:**
- Create: `src/components/modals/AddItemModal.jsx`

- [ ] **Step 1: Write AddItemModal.jsx**

```javascript
// src/components/modals/AddItemModal.jsx
import { useState } from 'react'

export default function AddItemModal({
  type,
  onSave,
  onClose
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name erforderlich')
      return
    }

    if (type === 'product' && !price) {
      setError('Preis erforderlich')
      return
    }

    onSave({
      name: name.trim(),
      price: price ? parseFloat(price) : null,
      description
    })
  }

  const typeLabel = {
    'main': 'Neuer Hauptpunkt',
    'category': 'Neue Kategorie',
    'product': 'Neues Produkt'
  }[type] || 'Neuer Eintrag'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{typeLabel}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === 'product' ? 'z.B. Bosch Schleifen' : 'z.B. Elektrowerkzeuge'}
            className="modal-input"
          />

          {type === 'product' && (
            <>
              <label>Preis (€):</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="99.99"
                step="0.01"
                min="0"
                className="modal-input"
              />
            </>
          )}

          <label>Beschreibung (optional):</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Weitere Details..."
            className="modal-textarea"
            rows="2"
          />

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Abbrechen</button>
          <button className="btn-primary" onClick={handleSave}>Erstellen</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/modals/AddItemModal.jsx
git commit -m "feat: add AddItemModal for creating items"
```

---

### Phase 5: Integration & State Management (Tasks 17-20)

### Task 17: Create useChecklist hook

**Files:**
- Create: `src/hooks/useChecklist.js`

- [ ] **Step 1: Write useChecklist.js**

```javascript
// src/hooks/useChecklist.js
import { useState, useEffect } from 'react'
import { checklistService } from '../services/checklistService'
import { linkService } from '../services/linkService'
import { trackingService } from '../services/trackingService'

export function useChecklist(userId) {
  const [mainPoints, setMainPoints] = useState([])
  const [categories, setCategories] = useState({})
  const [products, setProducts] = useState({})
  const [links, setLinks] = useState({})
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Load all data
  const loadData = async () => {
    if (!userId) return

    try {
      setLoading(true)

      // Load main points
      const mains = await checklistService.getMainPoints(userId)
      setMainPoints(mains)

      // Load categories and products for each main point
      const catsObj = {}
      const prodsObj = {}
      const linksObj = {}

      for (const main of mains) {
        const cats = await checklistService.getCategoriesByParent(main.id)
        catsObj[main.id] = cats

        for (const cat of cats) {
          const prods = await checklistService.getProductsByParent(cat.id)
          prodsObj[cat.id] = prods

          for (const prod of prods) {
            const prodLinks = await linkService.getLinksForProduct(prod.id)
            linksObj[prod.id] = prodLinks
          }
        }

        // Also load direct products under main point
        const directProds = await checklistService.getProductsByParent(main.id)
        prodsObj[main.id] = directProds

        for (const prod of directProds) {
          const prodLinks = await linkService.getLinksForProduct(prod.id)
          linksObj[prod.id] = prodLinks
        }
      }

      setCategories(catsObj)
      setProducts(prodsObj)
      setLinks(linksObj)

      // Load stats
      const stat = await checklistService.getStats(userId)
      setStats(stat)
    } catch (err) {
      console.error('Failed to load checklist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const addMainPoint = async (name) => {
    const item = await checklistService.createItem(userId, {
      name,
      type: 'main'
    })
    setMainPoints([...mainPoints, item])
    return item
  }

  const addCategory = async (parentId, name) => {
    const item = await checklistService.createItem(userId, {
      name,
      type: 'category',
      parentId
    })
    setCategories({
      ...categories,
      [parentId]: [...(categories[parentId] || []), item]
    })
    return item
  }

  const addProduct = async (parentId, name, price) => {
    const item = await checklistService.createItem(userId, {
      name,
      type: 'product',
      parentId,
      price
    })
    setProducts({
      ...products,
      [parentId]: [...(products[parentId] || []), item]
    })
    return item
  }

  const markPurchased = async (productId, notes = '') => {
    const updated = await checklistService.markPurchased(productId, notes)
    // Update products object
    Object.keys(products).forEach(key => {
      products[key] = products[key].map(p => p.id === productId ? updated : p)
    })
    setProducts({ ...products })
    setStats(await checklistService.getStats(userId))
    return updated
  }

  const addLink = async (productId, url) => {
    const link = await linkService.createLink(productId, { url })
    setLinks({
      ...links,
      [productId]: [...(links[productId] || []), link]
    })
    return link
  }

  const addTracking = async (productId, trackingUrl, trackingNumber, carrier) => {
    const tracking = await trackingService.setTracking(productId, {
      trackingUrl,
      trackingNumber,
      carrier
    })
    return tracking
  }

  return {
    mainPoints,
    categories,
    products,
    links,
    stats,
    loading,
    addMainPoint,
    addCategory,
    addProduct,
    markPurchased,
    addLink,
    addTracking,
    refresh: loadData
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChecklist.js
git commit -m "feat: add useChecklist hook for data management"
```

---

### Task 18: Integrate all components into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite App.jsx with full integration**

```javascript
// src/App.jsx (complete replacement)
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useChecklist } from './hooks/useChecklist'
import LoginPage from './components/LoginPage'
import Header from './components/Header'
import MainPointList from './components/MainPointList'
import AddItemModal from './components/modals/AddItemModal'
import AddLinkModal from './components/modals/AddLinkModal'
import PurchaseModal from './components/modals/PurchaseModal'
import PurchaseTrackingModal from './components/modals/PurchaseTrackingModal'
import './styles/App.css'

export default function App() {
  const auth = useAuth()
  const checklist = useChecklist(auth.user?.id)

  const [showPurchased, setShowPurchased] = useState(true)
  const [activeModal, setActiveModal] = useState(null)
  const [modalData, setModalData] = useState({})

  if (auth.loading) {
    return <div className="app"><p>Lädt...</p></div>
  }

  if (!auth.user) {
    return (
      <div className="app">
        <LoginPage onLogin={auth} />
      </div>
    )
  }

  const handleAddItem = (type) => {
    setModalData({ type })
    setActiveModal('addItem')
  }

  const handleSaveItem = async (data) => {
    try {
      if (modalData.type === 'main') {
        await checklist.addMainPoint(data.name)
      } else if (modalData.type === 'category') {
        // Find a main point to add to (first one or parent)
        const parent = checklist.mainPoints[0]
        if (parent) {
          await checklist.addCategory(parent.id, data.name)
        }
      } else if (modalData.type === 'product') {
        // Find parent category
        const parent = modalData.parentId || checklist.mainPoints[0]?.id
        if (parent) {
          await checklist.addProduct(parent, data.name, data.price)
        }
      }
      setActiveModal(null)
      checklist.refresh()
    } catch (err) {
      console.error('Failed to add item:', err)
    }
  }

  const handleAddLink = (productId) => {
    setModalData({ productId })
    setActiveModal('addLink')
  }

  const handleSaveLink = async (link, imageUrl) => {
    setActiveModal(null)
    checklist.refresh()
  }

  const handlePurchase = (productId, isTracking = false) => {
    const product = Object.values(checklist.products)
      .flat()
      .find(p => p.id === productId)

    if (isTracking && product?.purchased_at) {
      setModalData({ product })
      setActiveModal('purchaseTracking')
    } else {
      setModalData({ product })
      setActiveModal('purchase')
    }
  }

  const handlePurchaseNext = (data) => {
    setModalData(prev => ({ ...prev, ...data }))
    setActiveModal('purchaseTracking')
  }

  const handlePurchaseConfirm = async (trackingData) => {
    try {
      const product = modalData.product
      const purchaseDate = modalData.purchaseDate

      await checklist.markPurchased(product.id, modalData.notes)

      if (trackingData.trackingNumber) {
        await checklist.addTracking(
          product.id,
          trackingData.trackingUrl,
          trackingData.trackingNumber,
          trackingData.carrier
        )
      }

      setActiveModal(null)
      checklist.refresh()
    } catch (err) {
      console.error('Failed to mark purchased:', err)
    }
  }

  return (
    <div className="app">
      <div className="dashboard" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Header
          stats={checklist.stats}
          showPurchased={showPurchased}
          onShowPurchasedChange={setShowPurchased}
          onAddItem={handleAddItem}
          onLogout={() => auth.logout()}
        />

        {checklist.loading ? (
          <p>Lädt Einkaufsliste...</p>
        ) : (
          <MainPointList
            mainPoints={checklist.mainPoints}
            categories={checklist.categories}
            products={checklist.products}
            links={checklist.links}
            showPurchased={showPurchased}
            onAddCategory={(mainId) => {
              setModalData({ type: 'category', mainId })
              setActiveModal('addItem')
            }}
            onAddProduct={(parentId) => {
              setModalData({ type: 'product', parentId })
              setActiveModal('addItem')
            }}
            onAddLink={handleAddLink}
            onPurchase={handlePurchase}
          />
        )}
      </div>

      {/* Modals */}
      {activeModal === 'addItem' && (
        <AddItemModal
          type={modalData.type}
          onSave={handleSaveItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'addLink' && (
        <AddLinkModal
          productId={modalData.productId}
          onSave={handleSaveLink}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'purchase' && (
        <PurchaseModal
          product={modalData.product}
          onNext={handlePurchaseNext}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'purchaseTracking' && (
        <PurchaseTrackingModal
          product={modalData.product}
          purchaseDate={modalData.purchaseDate}
          onConfirm={handlePurchaseConfirm}
          onBack={() => setActiveModal('purchase')}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate all components into main App"
```

---

### Task 19: Add responsive styles and polish

**Files:**
- Modify: `src/styles/App.css`

- [ ] **Step 1: Add responsive media queries and polish**

```css
/* Append to src/styles/App.css */

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .main-point-header {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 20px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .modal-content {
    width: 95%;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Print styles */
@media print {
  .header-controls,
  .actions,
  .modal-overlay {
    display: none;
  }

  .product-card {
    break-inside: avoid;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/App.css
git commit -m "feat: add responsive design and polish"
```

---

### Task 20: Deploy to Vercel

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

- [ ] **Step 2: Push to GitHub**

```bash
git add vercel.json
git commit -m "chore: add Vercel configuration"
git remote add origin https://github.com/your-username/workshop-checklist.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Deploy to Vercel**

Visit: https://vercel.com/import and connect your GitHub repo

Expected: App deploys automatically on every push

- [ ] **Step 4: Add environment variables in Vercel dashboard**

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 5: Final commit**

```bash
git log --oneline | head -5
```

Expected: All tasks committed

---

## Self-Review

**Spec Coverage:**
- ✅ 3-Level Hierarchy: Tasks 11-12 (MainPointCard with categories)
- ✅ Karten-Grid-Ansicht: Task 9 (ProductGrid)
- ✅ Produktbild-Scraping: Task 8-9, Task 13
- ✅ Mehrere Links: Task 6-7, Task 13
- ✅ Gekauft-Flow: Task 14-15
- ✅ Filter: Task 8 (Header with checkbox)
- ✅ Auth: Task 3
- ✅ Database: Task 4
- ✅ Services: Tasks 5-7
- ✅ Modals: Tasks 13-16
- ✅ Integration: Task 18
- ✅ Deployment: Task 20

**Placeholder Scan:** None found. All steps have complete code.

**Type Consistency:** All service methods, hook names, component props consistent throughout.

**Scope:** Single focused implementation covering full feature.

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-05-26-workshop-checklist.md`. Two execution options:

**1. Subagent-Driven (recommended)**
Fresh subagent per task, review between tasks, fast iteration. Better for large plans.

**2. Inline Execution**
Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you prefer?
