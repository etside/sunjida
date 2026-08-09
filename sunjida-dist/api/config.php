<?php
/**
 * SalesDaddy PHP Fallback Backend
 * Used when Supabase is unavailable on cPanel shared hosting.
 * Connects to local MySQL and proxies to the AI gateway.
 */

// ── Database credentials (cPanel shared hosting) ──────────────────────
define('DB_HOST',   'localhost');
define('DB_NAME',   'torquest_Sales');
define('DB_USER',   'torquest_daddy');
define('DB_PASS',   'ER?b~SJAqPsYShy+');

// ── AI Gateway (same one Supabase edge functions use) ─────────────────
define('AI_GATEWAY_URL', 'https://ai.gateway.lovable.dev/v1/chat/completions');
define('AI_API_KEY',     'lvk_221u5y_6p1n4l3c3x6y391c0o594c5t074p1s4k1g');
define('AI_MODEL',       'google/gemini-2.5-pro');

// ── Supabase (for reference / pass-through) ───────────────────────────
define('SUPABASE_URL',          'https://yplgzmxzrslofnuagfaz.supabase.co');
define('SUPABASE_PUBLISHABLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbGd6bXh6cnNsb2ZudWFnZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTgxNTgsImV4cCI6MjA4NDc3NDE1OH0.i9RxJRB2VE87Qqvvgu27OVPqpFUfdat1DLYI6j_TxIs');

// ── Helpers ───────────────────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function corsHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sseResponse(string $text, ?string $conversationId = null): void {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('X-Accel-Buffering: no');
    header('Access-Control-Expose-Headers: X-Conversation-Id');
    if ($conversationId) {
        header('X-Conversation-Id: ' . $conversationId);
    }

    $chunks = preg_split('/\S+\s*/', $text, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
    if (!$chunks) $chunks = [$text];

    foreach ($chunks as $chunk) {
        $data = json_encode(['choices' => [['delta' => ['content' => $chunk]]]]);
        echo "data: $data\n\n";
        ob_flush();
        flush();
        usleep(12000); // 12ms delay for progressive rendering
    }
    echo "data: [DONE]\n\n";
    ob_flush();
    flush();
}

// ── Security helpers ────────────────────────────────────────────────

/**
 * Generate a v4 UUID
 */
function generateUUID(): string {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff), (mt_rand(0, 0x0fff) | 0x4000),
        (mt_rand(0, 0x3fff) | 0x8000),
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Encrypt an API key for storage (XOR + base64)
 */
function encryptKey(string $plaintext): string {
    $key = substr(hash('sha256', 'salesdaddy-enc-key', true), 0, 16);
    $iv = random_bytes(16);
    $encrypted = openssl_encrypt($plaintext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt an API key from storage
 */
function decryptKey(string $encoded): string {
    $key = substr(hash('sha256', 'salesdaddy-enc-key', true), 0, 16);
    $raw = base64_decode($encoded, true);
    if (!$raw || strlen($raw) < 17) return $encoded; // not encrypted, return as-is
    $iv = substr($raw, 0, 16);
    $encrypted = substr($raw, 16);
    return openssl_decrypt($encrypted, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv) ?: $encoded;
}

/**
 * CSRF token helpers
 */
function csrfToken(): string {
    session_start();
    if (empty($_SESSION['sd_csrf'])) {
        $_SESSION['sd_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['sd_csrf'];
}

function csrfField(): string {
    return '<input type="hidden" name="_csrf" value="' . htmlspecialchars(csrfToken()) . '">';
}

function verifyCsrf(): bool {
    session_start();
    $token = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return !empty($token) && hash_equals($_SESSION['sd_csrf'] ?? '', $token);
}

/**
 * Session timeout check (30 min inactivity)
 */
function requireAuth(): void {
    session_start();
    if (empty($_SESSION['sd_admin'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    if (isset($_SESSION['sd_last_activity']) && time() - $_SESSION['sd_last_activity'] > 1800) {
        session_destroy();
        jsonResponse(['error' => 'Session expired'], 401);
    }
    $_SESSION['sd_last_activity'] = time();
}

/**
 * Check if Supabase is reachable (quick health check).
 */
function supabaseAvailable(): bool {
    static $cached = null;
    if ($cached !== null) return $cached;

    $ch = curl_init(SUPABASE_URL . '/rest/v1/?select=1');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 3,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_HTTPHEADER     => [
            'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
            'Authorization: Bearer ' . SUPABASE_PUBLISHABLE_KEY,
        ],
    ]);
    curl_exec($ch);
    $cached = (curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 200 && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 500);
    curl_close($ch);
    return $cached;
}
