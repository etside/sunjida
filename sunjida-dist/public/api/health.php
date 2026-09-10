<?php
/**
 * Health Check Endpoint
 * Returns system status for monitoring/load balancers
 */

declare(strict_types=1);

header('Content-Type: application/json');

echo json_encode([
    'status' => 'healthy',
    'service' => 'salesdaddy-api',
    'version' => '1.0.0',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
], JSON_PRETTY_PRINT);
