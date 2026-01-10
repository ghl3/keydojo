import type { UserStats, UserSettings, SessionResult } from "@/types";
import { getDefaultUserStats } from "@/types/stats";
import { getDefaultSettings } from "@/types/settings";
import { aggregateSessionIntoStats } from "@/lib/stats/aggregator";

const STORAGE_KEYS = {
  USER_STATS: "keydojo_user_stats",
  USER_SETTINGS: "keydojo_user_settings",
  SESSION_HISTORY: "keydojo_session_history",
} as const;

// Generic get/set with JSON parsing
function get<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// User Stats
export function getUserStats(): UserStats {
  return get(STORAGE_KEYS.USER_STATS, getDefaultUserStats());
}

export function saveUserStats(stats: UserStats): void {
  set(STORAGE_KEYS.USER_STATS, stats);
}

export function updateUserStats(sessionResult: SessionResult): UserStats {
  const currentStats = getUserStats();
  const updatedStats = aggregateSessionIntoStats(currentStats, sessionResult);
  saveUserStats(updatedStats);
  return updatedStats;
}

// User Settings
export function getUserSettings(): UserSettings {
  const defaults = getDefaultSettings();
  const saved = get<Partial<UserSettings>>(STORAGE_KEYS.USER_SETTINGS, {});
  // Merge saved settings with defaults to ensure new fields have values
  return { ...defaults, ...saved };
}

export function saveUserSettings(settings: UserSettings): void {
  set(STORAGE_KEYS.USER_SETTINGS, settings);
}

export function updateUserSettings(
  updates: Partial<UserSettings>
): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...updates };
  saveUserSettings(updated);
  return updated;
}

// Session History (keep last 100 sessions)
export function getSessionHistory(): SessionResult[] {
  return get<SessionResult[]>(STORAGE_KEYS.SESSION_HISTORY, []);
}

export function addSessionToHistory(session: SessionResult): void {
  const history = getSessionHistory();
  history.unshift(session);
  set(STORAGE_KEYS.SESSION_HISTORY, history.slice(0, 100));
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
