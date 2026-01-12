"use client";

import { useReducer, useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { TypingSession } from "@/lib/session";
import type { LiveStats } from "@/lib/stats";
import type { VisualSessionState } from "@/lib/typing";
import {
  typingReducer,
  createInitialState,
  deriveVisualState,
  buildSessionResult,
  createDefaultBoundaryErrorState,
  createDefaultLiveStats,
  calculateLiveStatsFromState,
  IDLE_THRESHOLD_MS,
} from "@/lib/typing";
import type { BoundaryErrorState, UseTypingStateMachineOptions } from "@/lib/typing";
import {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
} from "@/lib/session";

export type { UseTypingStateMachineOptions } from "@/lib/typing";

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
  const [liveStats, setLiveStats] = useState<LiveStats>(createDefaultLiveStats);

  // Timing refs (side effects, not part of pure state)
  const activeTypingTimeRef = useRef<number>(0);
  const lastKeystrokeTimeRef = useRef<number>(0);

  // Mistake tracking refs
  const mistakesByKeyRef = useRef<Record<string, number>>({});
  const mistakesByPairRef = useRef<Record<string, number>>({});
  const recordedMistakePositionsRef = useRef<Set<number>>(new Set());

  // Boundary tracking
  const wordBoundaries = useMemo(() => findWordBoundaries(text), [text]);
  const sentenceBoundaries = useMemo(() => findSentenceBoundaries(text), [text]);
  const paragraphBoundaries = useMemo(() => findParagraphBoundaries(text), [text]);

  // Error tracking per boundary
  const boundaryErrorStateRef = useRef<BoundaryErrorState>(createDefaultBoundaryErrorState());

  // Timeout refs for proper cleanup
  const activeKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorKeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived visual state (memoized)
  const visualState = useMemo(
    (): VisualSessionState => deriveVisualState(state),
    [state]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (activeKeyTimeoutRef.current) clearTimeout(activeKeyTimeoutRef.current);
      if (errorKeyTimeoutRef.current) clearTimeout(errorKeyTimeoutRef.current);
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
      setLiveStats(calculateLiveStatsFromState(state, activeTypingTimeRef.current));
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  // Reset when text or errorMode changes
  useEffect(() => {
    dispatch({ type: "RESET", text, errorMode });
    mistakesByKeyRef.current = {};
    mistakesByPairRef.current = {};
    recordedMistakePositionsRef.current = new Set();
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    boundaryErrorStateRef.current = createDefaultBoundaryErrorState();
    setLiveStats(createDefaultLiveStats());
  }, [text, errorMode]);

  // Helper to set active key with timeout
  const setActiveKeyWithTimeout = useCallback((key: string) => {
    if (activeKeyTimeoutRef.current) clearTimeout(activeKeyTimeoutRef.current);
    setActiveKey(key);
    activeKeyTimeoutRef.current = setTimeout(() => setActiveKey(null), 150);
  }, []);

  // Helper to set error key with timeout
  const setErrorKeyWithTimeout = useCallback((key: string) => {
    if (errorKeyTimeoutRef.current) clearTimeout(errorKeyTimeoutRef.current);
    setErrorKey(key);
    errorKeyTimeoutRef.current = setTimeout(() => setErrorKey(null), 200);
  }, []);

  // Update boundary error tracking
  const updateBoundaryErrors = useCallback(
    (newIndex: number, hadError: boolean, isComplete: boolean) => {
      const bs = boundaryErrorStateRef.current;

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

  // Reset all state
  const resetAllState = useCallback(() => {
    dispatch({ type: "RESET", errorMode });
    mistakesByKeyRef.current = {};
    mistakesByPairRef.current = {};
    recordedMistakePositionsRef.current = new Set();
    activeTypingTimeRef.current = 0;
    lastKeystrokeTimeRef.current = 0;
    boundaryErrorStateRef.current = createDefaultBoundaryErrorState();
  }, [errorMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ignore modifier keys alone
      if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
        return;
      }

      // Handle escape to reset
      if (e.key === "Escape") {
        resetAllState();
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
        if (!recordedMistakePositionsRef.current.has(cursorPosition)) {
          recordedMistakePositionsRef.current.add(cursorPosition);
          mistakesByKeyRef.current[expectedChar] = (mistakesByKeyRef.current[expectedChar] || 0) + 1;

          // Track mistake for letter pair
          if (cursorPosition > 0) {
            const prevChar = state.text[cursorPosition - 1];
            const pair = prevChar + expectedChar;
            mistakesByPairRef.current[pair] = (mistakesByPairRef.current[pair] || 0) + 1;
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
      resetAllState,
    ]
  );

  const handleKeyUp = useCallback(() => {
    // Don't clear immediately - let the timeout handle it
  }, []);

  // Build session result when complete
  useEffect(() => {
    if (state.status === "complete" && onComplete && state.completedAt) {
      const result = buildSessionResult({
        state,
        mode,
        duration: activeTypingTimeRef.current,
        mistakesByKey: mistakesByKeyRef.current,
        mistakesByPair: mistakesByPairRef.current,
        recordedMistakeCount: recordedMistakePositionsRef.current.size,
        boundaryErrorState: boundaryErrorStateRef.current,
        wordBoundaries,
        sentenceBoundaries,
        paragraphBoundaries,
      });

      onComplete(result);
    }
  }, [
    state.status,
    state.completedAt,
    state,
    mode,
    onComplete,
    wordBoundaries,
    sentenceBoundaries,
    paragraphBoundaries,
  ]);

  const reset = useCallback(() => {
    resetAllState();
    setLiveStats(createDefaultLiveStats());
    setActiveKey(null);
    setNextKey(text[0] || null);
    setErrorKey(null);
  }, [text, resetAllState]);

  // Build a compatible session object for existing components
  const session: TypingSession = useMemo(() => ({
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
    ...boundaryErrorStateRef.current,
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
