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

  // ─── updateClock ───────────────────────────────────────────
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
      month: "long",
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

  // ─── Event wiring ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    greet();
    displayDate();
    updateClock();
    setInterval(updateClock, 1000);
  });

  // Toggle theme button
  document.querySelector("#theme-toggle-btn").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);      
    Storage.save("theme", newTheme);
  })

})();
