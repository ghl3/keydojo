// Session helper functions - pure utilities for typing session management

import type { SessionMode, SessionResult } from "@/lib/session";
import type { LiveStats } from "@/lib/stats";
import type { TypingState } from "./typingState";
import { calculateCategoryBreakdown } from "@/lib/stats";
import { countMistakes, calculateAccuracy } from "./typingSelectors";

// =============================================================================
// Types
// =============================================================================

export interface BoundaryErrorState {
  currentWordHasError: boolean;
  currentSentenceHasError: boolean;
  currentParagraphHasError: boolean;
  wordsWithErrors: number;
  sentencesWithErrors: number;
  paragraphsWithErrors: number;
}

export interface UseTypingStateMachineOptions {
  text: string;
  mode: SessionMode;
  onComplete?: (result: SessionResult) => void;
  errorMode?: "stop-on-error" | "correction-required" | "advance-on-error";
  newlineMode?: "required" | "optional";
}

// =============================================================================
// Constants
// =============================================================================

// If user doesn't type for this long, stop counting time
export const IDLE_THRESHOLD_MS = 2000;

// =============================================================================
// Factory Functions
// =============================================================================

export function createDefaultBoundaryErrorState(): BoundaryErrorState {
  return {
    currentWordHasError: false,
    currentSentenceHasError: false,
    currentParagraphHasError: false,
    wordsWithErrors: 0,
    sentencesWithErrors: 0,
    paragraphsWithErrors: 0,
  };
}

export function createDefaultLiveStats(): LiveStats {
  return {
    elapsedTime: 0,
    currentWPM: 0,
    currentAccuracy: 100,
    charactersTyped: 0,
    mistakeCount: 0,
    progress: 0,
  };
}

// =============================================================================
// Calculation Functions
// =============================================================================

/**
 * Calculate gross words per minute based on characters typed and active time
 */
export function calculateGrossWPM(charactersTyped: number, activeTimeMs: number): number {
  const minutes = activeTimeMs / 60000;
  const words = charactersTyped / 5;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

/**
 * Calculate live stats from current typing state
 */
export function calculateLiveStatsFromState(
  state: TypingState,
  activeTypingTimeMs: number
): LiveStats {
  const typedCount = state.cursorPosition;
  const mistakeCount = countMistakes(state.characters.slice(0, state.cursorPosition));
  const currentAccuracy = calculateAccuracy(typedCount, mistakeCount);

  return {
    elapsedTime: activeTypingTimeMs,
    currentWPM: calculateGrossWPM(typedCount, activeTypingTimeMs),
    currentAccuracy,
    charactersTyped: typedCount,
    mistakeCount,
    progress: state.text.length > 0 ? (typedCount / state.text.length) * 100 : 0,
  };
}

// =============================================================================
// Session Result Builder
// =============================================================================

export interface BuildSessionResultParams {
  state: TypingState;
  mode: SessionMode;
  duration: number;
  mistakesByKey: Record<string, number>;
  mistakesByPair: Record<string, number>;
  recordedMistakeCount: number;
  boundaryErrorState: BoundaryErrorState;
  wordBoundaries: number[];
  sentenceBoundaries: number[];
  paragraphBoundaries: number[];
}

/**
 * Build the final SessionResult from typing state and tracking data
 */
export function buildSessionResult(params: BuildSessionResultParams): SessionResult {
  const {
    state,
    mode,
    duration,
    mistakesByKey,
    mistakesByPair,
    recordedMistakeCount,
    boundaryErrorState,
    wordBoundaries,
    sentenceBoundaries,
    paragraphBoundaries,
  } = params;

  const totalMistakes = recordedMistakeCount;

  const categoryBreakdown = calculateCategoryBreakdown(
    state.text,
    state.characters,
    duration
  );

  // Count attempts per key from the text
  const attemptsByKey: Record<string, number> = {};
  for (const char of state.text) {
    attemptsByKey[char] = (attemptsByKey[char] || 0) + 1;
  }

  const wordsTyped = wordBoundaries.length;
  const sentencesTyped = sentenceBoundaries.length;
  const paragraphsTyped = paragraphBoundaries.length;

  const bs = boundaryErrorState;

  return {
    id: state.id,
    timestamp: state.completedAt!,
    duration,
    mode,
    grossWPM: Math.round((state.text.length / 5) / (duration / 60000)),
    netWPM: Math.round(((state.text.length / 5) - totalMistakes) / (duration / 60000)),
    accuracy: state.text.length > 0
      ? Math.floor(((state.text.length - totalMistakes) / state.text.length) * 100)
      : 100,
    totalCharacters: state.text.length,
    totalMistakes,
    categoryBreakdown,
    attemptsByKey,
    mistakesByKey: { ...mistakesByKey },
    mistakesByPair: { ...mistakesByPair },
    wordsTyped,
    wordsWithErrors: bs.wordsWithErrors,
    errorsPerWord: wordsTyped > 0
      ? Math.round((bs.wordsWithErrors / wordsTyped) * 100) / 100
      : 0,
    sentencesTyped,
    sentencesWithErrors: bs.sentencesWithErrors,
    errorsPerSentence: sentencesTyped > 0
      ? Math.round((bs.sentencesWithErrors / sentencesTyped) * 100) / 100
      : 0,
    paragraphsTyped,
    paragraphsWithErrors: bs.paragraphsWithErrors,
    errorsPerParagraph: paragraphsTyped > 0
      ? Math.round((bs.paragraphsWithErrors / paragraphsTyped) * 100) / 100
      : 0,
  };
}
