<?php
/**
 * JWT Utility
 * JSON Web Token creation and verification
 */

declare(strict_types=1);

namespace Sunjida\Utils;

use Sunjida\Config\Env;

class JWT
{
    private static string $secret = '';
    private static int $expiry = 86400; // 24 hours

    public static function init(): void
    {
        self::$secret = Env::required('JWT_SECRET');
        self::$expiry = (int) (Env::get('JWT_EXPIRY', '86400'));
    }

    /**
     * Create a JWT token
     */
    public static function create(array $payload): string
    {
        if (empty(self::$secret)) {
            self::init();
        }

        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256',
        ]));

        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + self::$expiry;

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payloadEncoded}", self::$secret, true)
        );

        return "{$header}.{$payloadEncoded}.{$signature}";
    }

    /**
     * Verify and decode a JWT token
     */
    public static function verify(string $token): ?array
    {
        if (empty(self::$secret)) {
            self::init();
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::$secret, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data) {
            return null;
        }

        // Check expiration
        if (isset($data['exp']) && $data['exp'] < time()) {
            return null;
        }

        return $data;
    }

    /**
     * Extract token from Authorization header
     */
    public static function extractFromHeader(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Get current authenticated user ID from token
     */
    public static function getUserId(): ?int
    {
        $token = self::extractFromHeader();
        if (!$token) {
            return null;
        }

        $payload = self::verify($token);
        if (!$payload || !isset($payload['user_id'])) {
            return null;
        }

        return (int) $payload['user_id'];
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
