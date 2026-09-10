<?php
namespace Models;

use Config\Database;

class Conversation
{
    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM conversations WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByShopId(int $shopId, int $page = 1, int $perPage = 20): array
    {
        $db = Database::getInstance();
        $offset = ($page - 1) * $perPage;
        $stmt = $db->prepare('SELECT * FROM conversations WHERE shop_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$shopId, $perPage, $offset]);
        $conversations = $stmt->fetchAll();
        $count = $db->prepare('SELECT COUNT(*) FROM conversations WHERE shop_id = ?');
        $count->execute([$shopId]);
        return ['data' => $conversations, 'total' => (int) $count->fetchColumn(), 'page' => $page, 'per_page' => $perPage];
    }

    public static function findByMetaUserId(int $shopId, string $metaUserId): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM conversations WHERE shop_id = ? AND meta_user_id = ? ORDER BY updated_at DESC LIMIT 1');
        $stmt->execute([$shopId, $metaUserId]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO conversations (shop_id, meta_user_id, meta_psid, customer_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([
            $data['shop_id'],
            $data['meta_user_id'],
            $data['meta_psid'] ?? null,
            $data['customer_name'] ?? null,
            $data['status'] ?? 'active',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getInstance();
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if (in_array($key, ['status', 'customer_name', 'meta_psid', 'lead_score'])) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }
        }
        if (empty($fields)) return false;
        $fields[] = 'updated_at = NOW()';
        $values[] = $id;
        $stmt = $db->prepare('UPDATE conversations SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public static function addMessage(int $conversationId, string $role, string $content, ?string $audioUrl = null): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('INSERT INTO messages (conversation_id, role, content, audio_url, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$conversationId, $role, $content, $audioUrl]);
        $messageId = (int) $db->lastInsertId();
        $db->prepare('UPDATE conversations SET updated_at = NOW() WHERE id = ?')->execute([$conversationId]);
        return $messageId;
    }

    public static function getMessages(int $conversationId, int $limit = 50): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?');
        $stmt->execute([$conversationId, $limit]);
        return $stmt->fetchAll();
    }

    public static function getRecentMessages(int $conversationId, int $limit = 10): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?');
        $stmt->execute([$conversationId, $limit]);
        return array_reverse($stmt->fetchAll());
    }
}
