<?php
namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class Auth
{
    private static array $user = [];

    public static function user(): array
    {
        return self::$user;        // [] если гость
    }

    public static function check(): bool
    {
        return !empty(self::$user);
    }

    public static function requireLogin(int $minRole = 1): void
    {
        if (!self::check() || self::$user['role_id'] < $minRole) {
            Response::json( ($minRole > 1 ? 403 : 401),
                ['error' => ($minRole > 1 ? 'Forbidden' : 'Unauthorized')] );
        }
    }

    /** запускается из Front Controller до Router::dispatch() */
    public static function bootstrap(): void
    {
        $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        error_log("Authorization header: " . $hdr);
        
        if (!preg_match('/Bearer\s+(.+)/', $hdr, $m)) {
            error_log("No Bearer token found");
            return;                             // гость
        }

        try {
            $token  = $m[1];
            error_log("Token: " . substr($token, 0, 20) . "...");
            error_log("APP_KEY: " . ($_ENV['APP_KEY'] ?? 'NOT SET'));
            
            $data   = JWT::decode($token, new Key($_ENV['APP_KEY'], 'HS256'));
            self::$user = [
                'id'      => $data->sub,
                'role_id' => $data->role
            ];
            error_log("User authenticated: ID=" . $data->sub . ", Role=" . $data->role);
        } catch (\Throwable $e) {
            // испорченный/просроченный токен → гость
            error_log("JWT decode error: " . $e->getMessage());
            self::$user = [];
        }
    }
}
