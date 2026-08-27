interface Props {
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
}

export default function IntentionInput({ value, onChange, locked }: Props) {
  if (locked) {
    return value ? (
      <p className="text-center font-ui text-sm text-text-soft">"{value}"</p>
    ) : null;
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="¿En qué te vas a enfocar? (opcional)"
      className="w-full max-w-sm border-b border-line bg-transparent px-1 py-2 text-center font-ui text-sm text-text outline-none placeholder:text-text-muted focus:border-accent"
    />
  );
}
