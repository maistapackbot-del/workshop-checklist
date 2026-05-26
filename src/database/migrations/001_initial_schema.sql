-- Create checklist_items table (3-level hierarchy)
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hauptpunkt', 'kategorie', 'produkt')),
  description TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_circular_references CHECK (id != parent_id)
);

-- Create product_links table
CREATE TABLE IF NOT EXISTS product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  platform TEXT,
  title TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracking_links table
CREATE TABLE IF NOT EXISTS tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_link_id UUID NOT NULL REFERENCES product_links(id) ON DELETE CASCADE,
  tracking_url TEXT NOT NULL,
  carrier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_parent_id ON checklist_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_links_user_id ON product_links(user_id);
CREATE INDEX IF NOT EXISTS idx_product_links_checklist_item_id ON product_links(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_user_id ON tracking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_product_link_id ON tracking_links(product_link_id);

-- Enable RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_items
CREATE POLICY "Users can view their own checklist items"
  ON checklist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklist items"
  ON checklist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items"
  ON checklist_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items"
  ON checklist_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for product_links
CREATE POLICY "Users can view their own product links"
  ON product_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product links"
  ON product_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product links"
  ON product_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product links"
  ON product_links FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tracking_links
CREATE POLICY "Users can view their own tracking links"
  ON tracking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking links"
  ON tracking_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking links"
  ON tracking_links FOR DELETE
  USING (auth.uid() = user_id);
