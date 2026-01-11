import type {
  UserStats,
  SessionResult,
  KeyStats,
  PairStats,
  CharCategory,
  ContentType,
} from "@/types";
import { getContentType } from "@/types";
import { createDefaultKeyStats } from "@/types/stats";
import { classifyChar } from "./classifier";
import { updateSpacedRepetition } from "./spacedRepetition";

// Merge a session result into the overall user stats
export function aggregateSessionIntoStats(
  currentStats: UserStats,
  session: SessionResult
): UserStats {
  const now = Date.now();

  // Update overall totals
  const totalSessions = currentStats.totalSessions + 1;
  const totalTimeMs = currentStats.totalTimeMs + session.duration;
  const totalCharacters = currentStats.totalCharacters + session.totalCharacters;
  const totalMistakes = currentStats.totalMistakes + session.totalMistakes;

  // Update WPM metrics
  const newAverageWPM = Math.round(
    (currentStats.averageWPM * currentStats.totalSessions + session.grossWPM) /
      totalSessions
  );
  const bestWPM = Math.max(currentStats.bestWPM, session.grossWPM);

  // Add to WPM history
  const wpmHistory = [
    ...currentStats.wpmHistory,
    {
      timestamp: session.timestamp,
      wpm: session.grossWPM,
      accuracy: session.accuracy,
      sessionId: session.id,
    },
  ].slice(-200); // Keep last 200 data points

  // Update per-key stats
  const keyStats = { ...currentStats.keyStats };
  for (const [key, mistakes] of Object.entries(session.mistakesByKey)) {
    const category = classifyChar(key);
    if (!keyStats[key]) {
      keyStats[key] = createDefaultKeyStats(key, category);
    }

    const keyData = keyStats[key];
    const wasCorrect = mistakes === 0;

    // Update attempt counts
    keyData.totalAttempts += 1;
    keyData.mistakes += mistakes;
    keyData.mistakeRate =
      keyData.totalAttempts > 0
        ? keyData.mistakes / keyData.totalAttempts
        : 0;
    keyData.lastPracticed = now;

    // Update spaced repetition
    const updated = updateSpacedRepetition(keyData, wasCorrect);
    keyData.easeFactor = updated.easeFactor;
    keyData.interval = updated.interval;
    keyData.nextReviewDate = updated.nextReviewDate;
  }

  // Update category stats
  const categoryStats = { ...currentStats.categoryStats };
  for (const [category, data] of Object.entries(
    session.categoryBreakdown
  ) as [CharCategory, { attempts: number; mistakes: number; wpm: number }][]) {
    const catStats = categoryStats[category];

    if (data.attempts > 0) {
      catStats.totalAttempts += data.attempts;
      catStats.mistakes += data.mistakes;
      catStats.mistakeRate =
        catStats.totalAttempts > 0
          ? catStats.mistakes / catStats.totalAttempts
          : 0;
      catStats.sessionCount += 1;
      catStats.averageWPM = Math.round(
        (catStats.averageWPM * (catStats.sessionCount - 1) + data.wpm) /
          catStats.sessionCount
      );
      catStats.bestWPM = Math.max(catStats.bestWPM, data.wpm);
    }
  }

  // Update content type stats
  const contentTypeStats = { ...currentStats.contentTypeStats };
  const contentType = getContentType(session.mode);
  const ctStats = contentTypeStats[contentType];

  ctStats.totalAttempts += session.totalCharacters;
  ctStats.mistakes += session.totalMistakes;
  ctStats.mistakeRate =
    ctStats.totalAttempts > 0 ? ctStats.mistakes / ctStats.totalAttempts : 0;
  ctStats.sessionCount += 1;
  ctStats.averageWPM = Math.round(
    (ctStats.averageWPM * (ctStats.sessionCount - 1) + session.grossWPM) /
      ctStats.sessionCount
  );
  ctStats.bestWPM = Math.max(ctStats.bestWPM, session.grossWPM);
  ctStats.errorsPerWord = session.errorsPerWord;
  ctStats.errorsPerSentence = session.errorsPerSentence;
  ctStats.errorsPerParagraph = session.errorsPerParagraph;

  // Update pair stats
  const pairStats = { ...currentStats.pairStats };
  for (const [pair, mistakes] of Object.entries(session.mistakesByPair || {})) {
    if (!pairStats[pair]) {
      pairStats[pair] = {
        pair,
        totalAttempts: 0,
        mistakes: 0,
        mistakeRate: 0,
      };
    }
    pairStats[pair].totalAttempts += 1;
    pairStats[pair].mistakes += mistakes;
    pairStats[pair].mistakeRate =
      pairStats[pair].totalAttempts > 0
        ? pairStats[pair].mistakes / pairStats[pair].totalAttempts
        : 0;
  }

  // Calculate weakest keys (sorted by mistake rate, at least 5 attempts)
  const weakestKeys = Object.values(keyStats)
    .filter((k) => k.totalAttempts >= 5)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .slice(0, 10)
    .map((k) => k.key);

  // Calculate weakest pairs (sorted by mistake rate, at least 3 attempts)
  const weakestPairs = Object.values(pairStats)
    .filter((p) => p.totalAttempts >= 3)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .slice(0, 10)
    .map((p) => p.pair);

  // Calculate weakest categories
  const weakestCategories = (
    Object.values(categoryStats) as { category: CharCategory; mistakeRate: number; totalAttempts: number }[]
  )
    .filter((c) => c.totalAttempts >= 10)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .map((c) => c.category);

  // Add to recent sessions
  const recentSessions = [session, ...currentStats.recentSessions].slice(
    0,
    100
  );

  return {
    firstSessionAt: currentStats.firstSessionAt || session.timestamp,
    lastSessionAt: session.timestamp,
    totalSessions,
    totalTimeMs,
    totalCharacters,
    totalMistakes,
    averageWPM: newAverageWPM,
    bestWPM,
    wpmHistory,
    keyStats,
    categoryStats,
    contentTypeStats,
    wordStats: currentStats.wordStats, // TODO: implement word-level tracking
    pairStats,
    weakestKeys,
    weakestPairs,
    weakestCategories,
    recentSessions,
  };
}
