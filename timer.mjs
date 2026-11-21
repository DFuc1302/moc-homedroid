export const DURATIONS = Object.freeze({ focus: 25 * 60, short: 5 * 60, long: 15 * 60 });

export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function nextMode(completedMode, completedFocusSessions) {
  if (completedMode !== "focus") return "focus";
  return completedFocusSessions % 4 === 0 ? "long" : "short";
}
