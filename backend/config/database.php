<?php
$conn = new mysqli("localhost:3306", "dtfj_system_hris_db", "ireplyusls", "dtfj_system_hris_db");

if ($conn->connect_error) {
    http_response_code(500);
    exit(json_encode(["error" => "DB connection failed"]));
}