<?php

$host = "localhost";
$user = "dtfj_system_hris_db";
$password = "ireplyusls";
$database = "dtfj_system_hris_db";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

// Create sessions table if it doesn't exist
$conn->query("CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    data LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_modified (modified_at)
)");

// Custom session handler using database for persistent session storage
class DbSessionHandler implements SessionHandlerInterface {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    public function open($path, $name) { 
        return true; 
    }
    
    public function close() { 
        return true; 
    }
    
    public function read($session_id) {
        $stmt = $this->conn->prepare("SELECT data FROM sessions WHERE session_id = ?");
        if (!$stmt) {
            return '';
        }
        $stmt->bind_param("s", $session_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result ? ($result['data'] ?? '') : '';
    }
    
    public function write($session_id, $data) {
        $stmt = $this->conn->prepare("INSERT INTO sessions (session_id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), modified_at = NOW()");
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("ss", $session_id, $data);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    public function destroy($session_id) {
        $stmt = $this->conn->prepare("DELETE FROM sessions WHERE session_id = ?");
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("s", $session_id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    public function gc($maxlifetime) {
        $stmt = $this->conn->prepare("DELETE FROM sessions WHERE modified_at < DATE_SUB(NOW(), INTERVAL ? SECOND)");
        if (!$stmt) {
            return false;
        }
        $stmt->bind_param("i", $maxlifetime);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
}

// Set database-backed session handler
$handler = new DbSessionHandler($conn);
session_set_save_handler($handler, true);

?>
