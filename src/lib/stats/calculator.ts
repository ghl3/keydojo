import type { LiveStats, CharCategory } from "./types";
import type { TypingSession } from "@/lib/session";
import { classifyChar } from "./classifier";

// Standard WPM calculation (5 characters = 1 word)
export function calculateGrossWPM(
  charactersTyped: number,
  elapsedTimeMs: number
): number {
  const minutes = elapsedTimeMs / 60000;
  const words = charactersTyped / 5;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

// Net WPM accounting for errors
export function calculateNetWPM(
  charactersTyped: number,
  errors: number,
  elapsedTimeMs: number
): number {
  const minutes = elapsedTimeMs / 60000;
  const grossWPM = calculateGrossWPM(charactersTyped, elapsedTimeMs);
  const errorPenalty = minutes > 0 ? errors / minutes : 0;
  return Math.max(0, Math.round(grossWPM - errorPenalty));
}

// Accuracy as percentage (floor to reserve 100% for perfect runs)
export function calculateAccuracy(
  correctCharacters: number,
  totalAttempts: number
): number {
  return totalAttempts > 0
    ? Math.floor((correctCharacters / totalAttempts) * 100)
    : 100;
}

// Calculate category-specific WPM
export function calculateCategoryWPM(
  categoryChars: number,
  elapsedTimeMs: number
): number {
  // For category-specific WPM, we still use 5 chars per word
  return calculateGrossWPM(categoryChars, elapsedTimeMs);
}

// Live stats calculation during session
export function calculateLiveStats(session: TypingSession): LiveStats {
  if (!session.startedAt) {
    return {
      elapsedTime: 0,
      currentWPM: 0,
      currentAccuracy: 100,
      charactersTyped: 0,
      mistakeCount: 0,
      progress: 0,
    };
  }

  const elapsedTime = Date.now() - session.startedAt;
  const typedCount = session.currentIndex;

  let correctCount = 0;
  let mistakeCount = 0;
  let totalAttempts = 0;

  for (let i = 0; i < session.currentIndex; i++) {
    const char = session.typedCharacters[i];
    totalAttempts += char.attempts;
    if (char.state === "correct") {
      correctCount++;
    } else if (char.state === "incorrect") {
      mistakeCount++;
    } else if (char.state === "corrected") {
      correctCount++;
      mistakeCount += char.attempts - 1;
    }
  }

  return {
    elapsedTime,
    currentWPM: calculateGrossWPM(typedCount, elapsedTime),
    currentAccuracy: calculateAccuracy(correctCount, totalAttempts),
    charactersTyped: typedCount,
    mistakeCount,
    progress: session.text.length > 0 ? (typedCount / session.text.length) * 100 : 0,
  };
}

// Calculate category breakdown for a completed session
export function calculateCategoryBreakdown(
  text: string,
  typedCharacters: { state: string; attempts: number }[],
  elapsedTimeMs: number
): Record<CharCategory, { attempts: number; mistakes: number; wpm: number }> {
  const breakdown: Record<
    CharCategory,
    { attempts: number; mistakes: number; chars: number }
  > = {
    lowercase: { attempts: 0, mistakes: 0, chars: 0 },
    uppercase: { attempts: 0, mistakes: 0, chars: 0 },
    number: { attempts: 0, mistakes: 0, chars: 0 },
    punctuation: { attempts: 0, mistakes: 0, chars: 0 },
    space: { attempts: 0, mistakes: 0, chars: 0 },
  };

  for (let i = 0; i < text.length && i < typedCharacters.length; i++) {
    const category = classifyChar(text[i]);
    const typed = typedCharacters[i];

    breakdown[category].chars++;
    breakdown[category].attempts += typed.attempts;
    // Count mistakes consistently: only "corrected" chars have mistakes, and mistakes = attempts - 1
    if (typed.state === "corrected") {
      breakdown[category].mistakes += typed.attempts - 1;
    }
  }

  // Calculate WPM per category (proportional time based on character count)
  const totalChars = text.length;
  const result: Record<
    CharCategory,
    { attempts: number; mistakes: number; wpm: number }
  > = {
    lowercase: { attempts: 0, mistakes: 0, wpm: 0 },
    uppercase: { attempts: 0, mistakes: 0, wpm: 0 },
    number: { attempts: 0, mistakes: 0, wpm: 0 },
    punctuation: { attempts: 0, mistakes: 0, wpm: 0 },
    space: { attempts: 0, mistakes: 0, wpm: 0 },
  };

  for (const category of Object.keys(breakdown) as CharCategory[]) {
    const data = breakdown[category];
    result[category].attempts = data.attempts;
    result[category].mistakes = data.mistakes;

    if (totalChars > 0 && data.chars > 0) {
      // Proportional time for this category
      const categoryTime = (data.chars / totalChars) * elapsedTimeMs;
      result[category].wpm = calculateGrossWPM(data.chars, categoryTime);
    }
  }

  return result;
}
