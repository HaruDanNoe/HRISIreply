<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Allow localhost and any vercel.app domain
if (
    $origin === 'http://localhost:5173' || 
    preg_match('/^https:\/\/.*\.vercel\.app$/', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}