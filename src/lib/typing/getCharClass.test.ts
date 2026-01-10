import { describe, it, expect } from "vitest";
import { getCharClass, findFirstErrorIndex } from "./getCharClass";
import type { TypedCharacter } from "@/types/session";
import type { ErrorMode } from "@/types/settings";

// Helper to create a typed character
function createChar(
  char: string,
  state: TypedCharacter["state"],
  attempts = 1
): TypedCharacter {
  return { char, state, attempts };
}

// Helper to create an array of typed characters from a simple spec
// e.g., "ppp" = 3 pending, "ccc" = 3 correct, "i" = incorrect, "x" = corrected
function createChars(spec: string): TypedCharacter[] {
  return spec.split("").map((s, i) => {
    switch (s) {
      case "p":
        return createChar(String.fromCharCode(97 + i), "pending", 0);
      case "c":
        return createChar(String.fromCharCode(97 + i), "correct");
      case "i":
        return createChar(String.fromCharCode(97 + i), "incorrect");
      case "x":
        return createChar(String.fromCharCode(97 + i), "corrected");
      default:
        return createChar(String.fromCharCode(97 + i), "pending", 0);
    }
  });
}

describe("getCharClass", () => {
  describe("basic states", () => {
    it("returns char-pending for untyped characters", () => {
      const chars = createChars("ppppp");
      expect(getCharClass(0, chars, 0, "stop-on-error", -1)).toBe("char-pending");
      expect(getCharClass(2, chars, 0, "stop-on-error", -1)).toBe("char-pending");
    });

    it("returns char-correct for correctly typed characters", () => {
      const chars = createChars("cccpp");
      expect(getCharClass(0, chars, 3, "stop-on-error", -1)).toBe("char-correct");
      expect(getCharClass(2, chars, 3, "stop-on-error", -1)).toBe("char-correct");
    });

    it("returns char-incorrect for incorrectly typed characters", () => {
      const chars = createChars("ccipp");
      expect(getCharClass(2, chars, 3, "stop-on-error", -1)).toBe("char-incorrect");
    });

    it("returns char-corrected for corrected characters", () => {
      const chars = createChars("cxcpp");
      expect(getCharClass(1, chars, 3, "stop-on-error", -1)).toBe("char-corrected");
    });

    it("returns char-pending for undefined character", () => {
      const chars = createChars("ccc");
      expect(getCharClass(5, chars, 3, "stop-on-error", -1)).toBe("char-pending");
    });
  });

  describe("error zone in correction-required mode", () => {
    it("returns char-error-zone for correct chars after error and before cursor", () => {
      // Text: "hello", typed "hxllo" (error at index 1), cursor at 5
      // Chars: c i c c c
      const chars = createChars("ciccc");
      const firstError = 1;
      const cursor = 5;

      // Index 0 (before error) - should be correct
      expect(getCharClass(0, chars, cursor, "correction-required", firstError)).toBe(
        "char-correct"
      );

      // Index 1 (the error) - should be incorrect
      expect(getCharClass(1, chars, cursor, "correction-required", firstError)).toBe(
        "char-incorrect"
      );

      // Index 2, 3, 4 (after error, before cursor) - should be error-zone
      expect(getCharClass(2, chars, cursor, "correction-required", firstError)).toBe(
        "char-error-zone"
      );
      expect(getCharClass(3, chars, cursor, "correction-required", firstError)).toBe(
        "char-error-zone"
      );
      expect(getCharClass(4, chars, cursor, "correction-required", firstError)).toBe(
        "char-error-zone"
      );
    });

    it("returns char-pending for chars after cursor (not in error zone)", () => {
      // User typed "hxll", then backspaced to "hxl"
      // Chars: c i c c p (last one reset to pending by backspace)
      // Actually when you backspace, the char at cursor-1 becomes pending
      // So if cursor is at 3, chars 3+ should be pending
      const chars = createChars("cicpp");
      const firstError = 1;
      const cursor = 3;

      // Index 3 (pending, at cursor) - should be pending
      expect(getCharClass(3, chars, cursor, "correction-required", firstError)).toBe(
        "char-pending"
      );

      // Index 4 (pending, after cursor) - should be pending
      expect(getCharClass(4, chars, cursor, "correction-required", firstError)).toBe(
        "char-pending"
      );
    });

    it("returns char-correct for correct chars after error is fixed", () => {
      // User fixed the error: "hello" all correct, char at 1 is "corrected"
      // Chars: c x c c c (no uncorrected errors, firstError = -1)
      const chars = createChars("cxccc");
      const firstError = -1; // No uncorrected errors

      expect(getCharClass(2, chars, 5, "correction-required", firstError)).toBe(
        "char-correct"
      );
      expect(getCharClass(3, chars, 5, "correction-required", firstError)).toBe(
        "char-correct"
      );
    });

    it("returns char-pending when no error exists", () => {
      const chars = createChars("cccpp");
      expect(getCharClass(3, chars, 3, "correction-required", -1)).toBe("char-pending");
    });

    it("ignores error zone logic in stop-on-error mode", () => {
      // Even with an error, correct chars should show as correct in stop-on-error
      const chars = createChars("ciccc");
      const firstError = 1;

      // In stop-on-error, you can't actually get past the error, but if somehow
      // there were correct chars after, they should show as correct not error-zone
      expect(getCharClass(2, chars, 5, "stop-on-error", firstError)).toBe("char-correct");
      expect(getCharClass(3, chars, 5, "stop-on-error", firstError)).toBe("char-correct");
    });

    it("ignores error zone logic in advance-on-error mode", () => {
      // In advance-on-error, errors are marked but you keep going, no fixing
      const chars = createChars("ciccc");
      const firstError = 1;

      expect(getCharClass(2, chars, 5, "advance-on-error", firstError)).toBe("char-correct");
      expect(getCharClass(3, chars, 5, "advance-on-error", firstError)).toBe("char-correct");
    });
  });

  describe("backspace transitions (simulated)", () => {
    it("char becomes pending when backspaced over", () => {
      // Simulate: typed "hello", then backspaced to "hell"
      // Before backspace: c c c c c, cursor at 5
      // After backspace: c c c c p, cursor at 4
      const chars = createChars("ccccp");

      expect(getCharClass(4, chars, 4, "correction-required", -1)).toBe("char-pending");
    });

    it("error zone shrinks when backspacing", () => {
      // Before: "hxllo" cursor at 5, error at 1
      // After 2 backspaces: "hxl" cursor at 3, chars 3,4 are pending
      const chars = createChars("cicpp");
      const firstError = 1;

      // Index 2 is still in error zone (correct, after error, before cursor)
      expect(getCharClass(2, chars, 3, "correction-required", firstError)).toBe(
        "char-error-zone"
      );

      // Index 3 and 4 are pending (after cursor)
      expect(getCharClass(3, chars, 3, "correction-required", firstError)).toBe(
        "char-pending"
      );
      expect(getCharClass(4, chars, 3, "correction-required", firstError)).toBe(
        "char-pending"
      );
    });

    it("incorrect state persists when backspacing over error", () => {
      // When you backspace over the error itself, it stays incorrect
      // because we need to track that it was an error
      const chars = createChars("cipp"); // Error at 1, cursor at 2
      const firstError = 1;

      expect(getCharClass(1, chars, 2, "correction-required", firstError)).toBe(
        "char-incorrect"
      );
    });

    it("error zone disappears completely when all chars after error are cleared", () => {
      // Backspaced all the way to just past the error
      // "hx" - cursor at 2, error at 1, no error zone chars remain
      const chars = createChars("cippp");
      const firstError = 1;

      // No chars are in error zone (index 2+ are pending, not correct)
      expect(getCharClass(2, chars, 2, "correction-required", firstError)).toBe(
        "char-pending"
      );
    });
  });
});

describe("findFirstErrorIndex", () => {
  it("returns -1 when no errors exist", () => {
    const chars = createChars("ccccc");
    expect(findFirstErrorIndex(chars, "correction-required")).toBe(-1);
  });

  it("returns index of first incorrect character", () => {
    const chars = createChars("cciccc");
    expect(findFirstErrorIndex(chars, "correction-required")).toBe(2);
  });

  it("returns index of first error when multiple errors exist", () => {
    const chars = createChars("cicici");
    expect(findFirstErrorIndex(chars, "correction-required")).toBe(1);
  });

  it("ignores corrected characters (only finds incorrect)", () => {
    const chars = createChars("cxcic");
    expect(findFirstErrorIndex(chars, "correction-required")).toBe(3);
  });

  it("returns -1 for non-correction-required modes", () => {
    const chars = createChars("cciccc");
    expect(findFirstErrorIndex(chars, "stop-on-error")).toBe(-1);
    expect(findFirstErrorIndex(chars, "advance-on-error")).toBe(-1);
  });
});
