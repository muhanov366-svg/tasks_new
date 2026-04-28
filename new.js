В вашем JavaScript‑коде есть несколько синтаксических и логических ошибок. Разберу их и предложу исправленную версию.

## Найденные ошибки

1. **Неправильные кавычки**. В коде используются типографические кавычки (`‘` и `’`) вместо стандартных одинарных (`'`) или двойных (`"`). Это вызывает синтаксические ошибки.
2. **Ошибки в шаблонных строках**. В выражениях вида `Команда: ${teamName}` не хватает обратных кавычек (`` ` ``) для обозначения шаблонных строк.
3. **Отсутствие обработки формы создания задачи**. Функция для обработки отправки формы `#taskForm` отсутствует.
4. **Минимальная валидация телефона**. Текущая проверка только на пустоту — недостаточно для корректного номера.
5. **Отсутствие сохранения данных**. При перезагрузке страницы вся информация теряется.
6. **Нет обратной связи при создании спринта/участника**. Используются `alert`, что ухудшает UX.
7. **Отсутствие очистки полей** после успешного действия.

---

## Исправленная версия кода

```javascript
// Базовые функции приложения
function createTeam() {
    const nickname = document.getElementById('userNickname').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const role = document.getElementById('userRole').value;
    const teamName = document.getElementById('teamName').value.trim();

    if (!nickname || !phone || !teamName || !role) {
        alert('Заполните все обязательные поля');
        return;
    }

    // Базовая валидация телефона (упрощённая)
    const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phone)) {
        alert('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
        return;
    }

    // Сохраняем данные в localStorage для сохранения между сессиями
    const userData = { nickname, phone, role, teamName };
    localStorage.setItem('taskTrackerUserData', JSON.stringify(userData));

    // Здесь будет логика создания команды
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    // Обновление интерфейса
    document.getElementById('teamInfo').textContent = `Команда: ${teamName}`;
    document.getElementById('userInfo').textContent = `Никнейм: ${nickname}, Телефон: ${phone}`;

    const roleText = role === 'manager' ? 'Руководитель' : 'Исполнитель';
    document.getElementById('roleBadge').textContent = roleText;

    // Очистка полей формы после создания
    document.getElementById('userNickname').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userRole').value = '';
    document.getElementById('teamName').value = '';
}

function showJoinTeam() {
    alert('Функция входа в команду будет реализована позже');
}

function logout() {
    // Очищаем сохранённые данные
    localStorage.removeItem('taskTrackerUserData');

    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authModal').classList.remove('hidden');

    // Сброс интерфейса
    document.getElementById('teamInfo').textContent = '';
    document.getElementById('userInfo').textContent = '';
    document.getElementById('roleBadge').textContent = '';
}

function createSprint() {
    const sprintName = document.getElementById('sprintName').value.trim();
    const startDate = document.getElementById('sprintStart').value;
    const endDate = document.getElementById('sprintEnd').value;

    if (!sprintName || !startDate || !endDate) {
        alert('Заполните все поля спринта');
        return;
    }

    // Проверка корректности дат
    if (new Date(startDate) > new Date(endDate)) {
        alert('Дата начала не может быть позже даты окончания');
        return;
    }

    // Логика создания спринта
    const sprintsContainer = document.getElementById('sprintsContainer');
    const newSprint = document.createElement('div');
    newSprint.className = 'sprint-card';
    newSprint.innerHTML = `
        <h3>${sprintName}</h3>
        <p>Период: ${startDate} — ${endDate}</p>
        <button onclick="deleteSprint(this)" class="danger">Удалить</button>
    `;
    sprintsContainer.appendChild(newSprint);

    // Очистка полей после создания
    document.getElementById('sprintName').value = '';
    document.getElementById('sprintStart').value = '';
    document.getElementById('sprintEnd').value = '';

    showNotification(`Спринт "${sprintName}" создан!`);
}

function deleteSprint(button) {
    button.parentElement.remove();
    showNotification('Спринт удалён');
}

function addMember() {
    const memberName = document.getElementById('memberName').value.trim();
    const memberRole = document.getElementById('memberRole').value;

    if (!memberName) {
        alert('Введите имя участника');
        return;
    }

    // Логика добавления участника
    const membersList = document.getElementById('membersList');
    const newMember = document.createElement('div');
    newMember.className = 'member-card';
    newMember.innerHTML = `
        <span>${memberName}</span>
        <span class="role-badge">${memberRole === 'manager' ? 'Руководитель' : 'Исполнитель'}</span>
        <button onclick="removeMember(this)" class="danger">Удалить</button>
    `;
    membersList.appendChild(newMember);

    // Очистка поля после добавления
    document.getElementById('memberName').value = '';

    showNotification(`Участник "${memberName}" добавлен в команду!`);
}

function removeMember(button) {
    button.parentElement.remove();
    showNotification('Участник удалён из команды');
}

// Обработка формы создания задачи
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const dueDate = document.getElementById('taskDue').value;
    const assignee = document.getElementById('taskAssignee').value;
    const priority = document.getElementById('taskPriority').value;

    if (!title) {
        alert('Введите название задачи');
        return;
    }

    // Добавление задачи в список
    const taskList = document.getElementById('activeTasksList');

    // Удаляем сообщение "Нет активных задач", если оно есть
    const emptyState = taskList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const newTask = document.createElement('div');
    newTask.className = `task-card priority-${priority}`;
    newTask.innerHTML = `
        <div class="task-header">
            <h4>${title}</h4>
            <span class="priority-badge">${priority === 'high' ? 'Высокий' : priority === 'medium' ? 'Средний' : 'Низкий'}</span>
        </div>
        ${description ? `<p class="task-desc">${description}</p>` : ''}
        <div class="task-footer">
            <span>Срок: ${dueDate || 'Не указан'}</span>
            <span>Исполнитель: ${assignee || 'Не назначен'}</span>
            <button onclick="completeTask(this)" class="success">Выполнено</button>
            <button onclick="deleteTask(this)" class="danger">Удалить</button>
        </div>
    `;

    taskList.appendChild(newTask);

    // Очистка формы
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskDue').value = '';
    document.getElementById('taskAssignee').value = '';
    document.getElementById('taskPriority').value = 'medium';

    showNotification('Задача создана!');
});

function completeTask(button) {
    const taskCard = button.parentElement.parentElement;
    taskCard.style.opacity = '0.5';
    taskCard.style.textDecoration = 'line-through';
    showNotification('Задача отмечена как выполненная');
}

function deleteTask(button) {
    button.parentElement.parentElement.remove();

    // Показываем сообщение "Нет активных задач", если список пуст
    const taskList = document.getElementById('activeTasksList');
    if (taskList.children.length === 0) {
        taskList.innerHTML = '<p class="empty-