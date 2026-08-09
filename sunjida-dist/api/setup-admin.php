<?php
/**
 * Setup Admin User — run once to create the admin with correct password hash.
 * Visit: /api/setup-admin.php?key=salesdaddy-setup-2024
 * DELETE this file after running for security.
 */
require_once __DIR__ . '/config.php';

$key = $_GET['key'] ?? '';
if ($key !== 'salesdaddy-setup-2024') {
    jsonResponse(['error' => 'Invalid key'], 403);
}

try {
    $db = getDB();
    $hash = password_hash('Pjokjict4', PASSWORD_BCRYPT);

    // Upsert admin user with correct bcrypt hash
    $stmt = $db->prepare('UPDATE users SET encrypted_password = ? WHERE email = ?');
    $stmt->execute([$hash, 'admin@salesdaddy.com']);
    $updated = $stmt->rowCount();

    if ($updated === 0) {
        $stmt = $db->prepare('INSERT INTO users (id, email, encrypted_password, raw_user_meta_data) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            '00000000-0000-0000-0000-000000000001',
            'admin@salesdaddy.com',
            $hash,
            json_encode(['full_name' => 'Super Admin', 'role' => 'super_admin']),
        ]);
    }

    // Ensure admin role exists
    $db->prepare('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)')
       ->execute(['00000000-0000-0000-0000-000000000001', 'admin']);
    $db->prepare('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)')
       ->execute(['00000000-0000-0000-0000-000000000001', 'super_admin']);

    // Ensure profile exists
    $db->prepare('INSERT IGNORE INTO profiles (id, email, full_name) VALUES (?, ?, ?)')
       ->execute(['00000000-0000-0000-0000-000000000001', 'admin@salesdaddy.com', 'Super Admin']);

    jsonResponse([
        'success' => true,
        'message' => 'Admin user configured. You can now log in at /admin/ with admin@salesdaddy.com',
    ]);
} catch (Throwable $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
