document.addEventListener('DOMContentLoaded', () => {
    const state = {
        activeMenu: 'contacts', // 'contacts' or 'deals'
        activeItemId: null,
        allItems: { contacts: [], deals: [] },
    };

    // --- DOM Elements ---
    const menuList = document.getElementById('menu-list');
    const listItems = document.getElementById('list-items');
    const listFooter = document.getElementById('list-footer'); // Новый элемент
    const contentArea = document.getElementById('content-area');

    // --- API Helper ---
    const api = {
        get: (url) => fetch(url).then(res => res.json()),
        post: (url, data) => fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(res => res.json()),
        delete: (url) => fetch(url, { method: 'DELETE' }).then(res => res.json()),
    };

    // --- RENDER FUNCTIONS ---
    function renderMenu() {
        menuList.innerHTML = `
            <div class="item ${state.activeMenu === 'contacts' ? 'active' : ''}" data-entity="contacts">Контакты</div>
            <div class="item ${state.activeMenu === 'deals' ? 'active' : ''}" data-entity="deals">Сделки</div>
        `;
    }

    async function renderList() {
        // Рендерим кнопку "Создать" в новом месте
        const buttonText = state.activeMenu === 'contacts' ? 'Создать контакт' : 'Создать сделку';
        listFooter.innerHTML = `<button id="add-new-btn">${buttonText}</button>`;

        const items = await api.get(`api.php?entity=${state.activeMenu}`);
        state.allItems[state.activeMenu] = items;

        listItems.innerHTML = items.map(item => {
            const displayName = state.activeMenu === 'contacts' ? `${item.first_name} ${item.last_name}` : item.name;
            return `<div class="item list-item ${item.id === state.activeItemId ? 'active' : ''}" data-id="${item.id}">${displayName}</div>`;
        }).join('');
    }

    function renderContentDetails() {
        if (!state.activeItemId) {
            contentArea.innerHTML = '<p>Выберите элемент из списка или создайте новый.</p>';
            return;
        }

        const item = state.allItems[state.activeMenu].find(i => i.id === state.activeItemId);
        if (!item) {
            contentArea.innerHTML = '<p>Элемент не найден.</p>';
            return;
        }

        let detailsHtml = '';
        if (state.activeMenu === 'contacts') {
            detailsHtml = `
                <table class="content-table">
                    <tr><td>ID</td><td>${item.id}</td></tr>
                    <tr><td>Имя</td><td>${item.first_name}</td></tr>
                    <tr><td>Фамилия</td><td>${item.last_name}</td></tr>
                </table>
                <h4>Сделки:</h4>
                <table class="content-table">
                    ${item.deals.map(deal => `<tr><td>id сделки: ${deal.id}</td><td>${deal.name}</td></tr>`).join('') || '<tr><td colspan="2">Нет связанных сделок</td></tr>'}
                </table>
            `;
        } else {
            detailsHtml = `
                 <table class="content-table">
                    <tr><td>ID</td><td>${item.id}</td></tr>
                    <tr><td>Наименование</td><td>${item.name}</td></tr>
                    <tr><td>Сумма</td><td>${item.sum}</td></tr>
                </table>
                <h4>Контакты:</h4>
                <table class="content-table">
                     ${item.contacts.map(c => `<tr><td>id контакта: ${c.id}</td><td>${c.first_name} ${c.last_name}</td></tr>`).join('') || '<tr><td colspan="2">Нет связанных контактов</td></tr>'}
                </table>
            `;
        }
        contentArea.innerHTML = detailsHtml + `<button id="edit-btn">Редактировать</button><button id="delete-btn">Удалить</button>`;
    }

    async function renderForm(itemToEdit = null) {
        let formHtml = '';
        const relatedItems = await api.get(`api.php?entity=${state.activeMenu}&listAll=true`);
        let checkedRelatedIds = new Set();

        if (state.activeMenu === 'contacts') {
            if (itemToEdit) itemToEdit.deals.forEach(d => checkedRelatedIds.add(d.id));

            formHtml = `
                <h3>${itemToEdit ? 'Редактировать контакт' : 'Создать контакт'}</h3>
                <form>
                    <label for="first_name">Имя (обязательно):</label>
                    <input type="text" id="first_name" value="${itemToEdit?.first_name || ''}">
                    <label for="last_name">Фамилия:</label>
                    <input type="text" id="last_name" value="${itemToEdit?.last_name || ''}">
                    <div class="links-container">
                        <h4>Сделки:</h4>
                        ${relatedItems.map(deal => `
                            <div class="checkbox-item">
                                <input type="checkbox" class="link-checkbox" value="${deal.id}" id="deal-${deal.id}" ${checkedRelatedIds.has(deal.id) ? 'checked' : ''}>
                                <label for="deal-${deal.id}">${deal.name}</label>
                            </div>
                        `).join('')}
                    </div>
                </form>
            `;
        } else {
            if (itemToEdit) itemToEdit.contacts.forEach(c => checkedRelatedIds.add(c.id));

            formHtml = `
                <h3>${itemToEdit ? 'Редактировать сделку' : 'Создать сделку'}</h3>
                <form>
                    <label for="name">Наименование (обязательно):</label>
                    <input type="text" id="name" value="${itemToEdit?.name || ''}">
                    <label for="sum">Сумма:</label>
                    <input type="number" id="sum" value="${itemToEdit?.sum || ''}">
                    <div class="links-container">
                        <h4>Контакты:</h4>
                        ${relatedItems.map(c => `
                             <div class="checkbox-item">
                                <input type="checkbox" class="link-checkbox" value="${c.id}" id="contact-${c.id}" ${checkedRelatedIds.has(c.id) ? 'checked' : ''}>
                                <label for="contact-${c.id}">${c.first_name} ${c.last_name}</label>
                            </div>
                        `).join('')}
                    </div>
                </form>
            `;
        }
        contentArea.innerHTML = formHtml + `<button id="save-btn">Сохранить</button><button id="cancel-btn">Отмена</button>`;
    }

    // --- EVENT HANDLERS ---

    menuList.addEventListener('click', e => {
        if (!e.target.classList.contains('item')) return;
        state.activeMenu = e.target.dataset.entity;
        state.activeItemId = null;
        updateUI();
    });

    listItems.addEventListener('click', e => {
        if (!e.target.classList.contains('list-item')) return;
        state.activeItemId = parseInt(e.target.dataset.id, 10);
        updateUI(false); 
    });

    document.body.addEventListener('click', async e => {
        if (e.target.id === 'add-new-btn') {
            state.activeItemId = null; // Сбрасываем выбор, чтобы форма была для создания
            renderForm();
        }
        if (e.target.id === 'edit-btn') {
            const item = state.allItems[state.activeMenu].find(i => i.id === state.activeItemId);
            renderForm(item);
        }
        if (e.target.id === 'cancel-btn') {
            updateUI(false);
        }
        if (e.target.id === 'delete-btn') {
            if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
                await api.delete(`api.php?entity=${state.activeMenu}&id=${state.activeItemId}`);
                state.activeItemId = null;
                updateUI();
            }
        }
        if (e.target.id === 'save-btn') {
            let payload = {};
            const checkedLinks = [...document.querySelectorAll('.link-checkbox:checked')].map(cb => cb.value);

            if (state.activeMenu === 'contacts') {
                payload = {
                    first_name: document.getElementById('first_name').value,
                    last_name: document.getElementById('last_name').value,
                    deal_ids: checkedLinks
                };
            } else {
                 payload = {
                    name: document.getElementById('name').value,
                    sum: document.getElementById('sum').value,
                    contact_ids: checkedLinks
                };
            }

            const url = `api.php?entity=${state.activeMenu}` + (state.activeItemId ? `&id=${state.activeItemId}` : '');
            const savedItem = await api.post(url, payload);

            state.activeItemId = savedItem.id;
            updateUI();
        }
    });

    // --- INITIALIZATION ---
    async function updateUI(fullReload = true) {
        renderMenu();
        if (fullReload) {
            await renderList();
        }
        renderContentDetails();
    }

    updateUI();
});