<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тестовое задание: База знаний (ООП/API)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>База знаний</h1>

    <div class="knowledge-base">
        <div class="column">
            <h3>Тема</h3>
            <div id="themes-list">
                <!-- Контент генерируется app.js -->
                <p>Загрузка тем...</p>
            </div>
        </div>
        <div class="column">
            <h3>Подтема</h3>
            <div id="subthemes-list">
                <!-- Контент генерируется app.js -->
            </div>
        </div>
        <div class="column" id="content-display">
            <h3>Содержимое</h3>
            <div id="content-area">
                <!-- Контент генерируется app.js -->
            </div>
        </div>
    </div>

    <!-- Подключаем наш JavaScript-файл -->
    <script src="app.js"></script>

</body>
</html>