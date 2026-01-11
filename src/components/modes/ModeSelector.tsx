"use client";

import type {
  SessionMode,
  ContentModeConfig,
  ContentType,
  CodeLanguage,
} from "@/types";
import {
  getDefaultWordsOptions,
  getDefaultTextOptions,
  getDefaultCodeOptions,
} from "@/types/generators";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";

interface ModeSelectorProps {
  mode: SessionMode;
  onChange: (mode: SessionMode) => void;
}

const CONTENT_TYPES: ContentType[] = ["words", "sentences", "paragraphs", "code"];

const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "react", label: "React" },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const currentType = mode.content.type;

  // Handle content type change
  const handleContentTypeChange = (type: ContentType) => {
    if (type === currentType) return;

    // Create new options based on new type
    let newContent: ContentModeConfig;
    switch (type) {
      case "words":
        newContent = { type: "words", options: getDefaultWordsOptions() };
        break;
      case "sentences":
        newContent = { type: "sentences", options: getDefaultTextOptions() };
        break;
      case "paragraphs":
        newContent = { type: "paragraphs", options: getDefaultTextOptions() };
        break;
      case "code":
        newContent = { type: "code", options: getDefaultCodeOptions() };
        break;
    }

    onChange({ content: newContent });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Primary: Content Type Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
        <div className="flex gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleContentTypeChange(type)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${
                  currentType === type
                    ? "bg-primary-500 text-white"
                    : "bg-cream-100 text-gray-700 hover:bg-cream-200"
                }
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary: Options Panel (changes based on content type) */}
      <div className="border-t border-cream-200 pt-4">
        {currentType === "words" && (
          <WordsOptions mode={mode} onChange={onChange} />
        )}
        {(currentType === "sentences" || currentType === "paragraphs") && (
          <TextOptions mode={mode} onChange={onChange} />
        )}
        {currentType === "code" && (
          <CodeOptions mode={mode} onChange={onChange} />
        )}
      </div>
    </Card>
  );
}

// ============= OPTIONS PANELS =============

function WordsOptions({ mode, onChange }: ModeSelectorProps) {
  if (mode.content.type !== "words") return null;
  const options = mode.content.options;

  const updateOption = (
    key: keyof typeof options,
    value: boolean
  ) => {
    // Ensure at least one letter option is selected
    if ((key === "lowercase" || key === "uppercase") && !value) {
      const otherKey = key === "lowercase" ? "uppercase" : "lowercase";
      if (!options[otherKey]) return; // Don't allow both off
    }

    onChange({
      content: {
        type: "words",
        options: { ...options, [key]: value },
      },
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-600">Characters</h4>
      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Lowercase (a-z)"
          checked={options.lowercase}
          onChange={(v) => updateOption("lowercase", v)}
        />
        <Toggle
          label="Uppercase (A-Z)"
          checked={options.uppercase}
          onChange={(v) => updateOption("uppercase", v)}
        />
        <Toggle
          label="Numbers (42, 2024)"
          checked={options.numbers}
          onChange={(v) => updateOption("numbers", v)}
        />
        <Toggle
          label="Punctuation (hello, world!)"
          checked={options.punctuation}
          onChange={(v) => updateOption("punctuation", v)}
        />
        <Toggle
          label="Special (@, #, $)"
          checked={options.specialChars}
          onChange={(v) => updateOption("specialChars", v)}
        />
      </div>
    </div>
  );
}

function TextOptions({ mode, onChange }: ModeSelectorProps) {
  if (mode.content.type !== "sentences" && mode.content.type !== "paragraphs") {
    return null;
  }
  const contentType = mode.content.type;
  const options = mode.content.options;

  const updateOption = (key: keyof typeof options, value: boolean) => {
    onChange({
      content: {
        type: contentType,
        options: { ...options, [key]: value },
      },
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-600">Content Options</h4>
      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Include numbers"
          checked={options.numbers}
          onChange={(v) => updateOption("numbers", v)}
        />
        <Toggle
          label="Include punctuation"
          checked={options.punctuation}
          onChange={(v) => updateOption("punctuation", v)}
        />
      </div>
      <p className="text-xs text-gray-500">
        {options.numbers
          ? "Preferring sentences with dates, times, and statistics"
          : "Preferring sentences without numbers"}
      </p>
    </div>
  );
}

function CodeOptions({ mode, onChange }: ModeSelectorProps) {
  if (mode.content.type !== "code") return null;
  const options = mode.content.options;

  const updateLanguage = (language: CodeLanguage) => {
    onChange({
      content: {
        type: "code",
        options: { language },
      },
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-600">Language</h4>
      <div className="flex flex-wrap gap-2">
        {CODE_LANGUAGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateLanguage(value)}
            className={`
              px-2 py-1 rounded text-sm transition-colors
              ${
                options.language === value
                  ? "bg-primary-500 text-white"
                  : "bg-cream-100 text-gray-700 hover:bg-cream-200"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Code is displayed as-is without character filtering
      </p>
    </div>
  );
}
