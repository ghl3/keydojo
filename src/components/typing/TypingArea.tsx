"use client";

import { useRef, useEffect } from "react";
import type { TypingSession } from "@/types";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface TypingAreaProps {
  text: string;
  session: TypingSession;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp: () => void;
}

export function TypingArea({ text, session, onKeyDown, onKeyUp }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the hidden input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const progress = text.length > 0 ? (session.currentIndex / text.length) * 100 : 0;

  return (
    <Card className="p-6">
      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-4" />

      {/* Text display */}
      <div
        onClick={handleClick}
        className="font-mono text-lg leading-relaxed cursor-text min-h-[120px] select-none"
      >
        {text.split("").map((char, index) => {
          const typedChar = session.typedCharacters[index];
          const isCurrent = index === session.currentIndex;

          let className = "char-pending";
          if (typedChar) {
            if (typedChar.state === "correct") {
              className = "char-correct";
            } else if (typedChar.state === "incorrect") {
              className = "char-incorrect";
            } else if (typedChar.state === "corrected") {
              className = "char-corrected";
            }
          }

          // Handle special characters for display
          let displayChar = char;
          if (char === " ") {
            displayChar = "\u00A0"; // Non-breaking space for visibility
          } else if (char === "\n") {
            displayChar = "↵";
          }

          return (
            <span
              key={index}
              className={`${className} ${
                isCurrent ? "border-l-2 border-primary-500 -ml-px pl-px animate-cursor-blink" : ""
              }`}
            >
              {displayChar}
            </span>
          );
        })}
      </div>

      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => inputRef.current?.focus()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Instructions */}
      {!session.startedAt && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Click here or start typing to begin. Press <kbd className="px-1.5 py-0.5 bg-cream-100 rounded text-xs">Esc</kbd> to restart.
        </p>
      )}
    </Card>
  );
}
