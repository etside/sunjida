<?php
namespace Services;

class MetaService
{
    private string $graphUrl = 'https://graph.facebook.com/v19.0';

    public function sendTyping(string $psid, string $pageToken): bool
    {
        return $this->sendAction($psid, 'typing_on', $pageToken);
    }

    public function sendText(string $psid, string $text, string $pageToken): array
    {
        return $this->send($psid, ['text' => $text], $pageToken);
    }

    public function sendAudio(string $psid, string $audioUrl, string $pageToken): array
    {
        return $this->send($psid, [
            'attachment' => ['type' => 'audio', 'payload' => ['url' => $audioUrl]],
        ], $pageToken);
    }

    public function sendImage(string $psid, string $imageUrl, string $pageToken): array
    {
        return $this->send($psid, [
            'attachment' => ['type' => 'image', 'payload' => ['url' => $imageUrl]],
        ], $pageToken);
    }

    public function getUserProfile(string $psid, string $pageToken): array
    {
        $url = "{$this->graphUrl}/{$psid}?fields=first_name,last_name,profile_pic&access_token={$pageToken}";
        $response = $this->httpGet($url);
        return json_decode($response, true) ?? [];
    }

    public function getPageInfo(string $pageToken): array
    {
        $url = "{$this->graphUrl}/me?fields=id,name&access_token={$pageToken}";
        $response = $this->httpGet($url);
        return json_decode($response, true) ?? [];
    }

    private function send(string $psid, array $messageData, string $pageToken): array
    {
        $url = "{$this->graphUrl}/me/messages";
        $body = json_encode(['recipient' => ['id' => $psid], 'message' => $messageData]);
        $response = $this->httpPost($url, $body, ['Content-Type: application/json', "Authorization: Bearer {$pageToken}"]);
        return json_decode($response, true) ?? [];
    }

    private function sendAction(string $psid, string $action, string $pageToken): bool
    {
        $url = "{$this->graphUrl}/me/messages";
        $body = json_encode(['recipient' => ['id' => $psid], 'sender_action' => $action]);
        $response = $this->httpPost($url, $body, ['Content-Type: application/json', "Authorization: Bearer {$pageToken}"]);
        $result = json_decode($response, true);
        return isset($result['recipient_id']);
    }

    private function httpPost(string $url, string $body, array $headers = []): string
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }

    private function httpGet(string $url): string
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}
