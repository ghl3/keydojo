import type { UserStats, KeyStats, PairStats, CharCategory } from "@/types";

/**
 * Get weakest keys sorted by mistake rate.
 * Filters to keys with minimum attempts and error rate.
 */
export function getWeakestKeys(
  keyStats: Record<string, KeyStats>,
  options: { minAttempts?: number; minErrorRate?: number; limit?: number } = {}
): string[] {
  const { minAttempts = 1, minErrorRate = 0.01, limit = 10 } = options;

  return Object.values(keyStats)
    .filter((k) => k.totalAttempts >= minAttempts && k.mistakeRate > minErrorRate)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .slice(0, limit)
    .map((k) => k.key);
}

/**
 * Get weakest letter pairs sorted by mistake rate.
 */
export function getWeakestPairs(
  pairStats: Record<string, PairStats>,
  options: { minAttempts?: number; limit?: number } = {}
): string[] {
  const { minAttempts = 3, limit = 10 } = options;

  return Object.values(pairStats)
    .filter((p) => p.totalAttempts >= minAttempts && p.mistakeRate > 0)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .slice(0, limit)
    .map((p) => p.pair);
}

/**
 * Get weakest categories sorted by mistake rate.
 */
export function getWeakestCategories(
  categoryStats: Record<CharCategory, { category: CharCategory; mistakeRate: number; totalAttempts: number }>,
  options: { minAttempts?: number } = {}
): CharCategory[] {
  const { minAttempts = 10 } = options;

  return Object.values(categoryStats)
    .filter((c) => c.totalAttempts >= minAttempts && c.mistakeRate > 0)
    .sort((a, b) => b.mistakeRate - a.mistakeRate)
    .map((c) => c.category);
}
