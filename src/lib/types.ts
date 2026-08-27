export type TimerPhase = "focus" | "break";
export type TimerState = "idle" | "focusing" | "paused" | "break" | "completed";
export type PresetId = "pomodoro" | "short" | "deep" | "custom";
export type SessionStatus = "completed" | "cancelled" | "interrupted";
export type EnvironmentId = "rain" | "coffee" | "forest" | "space";

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

export interface Environment {
  id: EnvironmentId;
  name: string;
  soundFile: string | null; // null = ruido blanco generado, sin archivo
}

export const ENVIRONMENTS: Environment[] = [
  { id: "rain", name: "Cuarto lluvioso", soundFile: `${import.meta.env.BASE_URL}sounds/rain.mp3` },
  {
    id: "coffee",
    name: "Cafetería",
    soundFile: `${import.meta.env.BASE_URL}sounds/coffee-shop.mp3`,
  },
  {
    id: "forest",
    name: "Bosque",
    soundFile: `${import.meta.env.BASE_URL}sounds/forest.mp3`,
  },
  { id: "space", name: "Espacio profundo", soundFile: null },
];

export interface Preferences {
  lastEnvironment: EnvironmentId;
  lastPresetId: PresetId;
  customFocusMinutes: number;
  customBreakMinutes: number;
  volume: number; // 0-1
}

export const defaultPreferences: Preferences = {
  lastEnvironment: "space",
  lastPresetId: "pomodoro",
  customFocusMinutes: 25,
  customBreakMinutes: 5,
  volume: 0.5,
};
