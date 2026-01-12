// Session-related types

import type { ContentModeConfig, ContentType } from "@/lib/content";

// Character categories for grouping
export type CharCategory =
  | "lowercase"
  | "uppercase"
  | "number"
  | "punctuation"
  | "space";

// New session mode with hierarchical content options
export interface SessionMode {
  content: ContentModeConfig;
}

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

// TypedCharacter - used by TypingSession
// Note: Also used by typing module, exported here for convenience
export interface TypedCharacter {
  char: string;
  state: CharacterState;
  typedAt?: number; // Timestamp when typed
  attempts: number; // Number of attempts (for corrections)
}

// Character states during typing (stored state)
export type CharacterState = "pending" | "correct" | "incorrect" | "corrected";

// Re-export content types for convenience
export type { ContentModeConfig, ContentType };
