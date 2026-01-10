import type { SessionMode } from "./session";

// User preferences
export interface UserSettings {
  // Mode defaults
  defaultMode: SessionMode;

  // Typing Behavior
  spaceMode: SpaceMode;
  newlineMode: NewlineMode;
  errorMode: ErrorMode;

  // Display settings
  showKeyboard: boolean;
  showLiveStats: boolean;
  highlightNextKey: boolean;
  showSpaceMarkers: boolean;
  fontSize: FontSize;

  // Audio settings
  soundEnabled: boolean;

  // Difficulty settings
  textLength: TextLengthOption;
  adaptiveDifficulty: boolean;
  adaptiveIntensity: number; // 0-1, how much to weight weak keys
}

// Type definitions
export type SpaceMode = "single" | "double" | "either";
export type NewlineMode = "required" | "optional";
export type ErrorMode = "stop-on-error" | "advance-on-error" | "correction-required";
export type FontSize = "small" | "medium" | "large";
export type TextLengthOption = "short" | "medium" | "long";

// Length mappings
export const TEXT_LENGTH_CHARS: Record<TextLengthOption, number> = {
  short: 50,
  medium: 150,
  long: 300,
};

// Font size mappings (in rem)
export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: "1rem",
  medium: "1.25rem",
  large: "1.5rem",
};

// Default settings
export function getDefaultSettings(): UserSettings {
  return {
    defaultMode: {
      characterTypes: {
        lowercaseLetters: true,
        uppercaseLetters: false,
        numbers: false,
        punctuation: false,
        spaces: true,
      },
      contentType: "words",
    },
    // Typing behavior
    spaceMode: "single",
    newlineMode: "optional",
    errorMode: "stop-on-error",
    // Display
    showKeyboard: true,
    showLiveStats: true,
    highlightNextKey: true,
    showSpaceMarkers: false,
    fontSize: "medium",
    // Audio
    soundEnabled: false,
    // Difficulty
    textLength: "medium",
    adaptiveDifficulty: false,
    adaptiveIntensity: 0.5,
  };
}
