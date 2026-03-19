<?php

$allowed_origins = [
    'http://localhost:5173',
    'https://hrisi-reply.vercel.app', // Update with your actual Vercel production URL
    'https://hrisi-reply-git-develop-harudannoe.vercel.app' // Example staging URL
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Optional: Log unauthorized CORS attempts
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}