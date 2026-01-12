// Typing state machine types

import type { ErrorMode } from "@/lib/settings";
import type { CharacterState, TypedCharacter } from "@/lib/session";

// Visual character state (derived for rendering, includes error-zone)
export type VisualCharState = "pending" | "correct" | "incorrect" | "corrected" | "error-zone";

// Visual character for rendering
export interface VisualCharacter {
  char: string;
  visualState: VisualCharState;
  isCursor: boolean;
}

// Derived visual state for the entire session
export interface VisualSessionState {
  characters: VisualCharacter[];
  isComplete: boolean;
  hasUnfixedErrors: boolean;
  firstErrorIndex: number | null;
  progress: number; // 0-100
}

// Core typing state (minimal stored state for the reducer)
export interface TypingState {
  id: string;
  text: string;
  characters: TypedCharacter[];
  cursorPosition: number;
  errorMode: ErrorMode;
  status: "idle" | "active" | "complete";
  startedAt: number | null;
  completedAt: number | null;
}

// Actions for the typing reducer
export type TypingAction =
  | { type: "TYPE_CHAR"; char: string; timestamp: number }
  | { type: "BACKSPACE"; timestamp: number }
  | { type: "RESET"; text?: string; errorMode?: ErrorMode };

// Configuration for creating initial state
export interface TypingConfig {
  text: string;
  errorMode: ErrorMode;
}

// Re-export from session for convenience
export type { CharacterState, TypedCharacter } from "@/lib/session";
export type { ErrorMode } from "@/lib/settings";
