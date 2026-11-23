import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { course, validateCourse } from "./curriculum.mjs";
import { createApp, defaultState, validateState } from "./server.mjs";

const PAIRING_KEY = "test-pairing-key-with-enough-entropy";

async function fixture() {
  const dataDir = await mkdtemp(path.join(tmpdir(), "datalab-"));
  const server = await createApp({ dataDir, pairingKey: PAIRING_KEY });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const context = { dataDir, server, base };
  context.close = async () => { context.server.closeAllConnections(); await new Promise((resolve) => context.server.close(resolve)); await rm(dataDir, { recursive: true, force: true }); };
  return context;
}

async function claim(base, key = PAIRING_KEY) {
  return fetch(`${base}/api/pair/claim`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
}

async function request(base, route, token, options = {}) {
  return fetch(`${base}${route}`, { ...options, headers: { ...(options.body ? { "content-type": "application/json" } : {}), authorization: `Bearer ${token}`, ...options.headers } });
}

test("course contains 9 assessed modules, 36 lessons, and weeks 37-39", () => {
  assert.deepEqual(validateCourse(), []);
  assert.equal(course.modules.length, 9);
  assert.deepEqual(course.bufferWeeks.map((week) => week.week), [37, 38, 39]);
  const lessons = course.modules.flatMap((module) => module.lessons);
  assert.equal(lessons.length, 36);
  const prompts = new Set();
  for (const module of course.modules) {
    assert.equal(module.assessment.threshold, 70);
    assert.equal(module.assessment.questions.length, 5);
    for (const lesson of module.lessons) {
      assert.ok(lesson.objectives.length >= 2);
      assert.ok(lesson.concept && lesson.example.code && lesson.practice && lesson.artifact);
      assert.ok(lesson.quiz.length >= 5 && lesson.flashcards.length >= 3);
      for (const question of lesson.quiz) prompts.add(question.prompt);
    }
  }
  assert.equal(prompts.size, 180, "every lesson quiz prompt must be lesson-specific");
});

test("completion gate rejects incomplete lessons", () => {
  const state = defaultState();
  state.lessons["m01-w01"] = { status: "completed", checks: [0, 1], bestQuizScore: 100, completedAt: new Date().toISOString(), artifact: "repo" };
  assert.equal(validateState(state), "completion_requirements_not_met");
  state.lessons["m01-w01"].checks.push(2);
  state.lessons["m01-w01"].bestQuizScore = 60;
  assert.equal(validateState(state), "completion_requirements_not_met");
  state.lessons["m01-w01"].bestQuizScore = 80;
  assert.equal(validateState(state), null);
});

test("module assessment and buffer week state enforce score and artifact bounds", () => {
  const state = defaultState();
  state.moduleAssessments.m01 = 70;
  state.bufferWeeks.w37 = { status: "completed", checks: [0, 1], artifact: "retrospective", completedAt: new Date().toISOString() };
  assert.equal(validateState(state), "buffer_completion_requirements_not_met");
  state.bufferWeeks.w37.checks.push(2);
  assert.equal(validateState(state), null);
  state.moduleAssessments.m01 = 101;
  assert.equal(validateState(state), "invalid_module_assessments");
});

test("pairing protects state and optimistic revisions preserve new data", async () => {
  const f = await fixture();
  try {
    assert.equal((await fetch(`${f.base}/api/state`)).status, 401);
    assert.equal((await claim(f.base, "wrong-key")).status, 401);
    const paired = await claim(f.base);
    assert.equal(paired.status, 201);
    const { token } = await paired.json();
    const initial = await (await request(f.base, "/api/state", token)).json();
    initial.profile.displayName = "Lan";
    const savedResponse = await request(f.base, "/api/state", token, { method: "PUT", body: JSON.stringify({ expectedRevision: 0, state: initial }) });
    assert.equal(savedResponse.status, 200);
    const saved = await savedResponse.json();
    assert.equal(saved.revision, 1);
    const staleResponse = await request(f.base, "/api/state", token, { method: "PUT", body: JSON.stringify({ expectedRevision: 0, state: initial }) });
    assert.equal(staleResponse.status, 409);
    assert.equal((await staleResponse.json()).state.profile.displayName, "Lan");
    assert.equal(JSON.parse(await readFile(path.join(f.dataDir, "state.json"), "utf8")).revision, 1);
    assert.equal(JSON.parse(await readFile(path.join(f.dataDir, "state.json.backup"), "utf8")).revision, 0);
  } finally { await f.close(); }
});

test("state and sessions survive a server restart", async () => {
  const f = await fixture();
  let token;
  try {
    token = (await (await claim(f.base)).json()).token;
    const state = await (await request(f.base, "/api/state", token)).json();
    state.notes["m01-w01"] = "ghi chú bền vững";
    assert.equal((await request(f.base, "/api/state", token, { method: "PUT", body: JSON.stringify({ expectedRevision: 0, state }) })).status, 200);
    await new Promise((resolve) => f.server.close(resolve));
    f.server = await createApp({ dataDir: f.dataDir, pairingKey: "ignored-after-first-start" });
    await new Promise((resolve) => f.server.listen(0, "127.0.0.1", resolve));
    f.base = `http://127.0.0.1:${f.server.address().port}`;
    const restored = await request(f.base, "/api/state", token);
    assert.equal(restored.status, 200);
    assert.equal((await restored.json()).notes["m01-w01"], "ghi chú bền vững");
  } finally { await f.close(); }
});

test("tutor maps missing laptop service to a stable offline response", async () => {
  const f = await fixture();
  try {
    const token = (await (await claim(f.base)).json()).token;
    const response = await request(f.base, "/api/tutor", token, { method: "POST", body: JSON.stringify({ lessonId: "m01-w01", question: "Giải thích biến" }) });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, "tutor_offline");
  } finally { await f.close(); }
});
