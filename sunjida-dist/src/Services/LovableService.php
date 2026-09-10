<?php
namespace Services;

use Config\Lovable;

class LovableService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = Lovable::getApiKey();
        $this->baseUrl = Lovable::getBaseUrl();
    }

    public function chat(array $messages, string $model = null, array $tools = [], string $systemPrompt = ''): array
    {
        $model = $model ?? Lovable::getDefaultModel();
        $body = ['model' => $model, 'messages' => $messages, 'stream' => false];
        if (!empty($tools)) $body['tools'] = $tools;
        if ($systemPrompt) array_unshift($body['messages'], ['role' => 'system', 'content' => $systemPrompt]);

        $response = $this->request('/chat/completions', $body);
        return [
            'content' => $response['choices'][0]['message']['content'] ?? '',
            'tool_calls' => $response['choices'][0]['message']['tool_calls'] ?? null,
            'usage' => $response['usage'] ?? [],
        ];
    }

    public function chatStream(array $messages, string $model = null, string $systemPrompt = ''): \Generator
    {
        $model = $model ?? Lovable::getDefaultModel();
        $body = ['model' => $model, 'messages' => $messages, 'stream' => true];
        if ($systemPrompt) array_unshift($body['messages'], ['role' => 'system', 'content' => $systemPrompt]);

        $response = $this->requestStream('/chat/completions', $body);
        foreach ($response as $line) {
            if (str_starts_with($line, 'data: ')) {
                $data = substr($line, 6);
                if ($data === '[DONE]') break;
                $json = json_decode($data, true);
                if (isset($json['choices'][0]['delta']['content'])) {
                    yield $json['choices'][0]['delta']['content'];
                }
            }
        }
    }

    public function embed(string $text, string $model = null): array
    {
        $model = $model ?? Lovable::getEmbeddingModel();
        $response = $this->request('/embeddings', ['model' => $model, 'input' => $text]);
        return $response['data'][0]['embedding'] ?? [];
    }

    public function tts(string $text, string $voice = null, float $speed = 1.0): string
    {
        $voice = $voice ?? Lovable::getTtsVoice();
        $response = $this->request('/audio/speech', [
            'model' => Lovable::getTtsModel(),
            'input' => $text,
            'voice' => $voice,
            'speed' => $speed,
        ], 'POST', true);
        return base64_encode($response);
    }

    private function request(string $endpoint, array $body, string $method = 'POST', bool $raw = false): mixed
    {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($body),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Lovable-API-Key: ' . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => 30,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($raw) return $response;
        if ($httpCode >= 400) {
            throw new \RuntimeException("Lovable API error ({$httpCode}): {$response}");
        }
        return json_decode($response, true);
    }

    private function requestStream(string $endpoint, array $body): \Generator
    {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($body),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Lovable-API-Key: ' . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => 60,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        foreach (explode("\n", $response) as $line) {
            $line = trim($line);
            if (!empty($line)) yield $line;
        }
    }
}
