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
    "border border-line px-5 py-2 font-ui text-xs uppercase tracking-wide text-text-soft transition-colors hover:border-accent hover:text-text";

  return (
    <div className="flex justify-center gap-3">
      {state === "idle" || state === "completed" ? (
        <button onClick={onStart} className={buttonClass}>
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
