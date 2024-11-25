// DOM Elements
const boardContainer = document.getElementById('boardContainer');
const addColumnBtn = document.getElementById('addColumnBtn');
const columnTemplate = document.getElementById('columnTemplate');
const taskTemplate = document.getElementById('taskTemplate');

// State
let columns = JSON.parse(localStorage.getItem('columns')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Initialize board
function initializeBoard() {
    columns.forEach(column => {
        createColumnElement(column);
    });
    setupSortable();
}

// Create new column
function createColumn(title = 'New Column') {
    const column = {
        id: Date.now().toString(),
        title: title
    };
    columns.push(column);
    saveColumns();
    createColumnElement(column);
    setupSortable();
}

// Create column DOM element
function createColumnElement(column) {
    const columnElement = columnTemplate.content.cloneNode(true).children[0];
    columnElement.id = `column-${column.id}`;
    
    const columnTitle = columnElement.querySelector('.column-title');
    columnTitle.textContent = column.title;
    
    // Add event listeners
    const deleteBtn = columnElement.querySelector('.delete-column');
    deleteBtn.addEventListener('click', () => deleteColumn(column.id));
    
    const addTaskBtn = columnElement.querySelector('.add-task');
    addTaskBtn.addEventListener('click', () => createTask(column.id));
    
    // Make title editable
    columnTitle.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.value = column.title;
        input.className = 'bg-[#2c2c34] text-white p-1 rounded';
        columnTitle.replaceWith(input);
        input.focus();
        
        input.addEventListener('blur', () => {
            column.title = input.value;
            saveColumns();
            input.replaceWith(columnTitle);
            columnTitle.textContent = column.title;
        });
    });
    
    // Add tasks belonging to this column
    const columnContent = columnElement.querySelector('.column-content');
    const columnTasks = tasks.filter(task => task.columnId === column.id);
    columnTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        columnContent.appendChild(taskElement);
    });
    
    boardContainer.appendChild(columnElement);
}

// Create new task
function createTask(columnId, title = 'New Task') {
    const task = {
        id: Date.now().toString(),
        columnId: columnId,
        title: title
    };
    tasks.push(task);
    saveTasks();
    
    const columnContent = document.querySelector(`#column-${columnId} .column-content`);
    const taskElement = createTaskElement(task);
    columnContent.appendChild(taskElement);
}

// Create task DOM element
function createTaskElement(task) {
    const taskElement = taskTemplate.content.cloneNode(true).children[0];
    taskElement.id = `task-${task.id}`;
    
    const taskTitle = taskElement.querySelector('.task-title');
    taskTitle.textContent = task.title;
    
    // Delete task
    const deleteBtn = taskElement.querySelector('.delete-task');
    deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        taskElement.remove();
    });
    
    // Make title editable
    taskTitle.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.value = task.title;
        input.className = 'bg-[#2c2c34] text-white p-1 rounded w-full';
        taskTitle.replaceWith(input);
        input.focus();
        
        input.addEventListener('blur', () => {
            task.title = input.value;
            saveTasks();
            input.replaceWith(taskTitle);
            taskTitle.textContent = task.title;
        });
    });
    
    return taskElement;
}

// Delete column
function deleteColumn(columnId) {
    columns = columns.filter(column => column.id !== columnId);
    tasks = tasks.filter(task => task.columnId !== columnId);
    saveColumns();
    saveTasks();
    document.querySelector(`#column-${columnId}`).remove();
}

// Setup sortable
function setupSortable() {
    // Make columns sortable
    new Sortable(boardContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: '.column-header',
        draggable: '.column',
        onEnd: function() {
            // Update columns order if needed
            const columnElements = document.querySelectorAll('.column');
            columns = Array.from(columnElements).map(el => {
                const id = el.id.replace('column-', '');
                return columns.find(col => col.id === id);
            });
            saveColumns();
        }
    });
    
    // Make tasks sortable within and between columns
    document.querySelectorAll('.column-content').forEach(columnContent => {
        new Sortable(columnContent, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            group: 'tasks',
            draggable: '.task',
            onEnd: function(evt) {
                const taskId = evt.item.id.replace('task-', '');
                const task = tasks.find(t => t.id === taskId);
                const newColumnId = evt.to.closest('.column').id.replace('column-', '');
                
                if (task.columnId !== newColumnId) {
                    task.columnId = newColumnId;
                    saveTasks();
                }
            }
        });
    });
}

// Save to localStorage
function saveColumns() {
    localStorage.setItem('columns', JSON.stringify(columns));
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event Listeners
addColumnBtn.addEventListener('click', () => createColumn());

// Initialize
initializeBoard();
