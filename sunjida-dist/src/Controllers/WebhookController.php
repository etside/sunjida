<?php
/**
 * Webhook Controller
 * Handles Meta Messenger webhook verification and message processing
 */

declare(strict_types=1);

namespace Sunjida\Controllers;

use Sunjida\Config\Env;

class WebhookController
{
    /**
     * Verify Meta webhook subscription
     */
    public function verify(): void
    {
        $verifyToken = Env::get('META_VERIFY_TOKEN');
        $mode = $_GET['hub_mode'] ?? '';
        $token = $_GET['hub_verify_token'] ?? '';
        $challenge = $_GET['hub_challenge'] ?? '';

        if ($mode === 'subscribe' && $token === $verifyToken) {
            http_response_code(200);
            echo $challenge;
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
        }
    }

    /**
     * Handle incoming messages from Meta
     */
    public function handleMessage(): void
    {
        // TODO: Implement message handling logic
        http_response_code(200);
        echo json_encode(['status' => 'ok']);
    }
}
