import { DURATIONS, formatTime, nextMode } from "./timer.mjs";

const STORAGE = {
  tasks: "moc.tasks",
  stats: "moc.stats",
  timer: "moc.timer",
  theme: "moc.theme",
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  timer: $("#timer-value"),
  label: $("#timer-label"),
  ring: $("#ring-progress"),
  start: $("#start-button"),
  reset: $("#reset-button"),
  tabs: [...document.querySelectorAll(".mode-tab")],
  currentTask: $("#current-task"),
  taskForm: $("#task-form"),
  taskInput: $("#task-input"),
  taskList: $("#task-list"),
  emptyState: $("#empty-state"),
  clearDone: $("#clear-done"),
  sessions: $("#session-count"),
  minutes: $("#minute-count"),
  day: $("#day-label"),
  theme: $("#theme-toggle"),
};

const todayKey = () => new Date().toLocaleDateString("en-CA");
const loadJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

let tasks = loadJson(STORAGE.tasks, []);
let stats = loadJson(STORAGE.stats, { date: todayKey(), sessions: 0, minutes: 0 });
let timer = loadJson(STORAGE.timer, { mode: "focus", remaining: DURATIONS.focus, running: false, deadline: 0 });
let activeTaskId = null;
let intervalId = null;

if (stats.date !== todayKey()) stats = { date: todayKey(), sessions: 0, minutes: 0 };
if (!DURATIONS[timer.mode] || !Number.isFinite(timer.remaining)) timer = { mode: "focus", remaining: DURATIONS.focus, running: false, deadline: 0 };

function saveTimer() {
  localStorage.setItem(STORAGE.timer, JSON.stringify(timer));
}

function setMode(mode) {
  stopTicker();
  timer = { mode, remaining: DURATIONS[mode], running: false, deadline: 0 };
  saveTimer();
  renderTimer();
}

function renderTimer() {
  const duration = DURATIONS[timer.mode];
  elements.timer.textContent = formatTime(timer.remaining);
  document.title = `${formatTime(timer.remaining)} — Focus`;
  elements.label.textContent = timer.running ? "staying on track" : "ready to begin";
  elements.start.textContent = timer.running ? "Pause" : "Start";
  elements.ring.style.strokeDashoffset = String(653.45 * (1 - timer.remaining / duration));
  elements.tabs.forEach((tab) => {
    const active = tab.dataset.mode === timer.mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function startTicker() {
  clearInterval(intervalId);
  intervalId = window.setInterval(tick, 250);
}

function stopTicker() {
  clearInterval(intervalId);
  intervalId = null;
}

function toggleTimer() {
  if (timer.running) {
    timer.remaining = Math.max(0, (timer.deadline - Date.now()) / 1000);
    timer.running = false;
    timer.deadline = 0;
    stopTicker();
  } else {
    timer.running = true;
    timer.deadline = Date.now() + timer.remaining * 1000;
    startTicker();
  }
  saveTimer();
  renderTimer();
}

function tick() {
  timer.remaining = Math.max(0, (timer.deadline - Date.now()) / 1000);
  if (timer.remaining <= 0) completeSession();
  else renderTimer();
}

function completeSession() {
  const completedMode = timer.mode;
  stopTicker();
  if (completedMode === "focus") {
    stats.sessions += 1;
    stats.minutes += DURATIONS.focus / 60;
    localStorage.setItem(STORAGE.stats, JSON.stringify(stats));
    renderStats();
  }
  const mode = nextMode(completedMode, stats.sessions);
  timer = { mode, remaining: DURATIONS[mode], running: false, deadline: 0 };
  saveTimer();
  renderTimer();
}

function renderStats() {
  elements.sessions.textContent = String(stats.sessions);
  elements.minutes.textContent = String(stats.minutes);
  elements.day.textContent = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date());
}

function saveTasks() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
}

function renderTasks() {
  elements.taskList.replaceChildren();
  elements.emptyState.hidden = tasks.length > 0;
  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}${task.id === activeTaskId ? " active" : ""}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} complete`);

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.textContent = "×";

    item.append(checkbox, text, remove);
    elements.taskList.append(item);
  }
  const active = tasks.find((task) => task.id === activeTaskId);
  elements.currentTask.textContent = active ? `Focusing on: ${active.text}` : "Choose a task to begin.";
}

function handleTaskClick(event) {
  const item = event.target.closest(".task-item");
  if (!item) return;
  const task = tasks.find((candidate) => candidate.id === item.dataset.id);
  if (!task) return;

  if (event.target.matches("[data-action='delete']")) {
    tasks = tasks.filter((candidate) => candidate.id !== task.id);
    if (activeTaskId === task.id) activeTaskId = null;
  } else if (event.target.matches(".task-check")) {
    task.done = event.target.checked;
    if (task.done && activeTaskId === task.id) activeTaskId = null;
  } else if (!task.done) {
    activeTaskId = activeTaskId === task.id ? null : task.id;
  }
  saveTasks();
  renderTasks();
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE.theme, theme);
  elements.theme.firstElementChild.textContent = theme === "dark" ? "☼" : "☾";
}

elements.start.addEventListener("click", toggleTimer);
elements.reset.addEventListener("click", () => setMode(timer.mode));
elements.tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  elements.taskInput.value = "";
  saveTasks();
  renderTasks();
});
elements.taskList.addEventListener("click", handleTaskClick);
elements.clearDone.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
});
elements.theme.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

document.addEventListener("visibilitychange", () => { if (!document.hidden && timer.running) tick(); });

setTheme(localStorage.getItem(STORAGE.theme) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
renderStats();
renderTasks();
if (timer.running) {
  if (timer.deadline <= Date.now()) completeSession();
  else { tick(); startTicker(); }
} else renderTimer();
