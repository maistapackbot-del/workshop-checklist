# Workshop Einkaufsliste Database Schema

## Overview

This database uses a 3-level hierarchical structure stored in a single table with parent-child relationships. All data is isolated per user using Row-Level Security (RLS).

## Tables

### checklist_items

Stores the hierarchical structure of shopping list items (Hauptpunkte, Kategorien, Produkte).

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): Owner of the item (auth.users.id)
- `parent_id` (UUID, FK): Reference to parent item (NULL for top-level)
- `name` (TEXT): Item name (e.g., "Elektrowerkzeuge", "Bohrschrauber", "DeWalt 18V")
- `type` (TEXT): Item type - 'hauptpunkt', 'kategorie', or 'produkt'
- `description` (TEXT): Optional description
- `purchased_at` (TIMESTAMP): When item was marked as purchased (NULL if not purchased)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Hierarchy:**
```
Hauptpunkt (parent_id = NULL, type = 'hauptpunkt')
├─ Kategorie (parent_id = hauptpunkt.id, type = 'kategorie')
│  └─ Produkt (parent_id = kategorie.id, type = 'produkt')
├─ Kategorie
│  └─ Produkt
└─ Produkt (direct child of hauptpunkt)
```

### product_links

Stores URLs and metadata for products (scraped from e-commerce sites).

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): Owner
- `checklist_item_id` (UUID, FK): References checklist_items
- `url` (TEXT): Product URL
- `platform` (TEXT): Platform name (e.g., "amazon.de", "willhaben.at")
- `title` (TEXT): Product title (auto-scraped)
- `price` (DECIMAL): Product price (auto-scraped)
- `image_url` (TEXT): Product image URL (auto-scraped)
- `created_at` (TIMESTAMP): When link was added
- `updated_at` (TIMESTAMP): Last update timestamp

### tracking_links

Stores shipping tracking URLs for purchased items.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): Owner
- `product_link_id` (UUID, FK): References product_links
- `tracking_url` (TEXT): Tracking URL
- `carrier` (TEXT): Shipping carrier (e.g., "DHL", "DPD")
- `created_at` (TIMESTAMP): When tracking link was added
- `updated_at` (TIMESTAMP): Last update timestamp

## Security

All tables have Row-Level Security (RLS) enabled with policies that ensure:
- Users can only view their own data
- Users can only insert/update/delete their own data
- Data is automatically filtered by `auth.uid()` at the query level

## Indexes

Indexes are created for common query patterns:
- `checklist_items(user_id)` - Fast filtering by user
- `checklist_items(parent_id)` - Fast hierarchy traversal
- `product_links(user_id)` - User data filtering
- `product_links(checklist_item_id)` - Find links for a product
- `tracking_links(user_id)` - User data filtering
- `tracking_links(product_link_id)` - Find tracking for a link

## Example Queries

### Get all top-level items for current user:
```sql
SELECT * FROM checklist_items 
WHERE parent_id IS NULL 
ORDER BY created_at DESC;
```

### Get all children of a hauptpunkt:
```sql
SELECT * FROM checklist_items 
WHERE parent_id = $1 
ORDER BY created_at DESC;
```

### Get product with all links:
```sql
SELECT ci.*, pl.* FROM checklist_items ci
LEFT JOIN product_links pl ON pl.checklist_item_id = ci.id
WHERE ci.id = $1;
```

### Get purchased items:
```sql
SELECT * FROM checklist_items 
WHERE purchased_at IS NOT NULL 
ORDER BY purchased_at DESC;
```
