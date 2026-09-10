<?php
/**
 * Meta Messenger Webhook
 * Handles incoming messages from Meta/Facebook Messenger
 *
 * GET  - Webhook verification (hub_verify_token)
 * POST - Incoming message handling
 */

declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/src/Config/Env.php';

use Sunjida\Config\Env;
use Sunjida\Controllers\WebhookController;

Env::load();

$controller = new WebhookController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller->verify();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->handleMessage();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
