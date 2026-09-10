<?php
namespace Models;

use Config\Database;

class Queue
{
    public static function enqueue(int $shopId, string $type, array $payload, int $delay = 0): int
    {
        $db = Database::getInstance();
        $runAt = $delay > 0 ? date('Y-m-d H:i:s', time() + $delay) : date('Y-m-d H:i:s');
        $stmt = $db->prepare('INSERT INTO queue (shop_id, type, payload, status, attempts, run_at, created_at) VALUES (?, ?, ?, ?, 0, ?, NOW())');
        $stmt->execute([$shopId, $type, json_encode($payload), 'pending', $runAt]);
        return (int) $db->lastInsertId();
    }

    public static function dequeue(string $type, int $limit = 10): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM queue WHERE type = ? AND status = ? AND run_at <= NOW() AND attempts < 5 ORDER BY created_at ASC LIMIT ?');
        $stmt->execute([$type, 'pending', $limit]);
        $jobs = $stmt->fetchAll();
        foreach ($jobs as $job) {
            $db->prepare('UPDATE queue SET status = ?, attempts = attempts + 1 WHERE id = ?')->execute(['processing', $job['id']]);
        }
        return $jobs;
    }

    public static function complete(int $id): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE queue SET status = ?, completed_at = NOW() WHERE id = ?');
        return $stmt->execute(['done', $id]);
    }

    public static function fail(int $id, ?string $error = null): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('UPDATE queue SET status = ?, error = ? WHERE id = ?');
        return $stmt->execute(['failed', $error, $id]);
    }

    public static function retry(int $id, int $delay = 60): bool
    {
        $db = Database::getInstance();
        $runAt = date('Y-m-d H:i:s', time() + $delay);
        $stmt = $db->prepare('UPDATE queue SET status = ?, run_at = ? WHERE id = ?');
        return $stmt->execute(['pending', $runAt, $id]);
    }

    public static function cleanup(int $daysOld = 7): int
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM queue WHERE status IN (?, ?) AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)');
        $stmt->execute(['done', 'failed', $daysOld]);
        return $stmt->rowCount();
    }
}
