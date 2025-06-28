<?php
namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['email'], $data['password'])) {
            Response::json(400, ['error' => 'Invalid payload']);
        }

        // Если имя не указано, используем часть email до @
        $name = $data['name'] ?? explode('@', $data['email'])[0];

        $pdo = Database::get();
        // проверка email
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            Response::json(409, ['error' => 'Email exists']);
        }

        $hash = password_hash($data['password'], PASSWORD_ARGON2ID);
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password) VALUES (?,?,?)'
        );
        $stmt->execute([$name, $data['email'], $hash]);
        Response::json(201, ['message' => 'User registered']);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['email'], $data['password'])) {
            Response::json(400, ['error' => 'Invalid payload']);
        }

        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT id, password, role_id FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::json(401, ['error' => 'Invalid credentials']);
        }

        $payload = [
            'sub'  => $user['id'],
            'role' => $user['role_id'],
            'iat'  => time(),
            'exp'  => time() + (int)$_ENV['JWT_TTL']
        ];
        $jwt = JWT::encode($payload, $_ENV['APP_KEY'], 'HS256');

        Response::json(200, ['token' => $jwt]);
    }
}
