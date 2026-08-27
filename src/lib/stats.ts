import type { FocusSession } from "./types";

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function computeStats(sessions: FocusSession[]) {
  const completed = sessions.filter((s) => s.status === "completed");
  const totalFocusMs = completed.reduce((sum, s) => sum + s.actualDurationMs, 0);
  const todaySessions = completed.filter((s) => isToday(s.start));
  const todayFocusMs = todaySessions.reduce((sum, s) => sum + s.actualDurationMs, 0);

  return {
    totalFocusMs,
    totalCompleted: completed.length,
    todayCompleted: todaySessions.length,
    todayFocusMs,
  };
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}
