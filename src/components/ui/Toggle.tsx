interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative w-10 h-6 rounded-full transition-colors
          ${checked ? "bg-primary-500" : "bg-cream-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
