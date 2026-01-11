import type { ErrorMode } from "./settings";

// Character states during typing (stored state)
export type CharacterState = "pending" | "correct" | "incorrect" | "corrected";

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

// Single character in the typing text
export interface TypedCharacter {
  char: string;
  state: CharacterState;
  typedAt?: number; // Timestamp when typed
  attempts: number; // Number of attempts (for corrections)
}

// ============= STATE MACHINE TYPES =============

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

// Session mode configuration
export interface SessionMode {
  characterTypes: CharacterTypeFlags;
  contentType: ContentType;
}

// Combinable character type flags
export interface CharacterTypeFlags {
  lowercaseLetters: boolean;
  uppercaseLetters: boolean;
  numbers: boolean;
  punctuation: boolean;
  spaces: boolean;
}

export type ContentType = "words" | "sentences" | "paragraphs" | "code";

// Active typing session
export interface TypingSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  text: string;
  typedCharacters: TypedCharacter[];
  currentIndex: number;
  mode: SessionMode;
  isPaused: boolean;
  isComplete: boolean;
  // Tracking for content-level stats
  wordBoundaries: number[]; // Indices where words start
  sentenceBoundaries: number[]; // Indices where sentences start
  paragraphBoundaries: number[]; // Indices where paragraphs start
  currentWordHasError: boolean;
  currentSentenceHasError: boolean;
  currentParagraphHasError: boolean;
  wordsWithErrors: number;
  sentencesWithErrors: number;
  paragraphsWithErrors: number;
}

// Session result after completion
export interface SessionResult {
  id: string;
  timestamp: number;
  duration: number; // in milliseconds
  mode: SessionMode;

  // Overall metrics
  grossWPM: number;
  netWPM: number;
  accuracy: number; // 0-100 percentage
  totalCharacters: number;
  totalMistakes: number;

  // Breakdown by category
  categoryBreakdown: Record<
    CharCategory,
    {
      attempts: number;
      mistakes: number;
      wpm: number;
    }
  >;

  // Per-key mistakes in this session
  mistakesByKey: Record<string, number>;

  // Per-pair (bigram) mistakes - tracks which letter transitions caused errors
  mistakesByPair: Record<string, number>;

  // Word-level data
  wordsTyped: number;
  wordsWithErrors: number;
  errorsPerWord: number;

  // Sentence-level (if applicable)
  sentencesTyped?: number;
  sentencesWithErrors?: number;
  errorsPerSentence?: number;

  // Paragraph-level (if applicable)
  paragraphsTyped?: number;
  paragraphsWithErrors?: number;
  errorsPerParagraph?: number;
}

// Character categories for grouping
export type CharCategory =
  | "lowercase"
  | "uppercase"
  | "number"
  | "punctuation"
  | "space";
