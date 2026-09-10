<?php
/**
 * Authentication Middleware
 * JWT-based authentication for API endpoints
 */

declare(strict_types=1);

namespace Sunjida\Middleware;

use Sunjida\Utils\JWT;
use Sunjida\Models\User;

class AuthMiddleware
{
    /**
     * Require authentication - returns user_id or exits with 401
     */
    public static function requireAuth(): int
    {
        $userId = JWT::getUserId();

        if ($userId === null) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        // Verify user still exists
        $user = User::findById($userId);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        return $userId;
    }

    /**
     * Optional authentication - returns user_id or null
     */
    public static function optionalAuth(): ?int
    {
        return JWT::getUserId();
    }

    /**
     * Require specific role
     */
    public static function requireRole(string $role): int
    {
        $userId = self::requireAuth();

        // TODO: Implement role checking when roles are added
        // For now, all authenticated users have admin access

        return $userId;
    }
}
