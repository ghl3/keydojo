"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { TypingArea } from "@/components/typing/TypingArea";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { ModeSelector } from "@/components/modes/ModeSelector";
import { StatsDisplay } from "@/components/stats/StatsDisplay";
import { SessionSummary } from "@/components/stats/SessionSummary";
import { Header } from "@/components/layout/Header";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { useTypingSession } from "@/hooks/useTypingSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateBaseText, transformText } from "@/lib/text/generator";
import { getUserSettings, updateUserSettings } from "@/lib/storage/localStorage";
import { getDefaultSettings, FONT_SIZE_VALUES } from "@/types/settings";
import type { UserSettings } from "@/types/settings";
import type { SessionMode, SessionResult } from "@/types";

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

  // Extract mode from settings for convenience
  const mode = settings.defaultMode;

  // Generate base text - only regenerates when content type, length, character types, or textKey changes
  // This is the "canonical" text with all features (case, punctuation, numbers)
  // characterTypes is passed to handle edge cases like numbers-only or punctuation-only modes
  const baseText = useMemo(() => {
    return generateBaseText({
      contentType: mode.contentType,
      length: settings.textLength,
      weakKeys: settings.adaptiveDifficulty ? userStats.weakestKeys : [],
      adaptiveIntensity: settings.adaptiveDifficulty ? settings.adaptiveIntensity : 0,
      characterTypes: mode.characterTypes,
    });
  }, [mode.contentType, mode.characterTypes, settings.textLength, settings.adaptiveDifficulty, settings.adaptiveIntensity, textKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
    stopOnError: settings.stopOnError,
    newlineMode: settings.newlineMode,
    backspaceMode: settings.backspaceMode,
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
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          showSpaceMarkers={settings.showSpaceMarkers}
          fontSize={FONT_SIZE_VALUES[settings.fontSize]}
        />

        {/* Keyboard */}
        {settings.showKeyboard && (
          <Keyboard
            activeKey={activeKey}
            nextKey={settings.highlightNextKey ? nextKey : null}
            errorKey={errorKey}
            weakKeys={userStats.weakestKeys.slice(0, 5)}
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
        <SessionSummary result={lastResult} onClose={handleNewSession} onDismiss={handleDismissSummary} />
      )}
    </main>
  );
}
