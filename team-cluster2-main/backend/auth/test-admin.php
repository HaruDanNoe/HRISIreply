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

// Test 1: Check if user is authenticated
$user = getCurrentUser();
if (!$user) {
    http_response_code(401);
    echo json_encode([
        "error" => "Not authenticated",
        "test_results" => [
            "authenticated" => false,
            "user" => null
        ]
    ]);
    exit;
}

// Test 2: Check user role
$userRole = strtolower($user['role'] ?? '');
$isAdmin = $userRole === 'admin';

if (!$isAdmin) {
    http_response_code(403);
    echo json_encode([
        "error" => "Forbidden - Not an admin",
        "test_results" => [
            "authenticated" => true,
            "user" => $user,
            "role" => $userRole,
            "is_admin" => $isAdmin
        ]
    ]);
    exit;
}

// Test 3: Try to query clusters
$query = "SELECT COUNT(*) as total FROM clusters";
$result = $conn->query($query);
$clusterCount = 0;
if ($result) {
    $row = $result->fetch_assoc();
    $clusterCount = (int)$row['total'];
}

echo json_encode([
    "success" => true,
    "test_results" => [
        "authenticated" => true,
        "user" => $user,
        "role" => $userRole,
        "is_admin" => $isAdmin,
        "cluster_count" => $clusterCount
    ]
]);
