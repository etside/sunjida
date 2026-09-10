<?php
namespace Models;

use Config\Database;

class User
{
    public static function findById(int $id): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByEmail(string $email): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::getInstance();
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (email, encrypted_password, full_name, role, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$data['email'], $hash, $data['full_name'] ?? '', $data['role'] ?? 'admin']);
        $userId = (int) $db->lastInsertId();
        $db->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)')->execute([$userId, $data['role'] ?? 'admin']);
        return $userId;
    }

    public static function verifyPassword(string $email, string $password): ?array
    {
        $user = self::findByEmail($email);
        if (!$user) return null;
        if (!password_verify($password, $user['encrypted_password'])) return null;
        return $user;
    }

    public static function hasRole(int $userId, string $role): bool
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT 1 FROM user_roles WHERE user_id = ? AND role = ?');
        $stmt->execute([$userId, $role]);
        return (bool) $stmt->fetch();
    }

    public static function getRoles(int $userId): array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ?');
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(), 'role');
    }
}
