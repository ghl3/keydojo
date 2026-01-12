import type {
  TypingState,
  TypedCharacter,
  CharacterState,
  VisualCharState,
  VisualCharacter,
  VisualSessionState,
  ErrorMode,
} from "./typingState";

// Debug logging - set to true to enable console logs
const DEBUG_SELECTORS = false;

function debugLog(...args: unknown[]) {
  if (DEBUG_SELECTORS) {
    console.log(...args);
  }
}

/**
 * Find the index of the first uncorrected error - pure function
 * Returns null if no errors exist
 */
export function findFirstErrorIndex(
  characters: TypedCharacter[]
): number | null {
  const index = characters.findIndex((char) => char.state === "incorrect");
  return index === -1 ? null : index;
}

/**
 * Compute visual state for a single character - pure function
 * This is the SINGLE SOURCE OF TRUTH for how a character should be rendered
 */
export function computeVisualState(
  storedState: CharacterState,
  index: number,
  cursorPosition: number,
  errorMode: ErrorMode,
  firstErrorIndex: number | null
): VisualCharState {
  // Incorrect characters: first error shows as "incorrect" (red background)
  // Subsequent errors show as "error-zone" (red text) in correction-required mode
  if (storedState === "incorrect") {
    // In correction-required mode, only the FIRST error gets red background
    // Subsequent incorrect chars show as error-zone (like correct chars after an error)
    if (
      errorMode === "correction-required" &&
      firstErrorIndex !== null &&
      index > firstErrorIndex
    ) {
      return "error-zone";
    }
    return "incorrect";
  }

  // Corrected always shows as corrected (dark text + red underline)
  if (storedState === "corrected") {
    return "corrected";
  }

  // Characters at or after cursor that are pending = pending (gray)
  if (storedState === "pending") {
    return "pending";
  }

  // At this point, the only remaining state is "correct"
  // Correct characters - check for error zone
  if (storedState === "correct") {
    // Error zone only applies in correction-required mode
    // Character must be:
    // 1. After an uncorrected error (firstErrorIndex !== null && index > firstErrorIndex)
    // 2. Before the cursor (index < cursorPosition) - characters we've "passed"
    if (
      errorMode === "correction-required" &&
      firstErrorIndex !== null &&
      index > firstErrorIndex &&
      index < cursorPosition
    ) {
      return "error-zone";
    }

    // Normal correct character
    return "correct";
  }

  // Fallback (should never reach here)
  return "pending";
}

/**
 * Derive the visual state for a single character - pure function
 */
function deriveVisualCharacter(
  storedChar: TypedCharacter,
  index: number,
  cursorPosition: number,
  errorMode: ErrorMode,
  firstErrorIndex: number | null
): VisualCharacter {
  const visualState = computeVisualState(
    storedChar.state,
    index,
    cursorPosition,
    errorMode,
    firstErrorIndex
  );

  return {
    char: storedChar.char,
    visualState,
    isCursor: index === cursorPosition,
  };
}

/**
 * Derive the full visual session state from the stored state - pure function
 * This is used by the UI to render the typing area
 */
export function deriveVisualState(state: TypingState): VisualSessionState {
  const firstErrorIndex = findFirstErrorIndex(state.characters);

  const characters = state.characters.map((char, index) =>
    deriveVisualCharacter(
      char,
      index,
      state.cursorPosition,
      state.errorMode,
      firstErrorIndex
    )
  );

  // Debug: log non-trivial visual states
  const interestingChars = characters
    .map((c, i) => ({ i, stored: state.characters[i].state, visual: c.visualState }))
    .filter(x => x.visual === "incorrect" || x.visual === "error-zone" || x.visual === "corrected");

  if (interestingChars.length > 0) {
    debugLog(`[VISUAL] cursor=${state.cursorPosition}, firstError=${firstErrorIndex}, mode=${state.errorMode}`);
    debugLog(`[VISUAL] interesting:`, interestingChars.map(x => `${x.i}:${x.stored}→${x.visual}`).join(", "));
  }

  return {
    characters,
    isComplete: state.status === "complete",
    hasUnfixedErrors: firstErrorIndex !== null,
    firstErrorIndex,
    progress:
      state.text.length > 0
        ? (state.cursorPosition / state.text.length) * 100
        : 0,
  };
}

/**
 * Map visual state to Tailwind class names - pure function
 * Returns utility classes directly (idiomatic Tailwind pattern)
 */
export function visualStateToClassName(visualState: VisualCharState): string {
  switch (visualState) {
    case "pending":
      return "text-gray-400";
    case "correct":
      return "text-gray-900";
    case "incorrect":
      return "text-red-600 bg-red-100";
    case "corrected":
      return "text-gray-900 underline decoration-red-400 decoration-2";
    case "error-zone":
      return "text-red-500 bg-red-50";
    default:
      return "text-gray-400";
  }
}

/**
 * Count mistakes in the session - pure function
 * Returns the number of characters that are incorrect or corrected
 */
export function countMistakes(characters: TypedCharacter[]): number {
  return characters.filter(
    (char) => char.state === "incorrect" || char.state === "corrected"
  ).length;
}

/**
 * Calculate accuracy percentage - pure function
 */
export function calculateAccuracy(
  typedCount: number,
  mistakeCount: number
): number {
  if (typedCount === 0) return 100;
  return Math.floor(((typedCount - mistakeCount) / typedCount) * 100);
}
