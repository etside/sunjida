<?php
namespace Models;

use Config\Database;

class Inventory
{
    public static function findByProductId(int $productId): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM inventory WHERE product_id = ?');
        $stmt->execute([$productId]);
        return $stmt->fetch() ?: null;
    }

    public static function findByShopId(int $shopId): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT i.*, p.title, p.sku FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.shop_id = ? ORDER BY i.updated_at DESC');
        $stmt->execute([$shopId]);
        return $stmt->fetchAll();
    }

    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO inventory (shop_id, product_id, quantity, stock_status, last_synced_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())');
        $stmt->execute([
            $data['shop_id'],
            $data['product_id'],
            $data['quantity'] ?? 0,
            $data['stock_status'] ?? 'in_stock',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $productId, array $data): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE inventory SET quantity = ?, stock_status = ?, last_synced_at = NOW(), updated_at = NOW() WHERE product_id = ?');
        return $stmt->execute([$data['quantity'], $data['stock_status'] ?? 'in_stock', $productId]);
    }

    public static function upsert(array $data): int
    {
        $existing = self::findByProductId($data['product_id']);
        if ($existing) {
            self::update($data['product_id'], $data);
            return $existing['id'];
        }
        return self::create($data);
    }

    public static function getStockStatus(int $productId): string
    {
        $inv = self::findByProductId($productId);
        if (!$inv) return 'unknown';
        if ($inv['quantity'] <= 0) return 'out_of_stock';
        if ($inv['quantity'] <= 5) return 'low_stock';
        return 'in_stock';
    }
}
