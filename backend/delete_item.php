<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'config.php';
    exit();
}
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->item_id) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing item_id or user_id."]);
    exit();
}

// Only delete if the item belongs to this user
$stmt = $conn->prepare("DELETE FROM items WHERE id = :item_id AND user_id = :user_id");

try {
    $stmt->execute([
        ':item_id'  => $data->item_id,
        ':user_id'  => $data->user_id
    ]);
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(["message" => "Item deleted."]);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Not allowed or item not found."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Delete failed.", "error" => $e->getMessage()]);
}
?>
