<?php
namespace App\Controllers;

use App\Core\Response;
use App\Models\User;
use Firebase\JWT\JWT;

class AuthController
{
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['email'], $data['password'])) {
            Response::json(400, ['error' => 'Invalid payload']);
            return;
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::json(400, ['error' => 'Invalid email format']);
            return;
        }

        // Check if email already exists
        if (User::emailExists($data['email'])) {
            Response::json(409, ['error' => 'Email exists']);
            return;
        }

        // Register user through model
        try {
            User::register($data['email'], $data['password'], $data['name'] ?? null);
            Response::json(201, ['message' => 'User registered']);
        } catch (\Exception $e) {
            error_log('Registration error: ' . $e->getMessage());
            Response::json(500, ['error' => 'Registration failed']);
        }
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['email'], $data['password'])) {
            Response::json(400, ['error' => 'Invalid payload']);
            return;
        }

        // Find user by email
        $user = User::findByEmail($data['email']);
        if (!$user || !$user->checkPassword($data['password'])) {
            Response::json(401, ['error' => 'Invalid credentials']);
            return;
        }

        // Check if user is blocked
        if ($user->isBlocked()) {
            Response::json(403, ['error' => 'Account blocked', 'redirect' => 'blocked']);
            return;
        }

        // Generate JWT token
        $payload = [
            'sub'  => $user->id(),
            'role' => $user->role(),
            'iat'  => time(),
            'exp'  => time() + (int)$_ENV['JWT_TTL']
        ];
        
        $jwt = JWT::encode($payload, $_ENV['APP_KEY'], 'HS256');

        Response::json(200, ['token' => $jwt]);
    }
}
