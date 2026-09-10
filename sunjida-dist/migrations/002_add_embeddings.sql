-- Migration 002: Add vector embeddings support
-- Run: psql -U sunjida -d sunjida -f migrations/002_add_embeddings.sql

-- Add embedding column to products table
-- Using 1536 dimensions for text-embedding-3-small
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for efficient approximate nearest neighbor search
-- This index is optimized for cosine distance search
CREATE INDEX IF NOT EXISTS idx_products_embedding_hnsw
    ON products
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Function to search products by embedding similarity
CREATE OR REPLACE FUNCTION search_products_by_embedding(
    p_shop_id INTEGER,
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 10,
    p_similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(500),
    description TEXT,
    price DECIMAL(10,2),
    sku VARCHAR(100),
    image_url VARCHAR(500),
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sku,
        p.image_url,
        (1 - (p.embedding <=> p_query_embedding))::FLOAT AS similarity
    FROM products p
    WHERE p.shop_id = p_shop_id
        AND p.embedding IS NOT NULL
        AND p.is_active = true
        AND (1 - (p.embedding <=> p_query_embedding)) > p_similarity_threshold
    ORDER BY p.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$;

-- Function to find similar products
CREATE OR REPLACE FUNCTION find_similar_products(
    p_product_id INTEGER,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(500),
    price DECIMAL(10,2),
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_embedding vector(1536);
    v_shop_id INTEGER;
BEGIN
    -- Get the source product's embedding
    SELECT embedding, shop_id INTO v_embedding, v_shop_id
    FROM products
    WHERE id = p_product_id;

    IF v_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.price,
        (1 - (p.embedding <=> v_embedding))::FLOAT AS similarity
    FROM products p
    WHERE p.shop_id = v_shop_id
        AND p.id != p_product_id
        AND p.embedding IS NOT NULL
        AND p.is_active = true
    ORDER BY p.embedding <=> v_embedding
    LIMIT p_limit;
END;
$$;
