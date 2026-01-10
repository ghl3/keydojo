import type { KeyDefinition, KeyboardLayout } from "@/types/keyboard";

// Standard US QWERTY keyboard layout
export const QWERTY_LAYOUT: KeyboardLayout = {
  rows: [
    // Number row
    [
      { key: "`", shiftKey: "~", code: "Backquote" },
      { key: "1", shiftKey: "!", code: "Digit1" },
      { key: "2", shiftKey: "@", code: "Digit2" },
      { key: "3", shiftKey: "#", code: "Digit3" },
      { key: "4", shiftKey: "$", code: "Digit4" },
      { key: "5", shiftKey: "%", code: "Digit5" },
      { key: "6", shiftKey: "^", code: "Digit6" },
      { key: "7", shiftKey: "&", code: "Digit7" },
      { key: "8", shiftKey: "*", code: "Digit8" },
      { key: "9", shiftKey: "(", code: "Digit9" },
      { key: "0", shiftKey: ")", code: "Digit0" },
      { key: "-", shiftKey: "_", code: "Minus" },
      { key: "=", shiftKey: "+", code: "Equal" },
      { key: "Backspace", code: "Backspace", width: 2, label: "⌫" },
    ],
    // Top letter row
    [
      { key: "Tab", code: "Tab", width: 1.5, label: "Tab" },
      { key: "q", shiftKey: "Q", code: "KeyQ" },
      { key: "w", shiftKey: "W", code: "KeyW" },
      { key: "e", shiftKey: "E", code: "KeyE" },
      { key: "r", shiftKey: "R", code: "KeyR" },
      { key: "t", shiftKey: "T", code: "KeyT" },
      { key: "y", shiftKey: "Y", code: "KeyY" },
      { key: "u", shiftKey: "U", code: "KeyU" },
      { key: "i", shiftKey: "I", code: "KeyI" },
      { key: "o", shiftKey: "O", code: "KeyO" },
      { key: "p", shiftKey: "P", code: "KeyP" },
      { key: "[", shiftKey: "{", code: "BracketLeft" },
      { key: "]", shiftKey: "}", code: "BracketRight" },
      { key: "\\", shiftKey: "|", code: "Backslash", width: 1.5 },
    ],
    // Home row
    [
      { key: "CapsLock", code: "CapsLock", width: 1.75, label: "Caps" },
      { key: "a", shiftKey: "A", code: "KeyA" },
      { key: "s", shiftKey: "S", code: "KeyS" },
      { key: "d", shiftKey: "D", code: "KeyD" },
      { key: "f", shiftKey: "F", code: "KeyF" },
      { key: "g", shiftKey: "G", code: "KeyG" },
      { key: "h", shiftKey: "H", code: "KeyH" },
      { key: "j", shiftKey: "J", code: "KeyJ" },
      { key: "k", shiftKey: "K", code: "KeyK" },
      { key: "l", shiftKey: "L", code: "KeyL" },
      { key: ";", shiftKey: ":", code: "Semicolon" },
      { key: "'", shiftKey: '"', code: "Quote" },
      { key: "Enter", code: "Enter", width: 2.25, label: "Enter" },
    ],
    // Bottom letter row
    [
      { key: "Shift", code: "ShiftLeft", width: 2.25, label: "Shift" },
      { key: "z", shiftKey: "Z", code: "KeyZ" },
      { key: "x", shiftKey: "X", code: "KeyX" },
      { key: "c", shiftKey: "C", code: "KeyC" },
      { key: "v", shiftKey: "V", code: "KeyV" },
      { key: "b", shiftKey: "B", code: "KeyB" },
      { key: "n", shiftKey: "N", code: "KeyN" },
      { key: "m", shiftKey: "M", code: "KeyM" },
      { key: ",", shiftKey: "<", code: "Comma" },
      { key: ".", shiftKey: ">", code: "Period" },
      { key: "/", shiftKey: "?", code: "Slash" },
      { key: "Shift", code: "ShiftRight", width: 2.75, label: "Shift" },
    ],
    // Space bar row
    [
      { key: "Ctrl", code: "ControlLeft", width: 1.25, label: "Ctrl" },
      { key: "Alt", code: "AltLeft", width: 1.25, label: "Alt" },
      { key: "Meta", code: "MetaLeft", width: 1.25, label: "⌘" },
      { key: " ", code: "Space", width: 6.25, label: "" },
      { key: "Meta", code: "MetaRight", width: 1.25, label: "⌘" },
      { key: "Alt", code: "AltRight", width: 1.25, label: "Alt" },
      { key: "Ctrl", code: "ControlRight", width: 1.25, label: "Ctrl" },
    ],
  ],
};

// Map from character to key code
export function getKeyCodeForChar(char: string): string | null {
  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row) {
      if (key.key === char || key.shiftKey === char) {
        return key.code;
      }
    }
  }
  return null;
}

// Check if shift is needed for a character
export function needsShift(char: string): boolean {
  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row) {
      if (key.shiftKey === char) {
        return true;
      }
    }
  }
  return false;
}

// Get the key definition for a character
export function getKeyDefinitionForChar(char: string): KeyDefinition | null {
  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row) {
      if (key.key === char || key.shiftKey === char) {
        return key;
      }
    }
  }
  return null;
}

// Get all printable characters from the keyboard
export function getAllPrintableChars(): string[] {
  const chars: string[] = [];

  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row) {
      if (key.key.length === 1) {
        chars.push(key.key);
      }
      if (key.shiftKey && key.shiftKey.length === 1) {
        chars.push(key.shiftKey);
      }
    }
  }

  return chars;
}
