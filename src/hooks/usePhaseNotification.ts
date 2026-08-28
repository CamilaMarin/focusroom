import { useEffect, useRef } from "react";
import type { TimerPhase } from "../lib/types";

/**
 * Provides subtle synthesized notification tones for focus/break phase
 * transitions. Completely independent from useAmbientSound.
 *
 * Usage pattern (required for Safari/iOS autoplay compliance):
 *   1. Call unlock() inside the "Iniciar" button handler (user gesture).
 *      This creates and warms up the AudioContext while the gesture is active.
 *   2. Call notify(completedPhase) whenever a phase ends.
 *      The AudioContext is already unlocked, so playback works immediately.
 *
 * notify() is a no-op if unlock() was never called, so it is safe to call
 * unconditionally from onPhaseComplete.
 */
export function usePhaseNotification() {
  const ctxRef = useRef<AudioContext | null>(null);

  // Close the AudioContext on unmount to release OS audio resources.
  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  /**
   * Must be called inside a direct user-gesture handler (e.g. the Iniciar
   * button's onClick). Creates the AudioContext while the browser's autoplay
   * gate is open, ensuring subsequent calls to notify() can play without
   * restriction on all browsers including Safari/iOS.
   *
   * Safe to call more than once — subsequent calls are ignored if the context
   * is already running.
   */
  function unlock() {
    if (ctxRef.current && ctxRef.current.state !== "closed") return;
    ctxRef.current = new AudioContext();
  }

  /**
   * Plays a short synthesized chime appropriate for the completed phase.
   *
   * completedPhase === "focus"  → two descending tones (E5 → C5)
   *   Signals: focus period is over, break is starting — a gentle release.
   *
   * completedPhase === "break"  → two ascending tones (C5 → E5)
   *   Signals: break is over, time to refocus — a gentle call to attention.
   *
   * Each tone is a sine wave with a fast linear attack and exponential decay,
   * giving a soft bell-like character. Total duration is ~1.4 seconds.
   * Volume is fixed at 0.35 — present but not startling.
   */
  function notify(completedPhase: TimerPhase) {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === "closed") return;

    // Resume the context if it was suspended (e.g. after a period of silence,
    // some browsers suspend the AudioContext automatically).
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const GAIN = 0.35;
    const ATTACK = 0.008;   // seconds — fast attack for bell-like onset
    const DECAY  = 0.9;     // seconds — exponential decay to silence
    const GAP    = 0.15;    // seconds — silence between the two tones

    // Frequencies for the two-tone chime:
    // focus→break (descending): E5 (659 Hz) then C5 (523 Hz)
    // break→done  (ascending):  C5 (523 Hz) then E5 (659 Hz)
    const [freq1, freq2] =
      completedPhase === "focus"
        ? [659.25, 523.25]  // descending: winding down
        : [523.25, 659.25]; // ascending:  calling back to focus

    const now = ctx.currentTime;

    function playTone(frequency: number, startTime: number, ctx: AudioContext) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      // Envelope: fast attack, exponential decay to near-silence
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(GAIN, startTime + ATTACK);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + ATTACK + DECAY);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + ATTACK + DECAY + 0.05);
    }

    playTone(freq1, now, ctx);
    playTone(freq2, now + ATTACK + DECAY * 0.6 + GAP, ctx); // second tone starts as first is fading
  }

  return { unlock, notify };
}
