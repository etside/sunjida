<?php
/**
 * SalesDaddy - Production Router/Entry Point
 * salesdaddy.torquesticker.com
 *
 * PSR-4 Autoloader + Request Router
 */

declare(strict_types=1);

// Error reporting for production
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Load environment configuration
require_once __DIR__ . '/../src/Config/Env.php';

// PSR-4 Autoloader
spl_autoload_register(function (string $class): void {
    $prefix = 'Sunjida\\';
    $baseDir = dirname(__DIR__) . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use Sunjida\Config\Env;
use Sunjida\Middleware\CorsMiddleware;
use Sunjida\Middleware\RateLimitMiddleware;

// Initialize
Env::load();
CorsMiddleware::handle();

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

// Rate limiting
RateLimitMiddleware::check($uri);

// Route matching
switch (true) {
    // Health check
    case $uri === '/api/health':
        require __DIR__ . '/api/health.php';
        break;

    // API v1 routes
    case preg_match('#^/api/v1/auth/(login|register|logout)$#', $uri, $m):
        require __DIR__ . "/api/v1/auth/{$m[1]}.php";
        break;

    case $uri === '/api/v1/webhook':
        require __DIR__ . '/api/v1/webhook.php';
        break;

    case $uri === '/api/v1/chat':
        require __DIR__ . '/api/v1/chat.php';
        break;

    case $uri === '/api/v1/voice':
        require __DIR__ . '/api/v1/voice.php';
        break;

    case preg_match('#^/api/v1/shops/(create|update|connect-meta)$#', $uri, $m):
        require __DIR__ . "/api/v1/shops/{$m[1]}.php";
        break;

    case preg_match('#^/api/v1/products/(sync|search)$#', $uri, $m):
        require __DIR__ . "/api/v1/products/{$m[1]}.php";
        break;

    case $uri === '/api/v1/inventory/update':
        require __DIR__ . '/api/v1/inventory/update.php';
        break;

    case $uri === '/api/v1/conversations/list':
        require __DIR__ . '/api/v1/conversations/list.php';
        break;

    case $uri === '/api/v1/conversations/detail':
        require __DIR__ . '/api/v1/conversations/detail.php';
        break;

    case preg_match('#^/api/v1/analytics/(usage|leads)$#', $uri, $m):
        require __DIR__ . "/api/v1/analytics/{$m[1]}.php";
        break;

    case preg_match('#^/api/v1/settings/(get|update)$#', $uri, $m):
        require __DIR__ . "/api/v1/settings/{$m[1]}.php";
        break;

    // Admin panel
    case preg_match('#^/admin(/.*)?$#', $uri):
        require __DIR__ . '/admin/index.php';
        break;

    // SPA fallback - serve React app for unmatched routes
    default:
        $staticFile = __DIR__ . $uri;
        if ($uri !== '/' && file_exists($staticFile) && is_file($staticFile)) {
            // Serve static file directly
            return false;
        }

        // Serve SPA index.html
        $spaIndex = dirname(__DIR__) . '/index.html';
        if (file_exists($spaIndex)) {
            header('Content-Type: text/html; charset=utf-8');
            readfile($spaIndex);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
        }
        break;
}
