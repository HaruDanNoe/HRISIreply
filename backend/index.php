<?php
header("Content-Type: application/json");
echo json_encode([
    "status" => "online",
    "message" => "HRISIreply Backend API is running on Koyeb."
]);
