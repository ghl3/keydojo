// Keyboard key definition
export interface KeyDefinition {
  key: string; // Main character
  shiftKey?: string; // Character when shift is held
  code: string; // KeyboardEvent.code
  width?: number; // Relative width (1 = standard)
  label?: string; // Display label if different from key
}

// Key visual state
export type KeyState = "default" | "active" | "next" | "error" | "weak";

// Keyboard layout
export interface KeyboardLayout {
  rows: KeyDefinition[][];
}
