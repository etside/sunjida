<?php
/**
 * Admin Dashboard Router
 * Serves admin panel pages
 */

declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/admin';

// Map URI to page
$page = match($uri) {
    '/admin' => 'index',
    '/admin/settings' => 'settings',
    '/admin/analytics' => 'analytics',
    '/admin/conversations' => 'conversations',
    '/admin/onboarding' => 'onboarding',
    default => 'index',
};

$pageFile = __DIR__ . "/pages/{$page}.html";

if (!file_exists($pageFile)) {
    $pageFile = __DIR__ . '/pages/index.html';
}

header('Content-Type: text/html; charset=utf-8');
readfile($pageFile);
