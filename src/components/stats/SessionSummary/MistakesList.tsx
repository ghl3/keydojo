import type { UserStats } from "@/lib/stats";

interface MistakesListProps {
  topMistakes: [string, number][];
  topPairMistakes: [string, number][];
  userStats?: UserStats;
}

export function MistakesList({ topMistakes, topPairMistakes, userStats }: MistakesListProps) {
  if (topMistakes.length === 0 && topPairMistakes.length === 0) return null;

  return (
    <div className="mb-6">
      {topMistakes.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Keys to Practice
          </h3>
          <div className="space-y-1.5 mb-3">
            {topMistakes.map(([key, count]) => {
              const historicalRate = userStats?.keyStats[key]?.mistakeRate;
              const displayKey = key === " " ? "Space" : key;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-1.5 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-red-700 w-8 text-center bg-red-100 rounded px-1">
                      {displayKey}
                    </span>
                    <span className="text-sm text-red-600">
                      {count} error{count !== 1 ? "s" : ""} this session
                    </span>
                  </div>
                  {historicalRate !== undefined && historicalRate > 0 && (
                    <span className="text-xs text-gray-500">
                      {(historicalRate * 100).toFixed(0)}% total
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {topPairMistakes.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Pairs to Practice
          </h3>
          <div className="space-y-1.5">
            {topPairMistakes.map(([pair, count]) => {
              const historicalRate = userStats?.pairStats[pair]?.mistakeRate;
              const displayPair = pair.replace(/ /g, "␣");

              return (
                <div
                  key={pair}
                  className="flex items-center justify-between px-3 py-1.5 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-orange-700 w-10 text-center bg-orange-100 rounded px-1">
                      {displayPair}
                    </span>
                    <span className="text-sm text-orange-600">
                      {count} error{count !== 1 ? "s" : ""} this session
                    </span>
                  </div>
                  {historicalRate !== undefined && historicalRate > 0 && (
                    <span className="text-xs text-gray-500">
                      {(historicalRate * 100).toFixed(0)}% total
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
