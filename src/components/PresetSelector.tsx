import { PRESETS } from "../lib/types";
import type { PresetId } from "../lib/types";

interface Props {
  selected: PresetId;
  onSelect: (id: PresetId) => void;
  customFocusMinutes: number;
  customBreakMinutes: number;
  onCustomChange: (focus: number, brk: number) => void;
  disabled: boolean;
}

export default function PresetSelector({
  selected,
  onSelect,
  customFocusMinutes,
  customBreakMinutes,
  onCustomChange,
  disabled,
}: Props) {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            disabled={disabled}
            onClick={() => onSelect(preset.id)}
            className={`border px-3 py-1.5 font-ui text-xs uppercase tracking-wide transition-colors disabled:opacity-40 ${
              selected === preset.id
                ? "border-accent text-text"
                : "border-line text-text-muted hover:text-text"
            }`}
          >
            {preset.label}
            {preset.id !== "custom" && (
              <span className="ml-1 text-text-muted">
                {preset.focusMinutes}/{preset.breakMinutes}
              </span>
            )}
          </button>
        ))}
      </div>

      {selected === "custom" && (
        <div className="mt-3 flex items-center justify-center gap-3 font-ui text-xs text-text-soft">
          <label className="flex items-center gap-1">
            Foco
            <input
              type="number"
              min={1}
              disabled={disabled}
              value={customFocusMinutes}
              onChange={(e) => onCustomChange(Number(e.target.value), customBreakMinutes)}
              className="w-14 border border-line bg-transparent px-1 py-0.5 text-center outline-none"
            />
            min
          </label>
          <label className="flex items-center gap-1">
            Descanso
            <input
              type="number"
              min={1}
              disabled={disabled}
              value={customBreakMinutes}
              onChange={(e) => onCustomChange(customFocusMinutes, Number(e.target.value))}
              className="w-14 border border-line bg-transparent px-1 py-0.5 text-center outline-none"
            />
            min
          </label>
        </div>
      )}
    </div>
  );
}
