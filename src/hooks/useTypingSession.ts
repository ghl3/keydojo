"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  TypingSession,
  TypedCharacter,
  SessionMode,
  SessionResult,
  LiveStats,
  CharCategory,
} from "@/types";
import { calculateCategoryBreakdown } from "@/lib/stats/calculator";
import {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
} from "@/lib/stats/classifier";

// If user doesn't type for this long, stop counting time
const IDLE_THRESHOLD_MS = 2000;

interface UseTypingSessionOptions {
  text: string;
  mode: SessionMode;
  onComplete?: (result: SessionResult) => void;
  stopOnError?: boolean;
  newlineMode?: "required" | "optional";
  backspaceMode?: "disabled" | "errors-only" | "full";
}

function createInitialSession(text: string, mode: SessionMode): TypingSession {
  const typedCharacters: TypedCharacter[] = text.split("").map((char) => ({
    char,
    state: "pending",
    attempts: 0,
  }));

  return {
    id: crypto.randomUUID(),
    startedAt: 0,
    text,
    typedCharacters,
    currentIndex: 0,
    mode,
    isPaused: false,
    isComplete: false,
    wordBoundaries: findWordBoundaries(text),
    sentenceBoundaries: findSentenceBoundaries(text),
    paragraphBoundaries: findParagraphBoundaries(text),
    currentWordHasError: false,
    currentSentenceHasError: false,
    currentParagraphHasError: false,
    wordsWithErrors: 0,
    sentencesWithErrors: 0,
    paragraphsWithErrors: 0,
  };
}

// Calculate WPM based on active typing time
function calculateGrossWPM(charactersTyped: number, activeTimeMs: number): number {
  const minutes = activeTimeMs / 60000;
  const words = charactersTyped / 5;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

// Calculate accuracy
function calculateAccuracy(correctCount: number, totalAttempts: number): number {
  return totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
}

export function useTypingSession({
  text,
  mode,
  onComplete,
  stopOnError = false,
  newlineMode = "optional",
  backspaceMode = "full",
}: UseTypingSessionOptions) {
  const [session, setSession] = useState<TypingSession>(() =>
    createInitialSession(text, mode)
  );
  const [liveStats, setLiveStats] = useState<LiveStats>({
    elapsedTime: 0,
    currentWPM: 0,
    currentAccuracy: 100,
    charactersTyped: 0,
    mistakeCount: 0,
    progress: 0,
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const mistakesByKey = useRef<Record<string, number>>({});
  const mistakesByPair = useRef<Record<string, number>>({});

  // Active typing time tracking
  const activeTypingTimeRef = useRef<number>(0);
  const lastKeystrokeTimeRef = useRef<number>(0);

  // Timeout refs for proper cleanup
  const activeKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to always have access to the latest session in callbacks
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (activeKeyTimeoutRef.current) {
        clearTimeout(activeKeyTimeoutRef.current);
      }
      if (errorKeyTimeoutRef.current) {
        clearTimeout(errorKeyTimeoutRef.current);
      }
    };
  }, []);

  // Update next key
  useEffect(() => {
    if (!session.isComplete && session.currentIndex < session.text.length) {
      setNextKey(session.text[session.currentIndex]);
    } else {
      setNextKey(null);
    }
  }, [session.currentIndex, session.text, session.isComplete]);

  // Update live stats periodically (only for display, not for WPM calculation)
  useEffect(() => {
    if (!session.startedAt || session.isComplete) return;

    const interval = setInterval(() => {
      const currentSession = sessionRef.current;
      const typedCount = currentSession.currentIndex;

      let correctCount = 0;
      let mistakeCount = 0;
      let totalAttempts = 0;

      for (let i = 0; i < currentSession.currentIndex; i++) {
        const char = currentSession.typedCharacters[i];
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

      setLiveStats({
        elapsedTime: activeTypingTimeRef.current,
        currentWPM: calculateGrossWPM(typedCount, activeTypingTimeRef.current),
        currentAccuracy: calculateAccuracy(correctCount, totalAttempts),
        charactersTyped: typedCount,
        mistakeCount,
        progress: currentSession.text.length > 0
          ? (typedCount / currentSession.text.length) * 100
          : 0,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [session.startedAt, session.isComplete]);

  // Reset when text changes
  useEffect(() => {
    setSession(createInitialSession(text, mode));
    mistakesByKey.current = {};
    mistakesByPair.current = {};
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    setLiveStats({
      elapsedTime: 0,
      currentWPM: 0,
      currentAccuracy: 100,
      charactersTyped: 0,
      mistakeCount: 0,
      progress: 0,
    });
  }, [text, mode]);

  // Helper to set active key with proper timeout management
  const setActiveKeyWithTimeout = useCallback((key: string) => {
    if (activeKeyTimeoutRef.current) {
      clearTimeout(activeKeyTimeoutRef.current);
    }
    setActiveKey(key);
    activeKeyTimeoutRef.current = setTimeout(() => {
      setActiveKey(null);
    }, 150);
  }, []);

  // Helper to set error key with proper timeout management
  const setErrorKeyWithTimeout = useCallback((key: string) => {
    if (errorKeyTimeoutRef.current) {
      clearTimeout(errorKeyTimeoutRef.current);
    }
    setErrorKey(key);
    errorKeyTimeoutRef.current = setTimeout(() => {
      setErrorKey(null);
    }, 200);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ignore modifier keys alone
      if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
        return;
      }

      // Handle escape to reset
      if (e.key === "Escape") {
        setSession(createInitialSession(text, mode));
        mistakesByKey.current = {};
    mistakesByPair.current = {};
        activeTypingTimeRef.current = 0;
        lastKeystrokeTimeRef.current = 0;
        return;
      }

      // Use ref to get latest session state (avoids stale closure)
      const currentSession = sessionRef.current;

      // Ignore if complete
      if (currentSession.isComplete) return;

      const now = Date.now();

      // Update active typing time
      if (lastKeystrokeTimeRef.current > 0) {
        const gap = now - lastKeystrokeTimeRef.current;
        // Only count time if gap is less than idle threshold
        if (gap < IDLE_THRESHOLD_MS) {
          activeTypingTimeRef.current += gap;
        }
      }
      lastKeystrokeTimeRef.current = now;

      // Start session on first keystroke
      if (!currentSession.startedAt) {
        setSession((prev) => ({
          ...prev,
          startedAt: now,
        }));
      }

      const { currentIndex } = currentSession;
      const expectedChar = currentSession.text[currentIndex];

      // Handle backspace
      if (e.key === "Backspace") {
        // Check if backspace is allowed based on mode
        if (backspaceMode === "disabled") {
          // Backspace completely disabled
          return;
        }

        if (currentIndex > 0) {
          const prevCharState = currentSession.typedCharacters[currentIndex - 1].state;

          // In "errors-only" mode, only allow backspace if there's an error to fix
          if (backspaceMode === "errors-only") {
            // Can only backspace if previous char was incorrect OR current position has an error
            const currentCharState = currentSession.typedCharacters[currentIndex]?.state;
            const hasErrorToFix = prevCharState === "incorrect" || currentCharState === "incorrect";
            if (!hasErrorToFix) {
              // No error to fix, don't allow backspace
              return;
            }
          }

          setSession((prev) => {
            const newTypedCharacters = [...prev.typedCharacters];
            newTypedCharacters[currentIndex - 1] = {
              ...newTypedCharacters[currentIndex - 1],
              state: "pending",
            };
            return {
              ...prev,
              currentIndex: currentIndex - 1,
              typedCharacters: newTypedCharacters,
            };
          });
        }
        setActiveKeyWithTimeout("Backspace");
        return;
      }

      // Only process single character keys (and Enter for newlines)
      if (e.key.length !== 1 && e.key !== "Enter") return;

      setActiveKeyWithTimeout(e.key);

      // Handle optional newlines (skippable by typing the next character)
      // Only allow skipping when newlineMode is "optional"
      // If expected is newline but user typed the character after it, skip the newline
      if (newlineMode === "optional" && expectedChar === "\n" && e.key !== "\n") {
        const nextChar = currentSession.text[currentIndex + 1];
        if (nextChar && e.key === nextChar) {
          // Skip the newline and process the typed character
          setErrorKey(null);
          setSession((prev) => {
            const newTypedCharacters = [...prev.typedCharacters];

            // Mark newline as skipped (correct without typing)
            newTypedCharacters[currentIndex] = {
              ...newTypedCharacters[currentIndex],
              state: "correct",
              typedAt: now,
              attempts: 1,
            };

            // Mark the actual typed character as correct
            newTypedCharacters[currentIndex + 1] = {
              ...newTypedCharacters[currentIndex + 1],
              state: "correct",
              typedAt: now,
              attempts: 1,
            };

            const newIndex = currentIndex + 2;
            const isComplete = newIndex >= prev.text.length;

            // Check boundaries for both skipped newline and typed char
            let { wordsWithErrors, sentencesWithErrors, paragraphsWithErrors } = prev;
            let { currentWordHasError, currentSentenceHasError, currentParagraphHasError } = prev;

            // Check boundaries at newIndex
            if (prev.wordBoundaries.includes(newIndex) || isComplete) {
              if (currentWordHasError) wordsWithErrors++;
              currentWordHasError = false;
            }
            if (prev.sentenceBoundaries.includes(newIndex) || isComplete) {
              if (currentSentenceHasError) sentencesWithErrors++;
              currentSentenceHasError = false;
            }
            if (prev.paragraphBoundaries.includes(newIndex) || isComplete) {
              if (currentParagraphHasError) paragraphsWithErrors++;
              currentParagraphHasError = false;
            }

            return {
              ...prev,
              currentIndex: newIndex,
              typedCharacters: newTypedCharacters,
              isComplete,
              endedAt: isComplete ? now : undefined,
              wordsWithErrors,
              sentencesWithErrors,
              paragraphsWithErrors,
              currentWordHasError,
              currentSentenceHasError,
              currentParagraphHasError,
            };
          });
          return;
        }
        // If typed char doesn't match next char, treat as wrong (they need to press Enter or the right char)
      }

      // Handle Enter key for newlines
      const typedChar = e.key === "Enter" ? "\n" : e.key;
      const isCorrect = typedChar === expectedChar;

      if (isCorrect) {
        setErrorKey(null);

        setSession((prev) => {
          const newTypedCharacters = [...prev.typedCharacters];
          const wasIncorrect = newTypedCharacters[currentIndex].state === "incorrect";

          newTypedCharacters[currentIndex] = {
            ...newTypedCharacters[currentIndex],
            state: wasIncorrect ? "corrected" : "correct",
            typedAt: now,
            attempts: newTypedCharacters[currentIndex].attempts + 1,
          };

          const newIndex = currentIndex + 1;
          const isComplete = newIndex >= prev.text.length;

          // Check for word/sentence/paragraph boundary crossings
          let { wordsWithErrors, sentencesWithErrors, paragraphsWithErrors } = prev;
          let { currentWordHasError, currentSentenceHasError, currentParagraphHasError } = prev;

          // Check if we crossed a word boundary
          if (prev.wordBoundaries.includes(newIndex) || isComplete) {
            if (currentWordHasError) {
              wordsWithErrors++;
            }
            currentWordHasError = false;
          }

          // Check if we crossed a sentence boundary
          if (prev.sentenceBoundaries.includes(newIndex) || isComplete) {
            if (currentSentenceHasError) {
              sentencesWithErrors++;
            }
            currentSentenceHasError = false;
          }

          // Check if we crossed a paragraph boundary
          if (prev.paragraphBoundaries.includes(newIndex) || isComplete) {
            if (currentParagraphHasError) {
              paragraphsWithErrors++;
            }
            currentParagraphHasError = false;
          }

          return {
            ...prev,
            currentIndex: newIndex,
            typedCharacters: newTypedCharacters,
            isComplete,
            endedAt: isComplete ? now : undefined,
            wordsWithErrors,
            sentencesWithErrors,
            paragraphsWithErrors,
            currentWordHasError,
            currentSentenceHasError,
            currentParagraphHasError,
          };
        });
      } else {
        // Wrong key
        setErrorKeyWithTimeout(e.key);

        // Track mistake for expected character
        mistakesByKey.current[expectedChar] = (mistakesByKey.current[expectedChar] || 0) + 1;

        // Track mistake for letter pair (previous char + expected char)
        if (currentIndex > 0) {
          const prevChar = currentSession.text[currentIndex - 1];
          const pair = prevChar + expectedChar;
          mistakesByPair.current[pair] = (mistakesByPair.current[pair] || 0) + 1;
        }

        setSession((prev) => {
          const newTypedCharacters = [...prev.typedCharacters];
          newTypedCharacters[currentIndex] = {
            ...newTypedCharacters[currentIndex],
            state: "incorrect",
            attempts: newTypedCharacters[currentIndex].attempts + 1,
          };

          // If stopOnError is true (default), don't advance cursor - user must backspace and fix
          // If stopOnError is false, advance past the error
          if (stopOnError) {
            return {
              ...prev,
              typedCharacters: newTypedCharacters,
              currentWordHasError: true,
              currentSentenceHasError: true,
              currentParagraphHasError: true,
            };
          }

          // Advance past the error (stopOnError is false)
          const newIndex = currentIndex + 1;
          const isComplete = newIndex >= prev.text.length;

          // Check for word/sentence/paragraph boundary crossings
          let { wordsWithErrors, sentencesWithErrors, paragraphsWithErrors } = prev;
          let currentWordHasError = true;
          let currentSentenceHasError = true;
          let currentParagraphHasError = true;

          // Check if we crossed a word boundary
          if (prev.wordBoundaries.includes(newIndex) || isComplete) {
            wordsWithErrors++;
            currentWordHasError = false;
          }

          // Check if we crossed a sentence boundary
          if (prev.sentenceBoundaries.includes(newIndex) || isComplete) {
            sentencesWithErrors++;
            currentSentenceHasError = false;
          }

          // Check if we crossed a paragraph boundary
          if (prev.paragraphBoundaries.includes(newIndex) || isComplete) {
            paragraphsWithErrors++;
            currentParagraphHasError = false;
          }

          return {
            ...prev,
            currentIndex: newIndex,
            typedCharacters: newTypedCharacters,
            isComplete,
            endedAt: isComplete ? now : undefined,
            wordsWithErrors,
            sentencesWithErrors,
            paragraphsWithErrors,
            currentWordHasError,
            currentSentenceHasError,
            currentParagraphHasError,
          };
        });
      }
    },
    [text, mode, stopOnError, newlineMode, backspaceMode, setActiveKeyWithTimeout, setErrorKeyWithTimeout]
  );

  const handleKeyUp = useCallback(() => {
    // Don't clear immediately - let the timeout handle it
  }, []);

  // Build session result when complete
  useEffect(() => {
    if (session.isComplete && onComplete && session.endedAt) {
      // Use active typing time for duration
      const duration = activeTypingTimeRef.current;

      // Calculate totals
      let totalMistakes = 0;
      let totalAttempts = 0;

      for (const char of session.typedCharacters) {
        totalAttempts += char.attempts;
        if (char.state === "corrected") {
          // Character was typed wrong at least once before getting it right
          totalMistakes += char.attempts - 1;
        }
      }

      const categoryBreakdown = calculateCategoryBreakdown(
        session.text,
        session.typedCharacters,
        duration
      );

      const wordsTyped = session.wordBoundaries.length;
      const sentencesTyped = session.sentenceBoundaries.length;
      const paragraphsTyped = session.paragraphBoundaries.length;

      const result: SessionResult = {
        id: session.id,
        timestamp: session.endedAt,
        duration,
        mode: session.mode,
        grossWPM: Math.round((session.text.length / 5) / (duration / 60000)),
        netWPM: Math.round(
          ((session.text.length / 5) - totalMistakes) / (duration / 60000)
        ),
        accuracy: totalAttempts > 0
          ? Math.round(((totalAttempts - totalMistakes) / totalAttempts) * 100)
          : 100,
        totalCharacters: session.text.length,
        totalMistakes,
        categoryBreakdown,
        mistakesByKey: { ...mistakesByKey.current },
        mistakesByPair: { ...mistakesByPair.current },
        wordsTyped,
        wordsWithErrors: session.wordsWithErrors,
        errorsPerWord:
          wordsTyped > 0
            ? Math.round((session.wordsWithErrors / wordsTyped) * 100) / 100
            : 0,
        sentencesTyped,
        sentencesWithErrors: session.sentencesWithErrors,
        errorsPerSentence:
          sentencesTyped > 0
            ? Math.round((session.sentencesWithErrors / sentencesTyped) * 100) / 100
            : 0,
        paragraphsTyped,
        paragraphsWithErrors: session.paragraphsWithErrors,
        errorsPerParagraph:
          paragraphsTyped > 0
            ? Math.round((session.paragraphsWithErrors / paragraphsTyped) * 100) / 100
            : 0,
      };

      onComplete(result);
    }
  }, [session.isComplete, session.endedAt, onComplete, session]);

  const reset = useCallback(() => {
    setSession(createInitialSession(text, mode));
    mistakesByKey.current = {};
    mistakesByPair.current = {};
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    setLiveStats({
      elapsedTime: 0,
      currentWPM: 0,
      currentAccuracy: 100,
      charactersTyped: 0,
      mistakeCount: 0,
      progress: 0,
    });
    setActiveKey(null);
    setNextKey(text[0] || null);
    setErrorKey(null);
  }, [text, mode]);

  return {
    session,
    liveStats,
    activeKey,
    nextKey,
    errorKey,
    handleKeyDown,
    handleKeyUp,
    reset,
  };
}
