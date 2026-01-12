import type { SessionResult, LegacySessionMode } from "@/lib/session";
import type { UserStats } from "@/lib/stats";
import type { UserSettings } from "@/lib/settings";
import { isLegacyMode, migrateLegacyMode } from "@/lib/session";
import { getDefaultUserStats, aggregateSessionIntoStats } from "@/lib/stats";
import { getDefaultSettings } from "@/lib/settings";

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
  const saved = get<Partial<UserSettings> & LegacySettings>(
    STORAGE_KEYS.USER_SETTINGS,
    {}
  );

  // Migrate from old stopOnError + backspaceMode to new errorMode
  let errorMode = saved.errorMode;
  if (!errorMode && ("stopOnError" in saved || "backspaceMode" in saved)) {
    const stopOnError = saved.stopOnError ?? false;
    const backspaceMode = saved.backspaceMode ?? "full";

    if (stopOnError) {
      errorMode = "stop-on-error";
    } else if (backspaceMode === "disabled") {
      errorMode = "advance-on-error";
    } else {
      errorMode = "correction-required";
    }
  }

  // Migrate from old SessionMode format (characterTypes + contentType)
  // to new format (content: ContentModeConfig)
  let migratedMode: UserSettings["defaultMode"] | undefined;
  if (saved.defaultMode && isLegacyMode(saved.defaultMode)) {
    migratedMode = migrateLegacyMode(saved.defaultMode);
  }

  // Build migrated settings if any migrations occurred
  const needsMigration =
    ("stopOnError" in saved || "backspaceMode" in saved) ||
    (saved.defaultMode && isLegacyMode(saved.defaultMode));

  if (needsMigration) {
    const { stopOnError: _, backspaceMode: __, defaultMode: ___, ...rest } = saved;
    const migrated = {
      ...rest,
      ...(errorMode ? { errorMode } : {}),
      ...(migratedMode ? { defaultMode: migratedMode } : {}),
    };
    set(STORAGE_KEYS.USER_SETTINGS, migrated);
  }

  // Merge saved settings with defaults to ensure new fields have values
  return {
    ...defaults,
    ...saved,
    ...(errorMode ? { errorMode } : {}),
    ...(migratedMode ? { defaultMode: migratedMode } : {}),
  };
}

// Legacy settings types for migration
interface LegacySettings {
  stopOnError?: boolean;
  backspaceMode?: "disabled" | "errors-only" | "full";
  defaultMode?: LegacySessionMode;
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
