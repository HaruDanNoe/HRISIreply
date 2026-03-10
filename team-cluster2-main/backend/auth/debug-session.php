<?php
// Dynamic CORS - Accept requests from any origin and credentials
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Vary: Origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include "../config/database.php";
include "../config/auth.php";

$user = getCurrentUser();
$sessionId = session_id();
$sessionStatus = session_status();
$sessionStatuses = [
    PHP_SESSION_DISABLED => 'disabled',
    PHP_SESSION_NONE => 'none',
    PHP_SESSION_ACTIVE => 'active'
];

echo json_encode([
    "session_id" => $sessionId,
    "session_status" => $sessionStatuses[$sessionStatus] ?? 'unknown',
    "is_authenticated" => isAuthenticated(),
    "user" => $user,
    "session_data" => $_SESSION,
    "cookies" => $_COOKIE,
    "server_info" => [
        "php_version" => phpversion(),
        "session_save_path" => session_save_path(),
        "session_save_handler" => ini_get('session.save_handler'),
        "https" => $_SERVER['HTTPS'] ?? 'not set',
        "server_port" => $_SERVER['SERVER_PORT'] ?? 'not set'
    ]
]);
