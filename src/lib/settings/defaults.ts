// Default settings and constants

import type { UserSettings, FontSize, TextLengthOption } from "./types";
import { getDefaultContentMode } from "@/lib/content";

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
      content: getDefaultContentMode(),
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
