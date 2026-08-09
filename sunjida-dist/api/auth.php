<?php
/**
 * SalesDaddy Auth API — PHP Fallback
 *
 * Mirrors Supabase GoTrue API responses so the compiled React app
 * can authenticate when Supabase is unavailable.
 *
 * POST /api/auth.php?grant_type=password
 *   Body: { "email": "...", "password": "..." }
 *   Returns: Supabase-compatible session JSON
 *
 * GET /api/auth.php?action=session
 *   Returns current session from cookie
 *
 * POST /api/auth.php?action=signout
 *   Clears session
 */

require_once __DIR__ . '/config.php';
corsHeaders();

$action = $_GET['action'] ?? ($_POST['action'] ?? null);
$grantType = $_GET['grant_type'] ?? null;

// ── Sign in with email/password ──────────────────────────────────────
if (($grantType === 'password') || ($_SERVER['REQUEST_METHOD'] === 'POST' && !$action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        jsonResponse([
            'error' => 'invalid_grant',
            'error_description' => 'Email and password are required',
        ], 400);
    }

    try {
        $db = getDB();

        // Look up user in local MySQL
        $stmt = $db->prepare('SELECT id, email, encrypted_password, raw_user_meta_data FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['encrypted_password'])) {
            jsonResponse([
                'error' => 'invalid_grant',
                'error_description' => 'Invalid login credentials',
            ], 401);
        }

        // Check if user has admin role
        $roleStmt = $db->prepare('SELECT role FROM user_roles WHERE user_id = ? AND role = ?');
        $roleStmt->execute([$user['id'], 'admin']);
        $isAdmin = $roleStmt->fetch() ? true : false;

        // Create session token
        $accessToken = bin2hex(random_bytes(32));
        $refreshToken = bin2hex(random_bytes(32));
        $expiresAt = time() + 3600; // 1 hour

        // Store session
        $db->prepare('INSERT INTO sessions (user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)')
           ->execute([$user['id'], $accessToken, $refreshToken, date('Y-m-d H:i:s', $expiresAt)]);

        // Set session cookie
        setcookie('sd_session', $accessToken, [
            'expires' => $expiresAt,
            'path' => '/',
            'httponly' => true,
            'secure' => true,
            'samesite' => 'Lax',
        ]);

        // Parse metadata
        $meta = json_decode($user['raw_user_meta_data'] ?? '{}', true);

        jsonResponse([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => 3600,
            'expires_at' => $expiresAt,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'app_metadata' => ['provider' => 'email'],
                'user_metadata' => $meta,
                'created_at' => date('c'),
            ],
        ]);

    } catch (Throwable $e) {
        jsonResponse(['error' => 'server_error', 'error_description' => $e->getMessage()], 500);
    }
}

// ── Get current session ──────────────────────────────────────────────
if ($action === 'session' || ($_SERVER['REQUEST_METHOD'] === 'GET' && !$grantType)) {
    $token = $_COOKIE['sd_session'] ?? null;
    if (!$token) {
        jsonResponse(['user' => null, 'session' => null]);
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT s.*, u.email, u.raw_user_meta_data FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.access_token = ? AND s.expires_at > NOW()');
        $stmt->execute([$token]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['user' => null, 'session' => null]);
        }

        $meta = json_decode($session['raw_user_meta_data'] ?? '{}', true);

        jsonResponse([
            'session' => [
                'access_token' => $token,
                'user' => [
                    'id' => $session['user_id'],
                    'email' => $session['email'],
                    'app_metadata' => ['provider' => 'email'],
                    'user_metadata' => $meta,
                ],
            ],
            'user' => [
                'id' => $session['user_id'],
                'email' => $session['email'],
                'user_metadata' => $meta,
            ],
        ]);
    } catch (Throwable $e) {
        jsonResponse(['user' => null, 'session' => null]);
    }
}

// ── Sign out ─────────────────────────────────────────────────────────
if ($action === 'signout') {
    $token = $_COOKIE['sd_session'] ?? null;
    if ($token) {
        try {
            $db = getDB();
            $db->prepare('DELETE FROM sessions WHERE access_token = ?')->execute([$token]);
        } catch (Throwable $e) { /* ignore */ }
    }
    setcookie('sd_session', '', time() - 3600, '/');
    jsonResponse(['message' => 'Signed out']);
}

// ── Refresh token ────────────────────────────────────────────────────
if ($action === 'token' && $grantType === 'refresh_token') {
    $input = json_decode(file_get_contents('php://input'), true);
    $refreshToken = $input['refresh_token'] ?? '';

    if (!$refreshToken) {
        jsonResponse(['error' => 'invalid_grant', 'error_description' => 'refresh_token required'], 400);
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT s.*, u.email, u.raw_user_meta_data FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.refresh_token = ?');
        $stmt->execute([$refreshToken]);
        $session = $stmt->fetch();

        if (!$session) {
            jsonResponse(['error' => 'invalid_grant', 'error_description' => 'Invalid refresh token'], 401);
        }

        // Rotate tokens
        $newAccess = bin2hex(random_bytes(32));
        $newRefresh = bin2hex(random_bytes(32));
        $expiresAt = time() + 3600;

        $db->prepare('UPDATE sessions SET access_token = ?, refresh_token = ?, expires_at = ? WHERE refresh_token = ?')
           ->execute([$newAccess, $newRefresh, date('Y-m-d H:i:s', $expiresAt), $refreshToken]);

        $meta = json_decode($session['raw_user_meta_data'] ?? '{}', true);

        jsonResponse([
            'access_token' => $newAccess,
            'refresh_token' => $newRefresh,
            'expires_in' => 3600,
            'expires_at' => $expiresAt,
            'token_type' => 'bearer',
            'user' => [
                'id' => $session['user_id'],
                'email' => $session['email'],
                'user_metadata' => $meta,
            ],
        ]);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'server_error', 'error_description' => $e->getMessage()], 500);
    }
}

jsonResponse(['error' => 'unsupported_grant_type'], 400);
