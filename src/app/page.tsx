"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { TypingArea } from "@/components/typing/TypingArea";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { ModeSelector } from "@/components/modes/ModeSelector";
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import { SessionSummary } from "@/components/stats/SessionSummary";
import { useTypingSession } from "@/hooks/useTypingSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateBaseText, transformText } from "@/lib/text/generator";
import { getUserSettings, updateUserSettings } from "@/lib/storage/localStorage";
import { getDefaultSettings } from "@/types/settings";
import type { SessionMode, SessionResult, LiveStats } from "@/types";
import Link from "next/link";

export default function Home() {
  // Initialize mode from localStorage (with SSR-safe default)
  const [mode, setMode] = useState<SessionMode>(() => getDefaultSettings().defaultMode);
  const [showSpaceMarkers, setShowSpaceMarkers] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const settings = getUserSettings();
    setMode(settings.defaultMode);
    setShowSpaceMarkers(settings.showSpaceMarkers ?? false);
    setSettingsLoaded(true);
  }, []);

  // Save mode to localStorage when it changes
  const handleModeChange = useCallback((newMode: SessionMode) => {
    setMode(newMode);
    updateUserSettings({ defaultMode: newMode });
  }, []);

  // Toggle space markers
  const handleToggleSpaceMarkers = useCallback(() => {
    setShowSpaceMarkers(prev => {
      const newValue = !prev;
      updateUserSettings({ showSpaceMarkers: newValue });
      return newValue;
    });
  }, []);
  const [showSummary, setShowSummary] = useState(false);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [textKey, setTextKey] = useState(0); // Used to trigger new text generation
  const { userStats, updateStats } = useLocalStorage();

  // Generate base text - only regenerates when content type or textKey changes
  // This is the "canonical" text with all features (case, punctuation, numbers)
  const baseText = useMemo(() => {
    return generateBaseText({
      contentType: mode.contentType,
      length: "medium",
      weakKeys: userStats.weakestKeys,
      adaptiveIntensity: 0.5,
    });
  }, [mode.contentType, textKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Transform base text based on character type settings
  // This updates when toggling uppercase, punctuation, numbers, etc.
  const text = useMemo(() => {
    return transformText(baseText, mode.characterTypes);
  }, [baseText, mode.characterTypes]);

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

  // Show skeleton while loading settings from localStorage
  if (!settingsLoaded) {
    return (
      <main className="min-h-screen bg-cream-50">
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
          {/* Mode selector skeleton */}
          <div className="h-24 bg-white rounded-xl border border-cream-200 animate-pulse" />
          {/* Stats skeleton */}
          <div className="h-16 bg-white rounded-xl border border-cream-200 animate-pulse" />
          {/* Typing area skeleton */}
          <div className="h-48 bg-white rounded-xl border border-cream-200 animate-pulse" />
          {/* Keyboard skeleton */}
          <div className="h-48 bg-white rounded-xl border border-cream-200 animate-pulse" />
        </div>
      </main>
    );
  }

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
        <ModeSelector mode={mode} onChange={handleModeChange} />

        {/* Display Options */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleSpaceMarkers}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              showSpaceMarkers
                ? "bg-primary-100 border-primary-300 text-primary-700"
                : "bg-white border-cream-300 text-gray-600 hover:border-primary-300"
            }`}
          >
            {showSpaceMarkers ? "✓ " : ""}Show space markers
          </button>
        </div>

        {/* Live Stats */}
        <StatsDisplay stats={liveStats} />

        {/* Typing Area */}
        <TypingArea
          text={text}
          session={session}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          showSpaceMarkers={showSpaceMarkers}
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
