"use client";

import { useState, useEffect, useCallback } from "react";
import type { SessionResult } from "@/lib/session";
import type { UserStats } from "@/lib/stats";
import { getDefaultUserStats } from "@/lib/stats";
import {
  getUserStats,
  saveUserStats,
  updateUserStats as updateStorageStats,
} from "@/lib/storage";

export function useLocalStorage() {
  const [userStats, setUserStats] = useState<UserStats>(getDefaultUserStats());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    const stats = getUserStats();
    setUserStats(stats);
    setIsLoaded(true);
  }, []);

  // Update stats when a session completes
  const updateStats = useCallback((sessionResult: SessionResult) => {
    const updatedStats = updateStorageStats(sessionResult);
    setUserStats(updatedStats);
    return updatedStats;
  }, []);

  // Reset all stats
  const resetStats = useCallback(() => {
    const defaultStats = getDefaultUserStats();
    saveUserStats(defaultStats);
    setUserStats(defaultStats);
  }, []);

  return {
    userStats,
    isLoaded,
    updateStats,
    resetStats,
  };
}
