"use client";

import { useState, useCallback, useMemo } from "react";
import { TypingArea } from "@/components/typing/TypingArea";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { ModeSelector } from "@/components/modes/ModeSelector";
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import { SessionSummary } from "@/components/stats/SessionSummary";
import { useTypingSession } from "@/hooks/useTypingSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateText } from "@/lib/text/generator";
import type { SessionMode, SessionResult, LiveStats } from "@/types";
import Link from "next/link";

const DEFAULT_MODE: SessionMode = {
  characterTypes: {
    lowercaseLetters: true,
    uppercaseLetters: false,
    numbers: false,
    punctuation: false,
  },
  contentType: "words",
};

export default function Home() {
  const [mode, setMode] = useState<SessionMode>(DEFAULT_MODE);
  const [showSummary, setShowSummary] = useState(false);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [textKey, setTextKey] = useState(0); // Used to trigger new text generation
  const { userStats, updateStats } = useLocalStorage();

  // Memoize text generation - only regenerate when mode or textKey changes
  const text = useMemo(() => {
    return generateText({
      mode,
      length: "medium",
      weakKeys: userStats.weakestKeys,
      adaptiveIntensity: 0.5,
    });
  }, [mode, textKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(
    (result: SessionResult) => {
      setLastResult(result);
      updateStats(result);
      setShowSummary(true);
    },
    [updateStats]
  );

  const {
    session,
    liveStats,
    activeKey,
    nextKey,
    errorKey,
    handleKeyDown,
    handleKeyUp,
    reset,
  } = useTypingSession({
    text,
    mode,
    onComplete: handleComplete,
  });

  const handleNewSession = useCallback(() => {
    setShowSummary(false);
    setLastResult(null);
    setTextKey((k) => k + 1); // Generate new text
    reset();
  }, [reset]);

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="border-b border-cream-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-700">KeyDojo</h1>
          <nav className="flex gap-4">
            <Link
              href="/stats"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Stats
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Mode Selector */}
        <ModeSelector mode={mode} onChange={setMode} />

        {/* Live Stats */}
        <StatsDisplay stats={liveStats} />

        {/* Typing Area */}
        <TypingArea
          text={text}
          session={session}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />

        {/* Keyboard */}
        <Keyboard
          activeKey={activeKey}
          nextKey={nextKey}
          errorKey={errorKey}
          weakKeys={userStats.weakestKeys.slice(0, 5)}
        />

        {/* Restart Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNewSession}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            New Session (Esc)
          </button>
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && lastResult && (
        <SessionSummary result={lastResult} onClose={handleNewSession} />
      )}
    </main>
  );
}
