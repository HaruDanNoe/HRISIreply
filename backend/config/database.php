<?php
// Database configuration - Always use environment variables for production
$host = getenv('DB_HOST');
$port = getenv('DB_PORT') ?: "3306";
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$dbname = getenv('DB_NAME');
$ca_cert = getenv('DB_SSL_CA') ?: __DIR__ . "/ca.pem"; 

if (!$host || !$user || !$pass || !$dbname) {
    // Fallback for local development if env vars are not set
    // In production (Koyeb), these MUST be set in the console
    $host = $host ?: "localhost";
    $user = $user ?: "root";
    $pass = $pass ?: "";
    $dbname = $dbname ?: "system_hris_db";
}

$conn = mysqli_init();

if ($ca_cert && file_exists($ca_cert)) {
    mysqli_ssl_set($conn, NULL, NULL, $ca_cert, NULL, NULL);
}

if (!$conn->real_connect($host, $user, $pass, $dbname, $port)) {
    http_response_code(500);
    exit(json_encode([
        "error" => "DB connection failed",
        "debug" => mysqli_connect_error()
    ]));
}

$conn->set_charset("utf8mb4");