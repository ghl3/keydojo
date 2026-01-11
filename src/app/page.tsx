"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { TypingArea } from "@/components/typing/TypingArea";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { ModeSelector } from "@/components/modes/ModeSelector";
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import { SessionSummary } from "@/components/stats/SessionSummary";
import { Header } from "@/components/layout/Header";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { useTypingStateMachine } from "@/hooks/useTypingStateMachine";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateContent } from "@/lib/text/generators";
import { toGeneratorOptions } from "@/types/generators";
import { getUserSettings, updateUserSettings } from "@/lib/storage/localStorage";
import { getDefaultSettings, FONT_SIZE_VALUES, TEXT_LENGTH_CHARS } from "@/types/settings";
import type { UserSettings } from "@/types/settings";
import type { SessionMode, SessionResult } from "@/types";
import { getWeakestKeys } from "@/lib/stats/selectors";

export default function Home() {
  // Initialize settings from localStorage (with SSR-safe default)
  const [settings, setSettings] = useState<UserSettings>(() => getDefaultSettings());
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = getUserSettings();
    setSettings(savedSettings);
    setSettingsLoaded(true);
  }, []);

  // Update settings (both state and localStorage)
  const handleSettingsChange = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      updateUserSettings(updates);
      return updated;
    });
  }, []);

  // Mode change handler (extracted from settings for convenience)
  const handleModeChange = useCallback((newMode: SessionMode) => {
    handleSettingsChange({ defaultMode: newMode });
  }, [handleSettingsChange]);
  const [showSummary, setShowSummary] = useState(false);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [textKey, setTextKey] = useState(0); // Used to trigger new text generation
  const { userStats, updateStats } = useLocalStorage();

  // Compute weak keys from stats (for adaptive difficulty and keyboard display)
  const weakKeys = useMemo(
    () => getWeakestKeys(userStats.keyStats),
    [userStats.keyStats]
  );

  // Extract mode from settings for convenience
  const mode = settings.defaultMode;

  // Generate text using the new content generators
  // Each generator handles its own options (numbers, punctuation, etc.) at generation time
  const text = useMemo(() => {
    const generatorInput = toGeneratorOptions(mode.content, {
      targetLength: TEXT_LENGTH_CHARS[settings.textLength],
      weakKeys: settings.adaptiveDifficulty ? weakKeys : [],
      adaptiveIntensity: settings.adaptiveDifficulty ? settings.adaptiveIntensity : 0,
    });
    return generateContent(generatorInput).text;
  }, [mode.content, settings.textLength, settings.adaptiveDifficulty, settings.adaptiveIntensity, textKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
    visualState,
    liveStats,
    activeKey,
    nextKey,
    errorKey,
    handleKeyDown,
    handleKeyUp,
    reset,
  } = useTypingStateMachine({
    text,
    mode,
    onComplete: handleComplete,
    errorMode: settings.errorMode,
    newlineMode: settings.newlineMode,
  });

  const handleNewSession = useCallback(() => {
    setShowSummary(false);
    setLastResult(null);
    setTextKey((k) => k + 1); // Generate new text
    reset();
  }, [reset]);

  const handleDismissSummary = useCallback(() => {
    setShowSummary(false);
  }, []);

  // Show skeleton while loading settings from localStorage
  if (!settingsLoaded) {
    return (
      <main className="min-h-screen bg-cream-50">
        <Header />
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

  // Settings panel component to pass to Header
  const settingsPanelComponent = (
    <SettingsPanel
      settings={settings}
      onChange={handleSettingsChange}
      onClose={() => setSettingsPanelOpen(false)}
    />
  );

  return (
    <main className="min-h-screen bg-cream-50">
      {/* Header with Settings */}
      <Header settingsPanel={settingsPanelComponent} />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Mode Selector */}
        <ModeSelector mode={mode} onChange={handleModeChange} />

        {/* Live Stats */}
        {settings.showLiveStats && <StatsDisplay stats={liveStats} />}

        {/* Typing Area */}
        <TypingArea
          text={text}
          session={session}
          visualState={visualState}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          showSpaceMarkers={settings.showSpaceMarkers}
          fontSize={FONT_SIZE_VALUES[settings.fontSize]}
          errorMode={settings.errorMode}
        />

        {/* Keyboard */}
        {settings.showKeyboard && (
          <Keyboard
            activeKey={activeKey}
            nextKey={settings.highlightNextKey ? nextKey : null}
            errorKey={errorKey}
            weakKeys={weakKeys.slice(0, 5)}
          />
        )}

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
        <SessionSummary result={lastResult} userStats={userStats} onClose={handleNewSession} onDismiss={handleDismissSummary} />
      )}
    </main>
  );
}
