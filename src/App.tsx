import { useEffect, useState } from "react";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import PresetSelector from "./components/PresetSelector";
import IntentionInput from "./components/IntentionInput";
import EnvironmentSelector from "./components/EnvironmentSelector";
import SoundSelector from "./components/SoundSelector";
import AmbientPlayer from "./components/AmbientPlayer";
import StatsPanel from "./components/StatsPanel";
import { useTimer } from "./hooks/useTimer";
import { useSessions } from "./hooks/useSessions";
import { usePreferences } from "./hooks/usePreferences";
import { useAmbientSound } from "./hooks/useAmbientSound";
import { usePhaseNotification } from "./hooks/usePhaseNotification";
import { useFullscreen } from "./hooks/useFullscreen";
import { ENVIRONMENTS, SOUNDS, PRESETS, type FocusSession } from "./lib/types";

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

  // Sound is independent of the visual environment.
  // "none" → hook is kept idle; ambient.play() is never called.
  // "brown-noise" → soundFile is null; hook generates brown noise on play().
  // file-based sounds → soundFile is a string; hook fetches the MP3 on play().
  const sound = SOUNDS.find((s) => s.id === preferences.lastSound) ?? SOUNDS[0];
  const isNoSound = sound.id === "none";
  const ambient = useAmbientSound(isNoSound ? null : sound.soundFile, preferences.volume);

  // Phase notification — independent from ambient audio.
  // unlock() must be called during the "Iniciar" user gesture to satisfy
  // browser autoplay policy (Safari/iOS). notify() is safe to call at any
  // time afterwards; it is a no-op if unlock() was never called.
  const { unlock: unlockNotification, notify: notifyPhase } = usePhaseNotification();

  const { state, phase, remainingMs, start, pause, resume, reset, updateDuration, } = useTimer({
    focusMs: focusMinutes * 60_000,
    breakMs: breakMinutes * 60_000,
    presetId: preset.id,
    onPhaseComplete: (completedPhase) => {
      notifyPhase(completedPhase);
      if (completedPhase === "break") finalizeSession("completed");
    },
  });

  // Stop any active audio immediately when the user selects "none".
  useEffect(() => {
    if (isNoSound) ambient.stop();
    // ambient.stop is stable (defined outside React state); isNoSound is the
    // only dependency that should trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNoSound]);

  const isActive = state === "focusing" || state === "paused" || state === "break";

  function handleStart() {
    unlockNotification(); // must happen inside the user gesture — before start()
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

        {isActive && (
          <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-muted">
            {environment.name}{!isNoSound ? ` · ${sound.label}` : ""}
          </p>
        )}

        <IntentionInput value={intention} onChange={setIntention} locked={isActive} />

        {!isActive && (
          <>
            {/* Tu espacio — scene and sound are two dimensions of the same decision */}
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-soft">
                Tu espacio
              </p>
              <div className="flex w-full flex-col items-center gap-1.5">
                <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-muted">
                  Escena
                </p>
                <EnvironmentSelector
                  selected={environment.id}
                  onSelect={(id) => updatePreference("lastEnvironment", id)}
                />
              </div>
              <div className="flex w-full flex-col items-center gap-1.5">
                <p className="font-ui text-xs uppercase tracking-[0.3em] text-text-muted">
                  Sonido
                </p>
                <SoundSelector
                  selected={preferences.lastSound}
                  onSelect={(id) => updatePreference("lastSound", id)}
                />
              </div>
            </div>

            <PresetSelector
              selected={preferences.lastPresetId}
              onSelect={(id) => {
                updatePreference("lastPresetId", id);

                const selectedPreset = PRESETS.find((p) => p.id === id);
                if (selectedPreset) {
                  const newFocusMinutes =
                    selectedPreset.id === "custom"
                      ? preferences.customFocusMinutes
                      : selectedPreset.focusMinutes;

                  updateDuration(newFocusMinutes * 60_000);
                }
              }}
              customFocusMinutes={preferences.customFocusMinutes}
              customBreakMinutes={preferences.customBreakMinutes}
              onCustomChange={(f, b) => {
                updatePreference("customFocusMinutes", f);
                updatePreference("customBreakMinutes", b);
                updateDuration(f * 60_000);
              }}
              disabled={isActive}
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

        {/* AmbientPlayer is only rendered when a sound is selected.
            Hiding it entirely (rather than hiding individual controls) is the
            cleanest expression of "Sin sonido = no audio configuration active".
            The volume preference is preserved in localStorage regardless. */}
        {!isNoSound && (
          <AmbientPlayer
            playing={ambient.playing}
            error={ambient.error}
            volume={preferences.volume}
            onPlay={ambient.play}
            onStop={ambient.stop}
            onVolumeChange={(v) => updatePreference("volume", v)}
          />
        )}

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
