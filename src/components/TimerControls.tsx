import type { TimerState } from "../lib/types";

interface Props {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function TimerControls({ state, onStart, onPause, onResume, onReset }: Props) {
  const buttonClass =
    "border border-line px-5 py-2 font-ui text-xs uppercase tracking-wide text-text-soft transition-colors hover:border-accent hover:text-text focus-visible:border-accent focus-visible:text-text focus-visible:outline-none";

  // Primary action style — uses accent border and full text brightness in idle
  // state to distinguish "Iniciar" as the one button that starts the session,
  // without introducing a filled/solid button that would break the aesthetic.
  const primaryClass =
    "border border-accent px-5 py-2 font-ui text-xs uppercase tracking-wide text-text transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent";

  return (
    <div className="flex justify-center gap-3">
      {state === "idle" || state === "completed" ? (
        <button onClick={onStart} className={primaryClass}>
          Iniciar
        </button>
      ) : state === "paused" ? (
        <>
          <button onClick={onResume} className={buttonClass}>
            Reanudar
          </button>
          <button onClick={onReset} className={buttonClass}>
            Reiniciar
          </button>
        </>
      ) : (
        <>
          <button onClick={onPause} className={buttonClass}>
            Pausar
          </button>
          <button onClick={onReset} className={buttonClass}>
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
