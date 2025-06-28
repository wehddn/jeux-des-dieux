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
        if (!preg_match('/Bearer\s+(.+)/', $hdr, $m)) {
            return;                             // гость
        }

        try {
            $token  = $m[1];
            $data   = JWT::decode($token, new Key($_ENV['APP_KEY'], 'HS256'));
            self::$user = [
                'id'      => $data->sub,
                'role_id' => $data->role
            ];
        } catch (\Throwable) {
            // испорченный/просроченный токен → гость
            self::$user = [];
        }
    }
}
