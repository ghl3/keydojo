"use client";

import { useReducer, useCallback, useEffect, useRef, useState, useMemo } from "react";
import type {
  TypingState,
  TypingAction,
  SessionMode,
  SessionResult,
  LiveStats,
  VisualSessionState,
  TypedCharacter,
} from "@/types";
import type { ErrorMode } from "@/types/settings";
import { typingReducer, createInitialState } from "@/lib/typing/typingReducer";
import {
  deriveVisualState,
  countMistakes,
  calculateAccuracy,
} from "@/lib/typing/typingSelectors";
import { calculateCategoryBreakdown } from "@/lib/stats/calculator";
import {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
} from "@/lib/stats/classifier";

// If user doesn't type for this long, stop counting time
const IDLE_THRESHOLD_MS = 2000;

interface UseTypingStateMachineOptions {
  text: string;
  mode: SessionMode;
  onComplete?: (result: SessionResult) => void;
  errorMode?: ErrorMode;
  newlineMode?: "required" | "optional";
}

// Calculate WPM based on active typing time
function calculateGrossWPM(charactersTyped: number, activeTimeMs: number): number {
  const minutes = activeTimeMs / 60000;
  const words = charactersTyped / 5;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

export function useTypingStateMachine({
  text,
  mode,
  onComplete,
  errorMode = "stop-on-error",
  newlineMode = "optional",
}: UseTypingStateMachineOptions) {
  // Core state machine
  const [state, dispatch] = useReducer(
    typingReducer,
    { text, errorMode },
    createInitialState
  );

  // UI feedback state (not part of core state machine)
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Timing refs (side effects, not part of pure state)
  const activeTypingTimeRef = useRef<number>(0);
  const lastKeystrokeTimeRef = useRef<number>(0);

  // Mistake tracking refs
  const mistakesByKey = useRef<Record<string, number>>({});
  const mistakesByPair = useRef<Record<string, number>>({});
  // Track positions where we've already recorded a mistake (to avoid over-counting)
  const recordedMistakePositions = useRef<Set<number>>(new Set());

  // Boundary tracking
  const wordBoundaries = useMemo(() => findWordBoundaries(text), [text]);
  const sentenceBoundaries = useMemo(() => findSentenceBoundaries(text), [text]);
  const paragraphBoundaries = useMemo(() => findParagraphBoundaries(text), [text]);

  // Error tracking per boundary
  const boundaryErrorState = useRef({
    currentWordHasError: false,
    currentSentenceHasError: false,
    currentParagraphHasError: false,
    wordsWithErrors: 0,
    sentencesWithErrors: 0,
    paragraphsWithErrors: 0,
  });

  // Timeout refs for proper cleanup
  const activeKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived visual state (memoized)
  const visualState = useMemo(
    (): VisualSessionState => deriveVisualState(state),
    [state]
  );

  // Live stats state
  const [liveStats, setLiveStats] = useState<LiveStats>({
    elapsedTime: 0,
    currentWPM: 0,
    currentAccuracy: 100,
    charactersTyped: 0,
    mistakeCount: 0,
    progress: 0,
  });

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
    if (state.status !== "complete" && state.cursorPosition < state.text.length) {
      setNextKey(state.text[state.cursorPosition]);
    } else {
      setNextKey(null);
    }
  }, [state.cursorPosition, state.text, state.status]);

  // Update live stats periodically
  useEffect(() => {
    if (state.status !== "active") return;

    const interval = setInterval(() => {
      const typedCount = state.cursorPosition;
      const mistakeCount = countMistakes(
        state.characters.slice(0, state.cursorPosition)
      );

      const currentAccuracy = calculateAccuracy(typedCount, mistakeCount);

      setLiveStats({
        elapsedTime: activeTypingTimeRef.current,
        currentWPM: calculateGrossWPM(typedCount, activeTypingTimeRef.current),
        currentAccuracy,
        charactersTyped: typedCount,
        mistakeCount,
        progress: state.text.length > 0
          ? (typedCount / state.text.length) * 100
          : 0,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.status, state.cursorPosition, state.characters, state.text.length]);

  // Reset when text or errorMode changes
  useEffect(() => {
    dispatch({ type: "RESET", text, errorMode });
    mistakesByKey.current = {};
    mistakesByPair.current = {};
    recordedMistakePositions.current = new Set();
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    boundaryErrorState.current = {
      currentWordHasError: false,
      currentSentenceHasError: false,
      currentParagraphHasError: false,
      wordsWithErrors: 0,
      sentencesWithErrors: 0,
      paragraphsWithErrors: 0,
    };
    setLiveStats({
      elapsedTime: 0,
      currentWPM: 0,
      currentAccuracy: 100,
      charactersTyped: 0,
      mistakeCount: 0,
      progress: 0,
    });
  }, [text, errorMode]);

  // Helper to set active key with timeout
  const setActiveKeyWithTimeout = useCallback((key: string) => {
    if (activeKeyTimeoutRef.current) {
      clearTimeout(activeKeyTimeoutRef.current);
    }
    setActiveKey(key);
    activeKeyTimeoutRef.current = setTimeout(() => {
      setActiveKey(null);
    }, 150);
  }, []);

  // Helper to set error key with timeout
  const setErrorKeyWithTimeout = useCallback((key: string) => {
    if (errorKeyTimeoutRef.current) {
      clearTimeout(errorKeyTimeoutRef.current);
    }
    setErrorKey(key);
    errorKeyTimeoutRef.current = setTimeout(() => {
      setErrorKey(null);
    }, 200);
  }, []);

  // Update boundary error tracking
  const updateBoundaryErrors = useCallback(
    (newIndex: number, hadError: boolean, isComplete: boolean) => {
      const bs = boundaryErrorState.current;

      if (hadError) {
        bs.currentWordHasError = true;
        bs.currentSentenceHasError = true;
        bs.currentParagraphHasError = true;
      }

      // Check word boundary
      if (wordBoundaries.includes(newIndex) || isComplete) {
        if (bs.currentWordHasError) bs.wordsWithErrors++;
        bs.currentWordHasError = false;
      }

      // Check sentence boundary
      if (sentenceBoundaries.includes(newIndex) || isComplete) {
        if (bs.currentSentenceHasError) bs.sentencesWithErrors++;
        bs.currentSentenceHasError = false;
      }

      // Check paragraph boundary
      if (paragraphBoundaries.includes(newIndex) || isComplete) {
        if (bs.currentParagraphHasError) bs.paragraphsWithErrors++;
        bs.currentParagraphHasError = false;
      }
    },
    [wordBoundaries, sentenceBoundaries, paragraphBoundaries]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ignore modifier keys alone
      if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
        return;
      }

      // Handle escape to reset
      if (e.key === "Escape") {
        dispatch({ type: "RESET", errorMode });
        mistakesByKey.current = {};
        mistakesByPair.current = {};
        recordedMistakePositions.current = new Set();
        activeTypingTimeRef.current = 0;
        lastKeystrokeTimeRef.current = 0;
        boundaryErrorState.current = {
          currentWordHasError: false,
          currentSentenceHasError: false,
          currentParagraphHasError: false,
          wordsWithErrors: 0,
          sentencesWithErrors: 0,
          paragraphsWithErrors: 0,
        };
        return;
      }

      // Ignore if complete
      if (state.status === "complete") return;

      const now = Date.now();

      // Update active typing time
      if (lastKeystrokeTimeRef.current > 0) {
        const gap = now - lastKeystrokeTimeRef.current;
        if (gap < IDLE_THRESHOLD_MS) {
          activeTypingTimeRef.current += gap;
        }
      }
      lastKeystrokeTimeRef.current = now;

      const { cursorPosition } = state;
      const expectedChar = state.text[cursorPosition];

      // Handle backspace
      if (e.key === "Backspace") {
        dispatch({ type: "BACKSPACE", timestamp: now });
        setActiveKeyWithTimeout("Backspace");
        return;
      }

      // Only process single character keys (and Enter for newlines)
      if (e.key.length !== 1 && e.key !== "Enter") return;

      setActiveKeyWithTimeout(e.key);

      // Handle optional newlines (skippable by typing the next character)
      if (newlineMode === "optional" && expectedChar === "\n" && e.key !== "\n") {
        const nextChar = state.text[cursorPosition + 1];
        if (nextChar && e.key === nextChar) {
          // Skip the newline - dispatch two TYPE_CHAR actions
          setErrorKey(null);
          dispatch({ type: "TYPE_CHAR", char: "\n", timestamp: now });
          dispatch({ type: "TYPE_CHAR", char: e.key, timestamp: now + 1 });
          updateBoundaryErrors(cursorPosition + 2, false, cursorPosition + 2 >= state.text.length);
          return;
        }
      }

      // Handle Enter key for newlines
      const typedChar = e.key === "Enter" ? "\n" : e.key;
      const isCorrect = typedChar === expectedChar;

      if (isCorrect) {
        setErrorKey(null);
      } else {
        setErrorKeyWithTimeout(e.key);

        // Track mistake for expected character (only once per position)
        if (!recordedMistakePositions.current.has(cursorPosition)) {
          recordedMistakePositions.current.add(cursorPosition);
          mistakesByKey.current[expectedChar] = (mistakesByKey.current[expectedChar] || 0) + 1;

          // Track mistake for letter pair
          if (cursorPosition > 0) {
            const prevChar = state.text[cursorPosition - 1];
            const pair = prevChar + expectedChar;
            mistakesByPair.current[pair] = (mistakesByPair.current[pair] || 0) + 1;
          }
        }
      }

      // Dispatch the action
      dispatch({ type: "TYPE_CHAR", char: typedChar, timestamp: now });

      // Update boundary tracking
      const newIndex = isCorrect || errorMode !== "stop-on-error"
        ? cursorPosition + 1
        : cursorPosition;
      const willComplete = newIndex >= state.text.length &&
        (errorMode !== "correction-required" ||
          !state.characters.some((c, i) => i !== cursorPosition && c.state === "incorrect"));

      updateBoundaryErrors(newIndex, !isCorrect, willComplete);
    },
    [
      state,
      errorMode,
      newlineMode,
      setActiveKeyWithTimeout,
      setErrorKeyWithTimeout,
      updateBoundaryErrors,
    ]
  );

  const handleKeyUp = useCallback(() => {
    // Don't clear immediately - let the timeout handle it
  }, []);

  // Build session result when complete
  useEffect(() => {
    if (state.status === "complete" && onComplete && state.completedAt) {
      const duration = activeTypingTimeRef.current;

      // Count mistakes (corrected characters)
      let totalMistakes = 0;
      for (const char of state.characters) {
        if (char.state === "corrected") {
          totalMistakes += 1;
        }
      }

      const categoryBreakdown = calculateCategoryBreakdown(
        state.text,
        state.characters,
        duration
      );

      const wordsTyped = wordBoundaries.length;
      const sentencesTyped = sentenceBoundaries.length;
      const paragraphsTyped = paragraphBoundaries.length;

      const bs = boundaryErrorState.current;

      const result: SessionResult = {
        id: state.id,
        timestamp: state.completedAt,
        duration,
        mode,
        grossWPM: Math.round((state.text.length / 5) / (duration / 60000)),
        netWPM: Math.round(
          ((state.text.length / 5) - totalMistakes) / (duration / 60000)
        ),
        accuracy: state.text.length > 0
          ? Math.floor(((state.text.length - totalMistakes) / state.text.length) * 100)
          : 100,
        totalCharacters: state.text.length,
        totalMistakes,
        categoryBreakdown,
        mistakesByKey: { ...mistakesByKey.current },
        mistakesByPair: { ...mistakesByPair.current },
        wordsTyped,
        wordsWithErrors: bs.wordsWithErrors,
        errorsPerWord:
          wordsTyped > 0
            ? Math.round((bs.wordsWithErrors / wordsTyped) * 100) / 100
            : 0,
        sentencesTyped,
        sentencesWithErrors: bs.sentencesWithErrors,
        errorsPerSentence:
          sentencesTyped > 0
            ? Math.round((bs.sentencesWithErrors / sentencesTyped) * 100) / 100
            : 0,
        paragraphsTyped,
        paragraphsWithErrors: bs.paragraphsWithErrors,
        errorsPerParagraph:
          paragraphsTyped > 0
            ? Math.round((bs.paragraphsWithErrors / paragraphsTyped) * 100) / 100
            : 0,
      };

      onComplete(result);
    }
  }, [
    state.status,
    state.completedAt,
    state.id,
    state.text,
    state.characters,
    mode,
    onComplete,
    wordBoundaries,
    sentenceBoundaries,
    paragraphBoundaries,
  ]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET", errorMode });
    mistakesByKey.current = {};
    mistakesByPair.current = {};
    recordedMistakePositions.current = new Set();
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    boundaryErrorState.current = {
      currentWordHasError: false,
      currentSentenceHasError: false,
      currentParagraphHasError: false,
      wordsWithErrors: 0,
      sentencesWithErrors: 0,
      paragraphsWithErrors: 0,
    };
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
  }, [text, errorMode]);

  // Build a compatible session object for existing components
  const session = useMemo(() => ({
    id: state.id,
    startedAt: state.startedAt ?? 0,
    endedAt: state.completedAt ?? undefined,
    text: state.text,
    typedCharacters: state.characters,
    currentIndex: state.cursorPosition,
    mode,
    isPaused: false,
    isComplete: state.status === "complete",
    wordBoundaries,
    sentenceBoundaries,
    paragraphBoundaries,
    ...boundaryErrorState.current,
  }), [
    state,
    mode,
    wordBoundaries,
    sentenceBoundaries,
    paragraphBoundaries,
  ]);

  return {
    // Core state
    state,
    visualState,

    // Compatibility with old hook
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
