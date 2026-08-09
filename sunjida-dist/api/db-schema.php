<?php
/**
 * SalesDaddy DB Schema Migration — Run once
 * GET /api/db-schema.php?key=salesdaddy-setup-2024
 */

require_once __DIR__ . '/config.php';
corsHeaders();

$key = $_GET['key'] ?? '';
if ($key !== 'salesdaddy-setup-2024') {
    jsonResponse(['error' => 'Invalid setup key'], 403);
}

try {
    $db = getDB();
    $results = [];

    // ── API Keys table ──────────────────────────────────────────────
    $db->exec("CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        service_type ENUM('text', 'voice', 'both') DEFAULT 'both',
        api_key VARCHAR(500) NOT NULL,
        model VARCHAR(100),
        is_active TINYINT(1) DEFAULT 1,
        priority INT DEFAULT 0,
        monthly_limit INT DEFAULT 0,
        monthly_used INT DEFAULT 0,
        rate_limit_rpm INT DEFAULT 60,
        label VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_provider (provider),
        INDEX idx_service (service_type),
        INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = 'api_keys table ready';

    // ── Training Data table ─────────────────────────────────────────
    $db->exec("CREATE TABLE IF NOT EXISTS training_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id VARCHAR(36) DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'general',
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        data_type ENUM('text', 'faq', 'product_info', 'response_template', 'keyword_response') DEFAULT 'text',
        keywords TEXT,
        language VARCHAR(10) DEFAULT 'bn',
        is_active TINYINT(1) DEFAULT 1,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_business (business_id),
        INDEX idx_category (category),
        INDEX idx_type (data_type),
        INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = 'training_data table ready';

    // ── Auto Responses table ────────────────────────────────────────
    $db->exec("CREATE TABLE IF NOT EXISTS auto_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id VARCHAR(36) DEFAULT NULL,
        keyword VARCHAR(255) NOT NULL,
        response_text TEXT NOT NULL,
        response_audio_url VARCHAR(500),
        response_type ENUM('text', 'audio', 'both') DEFAULT 'text',
        match_type ENUM('exact', 'contains', 'regex', 'ai_fallback') DEFAULT 'contains',
        priority INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        language VARCHAR(10) DEFAULT 'bn',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_business (business_id),
        INDEX idx_keyword (keyword),
        INDEX idx_match (match_type),
        INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = 'auto_responses table ready';

    // ── Voice Presets table ─────────────────────────────────────────
    $db->exec("CREATE TABLE IF NOT EXISTS voice_presets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id VARCHAR(36) DEFAULT NULL,
        name VARCHAR(100) NOT NULL,
        provider VARCHAR(50) DEFAULT 'elevenlabs',
        voice_id VARCHAR(100),
        model_id VARCHAR(100),
        stability FLOAT DEFAULT 0.5,
        similarity_boost FLOAT DEFAULT 0.75,
        style FLOAT DEFAULT 0.0,
        speed FLOAT DEFAULT 1.0,
        language VARCHAR(10) DEFAULT 'bn',
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_business (business_id),
        INDEX idx_default (is_default)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = 'voice_presets table ready';

    // ── API Usage Log table ─────────────────────────────────────────
    $db->exec("CREATE TABLE IF NOT EXISTS api_usage_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        api_key_id INT,
        provider VARCHAR(50),
        service_type VARCHAR(20),
        model VARCHAR(100),
        tokens_used INT DEFAULT 0,
        cost_usd DECIMAL(10,6) DEFAULT 0,
        request_type VARCHAR(20),
        business_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_key (api_key_id),
        INDEX idx_date (created_at),
        INDEX idx_business (business_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = 'api_usage_log table ready';

    // ── Insert default API key from config ──────────────────────────
    $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM api_keys WHERE api_key = ?');
    $stmt->execute([AI_API_KEY]);
    $exists = $stmt->fetch();

    if (!$exists || $exists['cnt'] == 0) {
        $db->prepare('INSERT INTO api_keys (provider, service_type, api_key, model, label, is_active, priority) VALUES (?, ?, ?, ?, ?, ?, ?)')
           ->execute(['lovable', 'both', AI_API_KEY, AI_MODEL, 'Default Lovable Gateway', 1, 10]);
        $results[] = 'Default Lovable API key inserted';
    }

    jsonResponse([
        'status' => 'success',
        'message' => 'Schema migration complete',
        'results' => $results,
    ]);

} catch (Throwable $e) {
    jsonResponse(['status' => 'error', 'error' => $e->getMessage(), 'results' => $results ?? []], 500);
}
