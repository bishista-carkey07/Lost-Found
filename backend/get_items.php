<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    require_once 'config.php';
    exit();
}
require_once 'config.php';

$status = isset($_GET['status']) ? $_GET['status'] : null;

if ($status && in_array($status, ['lost', 'found'])) {
    $query = "SELECT items.*, users.username FROM items JOIN users ON items.user_id = users.id WHERE status = :status ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute([':status' => $status]);
} else {
    $query = "SELECT items.*, users.username FROM items JOIN users ON items.user_id = users.id ORDER BY created_at DESC";
    $stmt = $conn->query($query);
}

$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode(["items" => $items]);
?>
