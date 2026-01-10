"use client";

import type { SessionMode, ContentType } from "@/types";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";

interface ModeSelectorProps {
  mode: SessionMode;
  onChange: (mode: SessionMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const handleCharacterTypeChange = (
    key: keyof SessionMode["characterTypes"],
    value: boolean
  ) => {
    const newCharTypes = { ...mode.characterTypes, [key]: value };

    // Ensure at least one character type is selected
    const hasSelection = Object.values(newCharTypes).some(Boolean);
    if (!hasSelection) {
      return; // Don't allow deselecting all
    }

    onChange({
      ...mode,
      characterTypes: newCharTypes,
    });
  };

  const handleContentTypeChange = (contentType: ContentType) => {
    onChange({
      ...mode,
      contentType,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-6">
        {/* Character types */}
        <div className={mode.contentType === "code" ? "opacity-50 pointer-events-none" : ""}>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Characters</h3>
          <div className="flex flex-wrap gap-4">
            <Toggle
              label="Lowercase (a-z)"
              checked={mode.characterTypes.lowercaseLetters}
              onChange={(v) => handleCharacterTypeChange("lowercaseLetters", v)}
            />
            <Toggle
              label="Uppercase (A-Z)"
              checked={mode.characterTypes.uppercaseLetters}
              onChange={(v) => handleCharacterTypeChange("uppercaseLetters", v)}
            />
            <Toggle
              label="Numbers (0-9)"
              checked={mode.characterTypes.numbers}
              onChange={(v) => handleCharacterTypeChange("numbers", v)}
            />
            <Toggle
              label="Punctuation"
              checked={mode.characterTypes.punctuation}
              onChange={(v) => handleCharacterTypeChange("punctuation", v)}
            />
            <Toggle
              label="Spaces"
              checked={mode.characterTypes.spaces}
              onChange={(v) => handleCharacterTypeChange("spaces", v)}
            />
          </div>
        </div>

        {/* Content type */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
          <div className="flex gap-2">
            {(["words", "sentences", "paragraphs", "code"] as ContentType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => handleContentTypeChange(type)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${
                      mode.contentType === type
                        ? "bg-primary-500 text-white"
                        : "bg-cream-100 text-gray-700 hover:bg-cream-200"
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
          {mode.contentType === "code" && (
            <p className="text-xs text-gray-500 mt-1">
              Character options disabled for code mode
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
