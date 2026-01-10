// Character states during typing
export type CharacterState = "pending" | "correct" | "incorrect" | "corrected";

// Single character in the typing text
export interface TypedCharacter {
  char: string;
  state: CharacterState;
  typedAt?: number; // Timestamp when typed
  attempts: number; // Number of attempts (for corrections)
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
}

export type ContentType = "words" | "sentences" | "paragraphs";

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
