const app = document.querySelector("#app");
const dialog = document.querySelector("#pair-dialog");
const pairForm = document.querySelector("#pair-form");
const pairError = document.querySelector("#pair-error");
const toastElement = document.querySelector("#toast");
const TOKEN_KEY = "datalab.session";

let token = localStorage.getItem(TOKEN_KEY) || "";
let course;
let state;
let runner;
let runnerTimer;
let runnerOutput = "";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
const allLessons = () => course.modules.flatMap((module) => module.lessons);
const lessonById = (id) => allLessons().find((lesson) => lesson.id === id);
const lessonState = (id) => state.lessons[id] || { status: "not_started", checks: [], bestQuizScore: null, completedAt: null, artifact: "" };
const bufferState = (id) => state.bufferWeeks[id] || { status: "not_started", checks: [], artifact: "", completedAt: null };
const moduleCompleted = (module) => module.lessons.every((lesson) => lessonState(lesson.id).status === "completed") && (state.moduleAssessments[module.id] ?? 0) >= module.assessment.threshold;
const today = () => new Date().toLocaleDateString("en-CA");
const statusLabel = (value) => ({ not_started: "Chưa học", in_progress: "Đang học", completed: "Hoàn thành" })[value] || "Chưa học";
const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { ...(options.body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== "/api/pair/claim") {
    localStorage.removeItem(TOKEN_KEY); token = ""; dialog.showModal();
    throw new Error("Thiết bị cần được kết nối lại.");
  }
  if (!response.ok) throw Object.assign(new Error(body.error || "request_failed"), { status: response.status, body });
  return body;
};
const toast = (message) => {
  toastElement.textContent = message;
  toastElement.classList.add("show");
  clearTimeout(toastElement.timer);
  toastElement.timer = setTimeout(() => toastElement.classList.remove("show"), 2800);
};

pairForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  pairError.textContent = "";
  try {
    const result = await api("/api/pair/claim", { method: "POST", body: JSON.stringify({ key: pairForm.key.value.trim() }) });
    token = result.token;
    localStorage.setItem(TOKEN_KEY, token);
    pairForm.reset();
    dialog.close();
    await load();
  } catch (error) {
    pairError.textContent = error.status === 429 ? "Thử quá nhiều lần. Chờ một phút." : "Pairing key không đúng.";
  }
});

async function load() {
  if (!token) return dialog.showModal();
  try {
    [course, state] = await Promise.all([api("/api/content"), api("/api/state")]);
    state.moduleAssessments ||= {};
    state.bufferWeeks ||= {};
    route();
  } catch (error) {
    if (error.status !== 401) app.innerHTML = `<section class="card panel"><h1>Không thể tải DataLab</h1><p>${escapeHtml(error.message)}</p></section>`;
  }
}

async function save(next, message) {
  const previous = state;
  try {
    state = await api("/api/state", { method: "PUT", body: JSON.stringify({ expectedRevision: state.revision, state: next }) });
    if (message) toast(message);
    return true;
  } catch (error) {
    state = error.status === 409 ? error.body.state : previous;
    toast(error.status === 409 ? "Dữ liệu đã đổi trên thiết bị khác. Đã tải bản mới." : `Không thể lưu: ${error.message}`);
    return false;
  }
}

function changedState() {
  const next = structuredClone(state);
  if (!next.profile.startedAt) next.profile.startedAt = new Date().toISOString();
  if (!next.activityDays.includes(today())) next.activityDays.push(today());
  return next;
}

function streak() {
  const days = new Set(state.activityDays);
  let count = 0;
  const date = new Date();
  if (!days.has(today())) date.setDate(date.getDate() - 1);
  while (days.has(date.toLocaleDateString("en-CA"))) { count += 1; date.setDate(date.getDate() - 1); }
  return count;
}

function progress() {
  const completed = allLessons().filter((lesson) => lessonState(lesson.id).status === "completed").length;
  return { completed, percent: Math.round(completed / allLessons().length * 100) };
}

function nextLesson() {
  return allLessons().find((lesson) => lessonState(lesson.id).status !== "completed") || allLessons().at(-1);
}

function route() {
  if (!course || !state) return;
  stopRunner();
  const hash = location.hash.slice(1) || "/";
  const courseRoute = hash.startsWith("/lesson/") || hash.startsWith("/assessment/") || hash.startsWith("/buffer/");
  document.querySelectorAll("nav a").forEach((link) => link.classList.toggle("active", link.getAttribute("href").slice(1) === (courseRoute ? "/course" : hash)));
  if (hash.startsWith("/lesson/")) renderLesson(decodeURIComponent(hash.split("/")[2]));
  else if (hash.startsWith("/assessment/")) renderAssessment(decodeURIComponent(hash.split("/")[2]));
  else if (hash.startsWith("/buffer/")) renderBufferWeek(decodeURIComponent(hash.split("/")[2]));
  else if (hash === "/course") renderCourse();
  else if (hash === "/review") renderReview();
  else if (hash === "/settings") renderSettings();
  else renderDashboard();
  app.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: "instant" });
}

function renderDashboard() {
  const stats = progress();
  const next = nextLesson();
  const recent = allLessons().filter((lesson) => lessonState(lesson.id).status !== "not_started").slice(-3).reverse();
  app.innerHTML = `
    <section class="hero">
      <div><p class="eyebrow">Lộ trình 9 tháng · 3 giờ mỗi tuần</p><h1>Học từ dữ liệu đến Deep Learning.</h1><p>36 tuần thực hành theo một đường thẳng: Python, Machine Learning, PyTorch, Transformer và RAG. Tiến độ được lưu trên HomeDroid.</p></div>
      <div class="progress-ring" style="--value:${stats.percent}"><strong>${stats.percent}%</strong></div>
    </section>
    <div class="grid">
      <section class="card panel span-8"><p class="eyebrow">Tiếp theo · Tuần ${next.week}</p><h2>${escapeHtml(next.title)}</h2><p>${escapeHtml(next.concept)}</p><a class="primary" href="#/lesson/${next.id}">Bắt đầu bài học</a></section>
      <section class="card panel span-4"><h2>Nhịp học</h2><div class="stats"><div class="stat"><strong>${stats.completed}/36</strong><span>bài hoàn thành</span></div><div class="stat"><strong>${streak()}</strong><span>ngày streak</span></div><div class="stat"><strong>${state.reviewItems.length}</strong><span>cần ôn</span></div></div></section>
      <section class="card panel span-12"><h2>Hoạt động gần đây</h2>${recent.length ? `<div class="lesson-list">${recent.map(lessonLink).join("")}</div>` : `<p class="muted">Chưa có hoạt động. Mở bài đầu tiên để bắt đầu.</p>`}</section>
    </div>`;
}

function lessonLink(lesson) {
  const saved = lessonState(lesson.id);
  return `<a class="lesson-link" href="#/lesson/${lesson.id}"><span class="week">${lesson.week}</span><span class="lesson-meta"><strong>${escapeHtml(lesson.title)}</strong><small class="muted">${escapeHtml(lesson.artifact)}</small></span><span class="status status-${saved.status}">${statusLabel(saved.status)}${saved.bestQuizScore !== null ? ` · ${saved.bestQuizScore}%` : ""}</span></a>`;
}

function renderCourse() {
  const stats = progress();
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">Chương trình học</p><h1>39 tuần, 9 module.</h1><p>36 tuần cốt lõi, assessment cuối mỗi module và ba tuần học bù, đánh giá, demo.</p></div><div class="progress-ring" style="--value:${stats.percent}"><strong>${stats.completed}/36</strong></div></section>
    <div class="module-list">${course.modules.map((module, index) => {
      const done = module.lessons.filter((lesson) => lessonState(lesson.id).status === "completed").length;
      const score = state.moduleAssessments[module.id] ?? null;
      const modComplete = moduleCompleted(module);
      const modStatusClass = modComplete ? "status-completed" : (done > 0 || score !== null) ? "status-in_progress" : "status-not_started";
      const assessStatusClass = (score ?? 0) >= module.assessment.threshold ? "status-completed" : score !== null ? "status-in_progress" : "status-not_started";
      return `<details class="module card" ${index === Math.floor((nextLesson().week - 1) / 4) ? "open" : ""}><summary><span>Module ${index + 1} · ${escapeHtml(module.title)}</span><span class="status ${modStatusClass}">${modComplete ? "Hoàn thành" : `${done}/4 · assessment ${score ?? "—"}%`}</span></summary><div class="lesson-list">${module.lessons.map(lessonLink).join("")}<a class="lesson-link" href="#/assessment/${module.id}"><span class="week week-assessment">A${index + 1}</span><span class="lesson-meta"><strong>${escapeHtml(module.assessment.title)}</strong><small class="muted">Cần đủ 4 bài và đạt ít nhất 70%</small></span><span class="status ${assessStatusClass}">${score ?? "—"}%</span></a></div></details>`;
    }).join("")}</div>
    <section class="card panel" style="margin-top:20px"><p class="eyebrow">Tuần 37–39</p><h2>Học bù, đánh giá và demo</h2><div class="lesson-list">${course.bufferWeeks.map((week) => { const saved = bufferState(week.id); return `<a class="lesson-link" href="#/buffer/${week.id}"><span class="week">${week.week}</span><span class="lesson-meta"><strong>${escapeHtml(week.title)}</strong><small class="muted">${escapeHtml(week.artifact)}</small></span><span class="status status-${saved.status}">${statusLabel(saved.status)}</span></a>`; }).join("")}</div></section>`;
}

function renderAssessment(moduleId) {
  const module = course.modules.find((item) => item.id === moduleId);
  if (!module) { location.hash = "#/course"; return; }
  const score = state.moduleAssessments[module.id] ?? null;
  const lessonCount = module.lessons.filter((lesson) => lessonState(lesson.id).status === "completed").length;
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">${escapeHtml(module.title)}</p><h1>${escapeHtml(module.assessment.title)}</h1><p>Assessment kiểm tra artifact và quy tắc kiểm chứng của cả bốn tuần. Module chỉ hoàn thành khi đủ bốn bài và điểm assessment ít nhất 70%.</p></div></section>
    <section class="card panel"><p class="${lessonCount < 4 ? "error" : "muted"}">Bài bắt buộc: ${lessonCount}/4 · Điểm tốt nhất: ${score ?? "—"}%</p>
    <form id="assessment-form">${module.assessment.questions.map((question, qIndex) => `<fieldset class="quiz-question"><legend><strong>${qIndex + 1}. ${escapeHtml(question.prompt)}</strong></legend><div class="answers">${question.options.map((option, index) => `<label class="answer"><input type="radio" name="${question.id}" value="${index}" required> <span>${escapeHtml(option)}</span></label>`).join("")}</div><div class="quiz-feedback"></div></fieldset>`).join("")}<div class="button-row"><button class="primary" type="submit">Chấm assessment</button><a class="secondary" href="#/course">Về khóa học</a></div></form></section>`;
  document.querySelector("#assessment-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let correct = 0;
    module.assessment.questions.forEach((question, index) => {
      const selected = Number(data.get(question.id));
      const field = event.currentTarget.querySelectorAll(".quiz-question")[index];
      field.querySelectorAll(".answer").forEach((answer, option) => {
        answer.classList.toggle("correct", option === question.answer);
        answer.classList.toggle("wrong", option === selected && option !== question.answer);
      });
      field.querySelector(".quiz-feedback").innerHTML = `<p class="explanation">${escapeHtml(question.explanation)}</p>`;
      if (selected === question.answer) correct += 1;
    });
    const assessmentScore = Math.round(correct / module.assessment.questions.length * 100);
    const next = changedState();
    next.moduleAssessments[module.id] = Math.max(next.moduleAssessments[module.id] ?? 0, assessmentScore);
    if (await save(next, `Assessment: ${assessmentScore}%`)) renderAssessment(module.id);
  });
}

function renderBufferWeek(id) {
  const week = course.bufferWeeks.find((item) => item.id === id);
  if (!week) { location.hash = "#/course"; return; }
  const saved = bufferState(id);
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">Tuần ${week.week}</p><h1>${escapeHtml(week.title)}</h1><p>${escapeHtml(week.objective)}</p></div></section>
    <section class="card panel"><h2>Checklist</h2><div class="check-list">${week.tasks.map((task, index) => `<label class="check-item"><input type="checkbox" data-buffer-check="${index}" ${saved.checks.includes(index) ? "checked" : ""}> <span>${escapeHtml(task)}</span></label>`).join("")}</div>
    <label>Artifact<input id="buffer-artifact" maxlength="1000" value="${escapeHtml(saved.artifact || "")}" placeholder="${escapeHtml(week.artifact)}"></label>
    <div class="button-row"><button class="primary" id="complete-buffer" type="button">${saved.status === "completed" ? "Đã hoàn thành" : "Hoàn thành tuần"}</button><a class="secondary" href="#/course">Về khóa học</a></div><p class="error" id="buffer-error"></p></section>`;
  const saveDraft = async () => {
    const next = changedState();
    const current = { ...bufferState(id), status: "in_progress", checks: [...document.querySelectorAll("[data-buffer-check]:checked")].map((input) => Number(input.dataset.bufferCheck)), artifact: document.querySelector("#buffer-artifact").value.trim() };
    next.bufferWeeks[id] = current;
    return save(next);
  };
  document.querySelectorAll("[data-buffer-check]").forEach((input) => input.addEventListener("change", saveDraft));
  document.querySelector("#buffer-artifact").addEventListener("change", saveDraft);
  document.querySelector("#complete-buffer").addEventListener("click", async () => {
    await saveDraft();
    const current = bufferState(id);
    const error = document.querySelector("#buffer-error");
    if (new Set(current.checks).size < 3) return error.textContent = "Hoàn thành đủ ba checklist.";
    if (!current.artifact?.trim()) return error.textContent = "Thêm mô tả hoặc đường dẫn artifact.";
    const next = changedState(); next.bufferWeeks[id] = { ...current, status: "completed", completedAt: new Date().toISOString() };
    if (await save(next, `Đã hoàn thành tuần ${week.week}`)) renderBufferWeek(id);
  });
}

function renderLesson(id) {
  const lesson = lessonById(id);
  if (!lesson) { location.hash = "#/course"; return; }
  const saved = lessonState(id);
  const prerequisite = lesson.prerequisite && lessonById(lesson.prerequisite);
  const unmet = prerequisite && lessonState(prerequisite.id).status !== "completed";
  app.innerHTML = `<div class="lesson-layout">
    <article class="lesson-content card">
      <p class="eyebrow">Tuần ${lesson.week} · ${escapeHtml(course.modules[lesson.month - 1].title)}</p>
      <h1>${escapeHtml(lesson.title)}</h1>
      ${unmet ? `<p class="error">Nên hoàn thành <a href="#/lesson/${prerequisite.id}">${escapeHtml(prerequisite.title)}</a> trước. Bạn vẫn có thể xem bài này.</p>` : ""}
      <section><h2>Mục tiêu</h2><ul>${lesson.objectives.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section><h2>Khái niệm</h2><p>${escapeHtml(lesson.concept)}</p></section>
      <section><h2>Worked example</h2><pre><code>${escapeHtml(lesson.example.code)}</code></pre><p>${escapeHtml(lesson.example.explanation)}</p></section>
      <section><h2>Thực hành</h2><p>${escapeHtml(lesson.practice)}</p><p><strong>Output mong đợi:</strong> ${escapeHtml(lesson.expected)}</p>
        ${lesson.week <= 16 ? runnerView(lesson) : `<pre><code>${escapeHtml(lesson.example.code)}</code></pre><p class="muted">Bài này chạy trên laptop theo môi trường của artifact, không chạy trong browser.</p>`}
      </section>
      <section id="quiz"><h2>Quiz</h2><p>Đạt ít nhất 70% để hoàn thành bài.</p>${quizView(lesson, saved)}</section>
      <section><h2>Flashcard</h2><div class="grid">${lesson.flashcards.map((card, index) => `<button class="flashcard span-4" data-flash="${index}" data-front="${escapeHtml(card.front)}" data-back="${escapeHtml(card.back)}">${escapeHtml(card.front)}</button>`).join("")}</div></section>
      <section><h2>AI tutor</h2><p class="muted">Tutor dùng model trên laptop. Bài học vẫn hoạt động khi tutor offline.</p><div class="tutor-log" id="tutor-log"></div><form id="tutor-form"><label>Câu hỏi<textarea name="question" maxlength="2000" required placeholder="Hãy giải thích phần tôi chưa hiểu…"></textarea></label><button class="primary" type="submit">Hỏi tutor</button></form></section>
      <section><h2>Tham khảo tùy chọn</h2><ul>${lesson.references.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    </article>
    <aside class="lesson-side card">
      <p class="eyebrow">Tiêu chí hoàn thành</p>
      <div class="check-list">${lesson.criteria.map((criterion, index) => `<label class="check-item"><input type="checkbox" data-check="${index}" ${saved.checks.includes(index) ? "checked" : ""}> <span>${escapeHtml(criterion)}</span></label>`).join("")}</div>
      <label>Artifact<input id="artifact" maxlength="1000" value="${escapeHtml(saved.artifact || "")}" placeholder="Đường dẫn hoặc mô tả bằng chứng"></label>
      <p class="muted">Quiz tốt nhất: <strong>${saved.bestQuizScore ?? "—"}%</strong></p>
      <button class="primary" id="complete-lesson" type="button">${saved.status === "completed" ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</button>
      <p class="error" id="completion-error"></p>
      <label>Ghi chú<textarea id="notes" maxlength="5000" placeholder="Ghi chú riêng…">${escapeHtml(state.notes[id] || "")}</textarea></label>
      <button class="secondary" id="save-notes" type="button">Lưu ghi chú</button>
    </aside>
  </div>`;
  bindLesson(lesson);
}

function runnerView(lesson) {
  return `<div class="runner"><label>Python editor<textarea id="python-code" maxlength="12000" spellcheck="false">${escapeHtml(lesson.example.code)}</textarea></label><div class="button-row"><button class="primary" id="run-python" type="button">Run</button><button class="secondary" id="stop-python" type="button">Stop</button><button class="secondary" id="reset-python" type="button">Reset</button></div><pre class="runner-output" id="runner-output">Runtime chỉ tải khi bấm Run.</pre></div>`;
}

function quizView(lesson, saved) {
  return `<form id="quiz-form">${lesson.quiz.map((question, qIndex) => `<fieldset class="quiz-question"><legend><strong>${qIndex + 1}. ${escapeHtml(question.prompt)}</strong></legend><div class="answers">${question.options.map((option, index) => `<label class="answer"><input type="radio" name="${question.id}" value="${index}" required> <span>${escapeHtml(option)}</span></label>`).join("")}</div><div class="quiz-feedback"></div></fieldset>`).join("")}<button class="primary" type="submit">Chấm quiz</button>${saved.bestQuizScore !== null ? `<p class="muted">Điểm tốt nhất: <strong>${saved.bestQuizScore}%</strong></p>` : ""}</form>`;
}

function bindLesson(lesson) {
  document.querySelectorAll("[data-check]").forEach((input) => input.addEventListener("change", () => updateLessonDraft(lesson.id)));
  document.querySelector("#artifact").addEventListener("change", () => updateLessonDraft(lesson.id));
  document.querySelector("#complete-lesson").addEventListener("click", () => completeLesson(lesson));
  document.querySelector("#save-notes").addEventListener("click", async () => {
    const next = changedState(); next.notes[lesson.id] = document.querySelector("#notes").value.trim();
    await save(next, "Đã lưu ghi chú");
  });
  document.querySelector("#quiz-form").addEventListener("submit", (event) => submitQuiz(event, lesson));
  document.querySelectorAll("[data-flash]").forEach((button) => button.addEventListener("click", () => {
    const showingBack = button.dataset.showing === "back";
    button.textContent = showingBack ? button.dataset.front : button.dataset.back;
    button.dataset.showing = showingBack ? "front" : "back";
  }));
  document.querySelector("#tutor-form").addEventListener("submit", (event) => askTutor(event, lesson.id));
  document.querySelector("#run-python")?.addEventListener("click", runPython);
  document.querySelector("#stop-python")?.addEventListener("click", () => stopRunner("Đã dừng runtime."));
  document.querySelector("#reset-python")?.addEventListener("click", () => {
    stopRunner(); document.querySelector("#python-code").value = lesson.example.code; document.querySelector("#runner-output").textContent = "Runtime đã reset.";
  });
}

async function updateLessonDraft(id) {
  const next = changedState();
  const current = { ...lessonState(id) };
  current.checks = [...document.querySelectorAll("[data-check]:checked")].map((input) => Number(input.dataset.check));
  current.artifact = document.querySelector("#artifact").value.trim();
  if (current.status === "not_started") current.status = "in_progress";
  next.lessons[id] = current;
  await save(next);
}

async function completeLesson(lesson) {
  await updateLessonDraft(lesson.id);
  const current = lessonState(lesson.id);
  const error = document.querySelector("#completion-error");
  if (new Set(current.checks).size < 3) return error.textContent = "Hoàn thành đủ 3 checklist.";
  if ((current.bestQuizScore ?? 0) < 70) return error.textContent = "Quiz cần đạt ít nhất 70%.";
  if (!current.artifact?.trim()) return error.textContent = "Thêm mô tả hoặc đường dẫn artifact.";
  const next = changedState();
  next.lessons[lesson.id] = { ...current, status: "completed", completedAt: new Date().toISOString() };
  if (await save(next, "Đã hoàn thành bài học")) renderLesson(lesson.id);
}

async function submitQuiz(event, lesson) {
  event.preventDefault();
  let correct = 0;
  const wrong = [];
  lesson.quiz.forEach((question, index) => {
    const selected = Number(new FormData(event.currentTarget).get(question.id));
    const field = event.currentTarget.querySelectorAll(".quiz-question")[index];
    field.querySelectorAll(".answer").forEach((answer, option) => {
      answer.classList.toggle("correct", option === question.answer);
      answer.classList.toggle("wrong", option === selected && selected !== question.answer);
    });
    field.querySelector(".quiz-feedback").innerHTML = `<p class="explanation">${escapeHtml(question.explanation)}</p>`;
    if (selected === question.answer) correct += 1; else wrong.push(question);
  });
  const score = Math.round(correct / lesson.quiz.length * 100);
  const next = changedState();
  const current = { ...lessonState(lesson.id), status: "in_progress" };
  current.bestQuizScore = Math.max(current.bestQuizScore ?? 0, score);
  next.lessons[lesson.id] = current;
  next.quizAttempts.push({ lessonId: lesson.id, score, at: new Date().toISOString() });
  const wrongIds = new Set(wrong.map((question) => question.id));
  next.reviewItems = next.reviewItems.filter((item) => !item.questionId.startsWith(`${lesson.id}-q`) || wrongIds.has(item.questionId));
  for (const question of wrong) if (!next.reviewItems.some((item) => item.questionId === question.id)) next.reviewItems.push({ lessonId: lesson.id, questionId: question.id, addedAt: new Date().toISOString() });
  if (await save(next, `Kết quả quiz: ${score}%`)) renderLesson(lesson.id);
}

async function askTutor(event, lessonId) {
  event.preventDefault();
  const question = event.currentTarget.question.value.trim();
  const log = document.querySelector("#tutor-log");
  log.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(question)}</div>`);
  event.currentTarget.querySelector("button").disabled = true;
  try {
    const result = await api("/api/tutor", { method: "POST", body: JSON.stringify({ lessonId, question }) });
    log.insertAdjacentHTML("beforeend", `<div class="message">${escapeHtml(result.answer)}</div>`);
    event.currentTarget.reset();
  } catch { log.insertAdjacentHTML("beforeend", `<div class="message error">Tutor đang offline. Bạn vẫn có thể tiếp tục bài học.</div>`); }
  finally { event.currentTarget.querySelector("button").disabled = false; log.scrollTop = log.scrollHeight; }
}

function runPython() {
  stopRunner();
  const output = document.querySelector("#runner-output");
  runnerOutput = "";
  output.textContent = "Đang khởi tạo Python…";
  runner = new Worker("/python-worker.js", { type: "module" });
  runner.onmessage = ({ data }) => {
    if (data.type === "stdout" || data.type === "stderr") {
      runnerOutput = `${runnerOutput}${runnerOutput ? "\\n" : ""}${data.text}`.slice(-20000);
      output.textContent = runnerOutput;
    }
    if (data.type === "done" && !runnerOutput) output.textContent = "Hoàn tất (không có output).";
    if (data.type === "done") clearTimeout(runnerTimer);
  };
  runner.onerror = () => { output.textContent = "Không tải được Python runtime."; stopRunner(); };
  runner.postMessage({ type: "run", code: document.querySelector("#python-code").value.slice(0, 12000) });
  runnerTimer = setTimeout(() => stopRunner("Đã dừng vì vượt giới hạn 15 giây."), 15000);
}

function stopRunner(message) {
  clearTimeout(runnerTimer);
  if (runner) runner.terminate();
  runner = null;
  const output = document.querySelector("#runner-output");
  if (message && output) output.textContent = message;
}

function renderReview() {
  const items = state.reviewItems.map((item) => ({ ...item, lesson: lessonById(item.lessonId), question: lessonById(item.lessonId)?.quiz.find((question) => question.id === item.questionId) })).filter((item) => item.question);
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">Review queue</p><h1>Ôn lại câu đã sai.</h1><p>Mỗi mục biến mất khi bạn xác nhận đã hiểu lời giải.</p></div></section><div class="review-list">${items.length ? items.map((item) => `<article class="card panel"><p class="eyebrow">${escapeHtml(item.lesson.title)}</p><h2>${escapeHtml(item.question.prompt)}</h2><p><strong>Đáp án:</strong> ${escapeHtml(item.question.options[item.question.answer])}</p><p>${escapeHtml(item.question.explanation)}</p><button class="primary" data-reviewed="${item.questionId}">Đã hiểu</button></article>`).join("") : `<section class="card panel"><h2>Queue đang trống</h2><p class="muted">Câu trả lời sai từ quiz sẽ xuất hiện tại đây.</p></section>`}</div>`;
  document.querySelectorAll("[data-reviewed]").forEach((button) => button.addEventListener("click", async () => {
    const next = changedState(); next.reviewItems = next.reviewItems.filter((item) => item.questionId !== button.dataset.reviewed);
    if (await save(next, "Đã hoàn tất mục ôn tập")) renderReview();
  }));
}

function renderSettings() {
  app.innerHTML = `<section class="hero"><div><p class="eyebrow">Cài đặt</p><h1>Dữ liệu của bạn.</h1><p>State nằm trên HomeDroid và tồn tại qua redeploy khi DATA_DIR được giữ nguyên.</p></div></section><section class="card panel"><label>Tên hiển thị<input id="display-name" maxlength="80" value="${escapeHtml(state.profile.displayName)}"></label><label>Số giờ mỗi tuần<input id="weekly-hours" type="number" min="1" max="20" value="${state.profile.weeklyHours}"></label><div class="button-row"><button class="primary" id="save-settings">Lưu cài đặt</button><a class="secondary" id="export-state" href="/api/state/export">Tải backup JSON</a><button class="danger" id="revoke-session">Ngắt kết nối thiết bị này</button></div><p class="muted">Content version: ${escapeHtml(course.version)} · State revision: ${state.revision}</p></section>`;
  document.querySelector("#save-settings").addEventListener("click", async () => {
    const next = changedState(); next.profile.displayName = document.querySelector("#display-name").value.trim(); next.profile.weeklyHours = Math.min(20, Math.max(1, Number(document.querySelector("#weekly-hours").value) || 3));
    if (await save(next, "Đã lưu cài đặt")) renderSettings();
  });
  document.querySelector("#export-state").addEventListener("click", async (event) => {
    event.preventDefault();
    const response = await fetch("/api/state/export", { headers: { authorization: `Bearer ${token}` } });
    const blob = await response.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "datalab-state.json"; link.click(); URL.revokeObjectURL(link.href);
  });
  document.querySelector("#revoke-session").addEventListener("click", async () => {
    await api("/api/session/revoke", { method: "POST" }); localStorage.removeItem(TOKEN_KEY); token = ""; dialog.showModal();
  });
}

addEventListener("hashchange", route);
load();
