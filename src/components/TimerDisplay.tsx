interface Props {
  remainingMs: number;
  phase: "focus" | "break";
}

function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TimerDisplay({ remainingMs, phase }: Props) {
  return (
    <div className="text-center">
      <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-muted">
        {phase === "focus" ? "Enfocando" : "Descanso"}
      </p>
      <p className="mt-2 font-timer text-[clamp(4rem,16vw,10rem)] leading-none tabular-nums text-text">
        {formatClock(remainingMs)}
      </p>
    </div>
  );
}
