import http from "node:http";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { course, COURSE_VERSION, validateCourse } from "./curriculum.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MAX_JSON = 256 * 1024;
const SESSION_LIMIT = 8;
const claimAttempts = new Map();
const lessonIds = new Set(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
let writeQueue = Promise.resolve();

export function defaultState() {
  return {
    schemaVersion: 1,
    revision: 0,
    profile: { displayName: "", startedAt: null, weeklyHours: 3 },
    lessons: {}, quizAttempts: [], reviewItems: [], notes: {}, activityDays: [],
    settings: { tutorEnabled: true }
  };
}

const hash = (value) => createHash("sha256").update(value).digest("hex");
const sameHash = (a, b) => {
  const left = Buffer.from(a || "", "hex");
  const right = Buffer.from(b || "", "hex");
  return left.length === right.length && timingSafeEqual(left, right);
};
const json = (res, status, body, headers = {}) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers });
  res.end(payload);
};

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_JSON) throw Object.assign(new Error("body_too_large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); }
  catch { throw Object.assign(new Error("invalid_json"), { status: 400 }); }
}

async function readStoredJson(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function validateState(state) {
  if (!state || state.schemaVersion !== 1 || !Number.isInteger(state.revision)) return "invalid_state";
  if (!state.profile || typeof state.profile.displayName !== "string" || state.profile.displayName.length > 80) return "invalid_profile";
  if (!state.lessons || Array.isArray(state.lessons) || typeof state.lessons !== "object") return "invalid_lessons";
  for (const [id, lesson] of Object.entries(state.lessons)) {
    if (!lessonIds.has(id)) return "unknown_lesson";
    if (!["not_started", "in_progress", "completed"].includes(lesson.status)) return "invalid_lesson_status";
    if (!Array.isArray(lesson.checks) || lesson.checks.some((check) => !Number.isInteger(check) || check < 0 || check > 2)) return "invalid_checks";
    if (lesson.bestQuizScore !== null && (!Number.isInteger(lesson.bestQuizScore) || lesson.bestQuizScore < 0 || lesson.bestQuizScore > 100)) return "invalid_quiz_score";
    if (lesson.status === "completed" && (new Set(lesson.checks).size < 3 || lesson.bestQuizScore < 70 || typeof lesson.artifact !== "string" || !lesson.artifact.trim())) return "completion_requirements_not_met";
    if (lesson.artifact && (typeof lesson.artifact !== "string" || lesson.artifact.length > 1000)) return "invalid_artifact";
  }
  if (!state.notes || Object.values(state.notes).some((note) => typeof note !== "string" || note.length > 5000)) return "invalid_notes";
  if (!Array.isArray(state.quizAttempts) || state.quizAttempts.length > 1000) return "invalid_attempts";
  if (!Array.isArray(state.reviewItems) || state.reviewItems.length > 500) return "invalid_review_items";
  if (!Array.isArray(state.activityDays) || state.activityDays.some((day) => !/^\d{4}-\d{2}-\d{2}$/.test(day))) return "invalid_activity";
  return null;
}

async function atomicWrite(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  try { await copyFile(file, `${file}.backup`); } catch (error) { if (error.code !== "ENOENT") throw error; }
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temp, file);
}

async function initialize(dataDir, pairingKeyOverride) {
  await mkdir(dataDir, { recursive: true });
  const authFile = path.join(dataDir, "auth.json");
  let auth = await readStoredJson(authFile, null);
  if (!auth) {
    if (!pairingKeyOverride || pairingKeyOverride.length < 24) throw new Error("PAIRING_KEY with at least 24 characters is required for first start");
    auth = { pairingHash: hash(pairingKeyOverride), sessions: [] };
    await atomicWrite(authFile, auth);
  }
  const stateFile = path.join(dataDir, "state.json");
  const state = await readStoredJson(stateFile, null);
  if (!state) await atomicWrite(stateFile, defaultState());
  else {
    const error = validateState(state);
    if (error) throw new Error(`Stored state rejected: ${error}`);
  }
  return { authFile, stateFile, auth };
}

function bearer(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function authenticated(req, auth) {
  const token = bearer(req);
  if (!token) return false;
  const tokenHash = hash(token);
  return auth.sessions.some((session) => sameHash(session.hash, tokenHash));
}

function safeClient(req) {
  return (req.socket.remoteAddress || "unknown").slice(0, 80);
}

async function serveStatic(pathname, res) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  let file;
  if (requested.startsWith("vendor/pyodide/")) file = path.join(ROOT, "node_modules", "pyodide", requested.slice("vendor/pyodide/".length));
  else file = path.join(ROOT, requested);
  const allowedRoot = requested.startsWith("vendor/pyodide/") ? path.join(ROOT, "node_modules", "pyodide") : ROOT;
  const relative = path.relative(allowedRoot, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return json(res, 404, { error: "not_found" });
  const ext = path.extname(file);
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".wasm": "application/wasm", ".zip": "application/zip" };
  try {
    const info = await stat(file);
    if (!info.isFile()) throw Object.assign(new Error(), { code: "ENOENT" });
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream", "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600" });
    res.end(await readFile(file));
  } catch (error) {
    if (error.code === "ENOENT") return json(res, 404, { error: "not_found" });
    throw error;
  }
}

export async function createApp(options = {}) {
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(path.dirname(ROOT), `${path.basename(ROOT)}-data`);
  const store = await initialize(dataDir, options.pairingKey || process.env.PAIRING_KEY);
  console.log(`[DataLab] Persistent data: ${dataDir}`);

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/health" && req.method === "GET") return json(res, 200, { ok: true, contentVersion: COURSE_VERSION, tutor: Boolean(process.env.AI_BASE_URL) });

      if (url.pathname === "/api/pair/claim" && req.method === "POST") {
        const client = safeClient(req);
        const recent = (claimAttempts.get(client) || []).filter((at) => Date.now() - at < 60_000);
        if (recent.length >= 5) return json(res, 429, { error: "rate_limited" }, { "retry-after": "60" });
        recent.push(Date.now()); claimAttempts.set(client, recent);
        const body = await readJson(req);
        if (typeof body.key !== "string" || !sameHash(store.auth.pairingHash, hash(body.key))) return json(res, 401, { error: "invalid_pairing_key" });
        const token = randomBytes(32).toString("base64url");
        store.auth.sessions.push({ hash: hash(token), createdAt: new Date().toISOString() });
        store.auth.sessions = store.auth.sessions.slice(-SESSION_LIMIT);
        await atomicWrite(store.authFile, store.auth);
        return json(res, 201, { token });
      }

      if (url.pathname.startsWith("/api/") && !authenticated(req, store.auth)) return json(res, 401, { error: "unauthorized" });
      if (url.pathname === "/api/content" && req.method === "GET") return json(res, 200, course);
      if ((url.pathname === "/api/state" || url.pathname === "/api/state/export") && req.method === "GET") return json(res, 200, await readStoredJson(store.stateFile, defaultState()), url.pathname.endsWith("export") ? { "content-disposition": "attachment; filename=datalab-state.json" } : {});

      if (url.pathname === "/api/state" && req.method === "PUT") {
        const body = await readJson(req);
        const result = await (writeQueue = writeQueue.then(async () => {
          const current = await readStoredJson(store.stateFile, defaultState());
          if (body.expectedRevision !== current.revision) return { status: 409, body: { error: "revision_conflict", state: current } };
          const next = body.state;
          if (!next || next.revision !== current.revision) return { status: 400, body: { error: "invalid_revision" } };
          const error = validateState(next);
          if (error) return { status: 400, body: { error } };
          next.revision = current.revision + 1;
          await atomicWrite(store.stateFile, next);
          return { status: 200, body: next };
        }));
        return json(res, result.status, result.body);
      }

      if (url.pathname === "/api/session/revoke" && req.method === "POST") {
        const tokenHash = hash(bearer(req));
        store.auth.sessions = store.auth.sessions.filter((session) => !sameHash(session.hash, tokenHash));
        await atomicWrite(store.authFile, store.auth);
        return json(res, 200, { ok: true });
      }

      if (url.pathname === "/api/tutor" && req.method === "POST") {
        if (!process.env.AI_BASE_URL) return json(res, 503, { error: "tutor_offline" });
        const body = await readJson(req);
        if (!lessonIds.has(body.lessonId) || typeof body.question !== "string" || body.question.length < 1 || body.question.length > 2000) return json(res, 400, { error: "invalid_tutor_request" });
        const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.id === body.lessonId);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20_000);
        try {
          const response = await fetch(`${process.env.AI_BASE_URL.replace(/\/$/, "")}/v1/chat/completions`, {
            method: "POST", signal: controller.signal,
            headers: { "content-type": "application/json", ...(process.env.AI_API_KEY ? { authorization: `Bearer ${process.env.AI_API_KEY}` } : {}) },
            body: JSON.stringify({ model: process.env.AI_MODEL || "local-model", max_tokens: 500, temperature: 0.2, messages: [
              { role: "system", content: "Bạn là trợ giảng tiếng Việt. Chỉ dùng ngữ cảnh bài học, không gọi công cụ. Nếu thiếu dữ kiện, nói rõ không đủ dữ kiện." },
              { role: "user", content: `Bài: ${lesson.title}\nKhái niệm: ${lesson.concept}\nVí dụ: ${lesson.example.code}\nCâu hỏi: ${body.question}` }
            ] })
          });
          if (!response.ok) throw new Error("upstream_error");
          const payload = await response.json();
          return json(res, 200, { answer: payload.choices?.[0]?.message?.content || "Model không trả về nội dung." });
        } catch { return json(res, 503, { error: "tutor_offline" }); }
        finally { clearTimeout(timeout); }
      }

      if (url.pathname.startsWith("/api/")) return json(res, 404, { error: "not_found" });
      if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "method_not_allowed" });
      return serveStatic(url.pathname, res);
    } catch (error) {
      if (error.status) return json(res, error.status, { error: error.message });
      console.error("[DataLab] request failed", error.message);
      return json(res, 500, { error: "internal_error" });
    }
  });
}

export { validateState };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateCourse();
  if (errors.length) throw new Error(`Invalid course: ${errors.join(", ")}`);
  const server = await createApp();
  const host = process.env.HOST || "0.0.0.0";
  const port = Number(process.env.PORT || 8090);
  server.listen(port, host, () => console.log(`[DataLab] Listening on http://${host}:${port}`));
}
