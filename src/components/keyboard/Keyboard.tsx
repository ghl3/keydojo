"use client";

import { useMemo } from "react";
import { Key } from "./Key";
import { QWERTY_LAYOUT, getKeyDefinitionForChar, needsShift } from "@/lib/keyboard/layout";
import type { KeyState } from "@/types/keyboard";
import { Card } from "@/components/ui/Card";

interface KeyboardProps {
  activeKey: string | null;
  nextKey: string | null;
  errorKey: string | null;
  weakKeys?: string[];
}

export function Keyboard({
  activeKey,
  nextKey,
  errorKey,
  weakKeys = [],
}: KeyboardProps) {
  // Determine if shift should be shown (for uppercase letters)
  const showShift = useMemo(() => {
    return nextKey ? needsShift(nextKey) : false;
  }, [nextKey]);

  // Get the key definition for the next key
  const nextKeyDef = useMemo(() => {
    return nextKey ? getKeyDefinitionForChar(nextKey) : null;
  }, [nextKey]);

  // Build a set of weak keys for quick lookup
  const weakKeySet = useMemo(() => new Set(weakKeys.map((k) => k.toLowerCase())), [weakKeys]);

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="flex flex-col items-center gap-1 min-w-[600px]">
        {QWERTY_LAYOUT.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((keyDef, keyIndex) => {
              // Determine key state
              let state: KeyState = "default";

              // Check if this is the active key
              if (activeKey) {
                const activeKeyLower = activeKey.toLowerCase();
                const keyDefLower = keyDef.key.toLowerCase();
                const shiftKeyLower = keyDef.shiftKey?.toLowerCase();

                if (
                  activeKey === keyDef.key ||
                  activeKey === keyDef.shiftKey ||
                  activeKeyLower === keyDefLower ||
                  activeKeyLower === shiftKeyLower
                ) {
                  state = "active";
                }

                // Check if shift should be highlighted
                if (
                  (keyDef.code === "ShiftLeft" || keyDef.code === "ShiftRight") &&
                  showShift
                ) {
                  state = "next";
                }
              }

              // Check if this is the next expected key
              if (
                nextKeyDef &&
                nextKeyDef.code === keyDef.code &&
                state === "default"
              ) {
                state = "next";
              }

              // Show shift as next if the next character needs shift
              if (
                showShift &&
                (keyDef.code === "ShiftLeft" || keyDef.code === "ShiftRight") &&
                state === "default"
              ) {
                state = "next";
              }

              // Check if this was an error key
              if (errorKey && state === "default") {
                const errorKeyLower = errorKey.toLowerCase();
                if (
                  errorKey === keyDef.key ||
                  errorKey === keyDef.shiftKey ||
                  errorKeyLower === keyDef.key.toLowerCase()
                ) {
                  state = "error";
                }
              }

              // Check if this is a weak key
              if (state === "default" && keyDef.key.length === 1) {
                if (weakKeySet.has(keyDef.key.toLowerCase())) {
                  state = "weak";
                }
              }

              return (
                <Key
                  key={`${rowIndex}-${keyIndex}`}
                  keyDef={keyDef}
                  state={state}
                  showShift={showShift}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
