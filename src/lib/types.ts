export type TimerPhase = "focus" | "break";
export type TimerState = "idle" | "focusing" | "paused" | "break" | "completed";
export type PresetId = "pomodoro" | "short" | "deep" | "custom";
export type SessionStatus = "completed" | "cancelled" | "interrupted";
export type EnvironmentId = "rain" | "coffee" | "forest" | "space";

/**
 * Identifies a sound option independently of the visual environment.
 *
 * "none"        — no audio; ambient.play() must never be called.
 * "brown-noise" — generated brown noise (soundFile === null in SOUNDS);
 *                 ambient.play() may be called normally.
 *
 * Both "none" and "brown-noise" carry soundFile === null, so the
 * distinction between them is maintained here at the SoundId level and
 * enforced in App.tsx — useAmbientSound itself is not aware of "none".
 */
export type SoundId = "none" | "rain" | "coffee" | "forest" | "brown-noise";

export interface Preset {
  id: PresetId;
  label: string;
  focusMinutes: number;
  breakMinutes: number;
}

export const PRESETS: Preset[] = [
  { id: "pomodoro", label: "Pomodoro", focusMinutes: 25, breakMinutes: 5 },
  { id: "short", label: "Foco corto", focusMinutes: 15, breakMinutes: 3 },
  { id: "deep", label: "Trabajo profundo", focusMinutes: 50, breakMinutes: 10 },
  { id: "custom", label: "Personalizado", focusMinutes: 25, breakMinutes: 5 },
];

export interface FocusSession {
  id: string;
  start: number;
  end: number | null;
  plannedDurationMs: number;
  actualDurationMs: number;
  intention: string;
  presetId: PresetId;
  status: SessionStatus;
}

/** Visual environment — controls palette and theming only. No audio. */
export interface Environment {
  id: EnvironmentId;
  name: string;
}

export const ENVIRONMENTS: Environment[] = [
  { id: "rain",   name: "Cuarto lluvioso" },
  { id: "coffee", name: "Cafetería" },
  { id: "forest", name: "Bosque" },
  { id: "space",  name: "Espacio profundo" },
];

/**
 * A selectable sound option, independent of the visual environment.
 *
 * soundFile === null  →  useAmbientSound generates brown noise (only
 *                        meaningful when id !== "none"; see SoundId).
 * soundFile === string → useAmbientSound fetches and loops the MP3.
 */
export interface Sound {
  id: SoundId;
  label: string;
  soundFile: string | null;
}

export const SOUNDS: Sound[] = [
  { id: "none",        label: "Sin sonido",   soundFile: null },
  { id: "rain",        label: "Lluvia",        soundFile: `${import.meta.env.BASE_URL}sounds/rain.mp3` },
  { id: "coffee",      label: "Cafetería",     soundFile: `${import.meta.env.BASE_URL}sounds/coffee-shop.mp3` },
  { id: "forest",      label: "Bosque",        soundFile: `${import.meta.env.BASE_URL}sounds/forest.mp3` },
  { id: "brown-noise", label: "Ruido marrón",  soundFile: null },
];

export interface Preferences {
  lastEnvironment: EnvironmentId;
  lastPresetId: PresetId;
  customFocusMinutes: number;
  customBreakMinutes: number;
  volume: number; // 0-1
  /**
   * The selected sound option. Independent of lastEnvironment.
   * Defaults to "none" so no audio plays on first load without user action.
   * Existing stored preferences without this key receive the default via
   * the { ...defaultPreferences, ...stored } merge in usePreferences.
   */
  lastSound: SoundId;
}

export const defaultPreferences: Preferences = {
  lastEnvironment: "space",
  lastPresetId: "pomodoro",
  customFocusMinutes: 25,
  customBreakMinutes: 5,
  volume: 0.5,
  lastSound: "none",
};
