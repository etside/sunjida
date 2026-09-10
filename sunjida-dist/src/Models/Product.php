<?php
namespace Models;

use Config\Database;

class Product
{
    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByShopId(int $shopId): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC');
        $stmt->execute([$shopId]);
        return $stmt->fetchAll();
    }

    public static function findBySku(int $shopId, string $sku): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM products WHERE shop_id = ? AND sku = ?');
        $stmt->execute([$shopId, $sku]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO products (shop_id, title, description, price, sku, image_url, embedding, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([
            $data['shop_id'],
            $data['title'],
            $data['description'] ?? '',
            $data['price'] ?? 0,
            $data['sku'] ?? null,
            $data['image_url'] ?? null,
            $data['embedding'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getInstance();
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if (in_array($key, ['title', 'description', 'price', 'sku', 'image_url', 'embedding'])) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        if (empty($fields)) return false;
        $fields[] = 'updated_at = NOW()';
        $values[] = $id;
        $stmt = $db->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public static function delete(int $id): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM products WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function search(int $shopId, string $query, int $limit = 10): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM products WHERE shop_id = ? AND (title LIKE ? OR description LIKE ? OR sku LIKE ?) LIMIT ?');
        $like = "%{$query}%";
        $stmt->execute([$shopId, $like, $like, $like, $limit]);
        return $stmt->fetchAll();
    }

    public static function updateEmbedding(int $id, string $embedding): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE products SET embedding = ?, updated_at = NOW() WHERE id = ?');
        return $stmt->execute([$embedding, $id]);
    }

    public static function getProductsNeedingEmbedding(int $shopId, int $limit = 50): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM products WHERE shop_id = ? AND embedding IS NULL LIMIT ?');
        $stmt->execute([$shopId, $limit]);
        return $stmt->fetchAll();
    }
}
