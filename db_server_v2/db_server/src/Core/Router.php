<?php
namespace App\Core;

class Router
{
    private const ROUTES = [
        // method => [ regex => [Controller, action] ]
        'POST' => [
            '#^/auth/register$#'                => ['AuthController', 'register'],
            '#^/auth/login$#'                   => ['AuthController', 'login'],
            '#^/friends$#'                      => ['FriendController', 'sendRequest'],
            '#^/friends/accept$#'               => ['FriendController', 'acceptRequest'],
            '#^/friends/decline$#'              => ['FriendController', 'declineRequest'],
            '#^/games$#'                        => ['GameController', 'create'],
        ],
        'GET' => [
            '#^/users/(\d+)$#'                  => ['UserController', 'get'],
            '#^/users$#'                        => ['UserController', 'list'],
            '#^/friends/(\d+)/non-friends$#'    => ['FriendController', 'nonFriends'],
            '#^/friends/(\d+)/pending-requests$#'=> ['FriendController', 'pending'],
            '#^/friends/(\d+)/list$#'           => ['FriendController', 'list'],
            '#^/games$#'                        => ['GameController', 'list'],
            '#^/games/(\d+)$#'                  => ['GameController', 'detail'],
            '#^/users/(\d+)/role$#'             => ['UserController', 'getRole'],
        ],
        'PUT' => [
            '#^/users/(\d+)/role$#'             => ['UserController', 'setRole'],
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
        ],
    ];

    public static function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Отладка
        error_log("Original URI: $uri");
        error_log("Parsed path: $path");
        
        // Теперь сервер отвечает и на /friends и на /api/friends; Nginx-конфиг трогать не нужно, клиент менять не придётся; минимум трафика -> меньше CO₂
        if (str_starts_with($path, '/api/')) {
            $path = substr($path, 4);
        }
        
        error_log("Final path: $path");
        error_log("Method: $method");
        
        foreach (self::ROUTES[$method] ?? [] as $regex => [$ctrl, $action]) {
            error_log("Checking regex: $regex against path: $path");
            if (preg_match($regex, $path, $matches)) {
                error_log("Match found! Controller: $ctrl, Action: $action");
                array_shift($matches);
                $class = 'App\\Controllers\\' . $ctrl;
                (new $class)->$action(...$matches);
                return;
            }
        }
        
        error_log("No match found for $method $path");
        Response::json(404, ['error' => 'Not Found']);
    }
}
