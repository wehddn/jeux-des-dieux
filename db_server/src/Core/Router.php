<?php
namespace App\Core;

class Router
{
    // Public routes that don't require authentication
    private const PUBLIC_ROUTES = [
        'POST' => [
            '#^/auth/register$#'                => ['AuthController', 'register'],
            '#^/auth/login$#'                   => ['AuthController', 'login'],
        ],
    ];

    // Protected routes that require authentication
    private const PROTECTED_ROUTES = [
        'POST' => [
            '#^/friends$#'                      => ['FriendController', 'sendRequest'],
            '#^/games$#'                        => ['GameController', 'create'],
            '#^/games/(\d+)/join$#'             => ['GameController', 'join'],
            '#^/users/(\d+)/block$#'            => ['BlockController', 'blockUser'],
            '#^/users$#'                        => ['UserController', 'create'],
        ],
        'GET' => [
            '#^/users/(\d+)$#'                  => ['UserController', 'get'],
            '#^/users$#'                        => ['UserController', 'list'],
            '#^/friends/(\d+)/non-friends$#'    => ['FriendController', 'nonFriends'],
            '#^/friends/(\d+)/pending-requests$#'=> ['FriendController', 'pending'],
            '#^/friends/(\d+)/list$#'           => ['FriendController', 'list'],
            '#^/games$#'                        => ['GameController', 'list'],
            '#^/games/(\d+)$#'                  => ['GameController', 'detail'],
            '#^/admin/games$#'                  => ['GameController', 'adminList'],
            '#^/users/(\d+)/role$#'             => ['UserController', 'getRole'],
            '#^/audit$#'                        => ['AuditController', 'list'],
            '#^/audit/record$#'                 => ['AuditController', 'getByRecord'],
            '#^/blocked-users$#'                => ['BlockController', 'listBlockedUsers'],

        ],
        'PUT' => [
            '#^/users/(\d+)$#'                  => ['UserController', 'updateUser'],
            '#^/users/(\d+)/role$#'             => ['UserController', 'setRole'],
            '#^/games/(\d+)$#'                  => ['GameController', 'update'],
            '#^/games/(\d+)/players$#'          => ['GameController', 'setPlayers'],
            '#^/games/(\d+)/status$#'           => ['GameController', 'setStatus'],
            '#^/friends/accept$#'               => ['FriendController', 'acceptRequest'],
            '#^/friends/decline$#'              => ['FriendController', 'declineRequest'],
        ],
        'PATCH' => [
            '#^/users/(\d+)$#'                  => ['UserController', 'update'],
        ],
        'DELETE' => [
            '#^/users/(\d+)$#'                  => ['UserController', 'delete'],
            '#^/games/(\d+)$#'                  => ['GameController', 'delete'],
            '#^/users/(\d+)/block$#'            => ['BlockController', 'unblockUser'],
            '#^/friends$#'                      => ['FriendController', 'removeFriendship'],
            '#^/audit/(\d+)$#'                  => ['AuditController', 'delete'],
            '#^/audit/clear$#'                  => ['AuditController', 'clear'],
        ],
    ];

    public static function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Отладка
        error_log("Original URI: $uri");
        
        error_log("Final path: $path");
        error_log("Method: $method");
        
        // First, try public routes (no authentication required)
        if (self::tryRoutes(self::PUBLIC_ROUTES, $method, $path, false)) {
            return;
        }
        
        // Then try protected routes (authentication required)
        if (self::tryRoutes(self::PROTECTED_ROUTES, $method, $path, true)) {
            return;
        }
        
        error_log("No match found for $method $path");
        Response::json(404, ['error' => 'Not Found']);
    }

    private static function tryRoutes(array $routes, string $method, string $path, bool $requireAuth): bool
    {
        foreach ($routes[$method] ?? [] as $regex => [$ctrl, $action]) {
            if (preg_match($regex, $path, $matches)) {
                error_log("Controller: $ctrl, Action: $action");
                
                // Check authentication if required
                if ($requireAuth && !Auth::check()) {
                    Response::json(401, ['error' => 'Unauthorized']);
                    return true; // Route was matched, but auth failed
                }
                
                array_shift($matches);
                $class = 'App\\Controllers\\' . $ctrl;
                (new $class)->$action(...$matches);
                return true;
            }
        }
        return false;
    }
}
