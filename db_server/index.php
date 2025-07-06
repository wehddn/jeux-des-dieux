<?php
// En développement, autoriser toutes les origines (en fait localhost)
// Pour le déploiement en production, spécifier les origines autorisées :
// header('Access-Control-Allow-Origin: https://futuredomain.com');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Traiter les requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

// Charger les variables d'environnement
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

\App\Core\Auth::bootstrap();

use App\Core\Router;
use App\Core\Response;

try {
    Router::dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (\Throwable $e) {
    // Gestionnaire centralisé d'exceptions
    error_log('Unhandled exception: ' . $e->getMessage());
    Response::json(500, ['error' => 'Internal Server Error']);
}
