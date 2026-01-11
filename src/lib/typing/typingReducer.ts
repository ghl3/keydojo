import type {
  TypingState,
  TypingAction,
  TypingConfig,
  TypedCharacter,
  CharacterState,
} from "@/types/session";
import type { ErrorMode } from "@/types/settings";

// Debug logging - set to true to enable console logs
const DEBUG_REDUCER = false;

function debugLog(...args: unknown[]) {
  if (DEBUG_REDUCER) {
    console.log(...args);
  }
}

/**
 * Create initial typing state - pure function
 */
export function createInitialState(config: TypingConfig): TypingState {
  const characters: TypedCharacter[] = config.text.split("").map((char) => ({
    char,
    state: "pending" as const,
    attempts: 0,
  }));

  return {
    id: crypto.randomUUID(),
    text: config.text,
    characters,
    cursorPosition: 0,
    errorMode: config.errorMode,
    status: "idle",
    startedAt: null,
    completedAt: null,
  };
}

/**
 * Check if the session is complete - pure function
 */
function checkCompletion(
  characters: TypedCharacter[],
  cursorPosition: number,
  errorMode: ErrorMode
): boolean {
  // Must reach end of text
  if (cursorPosition < characters.length) {
    return false;
  }

  // In correction-required mode, must have no unfixed errors
  if (errorMode === "correction-required") {
    return !characters.some((char) => char.state === "incorrect");
  }

  // In stop-on-error mode, we can only reach end if all correct
  // In advance-on-error mode, can complete regardless of errors
  return true;
}

/**
 * Handle typing a character - pure function
 */
function handleTypeChar(
  state: TypingState,
  typedChar: string,
  timestamp: number
): TypingState {
  // Can't type if already complete
  if (state.status === "complete") {
    return state;
  }

  // Can't type past end of text
  if (state.cursorPosition >= state.text.length) {
    return state;
  }

  const expectedChar = state.text[state.cursorPosition];
  const currentChar = state.characters[state.cursorPosition];
  const isCorrect = typedChar === expectedChar;

  // Determine new character state
  let newCharState: CharacterState;
  if (isCorrect) {
    // If was incorrect, it's now corrected; otherwise correct
    newCharState = currentChar.state === "incorrect" ? "corrected" : "correct";
  } else {
    newCharState = "incorrect";
  }

  // Update the character at current position
  const newCharacters = state.characters.map((char, i) =>
    i === state.cursorPosition
      ? {
          ...char,
          state: newCharState,
          attempts: char.attempts + 1,
          typedAt: timestamp,
        }
      : char
  );

  // Determine cursor movement based on error mode
  let newCursorPosition = state.cursorPosition;

  // In stop-on-error mode: only advance if correct
  // In other modes: always advance (even on error)
  if (isCorrect || state.errorMode !== "stop-on-error") {
    newCursorPosition = state.cursorPosition + 1;
  }

  debugLog(`[TYPE] "${typedChar}" at ${state.cursorPosition}: expected="${expectedChar}", ${currentChar.state} → ${newCharState}, cursor → ${newCursorPosition}, mode=${state.errorMode}`);

  // Check for completion
  const isComplete = checkCompletion(
    newCharacters,
    newCursorPosition,
    state.errorMode
  );

  return {
    ...state,
    characters: newCharacters,
    cursorPosition: newCursorPosition,
    status: isComplete ? "complete" : "active",
    startedAt: state.startedAt ?? timestamp,
    completedAt: isComplete ? timestamp : null,
  };
}

/**
 * Handle backspace - pure function
 * Only allowed in correction-required mode
 */
function handleBackspace(state: TypingState, timestamp: number): TypingState {
  // Only allowed in correction-required mode
  if (state.errorMode !== "correction-required") {
    return state;
  }

  // Can't backspace at start
  if (state.cursorPosition === 0) {
    return state;
  }

  // Can't backspace if complete
  if (state.status === "complete") {
    return state;
  }

  const prevIndex = state.cursorPosition - 1;
  const prevChar = state.characters[prevIndex];

  // Key behavior: Keep "incorrect" state ONLY for the first error
  // Subsequent errors should reset to pending so user can retype from the first error
  let newState: CharacterState = "pending";
  if (prevChar.state === "incorrect") {
    // Check if there's an earlier incorrect character
    const hasEarlierError = state.characters
      .slice(0, prevIndex)
      .some((c) => c.state === "incorrect");
    // Only keep as incorrect if this is the first error
    newState = hasEarlierError ? "pending" : "incorrect";
    debugLog(`[BACKSPACE] hasEarlierError=${hasEarlierError}`);
  }

  debugLog(`[BACKSPACE] cursor ${state.cursorPosition} → ${prevIndex}, char "${prevChar.char}": ${prevChar.state} → ${newState}`);

  const newCharacters = state.characters.map((char, i) =>
    i === prevIndex
      ? {
          ...char,
          state: newState,
          // Clear typedAt when going back to pending
          typedAt: newState === "pending" ? undefined : char.typedAt,
        }
      : char
  );

  return {
    ...state,
    characters: newCharacters,
    cursorPosition: prevIndex,
    // Start the session if not started (backspace can be first key)
    startedAt: state.startedAt ?? timestamp,
  };
}

/**
 * Handle reset - pure function
 */
function handleReset(state: TypingState, newText?: string, newErrorMode?: ErrorMode): TypingState {
  const text = newText ?? state.text;
  const errorMode = newErrorMode ?? state.errorMode;
  return createInitialState({
    text,
    errorMode,
  });
}

/**
 * Pure typing session reducer
 * All state transitions happen here - no side effects
 */
export function typingReducer(
  state: TypingState,
  action: TypingAction
): TypingState {
  switch (action.type) {
    case "TYPE_CHAR":
      return handleTypeChar(state, action.char, action.timestamp);

    case "BACKSPACE":
      return handleBackspace(state, action.timestamp);

    case "RESET":
      return handleReset(state, action.text, action.errorMode);

    default:
      return state;
  }
}
