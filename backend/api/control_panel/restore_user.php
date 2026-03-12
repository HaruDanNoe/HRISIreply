<?php
require_once "../cors.php";

session_start();

require_once "../config/database.php";

header('Content-Type: application/json');

/* Read JSON body */
$data = json_decode(file_get_contents("php://input"), true);

$employee_id = $data['employee_id'] ?? null;

if (!$employee_id) {
    echo json_encode([
        "success" => false,
        "message" => "Employee ID missing"
    ]);
    exit();
}

/* Restore user */
$stmt = $conn->prepare("UPDATE employees SET archived = 0 WHERE employee_id = ?");
$stmt->bind_param("i", $employee_id);
$stmt->execute();

echo json_encode([
    "success" => true
]);