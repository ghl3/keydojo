// Stats module - statistics, analytics, and calculations

// Types
export * from "./userStats";

// Defaults
export {
  getDefaultUserStats,
  createDefaultKeyStats,
  createDefaultCategoryStats,
  createDefaultContentTypeStats,
} from "./defaults";

// Calculations
export {
  calculateGrossWPM,
  calculateNetWPM,
  calculateAccuracy,
  calculateCategoryWPM,
  calculateLiveStats,
  calculateCategoryBreakdown,
} from "./calculator";

// Aggregation
export { aggregateSessionIntoStats } from "./aggregator";

// Character classification
export { classifyChar } from "./classifier";

// Selectors
export { getWeakestKeys, getWeakestPairs, getWeakestCategories } from "./selectors";

// Spaced repetition
export {
  updateSpacedRepetition,
  isKeyDueForReview,
  getDueKeys,
  getKeysByDifficulty,
  initializeSpacedRepetition,
} from "./spacedRepetition";

// Re-export boundary functions (from session module)
export {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
  countWords,
  countSentences,
  countParagraphs,
  extractWords,
} from "./classifier";
