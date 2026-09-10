<?php
/**
 * Widget Controller
 * Handles web widget chat and voice proxy to Lovable backend
 */

declare(strict_types=1);

namespace Sunjida\Controllers;

use Sunjida\Config\Lovable;

class WidgetController
{
    /**
     * Handle chat message from widget
     */
    public function handleChat(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing message']);
            return;
        }

        // TODO: Proxy to Lovable backend
        $endpoint = Lovable::getEndpoint();
        $apiKey = Lovable::getApiKey();

        http_response_code(200);
        echo json_encode(['response' => 'TODO: Connect to Lovable backend']);
    }

    /**
     * Handle voice/TTS request from widget
     */
    public function handleVoice(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing text']);
            return;
        }

        // TODO: Proxy to TTS service
        $endpoint = Lovable::getTtsEndpoint();
        $apiKey = Lovable::getTtsApiKey();

        http_response_code(200);
        echo json_encode(['audio_url' => 'TODO: Generate audio']);
    }
}
