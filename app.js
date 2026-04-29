// Глобальные переменные
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    renderTasks();
    updateStats();
});

function setupEventListeners() {
    // Добавление задачи
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });

    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const description = taskInput.value.trim();

    if (!description) {
        alert('Введите описание задачи!');
        return;
    }

    const newTask = {
        id: Date.now(),
        description: description,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();

    // Очищаем поле ввода
    taskInput.value = '';
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    if (confirm('Удалить эту задачу?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    // Фильтруем задачи в зависимости от выбранного фильтра
    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    // Если нет задач для отображения
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="no-tasks">
                ${currentFilter === 'all' ? 'Нет задач' :
                currentFilter === 'active' ? 'Нет активных задач' : 'Нет выполненных задач'}
            </div>
        `;
        return;
    }

    // Создаём элементы для каждой задачи
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <input type="checkbox"
                   class="task-checkbox"
                  ${task.completed ? 'checked' : ''}
                   onclick="toggleTask(${task.id})">
            <span class="task-text">${task.description}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Удалить</button>
        `;
        tasksList.appendChild(taskElement);
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStats() {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(task => task.completed).length;
    const remainingCount = totalCount - completedCount;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('remainingCount').textContent = remainingCount;
}

// Дополнительные функции для работы с клавиатурой
document.addEventListener('keydown', function(e) {
    // Esc — очистка поля ввода
    if (e.key === 'Escape') {
        document.getElementById('taskInput').value = '';
    }
});

// Функция очистки всех выполненных задач
function clearCompleted() {
    if (confirm('Удалить все выполненные задачи?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Добавляем кнопку очистки выполненных задач в интерфейс
function addClearButton() {
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Очистить выполненные';
    clearBtn.className = 'clear-btn';
    clearBtn.style.cssText = `
        margin-top: 15px;
        padding: 8px 16px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
        width: 100%;
    `;
    clearBtn.addEventListener('click', clearCompleted);

    const statsElement = document.querySelector('.stats');
    statsElement.parentNode.insertBefore(clearBtn, statsElement.nextSibling);
}

// Вызываем после инициализации
addClearButton();
