"use client";

import { useEffect, useRef } from "react";
import type { SessionResult, CharCategory } from "@/lib/session";
import type { UserStats } from "@/lib/stats";
import { Card } from "@/components/ui/Card";
import { useDraggable } from "@/hooks/useDraggable";
import { getAccuracyColor, getWpmColor, formatDuration } from "./helpers";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { MistakesList } from "./MistakesList";

interface SessionSummaryProps {
  result: SessionResult;
  userStats?: UserStats;
  onClose: () => void;
  onDismiss: () => void;
}

export function SessionSummary({ result, userStats, onClose, onDismiss }: SessionSummaryProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { position, isDragging, handleMouseDown, reset } = useDraggable();

  // Reset position when modal opens
  useEffect(() => {
    reset();
  }, [reset]);

  // Focus button and handle keyboard
  useEffect(() => {
    // Focus the button for immediate keyboard access
    buttonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter or Space starts new session
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClose();
      }
      // Escape dismisses without new session
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onDismiss]);

  // Get top key mistakes - only keys with more than 1 error
  const topMistakes = Object.entries(result.mistakesByKey)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get top pair mistakes - only pairs with more than 1 error
  const topPairMistakes = Object.entries(result.mistakesByPair || {})
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get category performance with attempts and mistakes
  const categoryPerformance = Object.entries(result.categoryBreakdown)
    .filter(([, data]) => data.attempts > 0)
    .map(([category, data]) => ({
      category: category as CharCategory,
      attempts: data.attempts,
      mistakes: data.mistakes,
      accuracy:
        data.attempts > 0
          ? Math.floor(((data.attempts - data.mistakes) / data.attempts) * 100)
          : 100,
      wpm: data.wpm,
    }));

  const isWordsMode = result.mode.content.type === "words";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card
        className={`w-full max-w-lg mx-4 p-6 relative transition-shadow ${
          isDragging ? "shadow-xl" : ""
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-12 h-10 cursor-grab active:cursor-grabbing flex justify-center items-center"
          aria-label="Drag to move"
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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

        {/* Perfect badge */}
        {result.accuracy === 100 && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            Perfect!
          </div>
        )}

        <h2 className="text-2xl font-bold text-primary-700 mb-4 mt-2">
          Session Complete!
        </h2>

        {/* Main stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getWpmColor(result.grossWPM)}`}>
              {result.grossWPM}
            </div>
            <div className="text-sm text-gray-500">WPM</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor(result.accuracy)}`}>
              {result.accuracy}%
            </div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {formatDuration(result.duration)}
            </div>
            <div className="text-sm text-gray-500">Time</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${result.totalMistakes === 0 ? "text-green-600" : "text-red-500"}`}>
              {result.totalMistakes}
            </div>
            <div className="text-sm text-gray-500">Errors</div>
          </div>
        </div>

        {/* Content summary */}
        <div className="mb-6 p-3 bg-cream-50 rounded-lg text-center text-sm text-gray-600">
          <span className="font-medium">{result.totalCharacters}</span> {result.totalCharacters === 1 ? "character" : "characters"}
          {" · "}
          <span className="font-medium">{result.wordsTyped}</span> {result.wordsTyped === 1 ? "word" : "words"}
          {/* Only show sentences for non-words mode */}
          {!isWordsMode && result.sentencesTyped !== undefined && result.sentencesTyped > 0 && (
            <>
              {" · "}
              <span className="font-medium">{result.sentencesTyped}</span> {result.sentencesTyped === 1 ? "sentence" : "sentences"}
            </>
          )}
          {result.paragraphsTyped !== undefined && result.paragraphsTyped > 1 && (
            <>
              {" · "}
              <span className="font-medium">{result.paragraphsTyped}</span> paragraphs
            </>
          )}
        </div>

        {/* Category breakdown */}
        <CategoryBreakdown categoryPerformance={categoryPerformance} />

        {/* Top mistakes */}
        <MistakesList
          topMistakes={topMistakes}
          topPairMistakes={topPairMistakes}
          userStats={userStats}
        />

        {/* Close button */}
        <button
          ref={buttonRef}
          onClick={onClose}
          className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          New Session
        </button>

        {/* Keyboard hints */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Enter</kbd> new session
          {" · "}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Esc</kbd> dismiss
        </div>
      </Card>
    </div>
  );
}
