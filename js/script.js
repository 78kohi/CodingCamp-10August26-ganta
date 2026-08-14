(function () {

  // ─── Storage ───────────────────────────────────────────────
  const Storage = (() => {
    function save(key, value) {
      localStorage.setItem(key, value)
    }
    function load(key) {
      return localStorage.getItem(key)
    }
    return { save, load };
  })();

  // ─── Toast ─────────────────────────────────────────────────
  const Toast = (() => {
    function show(message, duration = 3000) {

    }
    return { show };
  })();

  // ─── Modal ─────────────────────────────────────────────────
  const Modal = (() => {
    function show(title, message) {
      const modal = document.getElementById("modal");
      const modalTitle = document.getElementById("modal-title");
      const modalMessage = document.getElementById("modal-message");
      const modalCloseBtn = document.getElementById("modal-close-btn");

      modalTitle.textContent = title;
      modalMessage.textContent = message;

      modal.classList.remove("hide");

      modalCloseBtn.addEventListener("click", () => {
        modal.classList.toggle("visible");
      });
    }
    function hide() {}

    return { show, hide };
  })();

  // ─── TimerModule ───────────────────────────────────────────
  const TimerModule = (() => {
    // pure helpers
    function formatTime(seconds) {}
    function calcProgress() {}

    // render helpers
    function renderDisplay() {}
    function renderButtons() {}
    function renderPresets() {}

    // internal
    function tick() {}
    function persistState() {}

    // public API
    function init() {}
    function start() {}
    function stop() {}
    function reset() {}
    function selectPreset(minutes) {}

    return { init, start, stop, reset, selectPreset };
  })();

  // ─── LinksModule ───────────────────────────────────────────
  const LinksModule = (() => {
    // internal helpers
    function generateId() {}
    function persist() {}
    function showEmpty() {}
    function createCard(link) {}
    function renderGrid() {}

    // public API
    function init() {}
    function addLink(label, url) {}
    function deleteLink(id) {}

    return { init, addLink, deleteLink };
  })();

  // ─── ToDoListModule ───────────────────────────────────────────
  const ToDoListModule = (() => {
    // internal helpers
    function generateId() {
      return Date.now().toString(36);
    }
    function persist() {
      const tasks = Array.from(document.querySelectorAll("#todo-list .todo-item")).map(item => {
        return {
          id: item.dataset.id,
          text: item.querySelector("p").textContent,
          completed: item.querySelector("input[type='checkbox']").checked
        };
      });
      Storage.save("tasks", JSON.stringify(tasks));
    }
    function showEmpty() {
      const todoList = document.getElementById("todo-list");
      if (todoList.children.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No tasks yet. Add a task to get started!";
        emptyMessage.classList.add("empty-message");
        todoList.appendChild(emptyMessage);
      } else {
        const emptyMessage = todoList.querySelector(".empty-message");
        if (emptyMessage) {
          emptyMessage.remove();
        }
      }
    }
    function createItem(task) {
      const todoList = document.getElementById("todo-list");

    const item = document.createElement("li");
    item.classList.add("todo-item");
    item.dataset.id = task.id;

    item.innerHTML = `
        <p class="todo-text">${task.text}</p>
        <input class="todo-edit-input todo-input hide" type="text">

        <div class="todo-item-actions">
            <i class="todo-edit fa-solid fa-pen"></i>
            <i class="todo-delete fa-solid fa-trash"></i>
            <input class="todo-check" type="checkbox" ${task.completed ? "checked" : ""}>
        </div>
    `;

    const checkbox = item.querySelector(".todo-check");
    const deleteBtn = item.querySelector(".todo-delete");
    const editBtn = item.querySelector(".todo-edit");

    checkbox.addEventListener("change", () => {
        toggleTaskCompletion(task.id);
    });

    deleteBtn.addEventListener("click", () => {
        deleteTask(task.id);
    });

    editBtn.addEventListener("click", () => {
      const editInput = item.querySelector(".todo-edit-input");
      const p = item.querySelector(".todo-text");

      editInput.value = p.textContent;

      p.classList.add("hide");
      editInput.classList.remove("hide");

      editInput.focus();

      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const editText = editInput.value.trim();
  
          if (!editText) return;
  
          editTask(task.id, editText);
        }
      });
    });

    todoList.appendChild(item);
    }
    function renderList() {
      const tasks = JSON.parse(Storage.load("tasks") || "[]");
      const todoList = document.getElementById("todo-list");
      todoList.innerHTML = "";
      tasks.forEach(task => {
        createItem(task);
      });
      showEmpty();
      showClearTasks();
      tasksCounter();
    }

    // public API
    function addTask(task) {
      const tasks = JSON.parse(Storage.load("tasks") || "[]");
      tasks.push(task);
      Storage.save("tasks", JSON.stringify(tasks));
      createItem(task);
      showEmpty();
      tasksCounter();
    }
    function deleteTask(id) {
      let tasks = JSON.parse(Storage.load("tasks") || "[]");
      tasks = tasks.filter(task => task.id !== id);
      Storage.save("tasks", JSON.stringify(tasks));
      renderList();
    }
    function editTask(id, text) {
      let tasks = JSON.parse(Storage.load("tasks") || "[]");
      const taskToEdit = tasks.find(task => task.id === id);
      taskToEdit.text = text;
      Storage.save("tasks", JSON.stringify(tasks));
      renderList();
    }
    function toggleTaskCompletion(id) {
      const tasks = JSON.parse(Storage.load("tasks") || "[]");
      const task = tasks.find(task => task.id === id);
      if (task) {
        task.completed = !task.completed;
        Storage.save("tasks", JSON.stringify(tasks));
        renderList();
      }
    }
    function clearCompletedTasks() {
      let tasks = JSON.parse(Storage.load("tasks") || "[]");
      tasks = tasks.filter(task => !task.completed);
      Storage.save("tasks", JSON.stringify(tasks));
      renderList();
    }

    return { generateId, renderList, addTask, editTask, deleteTask, toggleTaskCompletion, clearCompletedTasks };
  })();

  // ─── Helpers ───────────────────────────────────────────
  function updateClock () {
    const clock = document.querySelector("#clock");
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    clock.textContent = `${hours}:${minutes}:${seconds}`
  }

  function displayDate () {
    const dateText = document.querySelector("#date-display");
    const now = new Date();

    let date = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    })
    dateText.textContent = date
  }

  function initTheme () {
    let theme = Storage.load("theme") || "light";
    document.documentElement.setAttribute('data-theme', theme);
  }

  function greet () {
    const greetText = document.querySelector("#greeting");
    const name = Storage.load("name")
    const now = new Date();

    let hour = now.getHours();
    let time = hour >= 5 && hour < 12 ? "morning" : 
               hour >= 12 && hour < 16 ? "afternoon" :
               "evening"
    greetText.textContent = `Good ${time}, kohi`
  }

  const Menu = (() => {
    const menu = document.querySelector(".menu-dropdown");

    function toggle() { menu.classList.toggle("hide"); }
    function hide() { menu.classList.add("hide"); }
    function show() { menu.classList.remove("hide"); }

    return { toggle, hide, show };
  })();

  function showClearTasks () {
    const tasks = JSON.parse(Storage.load("tasks") || "[]");
    const clearBtn = document.querySelector("#clear-completed-btn");
    const hasCompletedTasks = tasks.some(task => task.completed);
    
    if (hasCompletedTasks) {
      clearBtn.classList.remove("hide");
    } else {
      clearBtn.classList.add("hide");
    }
  }

  function tasksCounter () {
    const tasks = JSON.parse(Storage.load("tasks") || "[]");
    const counter = document.querySelector("#task-counter");
    const completedTask = tasks.filter(task => task.completed).length

    counter.textContent = `${completedTask} / ${tasks.length}`
  }

  // ─── Event wiring ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    greet();
    displayDate();
    updateClock();
    setInterval(updateClock, 1000);
    ToDoListModule.renderList();
    showClearTasks();
    tasksCounter();
  });

  // Toggle theme button
  document.querySelector("#theme-toggle-btn").addEventListener("click", () => {
    const themeIcon = document.querySelector("#theme-toggle-btn i");
    const themeText = document.querySelector("#theme-toggle-btn span");
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    Menu.hide();
    themeIcon.classList.toggle("fa-sun");
    themeIcon.classList.toggle("fa-moon");

    themeText.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';

    document.documentElement.setAttribute('data-theme', newTheme);      
    Storage.save("theme", newTheme);
  })

  // Add name
  document.querySelector("#name-form").addEventListener("click", (e) => {})

  // Menu button
  document.querySelector(".menu-btn").addEventListener("click", () => {
    Menu.toggle();
  })

  // Todo buttons
  document.querySelector(".todo-input-row").addEventListener("submit", (e) => {
    e.preventDefault();

    const taskInput = document.querySelector("#todo-input");
    const taskText = taskInput.value.trim();
    if (taskText) {
      const task = {
        id: ToDoListModule.generateId(),
        text: taskText,
        completed: false
      };
      ToDoListModule.addTask(task);
      taskInput.value = "";
    }
  })

  document.querySelector("#todo-add-btn").addEventListener("click", () => {
    
  })

  document.querySelector("#clear-completed-btn").addEventListener("click", () => {
    ToDoListModule.clearCompletedTasks();
  })

  document.addEventListener("click" , (e) => {
    if (!document.querySelector(".menu-dropdown").contains(e.target) && !document.querySelector(".menu-btn").contains(e.target)) {
      Menu.hide();
    }
  })

})();
