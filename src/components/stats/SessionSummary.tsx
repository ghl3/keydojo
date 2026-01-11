"use client";

import { useEffect, useRef } from "react";
import type { SessionResult, CharCategory } from "@/types";
import type { UserStats } from "@/types/stats";
import { Card } from "@/components/ui/Card";
import { useDraggable } from "@/hooks/useDraggable";

interface SessionSummaryProps {
  result: SessionResult;
  userStats?: UserStats;
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

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

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
        {categoryPerformance.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              By Character Type
            </h3>
            <div className="space-y-2">
              {categoryPerformance.map(({ category, attempts, mistakes, accuracy, wpm }) => (
                <div key={category} className="flex items-center justify-between text-sm py-1.5 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="capitalize text-gray-700 font-medium w-24">{category}</span>
                    <span className="text-gray-500 text-xs">
                      {attempts} typed
                      {mistakes > 0 && (
                        <span className="text-red-500 ml-2">{mistakes} error{mistakes !== 1 ? "s" : ""}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`${getWpmColor(wpm)} tabular-nums`}>{wpm} WPM</span>
                    <span className={`font-medium tabular-nums w-12 text-right ${getAccuracyColor(accuracy)}`}>
                      {accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top mistakes - only show if there are keys/pairs with more than 1 error */}
        {(topMistakes.length > 0 || topPairMistakes.length > 0) && (
          <div className="mb-6">
            {topMistakes.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Keys to Practice
                </h3>
                <div className="space-y-1.5 mb-3">
                  {topMistakes.map(([key, count]) => {
                    const historicalRate = userStats?.keyStats[key]?.mistakeRate;
                    const displayKey = key === " " ? "Space" : key;

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-1.5 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium text-red-700 w-8 text-center bg-red-100 rounded px-1">
                            {displayKey}
                          </span>
                          <span className="text-sm text-red-600">
                            {count} error{count !== 1 ? "s" : ""} this session
                          </span>
                        </div>
                        {historicalRate !== undefined && historicalRate > 0 && (
                          <span className="text-xs text-gray-500">
                            {(historicalRate * 100).toFixed(0)}% total
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {topPairMistakes.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Pairs to Practice
                </h3>
                <div className="space-y-1.5">
                  {topPairMistakes.map(([pair, count]) => {
                    const historicalRate = userStats?.pairStats[pair]?.mistakeRate;
                    const displayPair = pair.replace(/ /g, "␣");

                    return (
                      <div
                        key={pair}
                        className="flex items-center justify-between px-3 py-1.5 bg-orange-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium text-orange-700 w-10 text-center bg-orange-100 rounded px-1">
                            {displayPair}
                          </span>
                          <span className="text-sm text-orange-600">
                            {count} error{count !== 1 ? "s" : ""} this session
                          </span>
                        </div>
                        {historicalRate !== undefined && historicalRate > 0 && (
                          <span className="text-xs text-gray-500">
                            {(historicalRate * 100).toFixed(0)}% total
                          </span>
                        )}
                      </div>
                    );
                  })}
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
