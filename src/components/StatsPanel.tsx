import { computeStats, formatDuration } from "../lib/stats";
import type { FocusSession } from "../lib/types";

interface Props {
  sessions: FocusSession[];
}

export default function StatsPanel({ sessions }: Props) {
  const stats = computeStats(sessions);

  return (
    <div className="grid grid-cols-2 gap-4 font-ui text-xs text-text-soft sm:grid-cols-4">
      <div>
        <p className="text-text-muted">Foco total</p>
        <p className="mt-0.5 text-sm text-text">{formatDuration(stats.totalFocusMs)}</p>
      </div>
      <div>
        <p className="text-text-muted">Sesiones totales</p>
        <p className="mt-0.5 text-sm text-text">{stats.totalCompleted}</p>
      </div>
      <div>
        <p className="text-text-muted">Hoy</p>
        <p className="mt-0.5 text-sm text-text">{stats.todayCompleted} sesiones</p>
      </div>
      <div>
        <p className="text-text-muted">Foco hoy</p>
        <p className="mt-0.5 text-sm text-text">{formatDuration(stats.todayFocusMs)}</p>
      </div>
    </div>
  );
}
