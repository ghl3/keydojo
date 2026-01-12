// User settings types

import type { SessionMode } from "@/lib/session";

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
