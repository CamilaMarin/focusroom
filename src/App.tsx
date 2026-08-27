import { useState } from "react";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import PresetSelector from "./components/PresetSelector";
import IntentionInput from "./components/IntentionInput";
import EnvironmentSelector from "./components/EnvironmentSelector";
import AmbientPlayer from "./components/AmbientPlayer";
import StatsPanel from "./components/StatsPanel";
import { useTimer } from "./hooks/useTimer";
import { useSessions } from "./hooks/useSessions";
import { usePreferences } from "./hooks/usePreferences";
import { useAmbientSound } from "./hooks/useAmbientSound";
import { useFullscreen } from "./hooks/useFullscreen";
import { ENVIRONMENTS, PRESETS, type FocusSession } from "./lib/types";

export default function App() {
  const { preferences, updatePreference } = usePreferences();
  const { sessions, addSession } = useSessions();
  const { isFullscreen, supported: fullscreenSupported, enter, exit } = useFullscreen();

  const [intention, setIntention] = useState("");
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  const environment =
    ENVIRONMENTS.find((e) => e.id === preferences.lastEnvironment) ?? ENVIRONMENTS[3];
  const preset = PRESETS.find((p) => p.id === preferences.lastPresetId) ?? PRESETS[0];

  const focusMinutes =
    preset.id === "custom" ? preferences.customFocusMinutes : preset.focusMinutes;
  const breakMinutes =
    preset.id === "custom" ? preferences.customBreakMinutes : preset.breakMinutes;

  const { state, phase, remainingMs, start, pause, resume, reset } = useTimer({
    focusMs: focusMinutes * 60_000,
    breakMs: breakMinutes * 60_000,
    presetId: preset.id,
    onPhaseComplete: (completedPhase) => {
      if (completedPhase === "break") finalizeSession("completed");
    },
  });

  const ambient = useAmbientSound(environment.soundFile, preferences.volume);

  const isActive = state === "focusing" || state === "paused" || state === "break";

  function handleStart() {
    setSessionStart(Date.now());
    start();
  }

  function finalizeSession(status: FocusSession["status"]) {
    if (sessionStart === null) return;
    const now = Date.now();
    addSession({
      id: crypto.randomUUID(),
      start: sessionStart,
      end: now,
      plannedDurationMs: focusMinutes * 60_000,
      actualDurationMs: now - sessionStart,
      intention,
      presetId: preset.id,
      status,
    });
    setSessionStart(null);
  }

  function handleReset() {
    if (isActive) finalizeSession(state === "paused" ? "cancelled" : "interrupted");
    reset();
  }

  function handleToggleFullscreen() {
    if (isFullscreen) exit();
    else enter();
  }

  return (
    <div
      data-env={environment.id}
      className="min-h-screen bg-base font-ui text-text transition-colors duration-700"
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-10">
        {!isActive && (
          <div className="text-center">
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-muted">
              FocusRoom
            </p>
          </div>
        )}

        <TimerDisplay remainingMs={remainingMs} phase={phase} />

        <IntentionInput value={intention} onChange={setIntention} locked={isActive} />

        {!isActive && (
          <>
            <PresetSelector
              selected={preferences.lastPresetId}
              onSelect={(id) => updatePreference("lastPresetId", id)}
              customFocusMinutes={preferences.customFocusMinutes}
              customBreakMinutes={preferences.customBreakMinutes}
              onCustomChange={(f, b) => {
                updatePreference("customFocusMinutes", f);
                updatePreference("customBreakMinutes", b);
              }}
              disabled={isActive}
            />
            <EnvironmentSelector
              selected={environment.id}
              onSelect={(id) => updatePreference("lastEnvironment", id)}
            />
          </>
        )}

        <TimerControls
          state={state}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onReset={handleReset}
        />

        <AmbientPlayer
          playing={ambient.playing}
          error={ambient.error}
          volume={preferences.volume}
          onPlay={ambient.play}
          onStop={ambient.stop}
          onVolumeChange={(v) => updatePreference("volume", v)}
        />

        {fullscreenSupported && !isActive && (
          <button
            onClick={handleToggleFullscreen}
            className="font-ui text-xs uppercase tracking-wide text-text-muted underline hover:text-text"
          >
            {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          </button>
        )}

        {!isActive && (
          <div className="w-full border-t border-line pt-6">
            <StatsPanel sessions={sessions} />
          </div>
        )}
      </div>
    </div>
  );
}
