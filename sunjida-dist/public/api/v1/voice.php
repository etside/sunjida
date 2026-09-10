<?php
/**
 * TTS (Text-to-Speech) Proxy Endpoint
 * Proxies TTS requests to OpenAI or Bengali TTS service
 *
 * POST - Generate speech audio
 */

declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/src/Config/Env.php';

use Sunjida\Config\Env;
use Sunjida\Controllers\WidgetController;

Env::load();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$controller = new WidgetController();
$controller->handleVoice();
