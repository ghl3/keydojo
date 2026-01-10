"use client";

import type { SessionResult, CharCategory } from "@/types";
import { Card } from "@/components/ui/Card";

interface SessionSummaryProps {
  result: SessionResult;
  onClose: () => void;
}

export function SessionSummary({ result, onClose }: SessionSummaryProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Get top mistakes
  const topMistakes = Object.entries(result.mistakesByKey)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get category performance
  const categoryPerformance = Object.entries(result.categoryBreakdown)
    .filter(([, data]) => data.attempts > 0)
    .map(([category, data]) => ({
      category: category as CharCategory,
      accuracy:
        data.attempts > 0
          ? Math.round(((data.attempts - data.mistakes) / data.attempts) * 100)
          : 100,
      wpm: data.wpm,
    }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 p-6">
        <h2 className="text-2xl font-bold text-primary-700 mb-4">
          Session Complete!
        </h2>

        {/* Main stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {result.grossWPM}
            </div>
            <div className="text-sm text-gray-500">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
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
                  {(result.errorsPerSentence ?? 0).toFixed(2)} errors/sent
                </div>
              </div>
            )}
            {result.paragraphsTyped !== undefined && result.paragraphsTyped > 1 && (
              <div>
                <div className="font-medium">{result.paragraphsTyped}</div>
                <div className="text-gray-500">Paragraphs</div>
                <div className="text-xs text-gray-400">
                  {(result.errorsPerParagraph ?? 0).toFixed(2)} errors/para
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
                    <span className="text-gray-500">{wpm} WPM</span>
                    <span
                      className={`font-medium ${
                        accuracy >= 95
                          ? "text-green-600"
                          : accuracy >= 85
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top mistakes */}
        {topMistakes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Keys to Practice
            </h3>
            <div className="flex gap-2 flex-wrap">
              {topMistakes.map(([key, count]) => (
                <span
                  key={key}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {key === " " ? "Space" : key} ({count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          New Session
        </button>
      </Card>
    </div>
  );
}
