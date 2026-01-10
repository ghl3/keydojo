"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  TypingSession,
  TypedCharacter,
  SessionMode,
  SessionResult,
  LiveStats,
  CharCategory,
  ErrorMode,
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
  errorMode?: ErrorMode;
  newlineMode?: "required" | "optional";
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

export function useTypingSession({
  text,
  mode,
  onComplete,
  errorMode = "stop-on-error",
  newlineMode = "optional",
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

      // Count mistakes: each corrected or incorrect position counts as ONE mistake
      let mistakeCount = 0;

      for (let i = 0; i < currentSession.currentIndex; i++) {
        const char = currentSession.typedCharacters[i];
        if (char.state === "incorrect" || char.state === "corrected") {
          mistakeCount++;
        }
      }

      // Accuracy based on characters, not attempts
      const currentAccuracy = typedCount > 0
        ? Math.floor(((typedCount - mistakeCount) / typedCount) * 100)
        : 100;

      setLiveStats({
        elapsedTime: activeTypingTimeRef.current,
        currentWPM: calculateGrossWPM(typedCount, activeTypingTimeRef.current),
        currentAccuracy,
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
        // Backspace behavior depends on error mode:
        // - stop-on-error: disabled (can't advance past errors anyway)
        // - advance-on-error: disabled (no corrections allowed)
        // - correction-required: enabled (must fix errors to complete)
        if (errorMode !== "correction-required") {
          return;
        }

        // Use prev.currentIndex inside setSession to avoid stale closure issues
        setSession((prev) => {
          if (prev.currentIndex === 0) return prev;

          const newTypedCharacters = [...prev.typedCharacters];
          const prevChar = newTypedCharacters[prev.currentIndex - 1];
          // Keep "incorrect" state so we know there was an error to fix
          // Only reset to "pending" if it was correct/corrected
          if (prevChar.state !== "incorrect") {
            newTypedCharacters[prev.currentIndex - 1] = {
              ...prevChar,
              state: "pending",
            };
          }
          return {
            ...prev,
            currentIndex: prev.currentIndex - 1,
            typedCharacters: newTypedCharacters,
          };
        });
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

          // For correction-required mode, can only complete if no uncorrected errors remain
          const hasUncorrectedErrors = errorMode === "correction-required" &&
            newTypedCharacters.some(char => char.state === "incorrect");
          const isComplete = newIndex >= prev.text.length && !hasUncorrectedErrors;

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

          // Error mode behavior:
          // - stop-on-error: don't advance, must hit correct key
          // - advance-on-error: advance past error, no fixing
          // - correction-required: advance past error, but must fix all to complete
          if (errorMode === "stop-on-error") {
            return {
              ...prev,
              typedCharacters: newTypedCharacters,
              currentWordHasError: true,
              currentSentenceHasError: true,
              currentParagraphHasError: true,
            };
          }

          // Advance past the error (advance-on-error or correction-required)
          const newIndex = currentIndex + 1;

          // For correction-required, can't complete with uncorrected errors
          // For advance-on-error, can complete regardless
          const hasUncorrectedErrors = errorMode === "correction-required" &&
            newTypedCharacters.some(char => char.state === "incorrect");
          const isComplete = newIndex >= prev.text.length && !hasUncorrectedErrors;

          // Check for word/sentence/paragraph boundary crossings
          let { wordsWithErrors, sentencesWithErrors, paragraphsWithErrors } = prev;
          let currentWordHasError = true;
          let currentSentenceHasError = true;
          let currentParagraphHasError = true;

          // Check if we crossed a word boundary
          if (prev.wordBoundaries.includes(newIndex) || newIndex >= prev.text.length) {
            wordsWithErrors++;
            currentWordHasError = false;
          }

          // Check if we crossed a sentence boundary
          if (prev.sentenceBoundaries.includes(newIndex) || newIndex >= prev.text.length) {
            sentencesWithErrors++;
            currentSentenceHasError = false;
          }

          // Check if we crossed a paragraph boundary
          if (prev.paragraphBoundaries.includes(newIndex) || newIndex >= prev.text.length) {
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
    [text, mode, errorMode, newlineMode, setActiveKeyWithTimeout, setErrorKeyWithTimeout]
  );

  const handleKeyUp = useCallback(() => {
    // Don't clear immediately - let the timeout handle it
  }, []);

  // Build session result when complete
  useEffect(() => {
    if (session.isComplete && onComplete && session.endedAt) {
      // Use active typing time for duration
      const duration = activeTypingTimeRef.current;

      // Calculate totals - each corrected character counts as ONE error
      // (regardless of how many attempts it took to get it right)
      let totalMistakes = 0;

      for (const char of session.typedCharacters) {
        if (char.state === "corrected") {
          totalMistakes += 1;
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
        accuracy: session.text.length > 0
          ? Math.floor(((session.text.length - totalMistakes) / session.text.length) * 100)
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
