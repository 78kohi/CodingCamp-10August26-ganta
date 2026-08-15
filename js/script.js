(function () {
  "use strict";

  // ─────────────────────────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────────────────────────

  const Storage = (() => {
    function save(key, value) {
      localStorage.setItem(key, value);
    }

    function load(key) {
      return localStorage.getItem(key);
    }

    function remove(key) {
      localStorage.removeItem(key);
    }

    function loadJSON(key, fallback = null) {
      try {
        const value = load(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    }

    function saveJSON(key, value) {
      save(key, JSON.stringify(value));
    }

    return {
      save,
      load,
      remove,
      loadJSON,
      saveJSON
    };
  })();


  // ─────────────────────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────────────────────

  const Toast = (() => {
    let timeout = null;

    function show(message, duration = 3000) {
      const toast = document.querySelector("#toast");

      if (!toast) return;

      toast.textContent = message;
      toast.classList.remove("hide");

      // Restart animation if necessary
      toast.classList.remove("visible");

      requestAnimationFrame(() => {
        toast.classList.add("visible");
      });

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        toast.classList.remove("visible");

        setTimeout(() => {
          toast.classList.add("hide");
        }, 200);
      }, duration);
    }

    return { show };
  })();


  // ─────────────────────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────────────────────

  const Modal = (() => {
    const modal = document.querySelector("#modal");

    function show(title, content) {
      const modalTitle =
        document.querySelector("#modal-title");

      const modalBody =
        document.querySelector("#modal-body");

      modalTitle.textContent = title;
      modalBody.innerHTML = content;

      if (!modal.open) {
        modal.showModal();
      }
    }

    function hide() {
      if (modal.open) {
        modal.close();
      }
    }

    return { show, hide };
  })();


  // ─────────────────────────────────────────────────────────────
  // Menu
  // ─────────────────────────────────────────────────────────────

  const Menu = (() => {
    const menu = document.querySelector(".menu-dropdown");

    function toggle() {
      menu.classList.toggle("hide");
    }

    function hide() {
      menu.classList.add("hide");
    }

    function show() {
      menu.classList.remove("hide");
    }

    return {
      toggle,
      hide,
      show
    };
  })();


  // ─────────────────────────────────────────────────────────────
  // Theme
  // ─────────────────────────────────────────────────────────────

  function updateThemeUI(theme) {
    const themeBtn = document.querySelector("#theme-toggle-btn");

    if (!themeBtn) return;

    const icon = themeBtn.querySelector("i");
    const text = themeBtn.querySelector("span");

    if (theme === "dark") {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      text.textContent = "Light mode";
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      text.textContent = "Dark mode";
    }
  }

  function initTheme() {
    const savedTheme = Storage.load("theme") || "light";

    document.documentElement.setAttribute(
      "data-theme",
      savedTheme
    );

    updateThemeUI(savedTheme);
  }

  function toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    const newTheme =
      currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );

    Storage.save("theme", newTheme);
    updateThemeUI(newTheme);

    Menu.hide();

    Toast.show(
      newTheme === "dark"
        ? "Dark mode enabled"
        : "Light mode enabled"
    );
  }


  // ─────────────────────────────────────────────────────────────
  // Greeting
  // ─────────────────────────────────────────────────────────────

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "morning ☀️";
    }

    if (hour >= 12 && hour < 17) {
      return "afternoon 👋";
    }

    return "evening 🌙";
  }

  function greet() {
    const greeting = document.querySelector("#greeting");

    if (!greeting) return;

    const name = Storage.load("name");
    const time = getGreeting();

    if (name) {
      greeting.textContent = `Good ${time}, ${name}`;
    } else {
      greeting.textContent = `Good ${time}!`;
    }
  }


  // ─────────────────────────────────────────────────────────────
  // Clock & Date
  // ─────────────────────────────────────────────────────────────

  function updateClock() {
    const clock = document.querySelector("#clock");

    if (!clock) return;

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    clock.textContent =
      `${hours}:${minutes}:${seconds}`;
  }

  function displayDate() {
    const dateText =
      document.querySelector("#date-display");

    if (!dateText) return;

    const now = new Date();

    dateText.textContent =
      now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
  }


  // ─────────────────────────────────────────────────────────────
  // Name Modal
  // ─────────────────────────────────────────────────────────────

  function openNameModal() {
    const currentName = Storage.load("name") || "";

    Modal.show(
      "Change Name",
      `
        <input
          type="text"
          id="name-input"
          class="todo-input"
          placeholder="Enter your name"
          maxlength="50"
          autocomplete="off"
          aria-label="Your name"
          value="${escapeHTML(currentName)}"
        />

        <button
          id="name-save-btn"
          class="btn btn-primary"
          aria-label="Save name"
        >
          Save
        </button>
      `
    );

    const input = document.querySelector("#name-input");
    const saveBtn = document.querySelector("#name-save-btn");

    input.focus();

    saveBtn.addEventListener("click", () => {
      saveName();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveName();
      }

      if (event.key === "Escape") {
        Modal.hide();
      }
    });
  }

  function saveName() {
    const input = document.querySelector("#name-input");

    if (!input) return;

    const name = input.value.trim();

    if (!name) {
      Toast.show("Please enter a name.");
      input.focus();
      return;
    }

    Storage.save("name", name);

    greet();
    Modal.hide();

    Toast.show(`Welcome, ${name}!`);
  }


  // ─────────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────────

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }


  // ─────────────────────────────────────────────────────────────
  // Timer
  // ─────────────────────────────────────────────────────────────

  const TimerModule = (() => {
    let duration = 25 * 60;
    let remaining = duration;
    let interval = null;
    let running = false;

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;

      return (
        `${String(minutes).padStart(2, "0")}:` +
        `${String(secs).padStart(2, "0")}`
      );
    }

    function renderDisplay() {
      const display =
        document.querySelector("#timer-display");

      if (!display) return;

      display.textContent = formatTime(remaining);
    }

    function renderButtons() {
      const startBtn =
        document.querySelector("#timer-start-btn");

      const stopBtn =
        document.querySelector("#timer-stop-btn");

      if (!startBtn || !stopBtn) return;

      if (running) {
        startBtn.classList.add("hide");
        stopBtn.classList.remove("hide");

        stopBtn.disabled = false;
      } else {
        startBtn.classList.remove("hide");
        stopBtn.classList.add("hide");

        stopBtn.disabled = true;
      }
    }

    function renderProgress() {
      const bar =
        document.querySelector("#timer-progress-fill");

      if (!bar || duration <= 0) return;

      const progress =
        ((duration - remaining) / duration) * 100;

      bar.style.width =
        `${Math.min(100, Math.max(0, progress))}%`;
    }

    function renderLabel() {
      const label =
        document.querySelector("#timer-label");

      if (!label) return;

      const minutes = duration / 60;

      label.textContent =
        `Focus Timer · ${minutes} min`;
    }

    function renderPresets() {
      const buttons =
        document.querySelectorAll(".preset-btn");

      buttons.forEach(button => {
        const minutes =
          Number(button.dataset.minutes);

        if (
          minutes &&
          minutes === duration / 60
        ) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      });
    }

    function render() {
      renderDisplay();
      renderButtons();
      renderProgress();
      renderLabel();
      renderPresets();
    }

    function persistState() {
      Storage.saveJSON("timer", {
        duration,
        remaining
      });
    }

    function tick() {
      if (remaining <= 0) {
        finish();
        return;
      }

      remaining--;

      renderDisplay();
      renderProgress();

      persistState();

      if (remaining <= 0) {
        finish();
      }
    }

    function finish() {
      stop();

      remaining = 0;

      render();

      Modal.show(
        "Focus complete!",
        `
          <p>Nice work. Take a short break.</p>

          <button
            id="timer-finished-close"
            class="btn btn-primary"
          >
            Done
          </button>
        `
      );

      const closeBtn =
        document.querySelector("#timer-finished-close");

      if (closeBtn) {
        closeBtn.addEventListener(
          "click",
          Modal.hide
        );
      }

      Toast.show("Focus session complete!");
    }

    function init() {
      const saved =
        Storage.loadJSON("timer");

      if (saved) {
        duration =
          Number(saved.duration) > 0
            ? Number(saved.duration)
            : 25 * 60;

        remaining =
          Number(saved.remaining) >= 0
            ? Number(saved.remaining)
            : duration;
      }

      running = false;

      render();
    }

    function start() {
      if (running || remaining <= 0) {
        return;
      }

      running = true;

      interval =
        setInterval(tick, 1000);

      renderButtons();
      persistState();

      Toast.show("Focus timer started.");
    }

    function stop() {
      running = false;

      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }

      renderButtons();
      persistState();
    }

    function reset() {
      stop();

      remaining = duration;

      render();

      persistState();

      Toast.show("Timer reset.");
    }

    function selectPreset(minutes) {
      if (!Number.isFinite(minutes) || minutes <= 0) {
        return;
      }

      stop();

      duration = minutes * 60;
      remaining = duration;

      render();

      persistState();

      Toast.show(`${minutes} minute timer selected.`);
    }

    return {
      init,
      start,
      stop,
      reset,
      selectPreset
    };
  })();


  // ─────────────────────────────────────────────────────────────
  // Quick Links
  // ─────────────────────────────────────────────────────────────

  const LinksModule = (() => {
    function generateId() {
      return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
      );
    }

    function getLinks() {
      return Storage.loadJSON("links", []);
    }

    function persist(links) {
      Storage.saveJSON("links", links);
    }

    function normalizeURL(url) {
      if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
      }

      return url;
    }

    function createCard(link) {
      const grid =
        document.querySelector("#links-grid");

      const card =
        document.createElement("div");

      card.classList.add("link-card");
      card.dataset.id = link.id;

      const anchor =
        document.createElement("a");

      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      const label =
        document.createElement("span");

      label.classList.add("link-label");
      label.textContent = link.label;

      anchor.appendChild(label);

      const deleteBtn =
        document.createElement("button");

      deleteBtn.classList.add("link-delete");
      deleteBtn.type = "button";
      deleteBtn.setAttribute(
        "aria-label",
        `Delete ${link.label}`
      );

      deleteBtn.innerHTML =
        `<i class="fa-solid fa-trash"></i>`;

      deleteBtn.addEventListener(
        "click",
        () => deleteLink(link.id)
      );

      card.appendChild(anchor);
      card.appendChild(deleteBtn);

      grid.appendChild(card);
    }

    function renderGrid() {
      const grid =
        document.querySelector("#links-grid");

      if (!grid) return;

      grid.innerHTML = "";

      const links = getLinks();

      if (links.length === 0) {
        const empty =
          document.createElement("p");

        empty.classList.add("empty-message");
        empty.textContent =
          "No quick links yet.";

        grid.appendChild(empty);
        return;
      }

      links.forEach(createCard);
    }

    function addLink(label, url) {
      const links = getLinks();

      const normalizedURL =
        normalizeURL(url);

      try {
        new URL(normalizedURL);
      } catch {
        Toast.show("Please enter a valid URL.");
        return false;
      }

      const link = {
        id: generateId(),
        label,
        url: normalizedURL
      };

      links.push(link);

      persist(links);
      renderGrid();

      Toast.show("Link added.");

      return true;
    }

    function deleteLink(id) {
      const links =
        getLinks().filter(
          link => link.id !== id
        );

      persist(links);
      renderGrid();

      Toast.show("Link deleted.");
    }

    function init() {
      renderGrid();
    }

    return {
      init,
      addLink,
      deleteLink
    };
  })();


  // ─────────────────────────────────────────────────────────────
  // To-Do List
  // ─────────────────────────────────────────────────────────────

  const ToDoListModule = (() => {
    function generateId() {
      return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
      );
    }

    function getTasks() {
      return Storage.loadJSON("tasks", []);
    }

    function persist(tasks) {
      Storage.saveJSON("tasks", tasks);
    }

    function isDuplicate(text) {
      const tasks = getTasks();

      return tasks.some(
        task => task.text.trim().toLowerCase() === text.trim().toLowerCase()
      );
    }

    let sortMode = "newest";

    function sortTasks(tasks) {
      const sorted = [...tasks];

      switch (sortMode) {
        case "newest":
          return sorted.reverse();

        case "oldest":
          return sorted;

        case "completed":
          return sorted.sort(
            (a, b) =>
              Number(b.completed) - Number(a.completed)
          );

        case "incomplete":
          return sorted.sort(
            (a, b) =>
              Number(a.completed) - Number(b.completed)
          );

        default:
          return sorted;
      }
    }

    function showEmpty() {
      const todoList =
        document.querySelector("#todo-list");

      if (!todoList) return;

      const hasTasks =
        todoList.querySelector(".todo-item");

      const existing =
        todoList.querySelector(".empty-message");

      if (!hasTasks && !existing) {
        const emptyMessage =
          document.createElement("p");

        emptyMessage.classList.add(
          "empty-message"
        );

        emptyMessage.textContent =
          "No tasks yet. Add a task to get started!";

        todoList.appendChild(emptyMessage);
      }

      if (hasTasks && existing) {
        existing.remove();
      }
    }

    function createItem(task) {
      const todoList =
        document.querySelector("#todo-list");

      const item =
        document.createElement("li");

      item.classList.add("todo-item");
      item.dataset.id = task.id;

      const text =
        document.createElement("p");

      text.classList.add("todo-text");
      text.textContent = task.text;

      const editInput =
        document.createElement("input");

      editInput.classList.add(
        "todo-edit-input",
        "todo-input",
        "hide"
      );

      editInput.type = "text";
      editInput.value = task.text;
      editInput.maxLength = 100;

      const actions =
        document.createElement("div");

      actions.classList.add(
        "todo-item-actions"
      );

      const editBtn =
        document.createElement("i");

      editBtn.className =
        "todo-edit fa-solid fa-pen";

      editBtn.setAttribute(
        "role",
        "button"
      );

      editBtn.setAttribute(
        "tabindex",
        "0"
      );

      const deleteBtn =
        document.createElement("i");

      deleteBtn.className =
        "todo-delete fa-solid fa-trash";

      deleteBtn.setAttribute(
        "role",
        "button"
      );

      deleteBtn.setAttribute(
        "tabindex",
        "0"
      );

      const checkbox =
        document.createElement("input");

      checkbox.classList.add("todo-check");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(
        task.completed
      );

      actions.append(
        editBtn,
        deleteBtn,
        checkbox
      );

      item.append(
        text,
        editInput,
        actions
      );

      // ── Complete ──

      checkbox.addEventListener(
        "change",
        () => {
          toggleTaskCompletion(task.id);
        }
      );

      // ── Delete ──

      deleteBtn.addEventListener(
        "click",
        () => {
          deleteTask(task.id);
        }
      );

      // ── Edit ──

      function startEditing() {
        editInput.value = text.textContent;

        text.classList.add("hide");
        editInput.classList.remove("hide");

        editInput.focus();
        editInput.select();
      }

      function finishEditing() {
        const newText =
          editInput.value.trim();

        if (!newText) {
          editInput.value = text.textContent;
          return;
        }

        editTask(
          task.id,
          newText
        );
      }

      editBtn.addEventListener(
        "click",
        startEditing
      );

      editBtn.addEventListener(
        "keydown",
        event => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            startEditing();
          }
        }
      );

      editInput.addEventListener(
        "keydown",
        event => {
          if (event.key === "Enter") {
            event.preventDefault();
            finishEditing();
          }

          if (event.key === "Escape") {
            editInput.value =
              text.textContent;

            text.classList.remove("hide");
            editInput.classList.add("hide");
          }
        }
      );

      editInput.addEventListener(
        "blur",
        () => {
          if (
            !editInput.classList.contains("hide")
          ) {
            finishEditing();
          }
        }
      );

      todoList.appendChild(item);
    }

    function cycleSort() {
      const modes = [
        "newest",
        "oldest",
        "completed",
        "incomplete"
      ];

      const currentIndex =
        modes.indexOf(sortMode);

      sortMode =
        modes[(currentIndex + 1) % modes.length];

      renderList();

      return sortMode;
    }

    function renderList() {
      const todoList =
        document.querySelector("#todo-list");

      if (!todoList) return;

      todoList.innerHTML = "";

      const tasks = sortTasks(getTasks());

      tasks.forEach(createItem);

      showEmpty();
      showClearTasks();
      tasksCounter();
    }

    function addTask(task) {
      if (isDuplicate(task.text)) {
        Toast.show("That task already exists.");
        return false;
      }

      const tasks = getTasks();

      tasks.push(task);

      persist(tasks);

      createItem(task);

      showEmpty();
      showClearTasks();
      tasksCounter();

      Toast.show("Task added.");

      return true;
    }

    function deleteTask(id) {
      const tasks =
        getTasks().filter(
          task => task.id !== id
        );

      persist(tasks);

      renderList();

      Toast.show("Task deleted.");
    }

    function editTask(id, text) {
      const tasks = getTasks();

      const duplicate = tasks.some(
        task =>
          task.id !== id &&
          task.text.trim().toLowerCase() === text.trim().toLowerCase()
      );

      if (duplicate) {
        Toast.show("That task already exists.");
        return false;
      }

      const task = tasks.find(
        task => task.id === id
      );

      if (!task) return false;

      task.text = text;

      persist(tasks);
      renderList();

      Toast.show("Task updated.");

      return true;

    }

    function toggleTaskCompletion(id) {
      const tasks = getTasks();

      const task =
        tasks.find(
          task => task.id === id
        );

      if (!task) return;

      task.completed = !task.completed;

      persist(tasks);

      renderList();
    }

    function clearCompletedTasks() {
      const tasks =
        getTasks().filter(
          task => !task.completed
        );

      persist(tasks);

      renderList();

      Toast.show("Completed tasks cleared.");
    }

   return {
      generateId,
      renderList,
      addTask,
      editTask,
      deleteTask,
      toggleTaskCompletion,
      clearCompletedTasks,
      cycleSort
    };
  })();


  // ─────────────────────────────────────────────────────────────
  // Todo UI Helpers
  // ─────────────────────────────────────────────────────────────

  function showClearTasks() {
    const tasks =
      Storage.loadJSON("tasks", []);

    const clearBtn =
      document.querySelector(
        "#clear-completed-btn"
      );

    if (!clearBtn) return;

    const hasCompletedTasks =
      tasks.some(
        task => task.completed
      );

    clearBtn.classList.toggle(
      "hide",
      !hasCompletedTasks
    );
  }

  function tasksCounter() {
    const tasks =
      Storage.loadJSON("tasks", []);

    const counter =
      document.querySelector("#task-counter");

    if (!counter) return;

    const completed =
      tasks.filter(
        task => task.completed
      ).length;

    counter.textContent =
      `${completed} / ${tasks.length}`;
  }


  // ─────────────────────────────────────────────────────────────
  // Event Wiring
  // ─────────────────────────────────────────────────────────────

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      // Initial state
      initTheme();
      greet();
      displayDate();
      updateClock();

      ToDoListModule.renderList();
      LinksModule.init();
      TimerModule.init();

      // Clock
      setInterval(() => {
        updateClock();
        greet();
      }, 1000);

      // ─────────────────────────────────────────
      // Theme
      // ─────────────────────────────────────────

      document
        .querySelector("#theme-toggle-btn")
        .addEventListener(
          "click",
          toggleTheme
        );


      // ─────────────────────────────────────────
      // Name
      // ─────────────────────────────────────────

      document
        .querySelector("#name-form")
        .addEventListener(
          "click",
          () => {
            Menu.hide();
            openNameModal();
          }
        );


      // ─────────────────────────────────────────
      // Menu
      // ─────────────────────────────────────────

      document
        .querySelector(".menu-btn")
        .addEventListener(
          "click",
          event => {
            event.stopPropagation();
            Menu.toggle();
          }
        );


      // ─────────────────────────────────────────
      // Todo
      // ─────────────────────────────────────────

      document
        .querySelector(".todo-input-row")
        .addEventListener(
          "submit",
          event => {
            event.preventDefault();

            const input =
              document.querySelector("#todo-input");

            const text =
              input.value.trim();

            if (!text) {
              Toast.show("Enter a task first.");
              input.focus();
              return;
            }

            const task = {
              id:
                ToDoListModule.generateId(),
              text,
              completed: false
            };

            ToDoListModule.addTask(task);

            input.value = "";
            input.focus();
          }
        );


      document
        .querySelector("#clear-completed-btn")
        .addEventListener(
          "click",
          () => {
            ToDoListModule.clearCompletedTasks();
          }
        );

      document
        .querySelector("#sort-tasks-btn")
        .addEventListener("click", () => {
          const mode =
            ToDoListModule.cycleSort();

          const labels = {
            newest: "Newest first",
            oldest: "Oldest first",
            completed: "Completed first",
            incomplete: "Incomplete first"
          };

          Toast.show(labels[mode]);
        });


      // ─────────────────────────────────────────
      // Quick Links
      // ─────────────────────────────────────────

      document
        .querySelector(".links-input-area")
        .addEventListener(
          "submit",
          event => {
            event.preventDefault();

            const labelInput =
              document.querySelector(
                "#link-name-input"
              );

            const urlInput =
              document.querySelector(
                "#link-url-input"
              );

            const label =
              labelInput.value.trim();

            const url =
              urlInput.value.trim();

            if (!label || !url) {
              Toast.show(
                "Please fill in both fields."
              );
              return;
            }

            const success =
              LinksModule.addLink(
                label,
                url
              );

            if (!success) return;

            labelInput.value = "";
            urlInput.value = "";

            labelInput.focus();
          }
        );


      // ─────────────────────────────────────────
      // Timer
      // ─────────────────────────────────────────

      document
        .querySelector("#timer-start-btn")
        .addEventListener(
          "click",
          () => {
            TimerModule.start();
          }
        );


      document
        .querySelector("#timer-stop-btn")
        .addEventListener(
          "click",
          () => {
            TimerModule.stop();
            Toast.show("Timer stopped.");
          }
        );


      document
        .querySelector("#timer-reset-btn")
        .addEventListener(
          "click",
          () => {
            TimerModule.reset();
          }
        );


      // Preset buttons
      document
        .querySelectorAll(
          ".preset-btn[data-minutes]"
        )
        .forEach(button => {
          button.addEventListener(
            "click",
            () => {
              const minutes =
                Number(
                  button.dataset.minutes
                );

              if (minutes > 0) {
                TimerModule.selectPreset(
                  minutes
                );
              }
            }
          );
        });


      // Custom timer
      const customPresetBtn =
        document.querySelector(
          "#custom-preset-btn"
        );

      const customInput =
        document.querySelector(
          "#timer-input"
        );

      customPresetBtn.addEventListener(
        "click",
        () => {
          customInput.classList.remove(
            "hide"
          );

          customInput.focus();
        }
      );


      customInput.addEventListener(
        "keydown",
        event => {
          if (event.key === "Escape") {
            customInput.value = "";
            customInput.classList.add(
              "hide"
            );
          }

          if (event.key !== "Enter") {
            return;
          }

          event.preventDefault();

          const minutes =
            Number(
              customInput.value.trim()
            );

          if (
            !Number.isInteger(minutes) ||
            minutes <= 0 ||
            minutes > 999
          ) {
            Toast.show(
              "Enter a duration between 1 and 999 minutes."
            );
            return;
          }

          TimerModule.selectPreset(
            minutes
          );

          customInput.value = "";
          customInput.classList.add(
            "hide"
          );
        }
      );


      // ─────────────────────────────────────────
      // Modal close
      // ─────────────────────────────────────────

      const modal =
        document.querySelector("#modal");

      const modalCloseBtn =
        document.querySelector(
          "#modal-close-btn"
        );

      modalCloseBtn.addEventListener(
        "click",
        () => {
          Modal.hide();
        }
      );

      modal.addEventListener(
        "click",
        event => {
          if (event.target === modal) {
            Modal.hide();
          }
        }
      );


      // ─────────────────────────────────────────
      // Close menu when clicking outside
      // ─────────────────────────────────────────

      document.addEventListener(
        "click",
        event => {
          const menu =
            document.querySelector(
              ".menu-dropdown"
            );

          const menuBtn =
            document.querySelector(
              ".menu-btn"
            );

          if (
            !menu.contains(event.target) &&
            !menuBtn.contains(event.target)
          ) {
            Menu.hide();
          }
        }
      );

    }
  );

})();