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

    /** Check if current user is a manager (role_id >= 2) */
    public static function requireManager(): void
    {
        if (!self::check() || self::$user['role_id'] < 2) {
            Response::json(403, ['error' => 'Manager role required']);
        }
    }

    /** Check if current user is an admin (role_id >= 3) */
    public static function requireAdmin(): void
    {
        if (!self::check() || self::$user['role_id'] < 3) {
            Response::json(403, ['error' => 'Admin role required']);
        }
    }

    /** Check if current user owns the resource or is a manager+ */
    public static function requireOwnerOrManager(int $ownerId): void
    {
        if (!self::check()) {
            Response::json(401, ['error' => 'Unauthorized']);
        }
        
        $currentUser = self::$user;
        if ($currentUser['id'] !== $ownerId && $currentUser['role_id'] < 2) {
            Response::json(403, ['error' => 'Access denied']);
        }
    }

    /** Check if current user can access another user's data */
    public static function requireSelfOrManager(int $userId): void
    {
        if (!self::check()) {
            Response::json(401, ['error' => 'Unauthorized']);
        }
        
        $currentUser = self::$user;
        if ($currentUser['id'] !== $userId && $currentUser['role_id'] < 2) {
            Response::json(403, ['error' => 'Can only access your own data']);
        }
    }

    /** Get current user ID safely */
    public static function userId(): int
    {
        return self::$user['id'] ?? 0;
    }

    /** Prevent users from targeting themselves (for role changes, blocking, etc.) */
    public static function requireNotSelf(int $targetUserId, string $action = 'this action'): void
    {
        if (!self::check()) {
            Response::json(401, ['error' => 'Unauthorized']);
        }
        
        if (self::$user['id'] == $targetUserId) {
            Response::json(403, ['error' => "Cannot perform $action on yourself"]);
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
