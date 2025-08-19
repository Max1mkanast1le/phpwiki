<?php
require_once 'dataManager.php';

header('Content-Type: application/json');

$manager = new DataManager();
$method = $_SERVER['REQUEST_METHOD'];
$entity = $_GET['entity'] ?? null; // 'contacts' or 'deals'
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Простая валидация
if (!in_array($entity, ['contacts', 'deals'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid entity type']);
    exit();
}

try {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                $data = $manager->getById($entity, $id);
                if (!$data) http_response_code(404);
            } else {
                // Если запросили список всех "противоположных" сущностей для формы
                if (isset($_GET['listAll'])) {
                    $listEntity = ($entity === 'contacts') ? 'deals' : 'contacts';
                    $data = $manager->getAll($listEntity);
                } else {
                    $data = $manager->getAll($entity);
                }
            }
            echo json_encode($data);
            break;

        case 'POST':
            $postData = json_decode(file_get_contents('php://input'), true);
            // Простая валидация обязательных полей
            if (($entity === 'deals' && empty($postData['name'])) || ($entity === 'contacts' && empty($postData['first_name']))) {
                 http_response_code(400);
                 echo json_encode(['error' => 'Required field is missing']);
                 exit();
            }

            if ($id) { // Это обновление (используем POST для простоты вместо PUT)
                $result = $manager->update($entity, $id, $postData);
            } else { // Это создание
                $result = $manager->create($entity, $postData);
            }
            echo json_encode($result);
            break;

        case 'DELETE':
             if ($id === null) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required for deletion']);
                exit();
            }
            $result = $manager->delete($entity, $id);
            echo json_encode(['success' => $result]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An internal server error occurred: ' . $e->getMessage()]);
}