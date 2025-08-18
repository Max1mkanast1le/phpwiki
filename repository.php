<?php

// Model: Класс, отвечающий за доступ к данным.
class repository
{
    private string $dataSourcePath;

    public function __construct(string $dataSourcePath)
    {
        // Проверяем, что файл существует и доступен для чтения
        if (!file_exists($dataSourcePath) || !is_readable($dataSourcePath)) {
            throw new Exception("Data source file not found or not readable: " . $dataSourcePath);
        }
        $this->dataSourcePath = $dataSourcePath;
    }

    /**
     * Получает все данные из источника.
     * @return array
     */
    public function fetchAll(): array
    {
        $jsonContent = file_get_contents($this->dataSourcePath);
        return json_decode($jsonContent, true) ?: []; // Возвращаем пустой массив, если JSON невалидный
    }
}