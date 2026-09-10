<?php
/**
 * Admin Login Endpoint
 * Authenticates admin users and returns JWT token
 *
 * POST - Authenticate with email/password
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
$controller->login();
