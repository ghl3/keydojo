import type { ErrorMode } from "./settings";
import type {
  ContentModeConfig,
  WordsModeOptions,
  TextModeOptions,
  CodeModeOptions,
  CodeLanguage,
  ContentType,
} from "./generators";

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

// ============= NEW HIERARCHICAL MODE SYSTEM =============

// Re-export for convenience
export type {
  ContentModeConfig,
  WordsModeOptions,
  TextModeOptions,
  CodeModeOptions,
  CodeLanguage,
  ContentType,
};

// New session mode with hierarchical content options
export interface SessionMode {
  content: ContentModeConfig;
}

// ============= LEGACY TYPES (for backwards compatibility) =============

// Legacy character type flags - kept for migration and stats
export interface CharacterTypeFlags {
  lowercaseLetters: boolean;
  uppercaseLetters: boolean;
  numbers: boolean;
  punctuation: boolean;
  spaces: boolean;
}

// Legacy session mode - used for migration from old format
export interface LegacySessionMode {
  characterTypes: CharacterTypeFlags;
  contentType: ContentType;
}

// ============= MIGRATION HELPERS =============

/**
 * Convert new SessionMode to legacy CharacterTypeFlags for backwards compatibility
 * with stats tracking and other systems that expect the old format.
 */
export function toLegacyCharacterTypes(mode: SessionMode): CharacterTypeFlags {
  const { content } = mode;

  switch (content.type) {
    case "words":
      return {
        lowercaseLetters: content.options.lowercase,
        uppercaseLetters: content.options.uppercase,
        numbers: content.options.numbers,
        punctuation: content.options.punctuation,
        spaces: true,
      };
    case "sentences":
    case "paragraphs":
      return {
        lowercaseLetters: true,
        uppercaseLetters: true,
        numbers: content.options.numbers,
        punctuation: content.options.punctuation,
        spaces: true,
      };
    case "code":
      // Code mode has all characters enabled
      return {
        lowercaseLetters: true,
        uppercaseLetters: true,
        numbers: true,
        punctuation: true,
        spaces: true,
      };
  }
}

/**
 * Get the content type from a SessionMode
 */
export function getContentType(mode: SessionMode): ContentType {
  return mode.content.type;
}

/**
 * Migrate legacy session mode to new format
 */
export function migrateLegacyMode(legacy: LegacySessionMode): SessionMode {
  const { characterTypes, contentType } = legacy;

  switch (contentType) {
    case "words":
      return {
        content: {
          type: "words",
          options: {
            lowercase: characterTypes.lowercaseLetters,
            uppercase: characterTypes.uppercaseLetters,
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
            specialChars: false,
          },
        },
      };
    case "sentences":
      return {
        content: {
          type: "sentences",
          options: {
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
          },
        },
      };
    case "paragraphs":
      return {
        content: {
          type: "paragraphs",
          options: {
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
          },
        },
      };
    case "code":
      return {
        content: {
          type: "code",
          options: {
            language: "mixed",
          },
        },
      };
  }
}

/**
 * Check if a mode object is in the legacy format
 */
export function isLegacyMode(
  mode: SessionMode | LegacySessionMode
): mode is LegacySessionMode {
  return "characterTypes" in mode && "contentType" in mode;
}

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

  // Per-key attempts in this session (how many times each key was typed)
  attemptsByKey: Record<string, number>;

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
