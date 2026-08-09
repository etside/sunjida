<?php
/**
 * SalesDaddy Chat API — PHP Fallback (v2)
 *
 * Features:
 * - Multi API key routing with fallback
 * - Training data injection into system prompt
 * - Auto-response keyword detection
 * - Credit fallback with pre-recorded responses
 * - API usage logging
 */

require_once __DIR__ . '/config.php';
corsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Bootstrap (greeting + enabled) ───────────────────────────────
if ($method === 'GET') {
    $businessId = $_GET['businessId'] ?? null;

    try {
        $db = getDB();
        $settings = getSettings($db, $businessId);
        jsonResponse([
            'business_name' => $settings['business_name'] ?? 'SalesDaddy',
            'greeting_en'   => $settings['greeting_en'] ?? 'Hi! How can I help you today?',
            'greeting_bn'   => $settings['greeting_bn'] ?? 'হ্যালো! আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
            'is_enabled'    => (bool)($settings['is_enabled'] ?? 1),
        ]);
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// ── POST: Chat ────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $businessId     = $input['businessId'] ?? null;
    $messages       = $input['messages'] ?? [];
    $conversationId = $input['conversationId'] ?? null;

    if (empty($messages)) {
        jsonResponse(['error' => 'messages is required'], 400);
    }

    $messages = array_slice($messages, -20);
    $lastUserMsg = end($messages)['content'] ?? '';

    try {
        $db = getDB();
        $settings = getSettings($db, $businessId);

        if (empty($settings['is_enabled'])) {
            jsonResponse(['error' => 'The assistant is currently turned off.'], 503);
        }

        // ── Check auto-responses first (keyword detection) ──────────
        $autoResponse = checkAutoResponses($db, $lastUserMsg, $businessId);
        if ($autoResponse) {
            sseResponse($autoResponse['response_text'], $conversationId);
            logUsage($db, null, 'keyword_match', 'auto_response', null, 0, $businessId);
            exit;
        }

        // ── Check credit fallback ───────────────────────────────────
        $creditStatus = getCreditStatus($db);
        if ($creditStatus['should_fallback']) {
            $fallback = getFallbackResponse($db, $lastUserMsg, $businessId);
            if ($fallback) {
                sseResponse($fallback, $conversationId);
                logUsage($db, null, 'credit_fallback', 'auto_response', null, 0, $businessId);
                exit;
            }
        }

        // ── Build system prompt with training data ──────────────────
        $system = buildSystemPrompt($db, $settings, $businessId);

        // ── Select best API key ─────────────────────────────────────
        $apiKey = selectApiKey($db, 'text');
        if (!$apiKey) {
            jsonResponse(['error' => 'No text API keys available'], 503);
        }

        // ── Build conversation ──────────────────────────────────────
        $convo = array_merge([['role' => 'system', 'content' => $system]], $messages);

        $payload = json_encode([
            'model'    => $apiKey['model'] ?? AI_MODEL,
            'messages' => $convo,
            'stream'   => true,
        ]);

        $endpoint = getProviderEndpoint($apiKey['provider']);
        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Lovable-API-Key: ' . $apiKey['api_key'],
            ],
            CURLOPT_TIMEOUT        => 60,
        ]);

        $reply = '';
        $startTime = microtime(true);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $chunk) use (&$reply) {
            $lines = explode("\n", $chunk);
            foreach ($lines as $line) {
                $line = trim($line);
                if (str_starts_with($line, 'data: ')) {
                    $data = substr($line, 6);
                    if ($data === '[DONE]') break;
                    $json = json_decode($data, true);
                    $delta = $json['choices'][0]['delta']['content'] ?? '';
                    $reply .= $delta;
                }
            }
            return strlen($chunk);
        });
        curl_exec($ch);

        $duration = microtime(true) - $startTime;
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            // Try next API key as fallback
            $nextKey = selectApiKey($db, 'text', $apiKey['id']);
            if ($nextKey) {
                curl_close($ch);
                // Retry with next key (simplified — full impl would recurse)
            }
            jsonResponse(['error' => 'AI gateway error: ' . curl_error($ch)], 502);
        }
        curl_close($ch);

        if (!$reply) $reply = 'Sorry, I could not put together a reply. Could you try rephrasing?';

        // ── Log usage ───────────────────────────────────────────────
        $tokens = estimateTokens($convo, $reply);
        logUsage($db, $apiKey['id'], $apiKey['provider'], 'text', $apiKey['model'], $tokens, $businessId, $duration);

        storeMessages($db, $conversationId, $messages, $reply);
        sseResponse($reply, $conversationId);

    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// ══════════════════════════════════════════════════════════════════════
// Helper functions
// ══════════════════════════════════════════════════════════════════════

function getSettings(PDO $db, ?string $businessId): array {
    if ($businessId) {
        $stmt = $db->prepare('SELECT * FROM businesses WHERE id = ? LIMIT 1');
        $stmt->execute([$businessId]);
        $row = $stmt->fetch();
        if ($row) return $row;
    }
    return [
        'business_name' => 'SalesDaddy',
        'greeting_en'   => 'Hi! How can I help you today?',
        'greeting_bn'   => 'হ্যালো! আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
        'is_enabled'    => 1,
        'model'         => AI_MODEL,
    ];
}

/**
 * Build system prompt with training data injected
 */
function buildSystemPrompt(PDO $db, array $settings, ?string $businessId): string {
    $name = $settings['business_name'] ?? 'SalesDaddy';
    $products = '';
    $training = '';

    // Load product catalog
    try {
        $stmt = $db->query('SELECT name, description, price, stock FROM products LIMIT 50');
        $rows = $stmt->fetchAll();
        if ($rows) {
            $lines = [];
            foreach ($rows as $r) {
                $line = "- {$r['name']}";
                if (!empty($r['description'])) $line .= ": {$r['description']}";
                if (!empty($r['price'])) $line .= " (৳{$r['price']})";
                if (!empty($r['stock'])) $line .= " [Stock: {$r['stock']}]";
                $lines[] = $line;
            }
            $products = "\n\nProduct Catalog:\n" . implode("\n", $lines);
        }
    } catch (Throwable $e) { /* products table may not exist */ }

    // Load training data
    try {
        $stmt = $db->prepare('SELECT category, title, content, keywords FROM training_data WHERE is_active = 1 AND (business_id = ? OR business_id IS NULL) ORDER BY category, id LIMIT 100');
        $stmt->execute([$businessId]);
        $trainingRows = $stmt->fetchAll();
        if ($trainingRows) {
            $byCategory = [];
            foreach ($trainingRows as $t) {
                $cat = $t['category'] ?? 'general';
                $byCategory[$cat][] = $t;
            }
            $trainingLines = [];
            foreach ($byCategory as $cat => $items) {
                $trainingLines[] = "\n[{$cat}]";
                foreach ($items as $item) {
                    $line = "  - {$item['title']}: {$item['content']}";
                    if (!empty($item['keywords'])) $line .= " (Keywords: {$item['keywords']})";
                    $trainingLines[] = $line;
                }
            }
            $training = "\n\nTraining Data (use these patterns for responses):\n" . implode("\n", $trainingLines);
        }
    } catch (Throwable $e) { /* training_data table may not exist */ }

    return "You are SalesDaddy, a friendly and knowledgeable sales assistant for {$name}. Your job is to help customers find products, answer questions, take orders, and provide support.

CRITICAL RULES:
- Always respond in the SAME LANGUAGE the customer uses. If they write in Bangla (বাংলা), respond in Bangla. If they write in English, respond in English. Never mix languages in one reply.
- For Bangla replies: Use natural, conversational Bangla. Write as a native Bangla speaker would. Use simple, polite Bangla suitable for phone/chat sales.
- Keep responses concise and helpful — aim for 1-3 sentences unless the customer asks for details.
- If recommending products, mention the price in Bangladeshi Taka (৳) and include stock availability.
- Be warm, polite, and professional. Use greetings like \"আসসালামু আলাইকুম\" or \"নমস্কার\" when appropriate.
- If you don't know something, say so honestly and offer to connect them with a human.
- Never make up product information. Only reference products from the catalog below.
- When training data patterns are provided below, use them as examples for your response style and content.
{$products}{$training}";
}

/**
 * Check auto-responses for keyword matches
 */
function checkAutoResponses(PDO $db, string $message, ?string $businessId): ?array {
    try {
        $stmt = $db->prepare('SELECT keyword, response_text, response_audio_url, response_type, match_type, priority FROM auto_responses WHERE is_active = 1 AND (business_id = ? OR business_id IS NULL) ORDER BY priority DESC');
        $stmt->execute([$businessId]);
        $responses = $stmt->fetchAll();

        $msgLower = mb_strtolower(trim($message));

        foreach ($responses as $r) {
            $keyword = mb_strtolower(trim($r['keyword']));
            $matchType = $r['match_type'];

            $matched = false;
            if ($matchType === 'exact') {
                $matched = ($msgLower === $keyword);
            } elseif ($matchType === 'contains') {
                $matched = (mb_strpos($msgLower, $keyword) !== false);
            } elseif ($matchType === 'regex') {
                $matched = (bool)preg_match($r['keyword'], $msgLower);
            }

            if ($matched) {
                return $r;
            }
        }
    } catch (Throwable $e) { /* auto_responses table may not exist */ }
    return null;
}

/**
 * Get credit status and decide if fallback should activate
 */
function getCreditStatus(PDO $db): array {
    try {
        $row = $db->query("SELECT SUM(tokens_used) as total_tokens FROM api_usage_log WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())")->fetch();
        $totalTokens = $row['total_tokens'] ?? 0;
        // Simple heuristic: if > 1M tokens used this month, consider fallback
        return ['total_tokens' => $totalTokens, 'should_fallback' => ($totalTokens > 1000000)];
    } catch (Throwable $e) {
        return ['total_tokens' => 0, 'should_fallback' => false];
    }
}

/**
 * Get a fallback response when credits are low (keyword detection + product info)
 */
function getFallbackResponse(PDO $db, string $message, ?string $businessId): ?string {
    // Try auto-responses with ai_fallback match type
    try {
        $stmt = $db->prepare('SELECT response_text FROM auto_responses WHERE is_active = 1 AND match_type = "ai_fallback" AND (business_id = ? OR business_id IS NULL) ORDER BY priority DESC LIMIT 1');
        $stmt->execute([$businessId]);
        $row = $stmt->fetch();
        if ($row) return $row['response_text'];
    } catch (Throwable $e) { /* ignore */ }

    // Try matching product names in message
    try {
        $stmt = $db->prepare('SELECT name, price, description FROM products WHERE is_active = 1 LIMIT 20');
        $stmt->execute();
        $products = $stmt->fetchAll();
        $msgLower = mb_strtolower($message);
        foreach ($products as $p) {
            if (mb_strpos($msgLower, mb_strtolower($p['name'])) !== false) {
                $reply = "{$p['name']}: {$p['description']}";
                if (!empty($p['price'])) $reply .= " — ৳{$p['price']}";
                return $reply;
            }
        }
    } catch (Throwable $e) { /* ignore */ }

    // Default fallback
    return 'ধন্যবাদ! আমাদের AI সিস্টেম এখন ব্যস্ত। অল্প সময় পর আবার চেষ্টা করুন, অথবা আমাদের সাথে ফোনে যোগাযোগ করুন।';
}

/**
 * Select best available API key for a service type
 */
function selectApiKey(PDO $db, string $serviceType, ?int $excludeId = null): ?array {
    try {
        $sql = 'SELECT id, provider, api_key, model, priority, monthly_limit, monthly_used, rate_limit_rpm FROM api_keys WHERE is_active = 1 AND (service_type = ? OR service_type = "both")';
        $params = [$serviceType];
        if ($excludeId) {
            $sql .= ' AND id != ?';
            $params[] = $excludeId;
        }
        $sql .= ' ORDER BY priority DESC, id ASC';
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $keys = $stmt->fetchAll();

        foreach ($keys as $key) {
            // Check monthly limit
            if ($key['monthly_limit'] > 0 && $key['monthly_used'] >= $key['monthly_limit']) {
                continue; // Skip exhausted keys
            }
            $key['api_key'] = decryptKey($key['api_key']);
            return $key;
        }
    } catch (Throwable $e) { /* fallback to config default */ }

    // Return default from config
    return [
        'id' => 0,
        'provider' => 'lovable',
        'api_key' => AI_API_KEY,
        'model' => AI_MODEL,
        'priority' => 0,
        'monthly_limit' => 0,
        'monthly_used' => 0,
        'rate_limit_rpm' => 60,
    ];
}

/**
 * Get API endpoint URL for a provider
 */
function getProviderEndpoint(string $provider): string {
    return match($provider) {
        'openai'    => 'https://api.openai.com/v1/chat/completions',
        'anthropic' => 'https://api.anthropic.com/v1/messages',
        'google'    => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
        'deepseek'  => 'https://api.deepseek.com/v1/chat/completions',
        default     => AI_GATEWAY_URL, // Lovable gateway
    };
}

/**
 * Log API usage
 */
function logUsage(PDO $db, ?int $keyId, string $provider, string $serviceType, ?string $model, int $tokens, ?string $businessId, float $duration = 0): void {
    try {
        $db->prepare('INSERT INTO api_usage_log (api_key_id, provider, service_type, model, tokens_used, cost_usd, request_type, business_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
           ->execute([$keyId, $provider, $serviceType, $model, $tokens, 0, 'chat', $businessId]);
        // Increment monthly usage on the key
        if ($keyId) {
            $db->prepare('UPDATE api_keys SET monthly_used = monthly_used + ? WHERE id = ?')->execute([$tokens, $keyId]);
        }
    } catch (Throwable $e) { /* non-critical */ }
}

/**
 * Rough token estimate
 */
function estimateTokens(array $messages, string $reply): int {
    $totalChars = strlen(json_encode($messages)) + strlen($reply);
    return (int)($totalChars / 3); // rough estimate: ~3 chars per token
}

function storeMessages(PDO $db, ?string $conversationId, array $userMessages, string $reply): void {
    try {
        if (!$conversationId) {
            $conversationId = generateUUID();
            $db->prepare('INSERT IGNORE INTO conversations (id) VALUES (?)')->execute([$conversationId]);
        }
        $stmt = $db->prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)');
        $lastUser = end($userMessages);
        if ($lastUser) $stmt->execute([$conversationId, 'user', $lastUser['content'] ?? '']);
        $stmt->execute([$conversationId, 'assistant', $reply]);
    } catch (Throwable $e) { /* non-critical */ }
}
