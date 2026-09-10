<?php
/**
 * Admin Logout Endpoint
 * Invalidates JWT token
 *
 * POST - Logout current session
 */

declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/src/Config/Env.php';

use Sunjida\Config\Env;
use Sunjida\Controllers\AuthController;

Env::load();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$controller = new AuthController();
$controller->logout();
