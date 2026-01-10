import type { CharCategory, ContentType, SessionResult } from "./session";

// Per-key statistics (granular)
export interface KeyStats {
  key: string;
  category: CharCategory;
  totalAttempts: number;
  mistakes: number;
  mistakeRate: number; // mistakes / totalAttempts
  averageLatencyMs: number; // time to press this key
  lastPracticed: number; // timestamp
  // Spaced repetition fields
  easeFactor: number; // 2.5 default, adjusts based on performance
  interval: number; // days until next review
  nextReviewDate: number; // timestamp
}

// Stats grouped by character category
export interface CategoryStats {
  category: CharCategory;
  totalAttempts: number;
  mistakes: number;
  mistakeRate: number;
  averageWPM: number;
  bestWPM: number;
  sessionCount: number;
}

// Stats grouped by content type
export interface ContentTypeStats {
  contentType: ContentType;
  totalAttempts: number;
  mistakes: number;
  mistakeRate: number;
  averageWPM: number;
  bestWPM: number;
  sessionCount: number;
  // Content-specific metrics
  errorsPerWord?: number;
  errorsPerSentence?: number;
  errorsPerParagraph?: number;
  averageWordLength?: number;
}

// Word-level tracking (for pattern detection)
export interface WordStats {
  word: string;
  attempts: number;
  mistakes: number; // any error while typing this word
  mistakeRate: number;
  averageTimeMs: number; // time to complete word
}

// Letter pair (bigram) statistics - tracks transitions between keys
export interface PairStats {
  pair: string; // e.g., "th", "er", "in"
  totalAttempts: number;
  mistakes: number;
  mistakeRate: number;
}

// Data point for WPM history chart
export interface WPMDataPoint {
  timestamp: number;
  wpm: number;
  accuracy: number;
  sessionId: string;
}

// Real-time stats during active session
export interface LiveStats {
  elapsedTime: number;
  currentWPM: number;
  currentAccuracy: number;
  charactersTyped: number;
  mistakeCount: number;
  progress: number; // 0-100 percentage
}

// Main user stats aggregate
export interface UserStats {
  // Timestamps
  firstSessionAt: number;
  lastSessionAt: number;

  // Overall totals
  totalSessions: number;
  totalTimeMs: number;
  totalCharacters: number;
  totalMistakes: number;

  // Overall WPM
  averageWPM: number;
  bestWPM: number;
  wpmHistory: WPMDataPoint[];

  // Per-key breakdown (most granular)
  keyStats: Record<string, KeyStats>;

  // Category breakdown
  categoryStats: Record<CharCategory, CategoryStats>;

  // Content type breakdown
  contentTypeStats: Record<ContentType, ContentTypeStats>;

  // Problematic words (sorted by mistake rate)
  wordStats: Record<string, WordStats>;

  // Letter pair (bigram) stats for transition tracking
  pairStats: Record<string, PairStats>;

  // Computed weak areas (for adaptive learning)
  weakestKeys: string[]; // sorted by mistakeRate desc
  weakestPairs: string[]; // sorted by mistakeRate desc
  weakestCategories: CharCategory[]; // sorted by mistakeRate desc

  // Recent sessions for history view
  recentSessions: SessionResult[]; // last 100
}

// Default empty stats
export function getDefaultUserStats(): UserStats {
  return {
    firstSessionAt: 0,
    lastSessionAt: 0,
    totalSessions: 0,
    totalTimeMs: 0,
    totalCharacters: 0,
    totalMistakes: 0,
    averageWPM: 0,
    bestWPM: 0,
    wpmHistory: [],
    keyStats: {},
    categoryStats: {
      lowercase: createDefaultCategoryStats("lowercase"),
      uppercase: createDefaultCategoryStats("uppercase"),
      number: createDefaultCategoryStats("number"),
      punctuation: createDefaultCategoryStats("punctuation"),
      space: createDefaultCategoryStats("space"),
    },
    contentTypeStats: {
      words: createDefaultContentTypeStats("words"),
      sentences: createDefaultContentTypeStats("sentences"),
      paragraphs: createDefaultContentTypeStats("paragraphs"),
      code: createDefaultContentTypeStats("code"),
    },
    wordStats: {},
    pairStats: {},
    weakestKeys: [],
    weakestPairs: [],
    weakestCategories: [],
    recentSessions: [],
  };
}

function createDefaultCategoryStats(category: CharCategory): CategoryStats {
  return {
    category,
    totalAttempts: 0,
    mistakes: 0,
    mistakeRate: 0,
    averageWPM: 0,
    bestWPM: 0,
    sessionCount: 0,
  };
}

function createDefaultContentTypeStats(
  contentType: ContentType
): ContentTypeStats {
  return {
    contentType,
    totalAttempts: 0,
    mistakes: 0,
    mistakeRate: 0,
    averageWPM: 0,
    bestWPM: 0,
    sessionCount: 0,
  };
}

// Default key stats for a new key
export function createDefaultKeyStats(
  key: string,
  category: CharCategory
): KeyStats {
  return {
    key,
    category,
    totalAttempts: 0,
    mistakes: 0,
    mistakeRate: 0,
    averageLatencyMs: 0,
    lastPracticed: 0,
    easeFactor: 2.5,
    interval: 1,
    nextReviewDate: 0,
  };
}
