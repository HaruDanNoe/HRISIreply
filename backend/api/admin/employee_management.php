<?php
include __DIR__ . "/../../config/database.php";
include __DIR__ . "/../../config/auth.php";

requireRole("super admin");

function resolveEmployeeRoleId(mysqli $conn): ?int {
    $stmt = $conn->prepare("SELECT role_id FROM roles WHERE LOWER(role_name) LIKE '%employee%' LIMIT 1");
    if (!$stmt) {
        return null;
    }

    if (!$stmt->execute()) {
        return null;
    }

    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    return isset($row['role_id']) ? (int)$row['role_id'] : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT
                e.employee_id,
                CONCAT_WS(' ', e.first_name, e.middle_name, e.last_name) AS fullname,
                COALESCE(e.position, '') AS position,
                COALESCE(e.account, '') AS account,
                COALESCE(e.employee_type, '') AS employee_type,
                COALESCE(e.employment_status, '') AS employment_status,
                e.date_hired,
                COALESCE(e.email, u.email, '') AS email
            FROM employees e
            LEFT JOIN users u ON u.user_id = e.user_id
            LEFT JOIN roles r ON r.role_id = u.role_id
            WHERE LOWER(COALESCE(r.role_name, '')) LIKE '%employee%'
            ORDER BY e.employee_id DESC";

    $result = $conn->query($sql);
    if (!$result) {
        http_response_code(500);
        exit(json_encode(["error" => "Unable to load employees."]));
    }

    $employees = [];
    while ($row = $result->fetch_assoc()) {
        $employees[] = [
            "id" => (int)$row['employee_id'],
            "fullname" => trim((string)$row['fullname']) ?: "Employee #{$row['employee_id']}",
            "position" => $row['position'],
            "account" => $row['account'],
            "employee_type" => $row['employee_type'],
            "employment_status" => $row['employment_status'],
            "date_hired" => $row['date_hired'],
            "email" => $row['email']
        ];
    }

    echo json_encode($employees);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(["error" => "Method not allowed."]));
}

$data = json_decode(file_get_contents("php://input"), true);

$firstName = trim((string)($data['first_name'] ?? ''));
$middleName = trim((string)($data['middle_name'] ?? ''));
$lastName = trim((string)($data['last_name'] ?? ''));
$address = trim((string)($data['address'] ?? ''));
$birthdate = trim((string)($data['birthdate'] ?? ''));
$civilStatus = trim((string)($data['civil_status'] ?? ''));
$contactNumber = trim((string)($data['contact_number'] ?? ''));
$personalEmail = strtolower(trim((string)($data['personal_email'] ?? '')));
$workEmail = strtolower(trim((string)($data['work_email'] ?? $data['email'] ?? '')));
$password = (string)($data['password'] ?? 'Welcome123!');
$position = trim((string)($data['position'] ?? ''));
$account = trim((string)($data['account'] ?? ''));
$employeeType = trim((string)($data['employee_type'] ?? ''));
$employmentStatus = trim((string)($data['employment_status'] ?? 'Active'));
$dateHired = trim((string)($data['date_hired'] ?? ''));

if ($firstName === '' || $lastName === '' || $workEmail === '') {
    http_response_code(400);
    exit(json_encode(["error" => "First name, last name, and work email are required."]));
}

$employeeRoleId = resolveEmployeeRoleId($conn);
if (!$employeeRoleId) {
    http_response_code(500);
    exit(json_encode(["error" => "Employee role is not configured."]));
}

$duplicateStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
if (!$duplicateStmt) {
    http_response_code(500);
    exit(json_encode(["error" => "Unable to validate email."]));
}
$duplicateStmt->bind_param("s", $workEmail);
if (!$duplicateStmt->execute()) {
    http_response_code(500);
    exit(json_encode(["error" => "Unable to validate email."]));
}
if ($duplicateStmt->get_result()->fetch_assoc()) {
    http_response_code(409);
    exit(json_encode(["error" => "Work email already exists."]));
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$conn->begin_transaction();

try {
    $userStmt = $conn->prepare(
        "INSERT INTO users (email, password, role_id, created_at)
         VALUES (?, ?, ?, NOW())"
    );

    if (!$userStmt) {
        throw new Exception("Unable to prepare user insert statement.");
    }

    $userStmt->bind_param("ssi", $workEmail, $hashedPassword, $employeeRoleId);
    if (!$userStmt->execute()) {
        throw new Exception("Unable to create user account.");
    }

    $userId = (int)$userStmt->insert_id;

    $employeeStmt = $conn->prepare(
        "INSERT INTO employees (
            user_id,
            first_name,
            middle_name,
            last_name,
            address,
            birthdate,
            civil_status,
            email,
            personal_email,
            position,
            account,
            contact_number,
            employment_status,
            employee_type,
            date_hired
        ) VALUES (?, ?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?, ?, ?, NULLIF(?, ''))"
    );

    if (!$employeeStmt) {
        throw new Exception("Unable to prepare employee insert statement.");
    }

    $employeeStmt->bind_param(
        "issssssssssssss",
        $userId,
        $firstName,
        $middleName,
        $lastName,
        $address,
        $birthdate,
        $civilStatus,
        $workEmail,
        $personalEmail,
        $position,
        $account,
        $contactNumber,
        $employmentStatus,
        $employeeType,
        $dateHired
    );

    if (!$employeeStmt->execute()) {
        throw new Exception("Unable to create employee profile.");
    }

    $employeeId = (int)$employeeStmt->insert_id;
    $conn->commit();

    echo json_encode([
        "success" => true,
        "employee" => [
            "id" => $employeeId,
            "fullname" => trim("{$firstName} {$middleName} {$lastName}"),
            "position" => $position,
            "account" => $account,
            "employee_type" => $employeeType,
            "employment_status" => $employmentStatus,
            "date_hired" => $dateHired,
            "email" => $workEmail
        ]
    ]);
} catch (Throwable $error) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => $error->getMessage()]);
}
