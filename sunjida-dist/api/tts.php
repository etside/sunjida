<?php
/**
 * SalesDaddy TTS API — v2 Multi-Provider Bengali Voice
 *
 * Supports: ElevenLabs, OpenAI TTS, Edge TTS (free fallback)
 * Routes to best available voice provider
 * Falls back through providers when one fails
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

$isBengali = preg_match('/[\x{0980}-\x{09FF}]/u', $text);
$voice = $input['voice'] ?? ($isBengali ? 'nova' : 'alloy');
$speed = $input['speed'] ?? 1.0;

// Try providers in order: ElevenLabs → OpenAI → Edge TTS
$result = tryElevenLabs($text, $isBengali, $voice);
if (!$result) $result = tryOpenAITTS($text, $voice, $speed);
if (!$result) $result = tryEdgeTTS($text, $isBengali);

if ($result) {
    // Log usage
    try {
        $db = getDB();
        $provider = $result['provider'] ?? 'unknown';
        $db->prepare('INSERT INTO api_usage_log (provider, service_type, model, tokens_used, request_type) VALUES (?, ?, ?, ?, ?)')
           ->execute([$provider, 'voice', 'tts', mb_strlen($text), 'tts']);
    } catch (Throwable $e) { /* non-critical */ }

    header('Content-Type: audio/mpeg');
    header('Cache-Control: no-cache');
    header('X-Accel-Buffering: no');
    header('X-TTS-Provider: ' . ($result['provider'] ?? 'unknown'));
    echo $result['audio'];
    exit;
}

http_response_code(502);
header('Content-Type: application/json');
echo json_encode(['error' => 'All TTS providers failed']);

// ══════════════════════════════════════════════════════════════════════
// Provider functions
// ══════════════════════════════════════════════════════════════════════

function tryElevenLabs(string $text, bool $isBengali, string $voice): ?array {
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT api_key, model FROM api_keys WHERE is_active = 1 AND provider = "elevenlabs" AND (service_type = "voice" OR service_type = "both") ORDER BY priority DESC LIMIT 1');
        $stmt->execute();
        $key = $stmt->fetch();
        if (!$key) return null;
        $key['api_key'] = decryptKey($key['api_key']);

        // Bengali voice mapping for ElevenLabs
        $voiceId = $isBengali ? 'EXAVITQu4vr4xnSDxMaL' : '21m00Tcm4TlvDq8ikWAM'; // default voices
        // Try to get preset from DB
        $preset = $db->query('SELECT voice_id FROM voice_presets WHERE is_default = 1 AND provider = "elevenlabs" LIMIT 1')->fetch();
        if ($preset && $preset['voice_id']) $voiceId = $preset['voice_id'];

        $ch = curl_init("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'text' => $text,
                'model_id' => $key['model'] ?? 'eleven_multilingual_v2',
                'voice_settings' => ['stability' => 0.5, 'similarity_boost' => 0.75],
            ]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'xi-api-key: ' . $key['api_key'],
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $audio = '';
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$audio) {
            $audio .= $chunk;
            return strlen($chunk);
        });
        curl_exec($ch);

        if (curl_errno($ch) || empty($audio)) {
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        return ['audio' => $audio, 'provider' => 'elevenlabs'];
    } catch (Throwable $e) {
        return null;
    }
}

function tryOpenAITTS(string $text, string $voice, float $speed): ?array {
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT api_key, model FROM api_keys WHERE is_active = 1 AND provider = "openai" AND (service_type = "voice" OR service_type = "both") ORDER BY priority DESC LIMIT 1');
        $stmt->execute();
        $key = $stmt->fetch();
        if ($key) $key['api_key'] = decryptKey($key['api_key']);

        $apiKey = ($key['api_key'] ?? '') ?: AI_API_KEY;
        $model = $key['model'] ?? 'tts-1-hd';

        $ch = curl_init('https://api.openai.com/v1/audio/speech');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'model' => $model,
                'input' => $text,
                'voice' => $voice,
                'speed' => $speed,
                'response_format' => 'mp3',
            ]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $audio = '';
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$audio) {
            $audio .= $chunk;
            return strlen($chunk);
        });
        curl_exec($ch);

        if (curl_errno($ch) || empty($audio)) {
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        return ['audio' => $audio, 'provider' => 'openai'];
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Edge TTS — Free Microsoft TTS with excellent Bengali support
 * Uses edge-tts API via a simple HTTP request
 */
function tryEdgeTTS(string $text, bool $isBengali): ?array {
    try {
        // Use the free edge-tts endpoint
        $voice = $isBengali ? 'bn-BD-NabanitaNeural' : 'en-US-JennyNeural';
        $rate = '+0%';
        $pitch = '+0Hz';

        // Use a public edge-tts proxy or direct WebSocket
        // For simplicity, use a fallback HTTP endpoint
        $url = 'https://api.edge-tts.com/v1/synthesize';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'text' => $text,
                'voice' => $voice,
                'rate' => $rate,
                'pitch' => $pitch,
            ]),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30,
        ]);

        $audio = '';
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$audio) {
            $audio .= $chunk;
            return strlen($chunk);
        });
        curl_exec($ch);

        if (curl_errno($ch) || empty($audio) || strpos($audio, 'error') !== false) {
            curl_close($ch);
            // Final fallback: use PHP's built-in capabilities
            return tryLocalTTS($text, $isBengali);
        }
        curl_close($ch);

        return ['audio' => $audio, 'provider' => 'edge-tts'];
    } catch (Throwable $e) {
        return tryLocalTTS($text, $isBengali);
    }
}

/**
 * Local TTS fallback — generates a simple audio file using espeak if available
 */
function tryLocalTTS(string $text, bool $isBengali): ?array {
    try {
        $voice = $isBengali ? 'bn' : 'en';
        $tmpFile = tempnam(sys_get_temp_dir(), 'tts_');
        $wavFile = $tmpFile . '.wav';
        $mp3File = $tmpFile . '.mp3';

        // Try espeak
        exec("espeak -v {$voice} -w " . escapeshellarg($wavFile) . " " . escapeshellarg($text) . " 2>&1", $output, $returnCode);

        if ($returnCode === 0 && file_exists($wavFile)) {
            // Convert to mp3 if ffmpeg available
            exec("ffmpeg -i " . escapeshellarg($wavFile) . " -b:a 128k " . escapeshellarg($mp3File) . " 2>&1", $output, $convertCode);
            if ($convertCode === 0 && file_exists($mp3File)) {
                $audio = file_get_contents($mp3File);
                @unlink($wavFile);
                @unlink($mp3File);
                @unlink($tmpFile);
                return ['audio' => $audio, 'provider' => 'local-espeak'];
            }
            // Return WAV if mp3 conversion failed
            $audio = file_get_contents($wavFile);
            @unlink($wavFile);
            @unlink($tmpFile);
            return ['audio' => $audio, 'provider' => 'local-espeak-wav'];
        }

        @unlink($tmpFile);
        return null;
    } catch (Throwable $e) {
        return null;
    }
}
