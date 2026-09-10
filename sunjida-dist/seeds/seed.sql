-- Seed Data
-- Run: psql -U sunjida -d sunjida -f seeds/seed.sql

-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, email_verified_at)
VALUES ('admin@torquesticker.com', '$2y$12$LJ3m4ys3Lk0TSwHjmz0VOeUtEfX0Q9c2ZV8x5hB0K0U1Z5Y7Y8Xy', 'Admin', 'admin', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Demo shop
INSERT INTO shops (owner_id, name, description, category)
VALUES (1, 'Torque Sticker Shop', 'Custom stickers and decals for automotive enthusiasts', 'automotive')
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO products (shop_id, name, description, price, sku, category, tags, stock_quantity)
VALUES
    (1, 'Carbon Fiber Vinyl Wrap', 'Premium carbon fiber texture vinyl wrap for vehicles', 89.99, 'CF-001', 'wraps', ARRAY['carbon', 'vinyl', 'wrap'], 150),
    (1, 'Holographic Rainbow Sticker', 'Iridescent holographic sticker, waterproof', 4.99, 'HR-001', 'stickers', ARRAY['holographic', 'rainbow', 'sticker'], 500),
    (1, 'Custom Logo Decal', 'Personalized logo decal for business branding', 24.99, 'CL-001', 'decals', ARRAY['custom', 'logo', 'business'], 0),
    (1, 'Matte Black Window Tint', 'Privacy window tint film, 35% VLT', 59.99, 'MB-001', 'tint', ARRAY['matte', 'black', 'window'], 75),
    (1, 'Flame Design Side Stripe', 'Aggressive flame design side stripe kit', 34.99, 'FS-001', 'stripes', ARRAY['flame', 'stripe', 'design'], 200)
ON CONFLICT DO NOTHING;

-- Sample inventory
INSERT INTO inventory (product_id, shop_id, quantity, low_stock_threshold)
SELECT id, shop_id, stock_quantity, 10
FROM products
WHERE shop_id = 1
ON CONFLICT (product_id, shop_id) DO NOTHING;

-- Sample conversation
INSERT INTO conversations (shop_id, external_id, platform, status, lead_score)
VALUES (1, 'fb_user_12345', 'messenger', 'active', 0.75)
ON CONFLICT DO NOTHING;

-- Sample messages
INSERT INTO messages (conversation_id, role, content)
VALUES
    (1, 'user', 'Hi, do you have any carbon fiber wraps in stock?'),
    (1, 'assistant', 'Yes! We have our Premium Carbon Fiber Vinyl Wrap in stock. It''s $89.99 and perfect for vehicle wraps.'),
    (1, 'user', 'Great! I need about 50 feet for my car. Do you offer bulk pricing?'),
    (1, 'assistant', 'Absolutely! For bulk orders of 50+ feet, we can offer a 15% discount. That would bring it to $76.49 per roll.')
ON CONFLICT DO NOTHING;

-- Sample settings
INSERT INTO settings (shop_id, key, value, type)
VALUES
    (1, 'auto_reply', 'true', 'boolean'),
    (1, 'welcome_message', 'Welcome to Torque Sticker Shop! How can we help you today?', 'string'),
    (1, 'business_hours', '{"monday":"9-18","tuesday":"9-18","wednesday":"9-18","thursday":"9-18","friday":"9-17","saturday":"10-14"}', 'json'),
    (1, 'lead_score_threshold', '0.5', 'number')
ON CONFLICT DO NOTHING;

-- Queue some sample jobs
INSERT INTO queue (job_type, payload, status)
VALUES
    ('embedding_generate', '{"product_ids": [1, 2, 3, 4, 5]}', 'pending'),
    ('product_sync', '{"shop_id": 1}', 'pending')
ON CONFLICT DO NOTHING;
