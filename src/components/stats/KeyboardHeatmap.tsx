"use client";

import { useState } from "react";
import { QWERTY_LAYOUT } from "@/lib/keyboard/layout";
import { Card } from "@/components/ui/Card";
import type { KeyDefinition } from "@/types/keyboard";
import type { KeyStats } from "@/types/stats";

interface KeyboardHeatmapProps {
  keyStats: Record<string, KeyStats>;
}

// Returns [backgroundColor, borderColor] with gradient interpolation within buckets
function getAccuracyColors(mistakeRate: number | undefined): { bg: string; border: string } {
  if (mistakeRate === undefined) {
    return { bg: "rgb(245, 243, 239)", border: "rgb(224, 219, 209)" }; // cream
  }

  // Interpolate within buckets for smoother gradients
  // Green bucket: 0-2% errors (hue 120-100)
  if (mistakeRate <= 0.02) {
    const t = mistakeRate / 0.02; // 0 to 1 within bucket
    const saturation = 45 - t * 15; // 45% to 30%
    const lightness = 85 + t * 5; // 85% to 90%
    return {
      bg: `hsl(120, ${saturation}%, ${lightness}%)`,
      border: `hsl(120, ${saturation + 15}%, ${lightness - 20}%)`,
    };
  }

  // Yellow bucket: 2-5% errors (hue 60-45)
  if (mistakeRate <= 0.05) {
    const t = (mistakeRate - 0.02) / 0.03; // 0 to 1 within bucket
    const hue = 55 - t * 10; // 55 to 45
    const saturation = 50 - t * 10; // 50% to 40%
    const lightness = 88 - t * 3; // 88% to 85%
    return {
      bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      border: `hsl(${hue}, ${saturation + 15}%, ${lightness - 20}%)`,
    };
  }

  // Orange bucket: 5-10% errors (hue 35-20)
  if (mistakeRate <= 0.10) {
    const t = (mistakeRate - 0.05) / 0.05; // 0 to 1 within bucket
    const hue = 35 - t * 15; // 35 to 20
    const saturation = 60 - t * 10; // 60% to 50%
    const lightness = 88 - t * 5; // 88% to 83%
    return {
      bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      border: `hsl(${hue}, ${saturation + 15}%, ${lightness - 20}%)`,
    };
  }

  // Red bucket: >10% errors (hue 10-0, capped at 25%)
  const t = Math.min((mistakeRate - 0.10) / 0.15, 1); // 0 to 1, capped
  const hue = 10 - t * 10; // 10 to 0
  const saturation = 55 + t * 15; // 55% to 70%
  const lightness = 85 - t * 10; // 85% to 75%
  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsl(${hue}, ${saturation + 10}%, ${lightness - 20}%)`,
  };
}

function getWidthClass(width: number): string {
  if (width === 1) return "w-10";
  if (width === 1.25) return "w-[50px]";
  if (width === 1.5) return "w-[60px]";
  if (width === 1.75) return "w-[70px]";
  if (width === 2) return "w-[80px]";
  if (width === 2.25) return "w-[90px]";
  if (width === 2.75) return "w-[110px]";
  if (width >= 6) return "w-[250px]";
  return "w-10";
}

interface HeatmapKeyProps {
  keyDef: KeyDefinition;
  keyStats: Record<string, KeyStats>;
}

function HeatmapKey({ keyDef, keyStats }: HeatmapKeyProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const width = keyDef.width || 1;
  const widthClass = getWidthClass(width);

  // Get stats for this key (check both lowercase and the key itself)
  const stats = keyStats[keyDef.key] || keyStats[keyDef.key.toLowerCase()];
  const shiftStats = keyDef.shiftKey ? keyStats[keyDef.shiftKey] : undefined;

  // For letter keys, combine lowercase and uppercase stats
  const combinedAttempts = (stats?.totalAttempts || 0) + (shiftStats?.totalAttempts || 0);
  const combinedMistakes = (stats?.mistakes || 0) + (shiftStats?.mistakes || 0);
  const combinedMistakeRate = combinedAttempts > 0 ? combinedMistakes / combinedAttempts : undefined;

  const colors = getAccuracyColors(combinedMistakeRate);

  // Determine display label
  let displayLabel = keyDef.label || keyDef.key;
  if (keyDef.key === " ") {
    displayLabel = "Space";
  }

  // Only show tooltip for keys with data
  const hasData = combinedAttempts > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasData && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          ${widthClass} h-10 flex flex-col items-center justify-center
          text-xs font-medium text-gray-700
          border rounded-md transition-all duration-75
        `}
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        {keyDef.shiftKey && keyDef.key.length === 1 && (
          <span className="text-[10px] text-gray-400 -mb-0.5">{keyDef.shiftKey}</span>
        )}
        <span className={displayLabel.length > 1 ? "text-[10px]" : ""}>
          {displayLabel}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && hasData && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          <div className="font-medium mb-1">
            {keyDef.key === " " ? "Space" : keyDef.shiftKey ? `${keyDef.key} / ${keyDef.shiftKey}` : keyDef.key}
          </div>
          <div className="space-y-0.5 text-gray-300">
            <div>Attempts: {combinedAttempts}</div>
            <div>Mistakes: {combinedMistakes}</div>
            <div>
              Accuracy:{" "}
              <span className={combinedMistakeRate! <= 0.05 ? "text-green-400" : combinedMistakeRate! <= 0.10 ? "text-yellow-400" : "text-red-400"}>
                {((1 - combinedMistakeRate!) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

export function KeyboardHeatmap({ keyStats }: KeyboardHeatmapProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Keyboard Accuracy
      </h3>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-1 min-w-[600px]">
          {QWERTY_LAYOUT.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((keyDef, keyIndex) => (
                <HeatmapKey
                  key={`${rowIndex}-${keyIndex}`}
                  keyDef={keyDef}
                  keyStats={keyStats}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-6 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span>&gt;98%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
          <span>95-98%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
          <span>90-95%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
          <span>&lt;90%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-cream-100 border border-cream-200" />
          <span>No data</span>
        </div>
      </div>
    </Card>
  );
}
