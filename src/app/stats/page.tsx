"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/layout/Header";
import { SessionSummary } from "@/components/stats/SessionSummary";
import type { CharCategory, ContentType, SessionResult } from "@/types";

export default function StatsPage() {
  const { userStats, isLoaded, resetStats } = useLocalStorage();
  const [selectedSession, setSelectedSession] = useState<SessionResult | null>(null);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all your statistics?")) {
      resetStats();
    }
  };

  return (
    <main className="min-h-screen bg-cream-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Your Statistics</h2>

        {userStats.totalSessions === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No practice sessions yet. Start typing to see your stats!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Start Practicing
            </Link>
          </Card>
        ) : (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {userStats.totalSessions}
                </div>
                <div className="text-sm text-gray-500">Sessions</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {userStats.averageWPM}
                </div>
                <div className="text-sm text-gray-500">Avg WPM</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {userStats.bestWPM}
                </div>
                <div className="text-sm text-gray-500">Best WPM</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {formatTime(userStats.totalTimeMs)}
                </div>
                <div className="text-sm text-gray-500">Total Time</div>
              </Card>
            </div>

            {/* Category breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Performance by Character Type
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-cream-200">
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Sessions</th>
                      <th className="pb-2 text-right">Attempts</th>
                      <th className="pb-2 text-right">Mistake Rate</th>
                      <th className="pb-2 text-right">Avg WPM</th>
                      <th className="pb-2 text-right">Best WPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(userStats.categoryStats) as [CharCategory, typeof userStats.categoryStats[CharCategory]][])
                      .filter(([, stats]) => stats.totalAttempts > 0)
                      .map(([category, stats]) => (
                        <tr key={category} className="border-b border-cream-100">
                          <td className="py-2 capitalize font-medium">
                            {category}
                          </td>
                          <td className="py-2 text-right">{stats.sessionCount}</td>
                          <td className="py-2 text-right">{stats.totalAttempts}</td>
                          <td className="py-2 text-right">
                            <span
                              className={`${
                                stats.mistakeRate > 0.1
                                  ? "text-red-600"
                                  : stats.mistakeRate > 0.05
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {(stats.mistakeRate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 text-right">{stats.averageWPM}</td>
                          <td className="py-2 text-right">{stats.bestWPM}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Content type breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Performance by Content Type
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-cream-200">
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Sessions</th>
                      <th className="pb-2 text-right">Mistake Rate</th>
                      <th className="pb-2 text-right">Avg WPM</th>
                      <th className="pb-2 text-right">Best WPM</th>
                      <th className="pb-2 text-right">Errors/Word</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(userStats.contentTypeStats) as [ContentType, typeof userStats.contentTypeStats[ContentType]][])
                      .filter(([, stats]) => stats.sessionCount > 0)
                      .map(([type, stats]) => (
                        <tr key={type} className="border-b border-cream-100">
                          <td className="py-2 capitalize font-medium">{type}</td>
                          <td className="py-2 text-right">{stats.sessionCount}</td>
                          <td className="py-2 text-right">
                            <span
                              className={`${
                                stats.mistakeRate > 0.1
                                  ? "text-red-600"
                                  : stats.mistakeRate > 0.05
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {(stats.mistakeRate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 text-right">{stats.averageWPM}</td>
                          <td className="py-2 text-right">{stats.bestWPM}</td>
                          <td className="py-2 text-right">
                            {stats.errorsPerWord?.toFixed(2) ?? "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Weakest keys */}
            {userStats.weakestKeys.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Keys to Practice
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userStats.weakestKeys.slice(0, 10).map((key) => {
                    const keyData = userStats.keyStats[key];
                    return (
                      <div
                        key={key}
                        className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-center"
                      >
                        <div className="text-lg font-bold text-red-700">
                          {key === " " ? "Space" : key}
                        </div>
                        <div className="text-xs text-red-500">
                          {keyData
                            ? `${(keyData.mistakeRate * 100).toFixed(0)}% errors`
                            : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* WPM History */}
            {userStats.wpmHistory.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  WPM Progress
                </h3>
                <div className="h-40 flex items-end gap-1">
                  {userStats.wpmHistory.slice(-30).map((point, index) => {
                    const maxWPM = Math.max(
                      ...userStats.wpmHistory.map((p) => p.wpm),
                      1
                    );
                    const height = (point.wpm / maxWPM) * 100;

                    return (
                      <div
                        key={point.sessionId}
                        className="flex-1 bg-primary-400 hover:bg-primary-500 transition-colors rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${point.wpm} WPM, ${point.accuracy}% accuracy`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Last {Math.min(30, userStats.wpmHistory.length)} sessions
                </div>
              </Card>
            )}

            {/* Recent sessions */}
            {userStats.recentSessions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Sessions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-cream-200">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Mode</th>
                        <th className="pb-2 text-right">WPM</th>
                        <th className="pb-2 text-right">Accuracy</th>
                        <th className="pb-2 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStats.recentSessions.slice(0, 10).map((session) => (
                        <tr
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="border-b border-cream-100 cursor-pointer hover:bg-cream-100 transition-colors"
                        >
                          <td className="py-2">
                            {new Date(session.timestamp).toLocaleDateString()}{" "}
                            <span className="text-gray-400">
                              {new Date(session.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="py-2 capitalize">
                            {session.mode.contentType}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {session.grossWPM}
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={`${
                                session.accuracy >= 95
                                  ? "text-green-600"
                                  : session.accuracy >= 85
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {session.accuracy}%
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            {Math.round(session.duration / 1000)}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Reset button */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset All Statistics
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session Summary Modal */}
      {selectedSession && (
        <SessionSummary
          result={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDismiss={() => setSelectedSession(null)}
        />
      )}
    </main>
  );
}
