// Statistics types

import type { CharCategory, SessionResult, ContentType } from "@/lib/session";

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

  // Recent sessions for history view
  recentSessions: SessionResult[]; // last 100
}

// Re-export for convenience
export type { CharCategory, SessionResult, ContentType };
