<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'config.php';
    exit();
}
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->username) || !isset($data->phone) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

$username = $data->username;
$phone = $data->phone;
$password = password_hash($data->password, PASSWORD_DEFAULT);

// Check if username already exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE username = :username LIMIT 1");
$checkStmt->execute([':username' => $username]);
if ($checkStmt->fetch()) {
    http_response_code(409);
    echo json_encode(["message" => "Username already taken. Please choose a different one."]);
    exit();
}

$query = "INSERT INTO users (username, phone, password_hash) VALUES (:username, :phone, :password)";
$stmt = $conn->prepare($query);

try {
    $stmt->execute([
        ':username' => $username,
        ':phone' => $phone,
        ':password' => $password
    ]);
    http_response_code(201);
    echo json_encode(["message" => "User registered successfully."]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Registration failed. Please try again."]);
}
?>
