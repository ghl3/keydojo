import type { SessionMode, ContentType, CharacterTypeFlags } from "@/types";
import type { TextLengthOption } from "@/types/settings";
import { TEXT_LENGTH_CHARS } from "@/types/settings";
import { getAllWords } from "./wordLists";
import { getAllSentences } from "./sentences";
import { getAllParagraphs } from "./paragraphs";
import { getAllCodeSnippets } from "./codeSnippets";
import { getNumberSequences, getAllNumberSentences } from "./numbersContent";
import { getPunctuationDrills, getAllPunctuationSentences } from "./punctuationContent";

interface TextGeneratorOptions {
  mode: SessionMode;
  length: TextLengthOption;
  weakKeys?: string[];
  adaptiveIntensity?: number; // 0-1, how much to weight weak keys
}

interface BaseTextOptions {
  contentType: ContentType;
  length: TextLengthOption;
  weakKeys?: string[];
  adaptiveIntensity?: number;
  characterTypes?: CharacterTypeFlags;
}

// Check if this is a numbers-only mode (numbers enabled, no letters)
function isNumbersOnlyMode(characterTypes?: CharacterTypeFlags): boolean {
  if (!characterTypes) return false;
  return (
    characterTypes.numbers &&
    !characterTypes.lowercaseLetters &&
    !characterTypes.uppercaseLetters
  );
}

// Check if this is a punctuation-only mode (punctuation enabled, no letters/numbers)
function isPunctuationOnlyMode(characterTypes?: CharacterTypeFlags): boolean {
  if (!characterTypes) return false;
  return (
    characterTypes.punctuation &&
    !characterTypes.lowercaseLetters &&
    !characterTypes.uppercaseLetters &&
    !characterTypes.numbers
  );
}

// Generate "canonical" base text with all features enabled
// This text includes proper case, punctuation, and numbers
export function generateBaseText(options: BaseTextOptions): string {
  const { contentType, length, weakKeys = [], adaptiveIntensity = 0.5, characterTypes } = options;
  const targetLength = TEXT_LENGTH_CHARS[length];

  // Handle edge cases for special character-only modes
  if (isNumbersOnlyMode(characterTypes)) {
    return generateNumbersContent(targetLength);
  }
  if (isPunctuationOnlyMode(characterTypes)) {
    return generatePunctuationContent(targetLength);
  }

  switch (contentType) {
    case "words":
      return generateBaseWords(targetLength, weakKeys, adaptiveIntensity);
    case "sentences":
      return generateBaseSentences(targetLength, weakKeys, adaptiveIntensity);
    case "paragraphs":
      return generateBaseParagraphs(targetLength, weakKeys, adaptiveIntensity);
    case "code":
      return generateBaseCode(targetLength);
    default:
      return generateBaseWords(targetLength, weakKeys, adaptiveIntensity);
  }
}

// Transform base text according to character type settings
// Note: Code mode skips transformations to preserve syntax
export function transformText(
  baseText: string,
  characterTypes: CharacterTypeFlags,
  contentType?: ContentType
): string {
  // Code mode: skip all transformations to preserve syntax
  if (contentType === "code") {
    return baseText;
  }

  let result = baseText;

  // Handle case transformations
  if (!characterTypes.uppercaseLetters && characterTypes.lowercaseLetters) {
    // Lowercase only
    result = result.toLowerCase();
  } else if (characterTypes.uppercaseLetters && !characterTypes.lowercaseLetters) {
    // Uppercase only
    result = result.toUpperCase();
  }
  // If both or neither, keep original case

  // Remove all letters if neither lowercase nor uppercase is enabled
  // This ensures numbers-only and punctuation-only modes have no letters
  if (!characterTypes.lowercaseLetters && !characterTypes.uppercaseLetters) {
    result = result.replace(/[a-zA-Z]/g, "");
  }

  // Remove punctuation if disabled (preserve newlines for sentence/paragraph structure)
  if (!characterTypes.punctuation) {
    result = result.replace(/[.,!?;:'"()\-@#$%^&*~\/\\+=<>\[\]{}|`_]/g, "");
  }

  // Remove numbers if disabled
  if (!characterTypes.numbers) {
    result = result.replace(/\d+/g, "");
  }

  // Remove spaces if disabled (but preserve newlines for structure)
  if (!characterTypes.spaces) {
    result = result.replace(/ /g, "");
  }

  // Clean up: collapse multiple spaces (but preserve newlines), trim each line
  result = result
    .split("\n")
    .map(line => line.replace(/ +/g, " ").trim())
    .join("\n");

  // Remove empty lines that may result from transformations
  result = result
    .split("\n")
    .filter(line => line.length > 0)
    .join("\n");

  return result;
}

// Legacy function for backwards compatibility
export function generateText(options: TextGeneratorOptions): string {
  const baseText = generateBaseText({
    contentType: options.mode.contentType,
    length: options.length,
    weakKeys: options.weakKeys,
    adaptiveIntensity: options.adaptiveIntensity,
  });
  return transformText(baseText, options.mode.characterTypes, options.mode.contentType);
}

// Generate base words with mixed case (no artificial numbers)
function generateBaseWords(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const wordPool = getAllWords();
  const words: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    const word = selectWeightedItem(wordPool, weakKeys, adaptiveIntensity);
    let result = word.toLowerCase();

    // Occasionally capitalize (30% chance)
    if (Math.random() < 0.3) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    words.push(result);
    currentLength += result.length + 1;
  }

  return words.join(" ");
}

// Generate base sentences with proper case and punctuation (no artificial numbers)
function generateBaseSentences(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const sentences = getAllSentences();
  const result: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    const sentence = selectWeightedItem(sentences, weakKeys, adaptiveIntensity);
    result.push(sentence);
    currentLength += sentence.length + 1;
  }

  // Join with newlines - these will be optional (skippable) in the typing UI
  return result.join("\n");
}

// Generate base paragraphs using the structured paragraph data (no artificial numbers)
function generateBaseParagraphs(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const paragraphArrays = getAllParagraphs();
  const paragraphs: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    // Select a paragraph (array of sentences)
    const paragraphSentences = selectWeightedItem(paragraphArrays, weakKeys, adaptiveIntensity);

    // Join sentences within paragraph with spaces
    const paragraphText = paragraphSentences.join(" ");
    paragraphs.push(paragraphText);
    currentLength += paragraphText.length + 2;
  }

  // Join paragraphs with double newlines
  return paragraphs.join("\n\n");
}

// Generate content for numbers-only mode
function generateNumbersContent(targetLength: number): string {
  const sequences = getNumberSequences();
  const result: string[] = [];
  let currentLength = 0;

  // Shuffle to get variety
  const shuffled = [...sequences].sort(() => Math.random() - 0.5);
  let index = 0;

  while (currentLength < targetLength) {
    const sequence = shuffled[index % shuffled.length];
    result.push(sequence);
    currentLength += sequence.length + 1;
    index++;
  }

  return result.join("\n");
}

// Generate content for punctuation-only mode
function generatePunctuationContent(targetLength: number): string {
  const drills = getPunctuationDrills();
  const result: string[] = [];
  let currentLength = 0;

  // Shuffle to get variety
  const shuffled = [...drills].sort(() => Math.random() - 0.5);
  let index = 0;

  while (currentLength < targetLength) {
    const drill = shuffled[index % shuffled.length];
    result.push(drill);
    currentLength += drill.length + 1;
    index++;
  }

  return result.join("\n");
}

// Generate base code snippets
function generateBaseCode(targetLength: number): string {
  const snippets = getAllCodeSnippets();
  const result: string[] = [];
  let currentLength = 0;

  // Shuffle snippets to get variety
  const shuffled = [...snippets].sort(() => Math.random() - 0.5);
  let index = 0;

  while (currentLength < targetLength && index < shuffled.length) {
    const snippet = shuffled[index];
    result.push(snippet);
    currentLength += snippet.length + 2; // +2 for the double newline between snippets
    index++;
  }

  // If we've used all snippets but need more, start over with reshuffled
  while (currentLength < targetLength) {
    const reshuffled = [...snippets].sort(() => Math.random() - 0.5);
    for (const snippet of reshuffled) {
      if (currentLength >= targetLength) break;
      result.push(snippet);
      currentLength += snippet.length + 2;
    }
  }

  // Join code snippets with double newlines for visual separation
  return result.join("\n\n");
}

// Generic weighted selection for any item type
function selectWeightedItem<T>(
  items: T[],
  weakKeys: string[],
  intensity: number
): T {
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

// Count how many weak keys appear in text
function countWeakKeysInText(text: string, weakKeys: string[]): number {
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
