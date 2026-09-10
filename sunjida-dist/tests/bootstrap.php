<?php
/**
 * Test Bootstrap
 * Initializes test environment
 */

declare(strict_types=1);

// Load autoloader
require_once dirname(__DIR__) . '/vendor/autoload.php';

// Load environment
use Sunjida\Config\Env;

// Set test environment
$_ENV['APP_ENV'] = 'testing';

// Load .env if exists
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    Env::load($envFile);
}

// Override for testing
$_ENV['DB_HOST'] = $_ENV['DB_HOST'] ?? 'localhost';
$_ENV['DB_NAME'] = $_ENV['DB_NAME'] ?? 'sunjida_test';
$_ENV['DB_USER'] = $_ENV['DB_USER'] ?? 'sunjida';
$_ENV['DB_PASS'] = $_ENV['DB_PASS'] ?? '';

// Disable CSRF in tests
$_ENV['DISABLE_CSRF'] = 'true';

// Set timezone
date_default_timezone_set('UTC');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');
