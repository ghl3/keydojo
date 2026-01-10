import type { KeyDefinition, KeyState } from "@/types/keyboard";

interface KeyProps {
  keyDef: KeyDefinition;
  state: KeyState;
  showShift?: boolean;
}

export function Key({ keyDef, state, showShift = false }: KeyProps) {
  const width = keyDef.width || 1;
  const widthClass = getWidthClass(width);

  const stateClasses = {
    default: "key-default hover:bg-cream-50",
    active: "key-active",
    next: "key-next",
    error: "key-error",
    weak: "key-weak",
  };

  // Determine what to display
  let mainLabel = keyDef.label || keyDef.key;
  let shiftLabel = keyDef.shiftKey;

  // For letter keys, show uppercase when shift is active
  if (showShift && keyDef.shiftKey) {
    mainLabel = keyDef.shiftKey;
    shiftLabel = undefined;
  }

  // Handle space display
  if (keyDef.key === " ") {
    mainLabel = "";
  }

  return (
    <div
      className={`
        ${widthClass} h-10 flex flex-col items-center justify-center
        text-xs font-medium text-gray-700
        ${stateClasses[state]}
      `}
    >
      {shiftLabel && !showShift && (
        <span className="text-[10px] text-gray-400 -mb-0.5">{shiftLabel}</span>
      )}
      <span className={mainLabel.length > 1 ? "text-[10px]" : ""}>
        {mainLabel}
      </span>
    </div>
  );
}

function getWidthClass(width: number): string {
  // Base width is 40px (w-10), so multiply
  if (width === 1) return "w-10";
  if (width === 1.25) return "w-[50px]";
  if (width === 1.5) return "w-[60px]";
  if (width === 1.75) return "w-[70px]";
  if (width === 2) return "w-[80px]";
  if (width === 2.25) return "w-[90px]";
  if (width === 2.75) return "w-[110px]";
  if (width >= 6) return "w-[250px]"; // Space bar
  return "w-10";
}
