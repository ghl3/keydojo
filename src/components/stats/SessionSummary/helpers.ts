// Color and formatting helpers for session summary display

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 98) return "text-green-600";
  if (accuracy >= 95) return "text-green-500";
  if (accuracy >= 90) return "text-yellow-600";
  if (accuracy >= 85) return "text-yellow-500";
  return "text-red-500";
}

export function getWpmColor(wpm: number): string {
  if (wpm >= 80) return "text-green-600";
  if (wpm >= 60) return "text-green-500";
  if (wpm >= 40) return "text-yellow-600";
  if (wpm >= 25) return "text-yellow-500";
  return "text-gray-600";
}

export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
