-- ==============================================================================
-- ROSE VALLEY KANNAUJ - CUSTOMER INQUIRIES & PERSONAL COMMUNICATIONS SCHEMA
-- Run this in your Supabase SQL Editor if you wish to create a dedicated table.
-- Note: The system also automatically falls back to 'notification_logs' & 'notifications'.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    inquiry_ref VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'In Review', -- 'In Review', 'Replied', 'Closed'
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_inquiries_user ON customer_inquiries(store_id, user_id);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_ref ON customer_inquiries(inquiry_ref);
