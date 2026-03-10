<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Configure session settings for cross-origin requests
if (session_status() === PHP_SESSION_NONE) {
    // Set SameSite=Lax to allow cross-site cookie transmission with credentials
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $_SERVER['HTTPS'] === 'on' || $_SERVER['SERVER_PORT'] === '443',
        'httponly' => true, // Prevent JavaScript access
        'samesite' => 'Lax'  // Allow cross-site cookie transmission
    ]);
    session_start();
}

header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

// Get current user from session if available
function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}

// Check if user is authenticated
function isAuthenticated() {
    return isset($_SESSION['user']);
}

function requireRole($role) {
    if (!isAuthenticated()) {
        http_response_code(401);
        exit(json_encode(["error" => "Unauthorized"]));
    }
    
    $currentRole = strtolower($_SESSION['user']['role'] ?? '');
    if ($currentRole !== strtolower($role)) {
        http_response_code(403);
        exit(json_encode(["error" => "Forbidden"]));
    }
}
