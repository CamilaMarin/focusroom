interface Props {
  playing: boolean;
  error: string | null;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
}

export default function AmbientPlayer({
  playing,
  error,
  volume,
  onPlay,
  onStop,
  onVolumeChange,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={playing ? onStop : onPlay}
          className="border border-line px-3 py-1.5 font-ui text-xs uppercase tracking-wide text-text-soft hover:border-accent hover:text-text"
        >
          {playing ? "Detener sonido" : "Reproducir sonido"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24 accent-current"
        />
      </div>
      {error && <p className="max-w-xs text-center font-ui text-xs text-text-muted">{error}</p>}
    </div>
  );
}
