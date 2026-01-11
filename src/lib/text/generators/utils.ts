/**
 * Shared utility functions for content generators
 */

/**
 * Count how many weak keys appear in text
 */
export function countWeakKeysInText(text: string, weakKeys: string[]): number {
  let count = 0;
  const lowerText = text.toLowerCase();

  for (const key of weakKeys) {
    const lowerKey = key.toLowerCase();
    for (const char of lowerText) {
      if (char === lowerKey) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Generic weighted selection for any item type.
 * Items containing more weak keys are more likely to be selected.
 */
export function selectWeightedItem<T>(
  items: T[],
  weakKeys: string[],
  intensity: number
): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }

  if (weakKeys.length === 0 || intensity === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Calculate weights for each item
  const weights = items.map((item) => {
    const text = typeof item === "string" ? item : JSON.stringify(item);
    const weakKeyCount = countWeakKeysInText(text, weakKeys);
    return 1 + weakKeyCount * intensity * 2;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Select a random item from an array
 */
export function selectRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Shuffle an array (returns new array)
 */
export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/**
 * Strip numbers from text
 */
export function stripNumbers(text: string): string {
  return text
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip punctuation from text (preserves newlines)
 */
export function stripPunctuation(text: string): string {
  return text
    .replace(/[.,!?;:'"()\-@#$%^&*~\/\\+=<>\[\]{}|`_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Weighted selection for tagged items (items with content property).
 * Items containing more weak keys are more likely to be selected.
 */
export function selectWeightedItemFromTagged<T extends { content: string | string[] }>(
  items: T[],
  weakKeys: string[],
  intensity: number
): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }

  if (weakKeys.length === 0 || intensity === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Calculate weights for each item
  const weights = items.map((item) => {
    const text = typeof item.content === "string"
      ? item.content
      : item.content.join(" ");
    const weakKeyCount = countWeakKeysInText(text, weakKeys);
    return 1 + weakKeyCount * intensity * 2;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}
