<?php
/**
 * CORS Middleware
 * Cross-Origin Resource Sharing headers
 */

declare(strict_types=1);

namespace Sunjida\Middleware;

class CorsMiddleware
{
    private static array $allowedOrigins = [
        'https://salesdaddy.torquesticker.com',
        'https://torquesticker.com',
        'http://localhost:3000',  // Development
        'http://localhost:5173', // Vite dev server
    ];

    /**
     * Handle CORS preflight and set headers
     */
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Allow configured origins or all in development
        if (in_array($origin, self::$allowedOrigins) || self::isDev()) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Handle preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    private static function isDev(): bool
    {
        return ($_SERVER['SERVER_NAME'] ?? '') === 'localhost'
            || (str_starts_with($_SERVER['SERVER_NAME'] ?? '', '127.'));
    }
}
