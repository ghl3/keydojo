import type { LiveStats } from "@/lib/stats";
import { Card } from "@/components/ui/Card";

interface StatsDisplayProps {
  stats: LiveStats;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-center gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-primary-600">
            {stats.currentWPM}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">WPM</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary-600">
            {stats.currentAccuracy}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Accuracy
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-600">
            {formatTime(stats.elapsedTime)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-600">
            {stats.charactersTyped}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Chars</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-500">
            {stats.mistakeCount}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Mistakes
          </div>
        </div>
      </div>
    </Card>
  );
}
