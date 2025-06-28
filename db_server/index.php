<?php
// Добавляем CORS заголовки
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обрабатываем preflight OPTIONS запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

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
