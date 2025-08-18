document.addEventListener('DOMContentLoaded', () => {
    const themesList = document.getElementById('themes-list');
    const subthemesList = document.getElementById('subthemes-list');
    const contentArea = document.getElementById('content-area');

    let knowledgeBaseData = {}; 
    let activeThemeId = null;
    let activeSubthemeId = null;

    // Главная асинхронная функция для запуска приложения
    async function init() {
        try {
            // Делаем запрос к нашему API
            const response = await fetch('api.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            knowledgeBaseData = await response.json();

            // Проверяем, пришли ли данные
            if (Object.keys(knowledgeBaseData).length === 0) {
                 themesList.innerHTML = '<p>Данные не найдены.</p>';
                 return;
            }

            // Инициализация состояния по умолчанию (первая тема, первая подтема)
            activeThemeId = Object.keys(knowledgeBaseData)[0];
            activeSubthemeId = Object.keys(knowledgeBaseData[activeThemeId].subthemes)[0];

            // Первоначальная отрисовка интерфейса
            updateUI();

        } catch (error) {
            console.error("Не удалось загрузить данные:", error);
            themesList.innerHTML = `<p style="color: red;">Ошибка при загрузке данных.</p>`;
        }
    }

    function renderThemes() {
        themesList.innerHTML = '';
        for (const themeId in knowledgeBaseData) {
            const theme = knowledgeBaseData[themeId];
            const div = document.createElement('div');
            div.className = 'item theme-item';
            div.textContent = theme.title;
            div.dataset.themeId = themeId;
            if (themeId === activeThemeId) {
                div.classList.add('active');
            }
            themesList.appendChild(div);
        }
    }

    function renderSubthemes(themeId) {
        subthemesList.innerHTML = '';
        const theme = knowledgeBaseData[themeId];
        if (!theme || !theme.subthemes) return;

        for (const subthemeId in theme.subthemes) {
            const subtheme = theme.subthemes[subthemeId];
            const div = document.createElement('div');
            div.className = 'item subtheme-item';
            div.textContent = subtheme.title;
            div.dataset.subthemeId = subthemeId;
            if (subthemeId === activeSubthemeId) {
                div.classList.add('active');
            }
            subthemesList.appendChild(div);
        }
    }

    function renderContent(themeId, subthemeId) {
        const subtheme = knowledgeBaseData[themeId]?.subthemes[subthemeId];
        contentArea.textContent = subtheme ? subtheme.content : 'Выберите подтему.';
    }

    themesList.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('theme-item')) return;
        const clickedThemeId = target.dataset.themeId;
        if (clickedThemeId !== activeThemeId) {
            activeThemeId = clickedThemeId;
            activeSubthemeId = Object.keys(knowledgeBaseData[activeThemeId].subthemes)[0];
            updateUI();
        }
    });

    subthemesList.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('subtheme-item')) return;
        const clickedSubthemeId = target.dataset.subthemeId;
        if (clickedSubthemeId !== activeSubthemeId) {
            activeSubthemeId = clickedSubthemeId;
            updateUI();
        }
    });

    function updateUI() {
        renderThemes();
        renderSubthemes(activeThemeId);
        renderContent(activeThemeId, activeSubthemeId);
    }

    // Запускаем приложение
    init();
});