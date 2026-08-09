<?php
/**
 * SalesDaddy TTS API — Lovable AI Gateway (sole provider)
 *
 * Uses ai.gateway.lovable.dev/v1/audio/speech (gpt-4o-mini-tts)
 * Returns audio/mpeg binary response.
 */

require_once __DIR__ . '/config.php';
corsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'POST required'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$text = trim($input['text'] ?? '');
if (!$text) {
    jsonResponse(['error' => 'text is required'], 400);
}

if (mb_strlen($text) > 4000) {
    $text = mb_substr($text, 0, 4000);
}

$speed = $input['speed'] ?? 1.0;

$ch = curl_init('https://ai.gateway.lovable.dev/v1/audio/speech');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode([
        'model'           => 'gpt-4o-mini-tts',
        'input'           => $text,
        'voice'           => 'alloy',
        'speed'           => $speed,
        'response_format' => 'mp3',
    ]),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Lovable-API-Key: ' . AI_API_KEY,
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$audio = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    jsonResponse(['error' => 'TTS gateway error: ' . $curlErr], 502);
}

if ($httpCode !== 200 || !$audio) {
    jsonResponse(['error' => 'TTS failed (HTTP ' . $httpCode . ')'], 502);
}

// Log usage
try {
    $db = getDB();
    $db->prepare('INSERT INTO api_usage_log (provider, service_type, model, tokens_used, request_type) VALUES (?, ?, ?, ?, ?)')
       ->execute(['lovable', 'voice', 'gpt-4o-mini-tts', mb_strlen($text), 'tts']);
} catch (Throwable $e) { /* non-critical */ }

header('Content-Type: audio/mpeg');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');
header('X-TTS-Provider: lovable');
echo $audio;
exit;
