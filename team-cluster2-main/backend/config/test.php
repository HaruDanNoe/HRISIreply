<?php

require_once "config/database.php";

if ($conn) {
    echo "Database connected successfully";
} else {
    echo "Database connection failed";
}

?>