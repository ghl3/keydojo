import type { SessionMode } from "./session";

// User preferences
export interface UserSettings {
  // Mode defaults
  defaultMode: SessionMode;

  // Display settings
  showKeyboard: boolean;
  showLiveStats: boolean;
  highlightNextKey: boolean;
  showSpaceMarkers: boolean; // Show underscore markers for spaces

  // Text generation settings
  textLength: TextLengthOption;
  adaptiveDifficulty: boolean; // Use mistake-aware text generation
  adaptiveIntensity: number; // 0-1, how much to weight weak keys

  // Session settings
  stopOnError: boolean; // Require correction before continuing
}

export type TextLengthOption = "short" | "medium" | "long";

// Length mappings
export const TEXT_LENGTH_CHARS: Record<TextLengthOption, number> = {
  short: 50,
  medium: 150,
  long: 300,
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
      },
      contentType: "words",
    },
    showKeyboard: true,
    showLiveStats: true,
    highlightNextKey: true,
    showSpaceMarkers: false,
    textLength: "medium",
    adaptiveDifficulty: true,
    adaptiveIntensity: 0.5,
    stopOnError: false,
  };
}
