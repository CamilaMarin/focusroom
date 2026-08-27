import { ENVIRONMENTS } from "../lib/types";
import type { EnvironmentId } from "../lib/types";

interface Props {
  selected: EnvironmentId;
  onSelect: (id: EnvironmentId) => void;
}

export default function EnvironmentSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ENVIRONMENTS.map((env) => (
        <button
          key={env.id}
          onClick={() => onSelect(env.id)}
          className={`border px-3 py-1.5 font-ui text-xs uppercase tracking-wide transition-colors ${
            selected === env.id
              ? "border-accent text-text"
              : "border-line text-text-muted hover:text-text"
          }`}
        >
          {env.name}
        </button>
      ))}
    </div>
  );
}
