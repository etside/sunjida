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
    $adminId = '00000000-0000-0000-0000-000000000001';
    $adminEmail = 'admin@salesdaddy.com';

    // Check if admin user exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$adminEmail]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Update password hash
        $stmt = $db->prepare('UPDATE users SET encrypted_password = ?, raw_user_meta_data = ? WHERE email = ?');
        $stmt->execute([$hash, json_encode(['full_name' => 'Super Admin', 'role' => 'super_admin']), $adminEmail]);
    } else {
        // Insert new admin user
        $stmt = $db->prepare('INSERT INTO users (id, email, encrypted_password, raw_user_meta_data) VALUES (?, ?, ?, ?)');
        $stmt->execute([$adminId, $adminEmail, $hash, json_encode(['full_name' => 'Super Admin', 'role' => 'super_admin'])]);
    }

    // Ensure admin role exists (required by admin panel login)
    $db->prepare('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)')
       ->execute([$adminId, 'admin']);

    // Ensure super_admin role exists
    $db->prepare('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)')
       ->execute([$adminId, 'super_admin']);

    // Ensure profile exists
    $db->prepare('INSERT IGNORE INTO profiles (id, email, full_name) VALUES (?, ?, ?)')
       ->execute([$adminId, $adminEmail, 'Super Admin']);

    jsonResponse([
        'success' => true,
        'message' => 'Admin user configured successfully!',
        'credentials' => [
            'email' => $adminEmail,
            'password' => 'Pjokjict4',
            'login_url' => '/admin/',
        ],
        'next_steps' => [
            '1. Login at /admin/ with the credentials above',
            '2. DELETE this file for security: rm api/setup-admin.php',
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse(['error' => 'Setup failed: ' . $e->getMessage()], 500);
}
