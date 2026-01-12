import type { CharCategory } from "@/lib/session";
import { getAccuracyColor, getWpmColor } from "./helpers";

interface CategoryData {
  category: CharCategory;
  attempts: number;
  mistakes: number;
  accuracy: number;
  wpm: number;
}

interface CategoryBreakdownProps {
  categoryPerformance: CategoryData[];
}

export function CategoryBreakdown({ categoryPerformance }: CategoryBreakdownProps) {
  if (categoryPerformance.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        By Character Type
      </h3>
      <div className="space-y-2">
        {categoryPerformance.map(({ category, attempts, mistakes, accuracy, wpm }) => (
          <div key={category} className="flex items-center justify-between text-sm py-1.5 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="capitalize text-gray-700 font-medium w-24">{category}</span>
              <span className="text-gray-500 text-xs">
                {attempts} typed
                {mistakes > 0 && (
                  <span className="text-red-500 ml-2">{mistakes} error{mistakes !== 1 ? "s" : ""}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`${getWpmColor(wpm)} tabular-nums`}>{wpm} WPM</span>
              <span className={`font-medium tabular-nums w-12 text-right ${getAccuracyColor(accuracy)}`}>
                {accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
