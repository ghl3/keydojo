"use client";

import { useState, useRef, useEffect } from "react";
import type { UserSettings, SpaceMode, NewlineMode, ErrorMode, FontSize } from "@/lib/settings";
import { Toggle } from "./Toggle";

interface SettingsPanelProps {
  settings: UserSettings;
  onChange: (settings: Partial<UserSettings>) => void;
  onClose: () => void;
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

// Tooltip wrapper that shows description on hover after delay
function WithTooltip({
  children,
  description,
}: {
  children: React.ReactNode;
  description: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipStyle({
          position: 'fixed',
          left: rect.left,
          bottom: window.innerHeight - rect.top + 4,
        });
      }
      setShowTooltip(true);
    }, 600); // 600ms delay before showing
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div
          style={tooltipStyle}
          className="z-50 px-2 py-1.5 text-xs text-gray-600 bg-cream-50 border border-cream-200 rounded shadow-sm min-w-[280px] max-w-[320px]"
        >
          {description}
        </div>
      )}
    </div>
  );
}

function SettingSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  description,
}: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  description: React.ReactNode;
}) {
  return (
    <WithTooltip description={description}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-700">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="px-2 py-1 text-sm border border-cream-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </WithTooltip>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description: React.ReactNode;
}) {
  return (
    <WithTooltip description={description}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-700">{label}</span>
        <Toggle checked={checked} onChange={onChange} label="" />
      </div>
    </WithTooltip>
  );
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const spaceModeOptions: SelectOption<SpaceMode>[] = [
    { value: "single", label: "Single" },
    { value: "double", label: "Double" },
    { value: "either", label: "Either" },
  ];

  const newlineModeOptions: SelectOption<NewlineMode>[] = [
    { value: "optional", label: "Optional" },
    { value: "required", label: "Required" },
  ];

  const errorModeOptions: SelectOption<ErrorMode>[] = [
    { value: "stop-on-error", label: "Stop on error" },
    { value: "advance-on-error", label: "Advance on error" },
    { value: "correction-required", label: "Correction required" },
  ];

  const fontSizeOptions: SelectOption<FontSize>[] = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <div className="w-72 bg-white rounded-lg border border-cream-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
        <h2 className="font-medium text-gray-800">Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Typing Behavior */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Typing Behavior
          </h3>
          <div className="space-y-3">
            <SettingSelect
              label="Spaces"
              value={settings.spaceMode}
              options={spaceModeOptions}
              onChange={(value) => onChange({ spaceMode: value })}
              description="Single: one space between words. Double: two spaces required. Either: accept single or double spacing."
            />
            <SettingSelect
              label="Newlines"
              value={settings.newlineMode}
              options={newlineModeOptions}
              onChange={(value) => onChange({ newlineMode: value })}
              description="Optional: skip newlines by typing the next character. Required: must press Enter at line breaks."
            />
            <SettingSelect
              label="Error mode"
              value={settings.errorMode}
              options={errorModeOptions}
              onChange={(value) => onChange({ errorMode: value })}
              description={
                <div className="space-y-1.5">
                  <div>
                    <span className="font-medium">Stop on error:</span> You cannot advance until you press the correct key. No backspace needed.
                  </div>
                  <div>
                    <span className="font-medium">Advance on error:</span> Errors are marked but you continue typing. No backspace, no corrections.
                  </div>
                  <div>
                    <span className="font-medium">Correction required:</span> Errors are marked and you can continue, but you must backspace and fix all errors before completing.
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* Display */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Display
          </h3>
          <div className="space-y-3">
            <SettingSelect
              label="Font size"
              value={settings.fontSize}
              options={fontSizeOptions}
              onChange={(value) => onChange({ fontSize: value })}
              description="Adjust the size of the text in the typing area."
            />
            <SettingToggle
              label="Show keyboard"
              checked={settings.showKeyboard}
              onChange={(value) => onChange({ showKeyboard: value })}
              description="Display the on-screen keyboard showing key positions and finger placement."
            />
            <SettingToggle
              label="Show live stats"
              checked={settings.showLiveStats}
              onChange={(value) => onChange({ showLiveStats: value })}
              description="Display real-time WPM, accuracy, and progress while typing."
            />
            <SettingToggle
              label="Highlight next key"
              checked={settings.highlightNextKey}
              onChange={(value) => onChange({ highlightNextKey: value })}
              description="Highlight the next key to press on the on-screen keyboard."
            />
            <SettingToggle
              label="Show space markers"
              checked={settings.showSpaceMarkers}
              onChange={(value) => onChange({ showSpaceMarkers: value })}
              description="Show visual markers for spaces in the text to make them easier to see."
            />
          </div>
        </section>

        {/* Audio */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Audio
          </h3>
          <div className="space-y-3">
            <SettingToggle
              label="Sound effects"
              checked={settings.soundEnabled}
              onChange={(value) => onChange({ soundEnabled: value })}
              description="Play audio feedback for keystrokes and errors."
            />
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Difficulty
          </h3>
          <div className="space-y-3">
            <SettingToggle
              label="Adaptive difficulty"
              checked={settings.adaptiveDifficulty}
              onChange={(value) => onChange({ adaptiveDifficulty: value })}
              description="Generate text that focuses on your weakest keys to help you improve faster."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
