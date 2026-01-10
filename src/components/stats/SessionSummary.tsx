"use client";

import { useEffect, useRef } from "react";
import type { SessionResult, CharCategory } from "@/types";
import { Card } from "@/components/ui/Card";

interface SessionSummaryProps {
  result: SessionResult;
  onClose: () => void;
  onDismiss: () => void;
}

// Color helpers for performance metrics
function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 98) return "text-green-600";
  if (accuracy >= 95) return "text-green-500";
  if (accuracy >= 90) return "text-yellow-600";
  if (accuracy >= 85) return "text-yellow-500";
  return "text-red-500";
}

function getWpmColor(wpm: number): string {
  if (wpm >= 80) return "text-green-600";
  if (wpm >= 60) return "text-green-500";
  if (wpm >= 40) return "text-yellow-600";
  if (wpm >= 25) return "text-yellow-500";
  return "text-gray-600";
}

export function SessionSummary({ result, onClose, onDismiss }: SessionSummaryProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

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
  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Get top key mistakes
  const topMistakes = Object.entries(result.mistakesByKey)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get top pair mistakes
  const topPairMistakes = Object.entries(result.mistakesByPair || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get category performance
  const categoryPerformance = Object.entries(result.categoryBreakdown)
    .filter(([, data]) => data.attempts > 0)
    .map(([category, data]) => ({
      category: category as CharCategory,
      accuracy:
        data.attempts > 0
          ? Math.floor(((data.attempts - data.mistakes) / data.attempts) * 100)
          : 100,
      wpm: data.wpm,
    }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 p-6 relative">
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

        <h2 className="text-2xl font-bold text-primary-700 mb-4">
          Session Complete!
        </h2>

        {/* Main stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getWpmColor(result.grossWPM)}`}>
              {result.grossWPM}
            </div>
            <div className="text-sm text-gray-500">WPM</div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getAccuracyColor(result.accuracy)}`}>
              {result.accuracy}%
            </div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-600">
              {formatDuration(result.duration)}
            </div>
            <div className="text-sm text-gray-500">Time</div>
          </div>
        </div>

        {/* Content-level stats */}
        <div className="mb-6 p-3 bg-cream-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Content Stats</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-medium">{result.wordsTyped}</div>
              <div className="text-gray-500">Words</div>
              <div className="text-xs text-gray-400">
                {result.errorsPerWord.toFixed(2)} errors/word
              </div>
            </div>
            {result.sentencesTyped !== undefined && (
              <div>
                <div className="font-medium">{result.sentencesTyped}</div>
                <div className="text-gray-500">Sentences</div>
                <div className="text-xs text-gray-400">
                  {(result.errorsPerSentence ?? 0).toFixed(2)} errors/sentence
                </div>
              </div>
            )}
            {result.paragraphsTyped !== undefined && result.paragraphsTyped > 1 && (
              <div>
                <div className="font-medium">{result.paragraphsTyped}</div>
                <div className="text-gray-500">Paragraphs</div>
                <div className="text-xs text-gray-400">
                  {(result.errorsPerParagraph ?? 0).toFixed(2)} errors/paragraph
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {categoryPerformance.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              By Character Type
            </h3>
            <div className="space-y-2">
              {categoryPerformance.map(({ category, accuracy, wpm }) => (
                <div
                  key={category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-gray-600">{category}</span>
                  <div className="flex gap-4">
                    <span className={getWpmColor(wpm)}>{wpm} WPM</span>
                    <span className={`font-medium ${getAccuracyColor(accuracy)}`}>
                      {accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top mistakes - only show if more than 1 error */}
        {result.totalMistakes > 1 && (topMistakes.length > 0 || topPairMistakes.length > 0) && (
          <div className="mb-6">
            {topMistakes.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Keys to Practice
                </h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {topMistakes.map(([key, count]) => (
                    <span
                      key={key}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      {key === " " ? "Space" : key} ({count})
                    </span>
                  ))}
                </div>
              </>
            )}
            {topPairMistakes.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Pairs to Practice
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {topPairMistakes.map(([pair, count]) => (
                    <span
                      key={pair}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium font-mono"
                    >
                      {pair.replace(/ /g, "␣")} ({count})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          ref={buttonRef}
          onClick={onClose}
          className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          New Session <span className="text-primary-200 text-sm">(Enter)</span>
        </button>
      </Card>
    </div>
  );
}
