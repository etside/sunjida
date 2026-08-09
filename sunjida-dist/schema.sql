-- ============================================================
-- SalesDaddy Database Schema
-- Import via phpMyAdmin → Import tab → Choose File → Go
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `encrypted_password` VARCHAR(255) NOT NULL,
  `raw_user_meta_data` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── User Roles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_role` (`user_id`, `role`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255),
  `full_name` VARCHAR(255),
  `avatar_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `access_token` VARCHAR(255) UNIQUE NOT NULL,
  `refresh_token` VARCHAR(255) UNIQUE NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_access` (`access_token`),
  INDEX `idx_refresh` (`refresh_token`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Businesses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `businesses` (
  `id` VARCHAR(36) PRIMARY KEY,
  `business_name` VARCHAR(255) DEFAULT 'SalesDaddy',
  `greeting_en` TEXT,
  `greeting_bn` TEXT,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `model` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` VARCHAR(36),
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2),
  `stock` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_business` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Conversations ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` VARCHAR(36) PRIMARY KEY,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` VARCHAR(36),
  `role` VARCHAR(20),
  `content` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conv` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── API Keys ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `provider` VARCHAR(50) NOT NULL,
  `service_type` ENUM('text', 'voice', 'both') DEFAULT 'both',
  `api_key` VARCHAR(500) NOT NULL,
  `model` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  `priority` INT DEFAULT 0,
  `monthly_limit` INT DEFAULT 0,
  `monthly_used` INT DEFAULT 0,
  `rate_limit_rpm` INT DEFAULT 60,
  `label` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_provider` (`provider`),
  INDEX `idx_service` (`service_type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Training Data ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `training_data` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` VARCHAR(36) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `data_type` ENUM('text', 'faq', 'product_info', 'response_template', 'keyword_response') DEFAULT 'text',
  `keywords` TEXT,
  `language` VARCHAR(10) DEFAULT 'bn',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_business` (`business_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_type` (`data_type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Auto Responses ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `auto_responses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` VARCHAR(36) DEFAULT NULL,
  `keyword` VARCHAR(255) NOT NULL,
  `response_text` TEXT NOT NULL,
  `response_audio_url` VARCHAR(500),
  `response_type` ENUM('text', 'audio', 'both') DEFAULT 'text',
  `match_type` ENUM('exact', 'contains', 'regex', 'ai_fallback') DEFAULT 'contains',
  `priority` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `language` VARCHAR(10) DEFAULT 'bn',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_business` (`business_id`),
  INDEX `idx_keyword` (`keyword`),
  INDEX `idx_match` (`match_type`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Voice Presets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `voice_presets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `provider` VARCHAR(50) DEFAULT 'elevenlabs',
  `voice_id` VARCHAR(100),
  `model_id` VARCHAR(100),
  `stability` FLOAT DEFAULT 0.5,
  `similarity_boost` FLOAT DEFAULT 0.75,
  `style` FLOAT DEFAULT 0.0,
  `speed` FLOAT DEFAULT 1.0,
  `language` VARCHAR(10) DEFAULT 'bn',
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_business` (`business_id`),
  INDEX `idx_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── API Usage Log ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `api_usage_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `api_key_id` INT,
  `provider` VARCHAR(50),
  `service_type` VARCHAR(20),
  `model` VARCHAR(100),
  `tokens_used` INT DEFAULT 0,
  `cost_usd` DECIMAL(10,6) DEFAULT 0,
  `request_type` VARCHAR(20),
  `business_id` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_key` (`api_key_id`),
  INDEX `idx_date` (`created_at`),
  INDEX `idx_business` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Default Data
-- ============================================================

-- Default Lovable API key (encrypted at runtime by PHP)
INSERT INTO `api_keys` (`provider`, `service_type`, `api_key`, `model`, `label`, `is_active`, `priority`)
VALUES ('lovable', 'both', 'lvk_221u5y_6p1n4l3c3x6y391c0o594c5t074p1s4k1g', 'google/gemini-2.5-pro', 'Default Lovable Gateway', 1, 10)
ON DUPLICATE KEY UPDATE `api_key` = VALUES(`api_key`);

-- Admin user — run /api/setup-admin.php?key=salesdaddy-setup-2024 to create
-- (generates bcrypt hash at runtime for password: Pjokjict4)
-- The INSERT below creates a placeholder; setup-admin.php will update the real hash.
INSERT INTO `users` (`id`, `email`, `encrypted_password`, `raw_user_meta_data`)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@salesdaddy.com', '$2y$10$placeholder', '{"full_name":"Super Admin","role":"super_admin"}')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Admin profile
INSERT IGNORE INTO `profiles` (`id`, `email`, `full_name`)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@salesdaddy.com', 'Super Admin');

-- Admin roles
INSERT IGNORE INTO `user_roles` (`user_id`, `role`)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin');
INSERT IGNORE INTO `user_roles` (`user_id`, `role`)
VALUES ('00000000-0000-0000-0000-000000000001', 'super_admin');

-- ============================================================
-- After importing this file, visit:
--   https://yourdomain.com/api/setup-admin.php?key=salesdaddy-setup-2024
-- This will create/update the admin user with the correct password hash.
-- DELETE setup-admin.php after running for security.
-- ============================================================
