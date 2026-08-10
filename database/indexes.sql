-- Luxury Perfume Store - High-Performance Database Indexing
-- Apply these indexes to your PostgreSQL / Supabase instance to optimize query speeds for 1,000+ visitors

-- Products & Category Junction Indexes
CREATE INDEX IF NOT EXISTS idx_products_store_price ON products(store_id, price);
CREATE INDEX IF NOT EXISTS idx_products_store_bestseller ON products(store_id, is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_store_created_at ON products(store_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(store_id, category_id);

-- Orders & Payment Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(store_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(store_id, created_at DESC);

-- Order Items Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(store_id, product_id);

-- Cart & Wishlist Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_store_user ON wishlists(store_id, user_id);
