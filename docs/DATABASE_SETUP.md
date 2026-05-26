# Database Setup Instructions

## Overview

The Workshop Einkaufsliste uses Supabase PostgreSQL for data storage with Row-Level Security (RLS) for user isolation.

## Manual Setup (First Time)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Copy the contents of `src/database/migrations/001_initial_schema.sql`
5. Paste into SQL Editor and execute

This will create:
- 3 tables: checklist_items, product_links, tracking_links
- Proper indexes for performance
- RLS policies for security

## Schema Files

- **Schema Definition**: `src/database/SCHEMA.md` - Complete schema documentation
- **Migration**: `src/database/migrations/001_initial_schema.sql` - SQL to create tables
- **Service**: `src/services/checklistService.js` - JavaScript API for database operations

## Services

The app includes services for database operations:

### checklistService
```javascript
import { checklistService } from './services/checklistService'

// Get all top-level items
const items = await checklistService.getMainPoints()

// Get children of an item
const children = await checklistService.getChildren(parentId)

// Create new item
const item = await checklistService.createItem('Name', 'type', parentId)

// Update item
const updated = await checklistService.updateItem(id, { name: 'New Name' })

// Mark as purchased
await checklistService.markPurchased(itemId)

// Mark as unpurchased
await checklistService.markUnpurchased(itemId)

// Delete item
await checklistService.deleteItem(itemId)
```

## Testing

To test the schema locally:
```bash
npm test
```

This runs all tests including the 11 tests for checklistService that verify:
- Fetching main points and children
- Creating, updating, and deleting items
- Marking items as purchased/unpurchased
- Error handling for all operations

## Deployment

During Vercel deployment, the migration needs to be run once:
1. Deploy the code
2. Go to Supabase dashboard
3. Run the SQL migration from `src/database/migrations/001_initial_schema.sql`
4. App will work with the schema

## RLS (Row-Level Security)

All tables have RLS enabled with policies ensuring:
- Users can only view their own data
- Users can only modify their own data
- Data is automatically filtered by `auth.uid()` at query level
- No manual filtering needed in application code
