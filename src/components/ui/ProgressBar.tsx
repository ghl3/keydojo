interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-150 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
