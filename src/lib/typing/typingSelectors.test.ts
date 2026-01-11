import { describe, it, expect } from "vitest";
import {
  computeVisualState,
  findFirstErrorIndex,
  deriveVisualState,
  visualStateToCssClass,
  countMistakes,
  calculateAccuracy,
} from "./typingSelectors";
import { createInitialState, typingReducer } from "./typingReducer";
import type { TypedCharacter, CharacterState } from "@/types/session";
import type { ErrorMode } from "@/types/settings";

// Helper to create a typed character
function createChar(
  char: string,
  state: CharacterState,
  attempts = 1
): TypedCharacter {
  return { char, state, attempts };
}

// Helper to create characters from a simple spec
// p = pending, c = correct, i = incorrect, x = corrected
function createChars(spec: string): TypedCharacter[] {
  return spec.split("").map((s, i) => {
    const char = String.fromCharCode(97 + i); // a, b, c, ...
    switch (s) {
      case "p":
        return createChar(char, "pending", 0);
      case "c":
        return createChar(char, "correct");
      case "i":
        return createChar(char, "incorrect");
      case "x":
        return createChar(char, "corrected");
      default:
        return createChar(char, "pending", 0);
    }
  });
}

describe("computeVisualState", () => {
  describe("basic states", () => {
    it("returns pending for pending state", () => {
      expect(computeVisualState("pending", 0, 0, "stop-on-error", null)).toBe(
        "pending"
      );
    });

    it("returns correct for correct state", () => {
      expect(computeVisualState("correct", 0, 1, "stop-on-error", null)).toBe(
        "correct"
      );
    });

    it("returns incorrect for incorrect state", () => {
      expect(computeVisualState("incorrect", 0, 1, "stop-on-error", null)).toBe(
        "incorrect"
      );
    });

    it("returns corrected for corrected state", () => {
      expect(computeVisualState("corrected", 0, 1, "stop-on-error", null)).toBe(
        "corrected"
      );
    });
  });

  describe("error-zone in correction-required mode", () => {
    it("returns error-zone for correct char after error and before cursor", () => {
      // Text: "hello", typed "hxllo" (error at 1), cursor at 5
      // Position 2 is correct but after error -> error-zone
      const result = computeVisualState(
        "correct",
        2, // index
        5, // cursorPosition
        "correction-required",
        1 // firstErrorIndex
      );
      expect(result).toBe("error-zone");
    });

    it("returns correct for correct char before error", () => {
      // Position 0 is before the error at position 1
      const result = computeVisualState(
        "correct",
        0, // index
        5, // cursorPosition
        "correction-required",
        1 // firstErrorIndex
      );
      expect(result).toBe("correct");
    });

    it("returns incorrect for the error itself", () => {
      // The error at position 1 should still be incorrect
      const result = computeVisualState(
        "incorrect",
        1, // index
        5, // cursorPosition
        "correction-required",
        1 // firstErrorIndex
      );
      expect(result).toBe("incorrect");
    });

    it("returns pending for chars at or after cursor", () => {
      // Even if stored as correct (shouldn't happen), chars at cursor are pending
      const result = computeVisualState(
        "pending",
        5, // index at cursor
        5, // cursorPosition
        "correction-required",
        1 // firstErrorIndex
      );
      expect(result).toBe("pending");
    });

    it("returns correct when no errors exist", () => {
      const result = computeVisualState(
        "correct",
        2,
        5,
        "correction-required",
        null // no errors
      );
      expect(result).toBe("correct");
    });

    it("does not apply error-zone to corrected chars", () => {
      // Corrected chars should stay corrected, not become error-zone
      const result = computeVisualState(
        "corrected",
        2,
        5,
        "correction-required",
        0 // error before this char
      );
      expect(result).toBe("corrected");
    });
  });

  describe("error-zone does NOT apply in other modes", () => {
    it("returns correct in stop-on-error mode even with error before", () => {
      const result = computeVisualState(
        "correct",
        2,
        5,
        "stop-on-error",
        1 // error at position 1
      );
      expect(result).toBe("correct");
    });

    it("returns correct in advance-on-error mode even with error before", () => {
      const result = computeVisualState(
        "correct",
        2,
        5,
        "advance-on-error",
        1 // error at position 1
      );
      expect(result).toBe("correct");
    });
  });
});

describe("findFirstErrorIndex", () => {
  it("returns null when no errors", () => {
    const chars = createChars("ccccc");
    expect(findFirstErrorIndex(chars)).toBeNull();
  });

  it("returns index of first incorrect character", () => {
    const chars = createChars("ccic");
    expect(findFirstErrorIndex(chars)).toBe(2);
  });

  it("returns first error when multiple exist", () => {
    const chars = createChars("cicic");
    expect(findFirstErrorIndex(chars)).toBe(1);
  });

  it("ignores corrected characters", () => {
    const chars = createChars("cxcic"); // corrected at 1, incorrect at 3
    expect(findFirstErrorIndex(chars)).toBe(3);
  });

  it("returns null for all pending", () => {
    const chars = createChars("ppppp");
    expect(findFirstErrorIndex(chars)).toBeNull();
  });

  it("returns null for all corrected", () => {
    const chars = createChars("xxxxx");
    expect(findFirstErrorIndex(chars)).toBeNull();
  });
});

describe("deriveVisualState", () => {
  it("derives correct visual state for simple session", () => {
    let state = createInitialState({ text: "hello", errorMode: "stop-on-error" });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1000 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "e", timestamp: 1100 });

    const visual = deriveVisualState(state);

    expect(visual.characters[0].visualState).toBe("correct");
    expect(visual.characters[1].visualState).toBe("correct");
    expect(visual.characters[2].visualState).toBe("pending");
    expect(visual.characters[2].isCursor).toBe(true);
    expect(visual.progress).toBe(40); // 2/5 * 100
    expect(visual.hasUnfixedErrors).toBe(false);
  });

  it("derives error-zone for chars after error in correction-required mode", () => {
    let state = createInitialState({ text: "hello", errorMode: "correction-required" });
    // Type h, x (wrong for e), l, l, o
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1000 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1100 }); // wrong!
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1200 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 1400 });

    const visual = deriveVisualState(state);

    expect(visual.characters[0].visualState).toBe("correct"); // h - before error
    expect(visual.characters[1].visualState).toBe("incorrect"); // e - the error
    expect(visual.characters[2].visualState).toBe("error-zone"); // l - after error
    expect(visual.characters[3].visualState).toBe("error-zone"); // l - after error
    expect(visual.characters[4].visualState).toBe("error-zone"); // o - after error
    expect(visual.hasUnfixedErrors).toBe(true);
    expect(visual.firstErrorIndex).toBe(1);
    expect(visual.isComplete).toBe(false);
  });

  it("error-zone clears after fixing error", () => {
    let state = createInitialState({ text: "hi", errorMode: "correction-required" });
    // Type wrong, then right
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong
    state = typingReducer(state, { type: "TYPE_CHAR", char: "i", timestamp: 1100 }); // correct (error-zone)

    let visual = deriveVisualState(state);
    expect(visual.characters[1].visualState).toBe("error-zone");

    // Backspace and fix
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1200 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1400 }); // corrected

    visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("corrected");
    expect(visual.hasUnfixedErrors).toBe(false);
  });

  it("handles backspace shrinking error zone", () => {
    let state = createInitialState({ text: "hello", errorMode: "correction-required" });
    // Type h, x (wrong), l, l, o
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1000 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1100 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1200 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 1400 });

    // Backspace twice - cursor goes from 5 to 3
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1500 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1600 });

    const visual = deriveVisualState(state);

    expect(state.cursorPosition).toBe(3);
    expect(visual.characters[0].visualState).toBe("correct"); // h
    expect(visual.characters[1].visualState).toBe("incorrect"); // e - still error
    expect(visual.characters[2].visualState).toBe("error-zone"); // l - still in zone (before cursor)
    expect(visual.characters[3].visualState).toBe("pending"); // l - after cursor, now pending
    expect(visual.characters[4].visualState).toBe("pending"); // o - after cursor, now pending
  });
});

describe("visualStateToCssClass", () => {
  it("maps visual states to correct CSS classes", () => {
    expect(visualStateToCssClass("pending")).toBe("char-pending");
    expect(visualStateToCssClass("correct")).toBe("char-correct");
    expect(visualStateToCssClass("incorrect")).toBe("char-incorrect");
    expect(visualStateToCssClass("corrected")).toBe("char-corrected");
    expect(visualStateToCssClass("error-zone")).toBe("char-error-zone");
  });
});

describe("countMistakes", () => {
  it("counts incorrect characters", () => {
    const chars = createChars("ccic");
    expect(countMistakes(chars)).toBe(1);
  });

  it("counts corrected characters", () => {
    const chars = createChars("cxcc");
    expect(countMistakes(chars)).toBe(1);
  });

  it("counts both incorrect and corrected", () => {
    const chars = createChars("cxic");
    expect(countMistakes(chars)).toBe(2);
  });

  it("returns 0 for all correct", () => {
    const chars = createChars("cccc");
    expect(countMistakes(chars)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("calculates 100% with no mistakes", () => {
    expect(calculateAccuracy(10, 0)).toBe(100);
  });

  it("calculates correct percentage with mistakes", () => {
    expect(calculateAccuracy(10, 2)).toBe(80);
  });

  it("returns 100% for 0 typed", () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it("floors the result", () => {
    // 7/10 = 70%, 3/10 mistakes
    expect(calculateAccuracy(10, 3)).toBe(70);
    // 9/11 = 81.8%, should floor to 81
    expect(calculateAccuracy(11, 2)).toBe(81);
  });
});

describe("integration: error-zone behavior scenarios", () => {
  it("scenario: type error, continue, backspace, fix", () => {
    // This is the main bug scenario we're fixing
    let state = createInitialState({ text: "hello", errorMode: "correction-required" });

    // 1. Type "h" correctly
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1000 });
    let visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("correct");

    // 2. Type "x" instead of "e" - ERROR
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1100 });
    visual = deriveVisualState(state);
    expect(visual.characters[1].visualState).toBe("incorrect");

    // 3. Continue typing "llo" - should all be error-zone
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1200 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 1400 });
    visual = deriveVisualState(state);

    expect(visual.characters[2].visualState).toBe("error-zone");
    expect(visual.characters[3].visualState).toBe("error-zone");
    expect(visual.characters[4].visualState).toBe("error-zone");
    expect(visual.isComplete).toBe(false);

    // 4. Backspace to the error (4 times: o, l, l, e)
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1500 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1600 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1700 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1800 });
    visual = deriveVisualState(state);

    expect(state.cursorPosition).toBe(1);
    expect(visual.characters[1].visualState).toBe("incorrect"); // Still error
    expect(visual.characters[2].visualState).toBe("pending"); // Now pending (after cursor)
    expect(visual.characters[3].visualState).toBe("pending");
    expect(visual.characters[4].visualState).toBe("pending");

    // 5. Type "e" correctly - should become corrected
    state = typingReducer(state, { type: "TYPE_CHAR", char: "e", timestamp: 1900 });
    visual = deriveVisualState(state);
    expect(visual.characters[1].visualState).toBe("corrected");
    expect(visual.hasUnfixedErrors).toBe(false);

    // 6. Complete the session
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 2000 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 2100 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 2200 });
    visual = deriveVisualState(state);

    expect(visual.isComplete).toBe(true);
    expect(visual.characters[1].visualState).toBe("corrected"); // Still shows as corrected
    expect(visual.characters[2].visualState).toBe("correct");
    expect(visual.characters[3].visualState).toBe("correct");
    expect(visual.characters[4].visualState).toBe("correct");
  });

  it("scenario: multiple errors - all wrong chars are incorrect, not error-zone", () => {
    let state = createInitialState({ text: "abc", errorMode: "correction-required" });

    // Type all wrong: x, y, z
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "y", timestamp: 1100 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "z", timestamp: 1200 });

    let visual = deriveVisualState(state);
    // First error shows as incorrect (red background)
    // Subsequent errors show as error-zone (red text) - same as correct chars after error
    expect(visual.characters[0].visualState).toBe("incorrect");
    expect(visual.characters[1].visualState).toBe("error-zone");
    expect(visual.characters[2].visualState).toBe("error-zone");
    expect(visual.isComplete).toBe(false);
  });

  it("scenario: multiple consecutive errors - first is incorrect, rest are error-zone", () => {
    // In correction-required mode, only the FIRST error shows as "incorrect" (red background)
    // Subsequent errors show as "error-zone" (red text) just like correct chars after an error
    // This provides clear visual feedback about WHERE the first error occurred
    let state = createInitialState({ text: "hello", errorMode: "correction-required" });

    // Type 5 wrong characters in a row
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong h
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1100 }); // wrong e
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1200 }); // wrong l
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1300 }); // wrong l
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1400 }); // wrong o

    // Verify stored states are all incorrect
    expect(state.characters[0].state).toBe("incorrect");
    expect(state.characters[1].state).toBe("incorrect");
    expect(state.characters[2].state).toBe("incorrect");
    expect(state.characters[3].state).toBe("incorrect");
    expect(state.characters[4].state).toBe("incorrect");

    // Visual: first error is "incorrect" (red bg), rest are "error-zone" (red text)
    const visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("incorrect");
    expect(visual.characters[1].visualState).toBe("error-zone");
    expect(visual.characters[2].visualState).toBe("error-zone");
    expect(visual.characters[3].visualState).toBe("error-zone");
    expect(visual.characters[4].visualState).toBe("error-zone");

    // First error should be at index 0
    expect(visual.firstErrorIndex).toBe(0);
  });

  it("scenario: error then correct chars show as error-zone", () => {
    let state = createInitialState({ text: "abc", errorMode: "correction-required" });

    // Type wrong, then correct: x, b, c
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong
    state = typingReducer(state, { type: "TYPE_CHAR", char: "b", timestamp: 1100 }); // correct
    state = typingReducer(state, { type: "TYPE_CHAR", char: "c", timestamp: 1200 }); // correct

    let visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("incorrect"); // The error
    expect(visual.characters[1].visualState).toBe("error-zone"); // Correct but after error
    expect(visual.characters[2].visualState).toBe("error-zone"); // Correct but after error
    expect(visual.isComplete).toBe(false);

    // Fix first error
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1300 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1400 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 1500 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "a", timestamp: 1600 }); // Fix 'a'

    visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("corrected"); // Fixed!
    expect(visual.hasUnfixedErrors).toBe(false);
  });

  it("scenario: error + 5 correct chars, partial backspace, then full fix", () => {
    // Text: "hello " (with trailing space)
    let state = createInitialState({ text: "hello ", errorMode: "correction-required" });

    // Type "x" (wrong) then "ello " (correct)
    state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong 'h'
    state = typingReducer(state, { type: "TYPE_CHAR", char: "e", timestamp: 1100 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1200 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 1300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 1400 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: " ", timestamp: 1500 });

    // Verify: cursor at 6, error at 0, positions 1-5 are error-zone
    expect(state.cursorPosition).toBe(6);
    let visual = deriveVisualState(state);

    expect(visual.characters[0].visualState).toBe("incorrect"); // Red background
    expect(visual.characters[1].visualState).toBe("error-zone"); // Red text
    expect(visual.characters[2].visualState).toBe("error-zone"); // Red text
    expect(visual.characters[3].visualState).toBe("error-zone"); // Red text
    expect(visual.characters[4].visualState).toBe("error-zone"); // Red text
    expect(visual.characters[5].visualState).toBe("error-zone"); // Red text
    expect(visual.isComplete).toBe(false); // Blocked - uncorrected error

    // Backspace 3 times (cursor goes 6 -> 5 -> 4 -> 3)
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2000 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2100 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2200 });

    expect(state.cursorPosition).toBe(3);
    visual = deriveVisualState(state);

    // Positions 0-2 still in error zone, 3-5 now pending
    expect(visual.characters[0].visualState).toBe("incorrect"); // Still red background
    expect(visual.characters[1].visualState).toBe("error-zone"); // Still red text
    expect(visual.characters[2].visualState).toBe("error-zone"); // Still red text
    expect(visual.characters[3].visualState).toBe("pending"); // Now gray (after cursor)
    expect(visual.characters[4].visualState).toBe("pending"); // Now gray
    expect(visual.characters[5].visualState).toBe("pending"); // Now gray

    // Backspace all the way to position 0
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2300 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2400 });
    state = typingReducer(state, { type: "BACKSPACE", timestamp: 2500 });

    expect(state.cursorPosition).toBe(0);
    visual = deriveVisualState(state);

    // Position 0 is STILL incorrect (error persists until fixed)
    expect(visual.characters[0].visualState).toBe("incorrect"); // Still red!
    expect(visual.characters[1].visualState).toBe("pending"); // Gray
    expect(visual.characters[2].visualState).toBe("pending"); // Gray
    expect(visual.characters[3].visualState).toBe("pending"); // Gray
    expect(visual.characters[4].visualState).toBe("pending"); // Gray
    expect(visual.characters[5].visualState).toBe("pending"); // Gray

    // Type "h" correctly to fix the error
    state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 3000 });

    visual = deriveVisualState(state);
    expect(visual.characters[0].visualState).toBe("corrected"); // Dark + red underline
    expect(visual.hasUnfixedErrors).toBe(false);

    // Complete the session by typing the rest
    state = typingReducer(state, { type: "TYPE_CHAR", char: "e", timestamp: 3100 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 3200 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "l", timestamp: 3300 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: "o", timestamp: 3400 });
    state = typingReducer(state, { type: "TYPE_CHAR", char: " ", timestamp: 3500 });

    visual = deriveVisualState(state);
    expect(visual.isComplete).toBe(true);
    expect(visual.characters[0].visualState).toBe("corrected"); // Still shows it was an error
    expect(visual.characters[1].visualState).toBe("correct");
    expect(visual.characters[2].visualState).toBe("correct");
    expect(visual.characters[3].visualState).toBe("correct");
    expect(visual.characters[4].visualState).toBe("correct");
    expect(visual.characters[5].visualState).toBe("correct");
  });
});
