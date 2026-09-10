<?php
/**
 * Rate Limit Middleware
 * API rate limiting per client IP
 */

declare(strict_types=1);

namespace Sunjida\Middleware;

use Sunjida\Utils\Security;

class RateLimitMiddleware
{
    /**
     * Apply rate limiting to current request
     */
    public static function check(
        int $maxRequests = 60,
        int $windowSeconds = 60
    ): void {
        $ip = Security::getClientIp();
        $endpoint = $_SERVER['REQUEST_URI'] ?? '/';
        $key = "api:{$ip}:{$endpoint}";

        if (!Security::checkRateLimit($key, $maxRequests, $windowSeconds)) {
            http_response_code(429);
            header('Retry-After: ' . $windowSeconds);
            echo json_encode([
                'error' => 'Too many requests',
                'retry_after' => $windowSeconds,
            ]);
            exit;
        }
    }

    /**
     * Strict rate limiting for auth endpoints
     */
    public static function checkAuth(): void
    {
        self::check(10, 60); // 10 requests per minute for auth
    }

    /**
     * Lenient rate limiting for read endpoints
     */
    public static function checkRead(): void
    {
        self::check(120, 60); // 120 requests per minute for reads
    }
}
