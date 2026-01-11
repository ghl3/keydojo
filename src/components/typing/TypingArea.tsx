"use client";

import { useRef, useEffect, useMemo } from "react";
import type { TypingSession, ErrorMode, VisualSessionState } from "@/types";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { visualStateToCssClass } from "@/lib/typing/typingSelectors";

interface TypingAreaProps {
  text: string;
  session: TypingSession;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp: () => void;
  showSpaceMarkers?: boolean;
  fontSize?: string;
  errorMode?: ErrorMode;
  visualState?: VisualSessionState; // New: pre-computed visual state from hook
}

// Split text into words (preserving spaces and punctuation with words)
function splitIntoWords(text: string): { word: string; startIndex: number }[] {
  const words: { word: string; startIndex: number }[] = [];
  let currentWord = "";
  let wordStart = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === " " || char === "\n") {
      if (currentWord) {
        words.push({ word: currentWord, startIndex: wordStart });
        currentWord = "";
      }
      // Space/newline is its own "word"
      words.push({ word: char, startIndex: i });
      wordStart = i + 1;
    } else {
      if (!currentWord) {
        wordStart = i;
      }
      currentWord += char;
    }
  }

  // Don't forget the last word
  if (currentWord) {
    words.push({ word: currentWord, startIndex: wordStart });
  }

  return words;
}

export function TypingArea({ text, session, onKeyDown, onKeyUp, showSpaceMarkers = false, fontSize = "1.125rem", errorMode = "stop-on-error", visualState }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split text into words for non-breaking display
  const words = useMemo(() => splitIntoWords(text), [text]);

  // Helper to get character class - uses visualState if provided (single source of truth)
  const getCharClassName = (charIndex: number): string => {
    // Use visualState if provided (preferred - from new state machine)
    if (visualState && visualState.characters[charIndex]) {
      return visualStateToCssClass(visualState.characters[charIndex].visualState);
    }

    // Fallback to old logic for backwards compatibility
    // (This can be removed once all callers provide visualState)
    const typedChar = session.typedCharacters[charIndex];
    if (!typedChar || typedChar.state === "pending") return "char-pending";
    if (typedChar.state === "corrected") return "char-corrected";
    if (typedChar.state === "incorrect") return "char-incorrect";
    if (typedChar.state === "correct") return "char-correct";
    return "char-pending";
  };

  // Check if character is at cursor position
  const isCursorAt = (charIndex: number): boolean => {
    if (visualState) {
      return visualState.characters[charIndex]?.isCursor ?? false;
    }
    return charIndex === session.currentIndex;
  };

  // Keep focus on the hidden input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get current cursor position for auto-scroll dependency
  const cursorPosition = visualState
    ? visualState.characters.findIndex(c => c.isCursor)
    : session.currentIndex;

  // Auto-scroll to keep current character visible
  useEffect(() => {
    if (currentCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentChar = currentCharRef.current;

      // Get positions relative to container
      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();

      // Calculate if character is outside visible area
      const charTopRelative = charRect.top - containerRect.top + container.scrollTop;
      const charBottomRelative = charTopRelative + charRect.height;

      // Keep some padding (show context lines above and below)
      const paddingTop = 40;
      const paddingBottom = 60;

      // Scroll if current char is too high
      if (charTopRelative < container.scrollTop + paddingTop) {
        container.scrollTo({
          top: Math.max(0, charTopRelative - paddingTop),
          behavior: "smooth",
        });
      }
      // Scroll if current char is too low
      else if (charBottomRelative > container.scrollTop + container.clientHeight - paddingBottom) {
        container.scrollTo({
          top: charBottomRelative - container.clientHeight + paddingBottom,
          behavior: "smooth",
        });
      }
    }
  }, [cursorPosition]);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const progress = visualState ? visualState.progress : (text.length > 0 ? (session.currentIndex / text.length) * 100 : 0);

  return (
    <Card className="p-6">
      {/* Progress bar */}
      <ProgressBar progress={progress} className="mb-4" />

      {/* Text display with scrolling */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="font-mono leading-relaxed cursor-text max-h-[180px] overflow-y-auto"
        style={{ fontSize }}
      >
        {words.map((wordData, wordIndex) => {
          const { word, startIndex } = wordData;

          // Handle newlines (optional - user can skip by typing next char)
          // No visible indicator - just a line break with cursor at start of next line
          if (word === "\n") {
            const charIndex = startIndex;
            const isCurrent = isCursorAt(charIndex);

            return (
              <span key={`word-${wordIndex}`}>
                <br />
                {/* When cursor is on newline, show it at start of next line */}
                {isCurrent && (
                  <span
                    ref={currentCharRef}
                    className="border-b-2 border-primary-500 animate-cursor-blink inline-block w-2"
                  >
                    {"\u200B"}{/* Zero-width space for cursor positioning */}
                  </span>
                )}
              </span>
            );
          }

          // Handle spaces - render as regular inline element
          if (word === " ") {
            const charIndex = startIndex;
            const isCurrent = isCursorAt(charIndex);
            const isPending = visualState
              ? visualState.characters[charIndex]?.visualState === "pending"
              : (!session.typedCharacters[charIndex] || session.typedCharacters[charIndex].state === "pending");
            const className = getCharClassName(charIndex);

            return (
              <span
                key={`word-${wordIndex}`}
                ref={isCurrent ? currentCharRef : null}
                className={`${className} ${
                  isCurrent ? "border-b-2 border-primary-500 animate-cursor-blink" : ""
                } relative`}
              >
                {"\u00A0"}
                {/* Subtle space marker with wing tips */}
                {showSpaceMarkers && isPending && (
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none opacity-30">
                    <span className="w-full h-[1px] bg-gray-400 relative">
                      {/* Left wing */}
                      <span className="absolute left-0 bottom-0 w-[3px] h-[4px] border-l border-b border-gray-400" />
                      {/* Right wing */}
                      <span className="absolute right-0 bottom-0 w-[3px] h-[4px] border-r border-b border-gray-400" />
                    </span>
                  </span>
                )}
              </span>
            );
          }

          // Render word as inline-block to prevent mid-word wrapping
          return (
            <span
              key={`word-${wordIndex}`}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((char, charOffset) => {
                const charIndex = startIndex + charOffset;
                const isCurrent = isCursorAt(charIndex);
                const className = getCharClassName(charIndex);

                return (
                  <span
                    key={charIndex}
                    ref={isCurrent ? currentCharRef : null}
                    className={`${className} ${
                      isCurrent ? "border-b-2 border-primary-500 animate-cursor-blink" : ""
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
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
