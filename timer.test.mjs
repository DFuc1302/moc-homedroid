import assert from "node:assert/strict";
import { DURATIONS, formatTime, nextMode } from "./timer.mjs";

assert.equal(DURATIONS.focus, 1500);
assert.equal(formatTime(1500), "25:00");
assert.equal(formatTime(0.2), "00:01");
assert.equal(formatTime(-1), "00:00");
assert.equal(nextMode("focus", 1), "short");
assert.equal(nextMode("focus", 4), "long");
assert.equal(nextMode("short", 4), "focus");

console.log("timer checks passed");
