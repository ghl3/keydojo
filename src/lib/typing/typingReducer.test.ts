import { describe, it, expect } from "vitest";
import { typingReducer, createInitialState } from "./typingReducer";
import type { TypingState, TypingAction, ErrorMode } from "./types";

// Helper to create initial state with a specific error mode
function createState(text: string, errorMode: ErrorMode): TypingState {
  return createInitialState({ text, errorMode });
}

// Helper to type a sequence of characters
function typeSequence(
  state: TypingState,
  chars: string,
  startTimestamp = 1000
): TypingState {
  let result = state;
  for (let i = 0; i < chars.length; i++) {
    result = typingReducer(result, {
      type: "TYPE_CHAR",
      char: chars[i],
      timestamp: startTimestamp + i * 100,
    });
  }
  return result;
}

// Helper to backspace n times
function backspaceN(
  state: TypingState,
  n: number,
  startTimestamp = 2000
): TypingState {
  let result = state;
  for (let i = 0; i < n; i++) {
    result = typingReducer(result, {
      type: "BACKSPACE",
      timestamp: startTimestamp + i * 100,
    });
  }
  return result;
}

describe("typingReducer", () => {
  describe("createInitialState", () => {
    it("creates initial state with pending characters", () => {
      const state = createState("hello", "stop-on-error");

      expect(state.text).toBe("hello");
      expect(state.cursorPosition).toBe(0);
      expect(state.status).toBe("idle");
      expect(state.characters.length).toBe(5);
      expect(state.characters.every((c) => c.state === "pending")).toBe(true);
      expect(state.characters.every((c) => c.attempts === 0)).toBe(true);
    });
  });

  describe("TYPE_CHAR action", () => {
    describe("correct keystroke", () => {
      it("advances cursor and marks character as correct", () => {
        const state = createState("hello", "stop-on-error");
        const newState = typingReducer(state, {
          type: "TYPE_CHAR",
          char: "h",
          timestamp: 1000,
        });

        expect(newState.cursorPosition).toBe(1);
        expect(newState.characters[0].state).toBe("correct");
        expect(newState.characters[0].attempts).toBe(1);
        expect(newState.status).toBe("active");
        expect(newState.startedAt).toBe(1000);
      });

      it("marks character as corrected if it was previously incorrect", () => {
        // Type wrong, then backspace, then type correct (correction-required mode)
        let state = createState("hello", "correction-required");
        state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
        expect(state.characters[0].state).toBe("incorrect");

        state = typingReducer(state, { type: "BACKSPACE", timestamp: 1100 });
        expect(state.characters[0].state).toBe("incorrect"); // Still incorrect
        expect(state.cursorPosition).toBe(0);

        state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1200 });
        expect(state.characters[0].state).toBe("corrected");
        expect(state.cursorPosition).toBe(1);
      });

      it("completes session when all characters typed correctly", () => {
        let state = createState("hi", "stop-on-error");
        state = typeSequence(state, "hi");

        expect(state.status).toBe("complete");
        expect(state.completedAt).not.toBeNull();
      });
    });

    describe("incorrect keystroke", () => {
      it("marks character as incorrect", () => {
        const state = createState("hello", "stop-on-error");
        const newState = typingReducer(state, {
          type: "TYPE_CHAR",
          char: "x",
          timestamp: 1000,
        });

        expect(newState.characters[0].state).toBe("incorrect");
        expect(newState.characters[0].attempts).toBe(1);
      });
    });
  });

  describe("stop-on-error mode", () => {
    it("does not advance cursor on incorrect keystroke", () => {
      let state = createState("hello", "stop-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });

      expect(state.cursorPosition).toBe(0);
      expect(state.characters[0].state).toBe("incorrect");
    });

    it("advances cursor when correct key is pressed after error", () => {
      let state = createState("hello", "stop-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
      expect(state.cursorPosition).toBe(0);

      state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1100 });
      expect(state.cursorPosition).toBe(1);
      // Note: In stop-on-error, typing correct after incorrect still marks as corrected
      expect(state.characters[0].state).toBe("corrected");
    });

    it("ignores backspace action", () => {
      let state = createState("hello", "stop-on-error");
      state = typeSequence(state, "he");
      const cursorBefore = state.cursorPosition;

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 2000 });
      expect(state.cursorPosition).toBe(cursorBefore);
    });

    it("cannot complete with incorrect characters (impossible to reach)", () => {
      // In stop-on-error, you can't advance past errors, so you can never
      // reach the end with errors. Let's verify partial completion blocking.
      let state = createState("hi", "stop-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
      // Can't advance, cursor still at 0
      expect(state.cursorPosition).toBe(0);
      expect(state.status).toBe("active");
    });
  });

  describe("advance-on-error mode", () => {
    it("advances cursor on incorrect keystroke", () => {
      let state = createState("hello", "advance-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });

      expect(state.cursorPosition).toBe(1);
      expect(state.characters[0].state).toBe("incorrect");
    });

    it("ignores backspace action", () => {
      let state = createState("hello", "advance-on-error");
      state = typeSequence(state, "he");
      const cursorBefore = state.cursorPosition;

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 2000 });
      expect(state.cursorPosition).toBe(cursorBefore);
    });

    it("can complete session even with errors", () => {
      let state = createState("hi", "advance-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong
      state = typingReducer(state, { type: "TYPE_CHAR", char: "i", timestamp: 1100 }); // correct

      expect(state.status).toBe("complete");
      expect(state.characters[0].state).toBe("incorrect");
      expect(state.characters[1].state).toBe("correct");
    });
  });

  describe("correction-required mode", () => {
    it("advances cursor on incorrect keystroke", () => {
      let state = createState("hello", "correction-required");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });

      expect(state.cursorPosition).toBe(1);
      expect(state.characters[0].state).toBe("incorrect");
    });

    it("allows backspace to move cursor back", () => {
      let state = createState("hello", "correction-required");
      state = typeSequence(state, "hel");
      expect(state.cursorPosition).toBe(3);

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 2000 });
      expect(state.cursorPosition).toBe(2);
    });

    it("resets correct character to pending on backspace", () => {
      let state = createState("hello", "correction-required");
      state = typeSequence(state, "he");
      expect(state.characters[1].state).toBe("correct");

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 2000 });
      expect(state.characters[1].state).toBe("pending");
    });

    it("keeps incorrect state when backspacing over error", () => {
      let state = createState("hello", "correction-required");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
      expect(state.characters[0].state).toBe("incorrect");
      expect(state.cursorPosition).toBe(1);

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 1100 });
      expect(state.characters[0].state).toBe("incorrect"); // Still incorrect!
      expect(state.cursorPosition).toBe(0);
    });

    it("cannot complete with uncorrected errors", () => {
      let state = createState("hi", "correction-required");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong
      state = typingReducer(state, { type: "TYPE_CHAR", char: "i", timestamp: 1100 }); // correct

      expect(state.status).toBe("active"); // Not complete!
      expect(state.cursorPosition).toBe(2);
    });

    it("can complete after fixing all errors", () => {
      let state = createState("hi", "correction-required");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 }); // wrong h
      state = typingReducer(state, { type: "TYPE_CHAR", char: "i", timestamp: 1100 }); // correct i
      expect(state.status).toBe("active");

      // Backspace twice
      state = backspaceN(state, 2);
      expect(state.cursorPosition).toBe(0);
      expect(state.characters[0].state).toBe("incorrect");
      expect(state.characters[1].state).toBe("pending");

      // Type correctly
      state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 3000 });
      expect(state.characters[0].state).toBe("corrected");

      state = typingReducer(state, { type: "TYPE_CHAR", char: "i", timestamp: 3100 });
      expect(state.status).toBe("complete");
    });

    it("cannot backspace at position 0", () => {
      let state = createState("hello", "correction-required");
      const before = { ...state };

      state = typingReducer(state, { type: "BACKSPACE", timestamp: 1000 });
      expect(state.cursorPosition).toBe(0);
    });

    it("cannot backspace when complete", () => {
      let state = createState("hi", "correction-required");
      state = typeSequence(state, "hi");
      expect(state.status).toBe("complete");

      const cursorBefore = state.cursorPosition;
      state = typingReducer(state, { type: "BACKSPACE", timestamp: 3000 });
      expect(state.cursorPosition).toBe(cursorBefore);
    });
  });

  describe("RESET action", () => {
    it("resets state to initial", () => {
      let state = createState("hello", "correction-required");
      state = typeSequence(state, "hel");

      state = typingReducer(state, { type: "RESET" });

      expect(state.cursorPosition).toBe(0);
      expect(state.status).toBe("idle");
      expect(state.startedAt).toBeNull();
      expect(state.characters.every((c) => c.state === "pending")).toBe(true);
    });

    it("can reset with new text", () => {
      let state = createState("hello", "correction-required");
      state = typeSequence(state, "hel");

      state = typingReducer(state, { type: "RESET", text: "world" });

      expect(state.text).toBe("world");
      expect(state.characters.length).toBe(5);
      expect(state.cursorPosition).toBe(0);
    });

    it("preserves error mode on reset", () => {
      let state = createState("hello", "correction-required");
      state = typingReducer(state, { type: "RESET" });

      expect(state.errorMode).toBe("correction-required");
    });
  });

  describe("edge cases", () => {
    it("handles empty text", () => {
      const state = createState("", "stop-on-error");
      expect(state.characters.length).toBe(0);
      expect(state.status).toBe("idle");
    });

    it("cannot type past end of text", () => {
      let state = createState("a", "stop-on-error");
      state = typeSequence(state, "a");
      expect(state.status).toBe("complete");

      // Try to type more
      const newState = typingReducer(state, {
        type: "TYPE_CHAR",
        char: "x",
        timestamp: 3000,
      });
      expect(newState.cursorPosition).toBe(1);
      expect(newState.status).toBe("complete");
    });

    it("handles special characters", () => {
      let state = createState("a b", "stop-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "a", timestamp: 1000 });
      state = typingReducer(state, { type: "TYPE_CHAR", char: " ", timestamp: 1100 });
      state = typingReducer(state, { type: "TYPE_CHAR", char: "b", timestamp: 1200 });

      expect(state.status).toBe("complete");
    });

    it("records timestamp on character", () => {
      let state = createState("ab", "stop-on-error");
      state = typingReducer(state, { type: "TYPE_CHAR", char: "a", timestamp: 12345 });

      expect(state.characters[0].typedAt).toBe(12345);
    });

    it("increments attempts counter on each keystroke", () => {
      let state = createState("hello", "stop-on-error");
      // Type wrong 3 times
      state = typingReducer(state, { type: "TYPE_CHAR", char: "x", timestamp: 1000 });
      state = typingReducer(state, { type: "TYPE_CHAR", char: "y", timestamp: 1100 });
      state = typingReducer(state, { type: "TYPE_CHAR", char: "z", timestamp: 1200 });
      // Type correct
      state = typingReducer(state, { type: "TYPE_CHAR", char: "h", timestamp: 1300 });

      expect(state.characters[0].attempts).toBe(4);
      expect(state.characters[0].state).toBe("corrected");
    });
  });
});
