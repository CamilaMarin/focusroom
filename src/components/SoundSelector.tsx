import { SOUNDS } from "../lib/types";
import type { SoundId } from "../lib/types";

interface Props {
  selected: SoundId;
  onSelect: (id: SoundId) => void;
}

export default function SoundSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SOUNDS.map((sound) => (
        <button
          key={sound.id}
          onClick={() => onSelect(sound.id)}
          aria-pressed={selected === sound.id}
          className={`border px-3 py-1.5 font-ui text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
            selected === sound.id
              ? "border-accent bg-surface text-text"
              : "border-line text-text-muted hover:text-text"
          }`}
        >
          {sound.label}
        </button>
      ))}
    </div>
  );
}
