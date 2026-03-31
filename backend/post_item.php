<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'config.php';
    exit();
}
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->user_id) || !isset($data->title) || !isset($data->description) || !isset($data->status) || !isset($data->contact_info)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields. Received params are incomplete."]);
    exit();
}

$query = "INSERT INTO items (user_id, title, description, status, contact_info, image_url) VALUES (:user_id, :title, :description, :status, :contact_info, :image_url)";
$stmt = $conn->prepare($query);

try {
    $stmt->execute([
        ':user_id' => $data->user_id,
        ':title' => $data->title,
        ':description' => $data->description,
        ':status' => $data->status,
        ':contact_info' => $data->contact_info,
        ':image_url' => isset($data->image_url) ? $data->image_url : null
    ]);
    http_response_code(201);
    echo json_encode(["message" => "Item posted successfully."]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Failed to post item.", "error" => $e->getMessage()]);
}
?>
