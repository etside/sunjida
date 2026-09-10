<?php
/**
 * Meta OAuth Callback Endpoint
 * Handles OAuth callback from Meta/Facebook
 *
 * GET - Process OAuth code, connect shop to Meta
 */

declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/src/Config/Env.php';

use Sunjida\Config\Env;
use Sunjida\Controllers\AdminController;

Env::load();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$controller = new AdminController();
$controller->connectMeta();
