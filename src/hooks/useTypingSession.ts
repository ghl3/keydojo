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
import { calculateLiveStats, calculateCategoryBreakdown } from "@/lib/stats/calculator";
import {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
  classifyChar,
} from "@/lib/stats/classifier";

interface UseTypingSessionOptions {
  text: string;
  mode: SessionMode;
  onComplete?: (result: SessionResult) => void;
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

export function useTypingSession({ text, mode, onComplete }: UseTypingSessionOptions) {
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
  const lastKeyTime = useRef<number>(0);

  // Use a ref to always have access to the latest session in callbacks
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Update next key
  useEffect(() => {
    if (!session.isComplete && session.currentIndex < session.text.length) {
      setNextKey(session.text[session.currentIndex]);
    } else {
      setNextKey(null);
    }
  }, [session.currentIndex, session.text, session.isComplete]);

  // Update live stats periodically
  useEffect(() => {
    if (!session.startedAt || session.isComplete) return;

    const interval = setInterval(() => {
      setLiveStats(calculateLiveStats(session));
    }, 100);

    return () => clearInterval(interval);
  }, [session]);

  // Reset when text changes
  useEffect(() => {
    setSession(createInitialSession(text, mode));
    mistakesByKey.current = {};
    setLiveStats({
      elapsedTime: 0,
      currentWPM: 0,
      currentAccuracy: 100,
      charactersTyped: 0,
      mistakeCount: 0,
      progress: 0,
    });
  }, [text, mode]);

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
        return;
      }

      // Use ref to get latest session state (avoids stale closure)
      const currentSession = sessionRef.current;

      // Ignore if complete
      if (currentSession.isComplete) return;

      const now = Date.now();

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
        if (currentIndex > 0) {
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
        setActiveKey("Backspace");
        setTimeout(() => setActiveKey(null), 100);
        return;
      }

      // Only process single character keys
      if (e.key.length !== 1) return;

      setActiveKey(e.key);
      setTimeout(() => setActiveKey(null), 100);

      const isCorrect = e.key === expectedChar;

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
        setErrorKey(e.key);
        setTimeout(() => setErrorKey(null), 200);

        // Track mistake for expected character
        mistakesByKey.current[expectedChar] = (mistakesByKey.current[expectedChar] || 0) + 1;

        setSession((prev) => {
          const newTypedCharacters = [...prev.typedCharacters];
          newTypedCharacters[currentIndex] = {
            ...newTypedCharacters[currentIndex],
            state: "incorrect",
            attempts: newTypedCharacters[currentIndex].attempts + 1,
          };

          return {
            ...prev,
            typedCharacters: newTypedCharacters,
            currentWordHasError: true,
            currentSentenceHasError: true,
            currentParagraphHasError: true,
          };
        });
      }

      lastKeyTime.current = now;
    },
    [text, mode] // Removed session from deps - using sessionRef instead
  );

  const handleKeyUp = useCallback(() => {
    setActiveKey(null);
  }, []);

  // Build session result when complete
  useEffect(() => {
    if (session.isComplete && onComplete && session.endedAt) {
      const duration = session.endedAt - session.startedAt;

      // Calculate totals
      let totalMistakes = 0;
      let correctCount = 0;

      for (const char of session.typedCharacters) {
        if (char.state === "correct") {
          correctCount++;
        } else if (char.state === "incorrect") {
          totalMistakes++;
        } else if (char.state === "corrected") {
          correctCount++;
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
        accuracy: Math.round((correctCount / session.text.length) * 100),
        totalCharacters: session.text.length,
        totalMistakes,
        categoryBreakdown,
        mistakesByKey: { ...mistakesByKey.current },
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
  }, [session.isComplete, session.endedAt, onComplete]);

  const reset = useCallback(() => {
    setSession(createInitialSession(text, mode));
    mistakesByKey.current = {};
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
