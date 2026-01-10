import type { TypedCharacter } from "@/types/session";
import type { ErrorMode } from "@/types/settings";

/**
 * Determines the CSS class for a character in the typing area based on its state
 * and position relative to errors and cursor.
 *
 * @param charIndex - Index of the character in the text
 * @param typedCharacters - Array of typed character states
 * @param currentIndex - Current cursor position
 * @param errorMode - Current error mode setting
 * @param firstErrorIndex - Index of the first uncorrected error (-1 if none)
 * @returns CSS class name for the character
 */
export function getCharClass(
  charIndex: number,
  typedCharacters: TypedCharacter[],
  currentIndex: number,
  errorMode: ErrorMode,
  firstErrorIndex: number
): string {
  const typedChar = typedCharacters[charIndex];

  // Not yet typed
  if (!typedChar || typedChar.state === "pending") {
    return "char-pending";
  }

  // Corrected errors always show with red underline
  if (typedChar.state === "corrected") {
    return "char-corrected";
  }

  // Incorrect characters always show with red background
  if (typedChar.state === "incorrect") {
    return "char-incorrect";
  }

  // Correct characters - check if they're in an error zone (correction-required mode only)
  if (typedChar.state === "correct") {
    // In error zone: there's an uncorrected error before this character
    // AND this character is before the cursor (has been typed)
    if (
      errorMode === "correction-required" &&
      firstErrorIndex !== -1 &&
      charIndex > firstErrorIndex &&
      charIndex < currentIndex
    ) {
      return "char-error-zone";
    }
    return "char-correct";
  }

  return "char-pending";
}

/**
 * Finds the index of the first uncorrected error in the typed characters.
 *
 * @param typedCharacters - Array of typed character states
 * @param errorMode - Current error mode setting
 * @returns Index of first error, or -1 if no errors
 */
export function findFirstErrorIndex(
  typedCharacters: TypedCharacter[],
  errorMode: ErrorMode
): number {
  if (errorMode !== "correction-required") {
    return -1;
  }
  return typedCharacters.findIndex((char) => char.state === "incorrect");
}
