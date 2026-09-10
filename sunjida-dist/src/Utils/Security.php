<?php
/**
 * Security Utility
 * Rate limiting, CSRF protection, and input sanitization
 */

declare(strict_types=1);

namespace Sunjida\Utils;

class Security
{
    /**
     * Sanitize string input
     */
    public static function sanitize(string $input): string
    {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Generate a random string
     */
    public static function randomString(int $length = 32): string
    {
        return bin2hex(random_bytes((int) ceil($length / 2)));
    }

    /**
     * Generate CSRF token
     */
    public static function csrfToken(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = self::randomString(64);
        }

        return $_SESSION['csrf_token'];
    }

    /**
     * Validate CSRF token
     */
    public static function validateCsrf(?string $token): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return isset($_SESSION['csrf_token'])
            && $token !== null
            && hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Simple rate limiter using file-based storage
     */
    public static function checkRateLimit(
        string $key,
        int $maxRequests = 60,
        int $windowSeconds = 60
    ): bool {
        $cacheDir = dirname(__DIR__, 2) . '/cache/ratelimit';

        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }

        $cacheFile = $cacheDir . '/' . md5($key) . '.json';
        $now = time();

        $data = ['requests' => [], 'blocked_until' => 0];

        if (file_exists($cacheFile)) {
            $raw = file_get_contents($cacheFile);
            $data = json_decode($raw, true) ?? $data;
        }

        // Check if blocked
        if ($data['blocked_until'] > $now) {
            return false;
        }

        // Remove old requests outside window
        $data['requests'] = array_filter(
            $data['requests'],
            fn($ts) => $ts > ($now - $windowSeconds)
        );

        // Check limit
        if (count($data['requests']) >= $maxRequests) {
            $data['blocked_until'] = $now + $windowSeconds;
            file_put_contents($cacheFile, json_encode($data), LOCK_EX);
            return false;
        }

        // Record this request
        $data['requests'][] = $now;
        file_put_contents($cacheFile, json_encode($data), LOCK_EX);

        return true;
    }

    /**
     * Get client IP address
     */
    public static function getClientIp(): string
    {
        $headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR',
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Hash password with bcrypt
     */
    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify password against hash
     */
    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
