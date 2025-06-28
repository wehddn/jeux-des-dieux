<?php
require_once __DIR__ . '/vendor/autoload.php';
\App\Core\Auth::bootstrap();

use App\Core\Router;
use App\Core\Response;

try {
    Router::dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (\Throwable $e) {
    // централизованный ловец исключений
    \App\Core\EventLogger::error('unhandled_exception', $e->getMessage());
    Response::json(500, ['error' => 'Internal Server Error']);
}
