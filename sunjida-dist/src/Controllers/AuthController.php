<?php
/**
 * Auth Controller
 * Handles admin authentication (login, register, logout)
 */

declare(strict_types=1);

namespace Sunjida\Controllers;

use Sunjida\Config\Database;
use Sunjida\Utils\JWT;
use Sunjida\Utils\Security;

class AuthController
{
    /**
     * Admin login
     */
    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        // TODO: Implement login logic
        http_response_code(200);
        echo json_encode(['token' => 'TODO: Generate JWT', 'user' => []]);
    }

    /**
     * Admin registration
     */
    public function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        // TODO: Implement registration logic
        http_response_code(201);
        echo json_encode(['status' => 'registered', 'user' => []]);
    }

    /**
     * Admin logout
     */
    public function logout(): void
    {
        // TODO: Invalidate JWT token
        http_response_code(200);
        echo json_encode(['status' => 'logged_out']);
    }
}
