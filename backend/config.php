<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$host = 'localhost';
$db_name = 'lost_and_found_db';
// Based on "use username phone no password": If "phone" was literally meant as the DB username, change 'root' to 'phone'. 
// Default local MySQL setup usually uses 'root' with empty password.
$username = 'root'; 
$password = '';

try {
    $conn = new PDO("mysql:host=" . $host, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$db_name`");
    $conn->exec("USE `$db_name`");
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database Connection error: " . $e->getMessage()]);
    die();
}
?>
