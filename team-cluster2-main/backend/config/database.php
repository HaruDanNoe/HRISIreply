<?php

$host = "localhost";
$user = "dtfj_system_hris_db";
$password = "ireplyusls";
$database = "dtfj_system_hris_db";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>