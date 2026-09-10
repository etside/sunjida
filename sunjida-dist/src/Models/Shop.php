<?php
namespace Models;

use Config\Database;

class Shop
{
    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM shops WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByMetaPageId(string $pageId): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM shops WHERE meta_page_id = ?');
        $stmt->execute([$pageId]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO shops (name, slug, meta_page_id, meta_page_token, meta_app_secret, domain, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([
            $data['name'],
            $data['slug'] ?? self::generateSlug($data['name']),
            $data['meta_page_id'] ?? null,
            $data['meta_page_token'] ?? null,
            $data['meta_app_secret'] ?? null,
            $data['domain'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getInstance();
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if (in_array($key, ['name', 'slug', 'meta_page_id', 'meta_page_token', 'meta_app_secret', 'domain', 'voice_enabled', 'system_prompt', 'is_active'])) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        if (empty($fields)) return false;
        $values[] = $id;
        $stmt = $db->prepare('UPDATE shops SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public static function delete(int $id): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM shops WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function list(int $page = 1, int $perPage = 20): array
    {
        $db = Database::getInstance();
        $offset = ($page - 1) * $perPage;
        $stmt = $db->prepare('SELECT * FROM shops ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$perPage, $offset]);
        $shops = $stmt->fetchAll();
        $count = $db->query('SELECT COUNT(*) FROM shops')->fetchColumn();
        return ['data' => $shops, 'total' => (int) $count, 'page' => $page, 'per_page' => $perPage];
    }

    private static function generateSlug(string $name): string
    {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
    }
}
