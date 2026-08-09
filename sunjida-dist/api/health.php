<?php
/**
 * Health check endpoint — confirms PHP fallback is running.
 * GET /api/health.php
 */

header('Content-Type: application/json');
echo json_encode([
    'status'  => 'ok',
    'backend' => 'php-fallback',
    'time'    => gmdate('c'),
    'php'     => PHP_VERSION,
]);
