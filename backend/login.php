<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'config.php';
    exit();
}
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

$username = $data->username;
$password = $data->password;

$query = "SELECT id, username, phone, password_hash FROM users WHERE username = :username";
$stmt = $conn->prepare($query);
$stmt->execute([':username' => $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if($user && password_verify($password, $user['password_hash'])) {
    http_response_code(200);
    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "username" => $user['username'],
            "phone" => $user['phone']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["message" => "Invalid credentials."]);
}
?>
