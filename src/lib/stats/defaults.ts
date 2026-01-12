// Default stats values

import type {
  UserStats,
  KeyStats,
  CategoryStats,
  ContentTypeStats,
  CharCategory,
  ContentType,
} from "./userStats";

// Create default category stats
export function createDefaultCategoryStats(category: CharCategory): CategoryStats {
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

// Create default content type stats
export function createDefaultContentTypeStats(
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
    recentSessions: [],
  };
}
