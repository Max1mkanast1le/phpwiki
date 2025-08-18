<?php
// Controller (API Endpoint)
// Иммитация работы с API
// Подключаем наш класс-модель
require_once 'repository.php';

header('Content-Type: application/json');
header('Cache-Control: no-cache');

try {
    // Создаем экземпляр репозитория, указывая путь к нашему файлу с данными
    $repository = new repository('data.json');

    $data = $repository->fetchAll();

    echo json_encode($data);

} catch (Exception $e) {
    // В случае ошибки (например, файл не найден) отдаем ошибку сервера
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}