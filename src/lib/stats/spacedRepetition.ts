import type { KeyStats } from "@/types";

// SM-2 algorithm parameters
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const INITIAL_EASE_FACTOR = 2.5;

// Grades for SM-2: 0 = complete failure, 5 = perfect
// We simplify to: correct (grade 4) or incorrect (grade 1)
const GRADE_CORRECT = 4;
const GRADE_INCORRECT = 1;

interface SpacedRepetitionResult {
  easeFactor: number;
  interval: number; // in days
  nextReviewDate: number; // timestamp
}

// Update spaced repetition data based on performance
export function updateSpacedRepetition(
  keyStats: KeyStats,
  wasCorrect: boolean
): SpacedRepetitionResult {
  const grade = wasCorrect ? GRADE_CORRECT : GRADE_INCORRECT;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Update ease factor using SM-2 formula
  let newEaseFactor =
    keyStats.easeFactor +
    (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  // Clamp ease factor
  newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));

  // Calculate new interval
  let newInterval: number;

  if (!wasCorrect) {
    // Reset to 1 day on failure
    newInterval = 1;
  } else if (keyStats.interval <= 1) {
    // First successful review: 1 day
    newInterval = 1;
  } else if (keyStats.interval <= 6) {
    // Second successful review: 6 days
    newInterval = 6;
  } else {
    // Subsequent reviews: multiply by ease factor
    newInterval = Math.round(keyStats.interval * newEaseFactor);
  }

  // Calculate next review date
  const nextReviewDate = now + newInterval * dayMs;

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate,
  };
}

// Check if a key is due for review
export function isKeyDueForReview(keyStats: KeyStats): boolean {
  return Date.now() >= keyStats.nextReviewDate;
}

// Get keys that are due for review, sorted by urgency
export function getDueKeys(
  keyStats: Record<string, KeyStats>
): KeyStats[] {
  const now = Date.now();

  return Object.values(keyStats)
    .filter((k) => k.nextReviewDate <= now)
    .sort((a, b) => {
      // Sort by how overdue (most overdue first)
      const overdueA = now - a.nextReviewDate;
      const overdueB = now - b.nextReviewDate;
      return overdueB - overdueA;
    });
}

// Get keys sorted by difficulty (for adaptive learning)
export function getKeysByDifficulty(
  keyStats: Record<string, KeyStats>
): KeyStats[] {
  return Object.values(keyStats)
    .filter((k) => k.totalAttempts >= 3) // Need some data
    .sort((a, b) => {
      // Lower ease factor = harder
      // Higher mistake rate = harder
      const difficultyA = (1 / a.easeFactor) + a.mistakeRate;
      const difficultyB = (1 / b.easeFactor) + b.mistakeRate;
      return difficultyB - difficultyA;
    });
}

// Initialize spaced repetition data for a new key
export function initializeSpacedRepetition(): Pick<
  KeyStats,
  "easeFactor" | "interval" | "nextReviewDate"
> {
  return {
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 1,
    nextReviewDate: 0, // Due immediately for first practice
  };
}
