Вы правы — в коде есть несколько синтаксических и логических ошибок, из‑за которых функция создания команды не работает. Разберу проблему и дам исправленную версию.

## Основные ошибки

1. **Некорректные кавычки** в JS‑коде (`‘` вместо `'`).
2. **Ошибки в шаблонах строк** — пропущены обратные кавычки (`\``).
3. **Синтаксическая ошибка в `saveTeam`** — не закрыта скобка, неверные кавычки.
4. **Проблемы в `loadTasks`** — некорректный HTML в шаблоне, пропущены кавычки и обратные кавычки.
5. **Ошибки в `updateSprintDisplay`** — пропущены обратные кавычки в шаблоне.
6. **Ошибки в загрузке данных** — неверные строки для ключей `localStorage`.

---

## Исправленный код (app.js)

```javascript
// Глобальные переменные
let currentUser = null;
let currentTeam = null;
let tasks = [];
let sprint = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    loadTeams();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('registerBtn').addEventListener('click', registerUser);
    document.getElementById('createTeamBtn').addEventListener('click', createTeam);
    document.getElementById('createTaskBtn').addEventListener('click', createTask);
    document.getElementById('startSprintBtn').addEventListener('click', startSprint);
}

function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const teamSelect = document.getElementById('teamSelect');
    teamSelect.innerHTML = '';

    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

function registerUser() {
    const role = document.getElementById('userRole').value;
    const teamId = document.getElementById('teamSelect').value;
    const nickname = document.getElementById('nickname').value.trim();
    const phoneLast4 = document.getElementById('phoneLast4').value.trim();

    if (!nickname || !phoneLast4) {
        alert('Заполните все поля');
        return;
    }

    currentUser = {
        id: Date.now().toString(),
        nickname,
        phoneLast4,
        role
    };

    // Если выбрана существующая команда
    if (teamId) {
        currentTeam = JSON.parse(localStorage.getItem(`team_${teamId}`));
        if (!currentTeam.members) currentTeam.members = [];
        currentTeam.members.push(currentUser);
        saveTeam(currentTeam);
    } else {
        // Создаём новую команду (только для руководителей)
        if (role === 'manager') {
            createTeam();
        } else {
            alert('Выберите команду или создайте новую (только для руководителей)');
            return;
        }
    }

    showMainApp();
}

function createTeam() {
    const teamName = prompt('Введите название команды:');
    if (!teamName) return;

    const team = {
        id: Date.now().toString(),
        name: teamName,
        members: [currentUser]
    };

    saveTeam(team);
    currentTeam = team;
    showMainApp();
}

function saveTeam(team) {
    localStorage.setItem(`team_${team.id}`, JSON.stringify(team));
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams = teams.filter(t => t.id !== team.id);
    teams.push({ id: team.id, name: team.name });
    localStorage.setItem('teams', JSON.stringify(teams));
}

function showMainApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    document.getElementById('currentTeam').textContent = currentTeam.name;
    document.getElementById('userName').textContent = currentUser.nickname;
    document.getElementById('userRoleDisplay').textContent =
        currentUser.role === 'manager' ? 'Руководитель' : 'Исполнитель';

    // Заполняем список исполнителей (только для руководителей)
    if (currentUser.role === 'manager') {
        const assigneeSelect = document.getElementById('taskAssignee');
        assigneeSelect.innerHTML = '';
        currentTeam.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.nickname} (${member.phoneLast4})`;
            assigneeSelect.appendChild(option);
        });
    } else {
        document.getElementById('assigneeSection').classList.add('hidden');
    }

    loadTasks();
}

function createTask() {
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    let assigneeId = currentUser.id; // По умолчанию — сам пользователь

    if (currentUser.role === 'manager') {
        assigneeId = document.getElementById('taskAssignee').value;
    }

    if (!description || !dueDate) {
        alert('Заполните описание и срок выполнения');
        return;
    }

    const task = {
        id: Date.now().toString(),
        description,
        dueDate,
        status: 'in-progress', // в работе
        creatorId: currentUser.id,
        assigneeId,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    loadTasks();

    // Очищаем форму
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
}

function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    const userTasks = tasks.filter(task =>
        task.assigneeId === currentUser.id || task.creatorId === currentUser.id
    );

    if (userTasks.length === 0) {
        tasksList.innerHTML = '<p>Нет задач</p>';
        return;
    }

    userTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div><strong>Описание:</strong> ${task.description}</div>
            <div><strong>Срок:</strong> ${formatDate(task.dueDate)}</div>
            <div><strong>Статус:</strong> <span class="status-${task.status}">
                ${task.status === 'in-progress' ? 'В работе' : 'Выполнено'}
            </span></div>
            ${currentUser.role === 'manager' || task.creatorId === currentUser.id ?
                `<button onclick="toggleTaskStatus('${task.id}')">
                    ${task.status === 'in-progress' ? 'Отметить выполненным' : 'Вернуть в работу'}
        </button>` : ''}
        `;
        tasksList.appendChild(taskCard);
    });
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'in-progress' ? 'done' : 'in-progress';
        saveTasks();
        loadTasks();
    }
}

function saveTasks() {
    localStorage.setItem(`tasks_${currentTeam.id}`, JSON.stringify(tasks));
}

function startSprint() {
    if (confirm('Начать новый спринт? Все текущие задачи будут включены в спринт.')) {
        sprint = {
            id: Date.now().toString(),
            startDate: new Date().toISOString(),
            tasks: [...tasks] // Копируем все текущие задачи
        };
        localStorage.setItem(`sprint_${currentTeam.id}`, JSON.stringify(sprint));
        updateSprintDisplay();
    }
}

function updateSprintDisplay() {
    const sprintInfo = document.getElementById('sprintInfo');
    const sprintTasksList = document.getElementById('sprintTasksList');

    if (!sprint) {
        sprintInfo.textContent = 'Спринт не создан';
        sprintTasksList.innerHTML = '';
        return;
    }

    sprintInfo.textContent = `Спринт начат: ${formatDate(sprint.startDate)}`;
    sprintTasksList.innerHTML = '';

    sprint.tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card';
    taskElement.innerHTML = `
        <div>${task.description} (${formatDate(task.dueDate)})</div>
        <div class="status-${task.status}">
            Статус: ${task.status === 'in-progress' ? 'В работе' : 'Выполнено'}
        </div>
    `;
    sprintTasksList.appendChild(taskElement);
});
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Загружаем данные при старте
window.addEventListener('load', function() {
    // Проверяем, есть ли сохранённая сессия
    const savedUser = localStorage.getItem('currentUser');
    const savedTeamId = localStorage.getItem('currentTeamId');

    if (savedUser && savedTeamId) {
        currentUser = JSON.parse(savedUser);
        currentTeam = JSON.parse(localStorage.getItem(`team_${savedTeamId}`));
        tasks = JSON.parse(localStorage.getItem(`tasks_${savedTeamId}`)) || [];
        sprint = JSON.parse(localStorage.getItem(`sprint_${savedTeamId}`)) || null;

        showMainApp();
        updateSprintDisplay();
    }
});
