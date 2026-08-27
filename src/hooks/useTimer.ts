import { useCallback, useEffect, useRef, useState } from "react";
import type { PresetId, TimerPhase, TimerState } from "../lib/types";

interface UseTimerOptions {
  focusMs: number;
  breakMs: number;
  presetId: PresetId;
  onPhaseComplete?: (phase: TimerPhase) => void;
}

/**
 * Temporizador basado en timestamps (Date.now()), no en setInterval
 * acumulativo. Cada tick recalcula el tiempo restante contra el momento
 * en que empezó la fase actual, así el tiempo no se desincroniza si la
 * pestaña pierde foco o el dispositivo se suspende un rato.
 */
export function useTimer({ focusMs, breakMs, onPhaseComplete }: UseTimerOptions) {
  const [state, setState] = useState<TimerState>("idle");
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [remainingMs, setRemainingMs] = useState(focusMs);

  const phaseStartedAt = useRef<number | null>(null);
  const phaseDuration = useRef(focusMs);
  const remainingAtPause = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (phaseStartedAt.current === null) return;
    const elapsed = Date.now() - phaseStartedAt.current;
    const remaining = Math.max(0, phaseDuration.current - elapsed);
    setRemainingMs(remaining);

    if (remaining === 0) {
      onPhaseComplete?.(phase);
      if (phase === "focus") {
        setPhase("break");
        phaseDuration.current = breakMs;
        phaseStartedAt.current = Date.now();
        setState("break");
      } else {
        setState("completed");
        phaseStartedAt.current = null;
      }
    }
  }, [phase, breakMs, onPhaseComplete]);

  useEffect(() => {
    if (state !== "focusing" && state !== "break") return;
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [state, tick]);

  function start() {
    setPhase("focus");
    phaseDuration.current = focusMs;
    phaseStartedAt.current = Date.now();
    setRemainingMs(focusMs);
    setState("focusing");
  }

  function pause() {
    if (state !== "focusing" && state !== "break") return;
    remainingAtPause.current = remainingMs;
    phaseStartedAt.current = null;
    setState("paused");
  }

  function resume() {
    if (state !== "paused" || remainingAtPause.current === null) return;
    phaseStartedAt.current = Date.now() - (phaseDuration.current - remainingAtPause.current);
    setState(phase === "focus" ? "focusing" : "break");
  }

  function reset() {
    phaseStartedAt.current = null;
    remainingAtPause.current = null;
    setPhase("focus");
    phaseDuration.current = focusMs;
    setRemainingMs(focusMs);
    setState("idle");
  }

  return { state, phase, remainingMs, start, pause, resume, reset };
}
