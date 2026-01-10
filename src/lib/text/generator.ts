import type { SessionMode, CharCategory } from "@/types";
import type { TextLengthOption } from "@/types/settings";
import { TEXT_LENGTH_CHARS } from "@/types/settings";
import {
  getBasicWords,
  getAllWords,
  SIMPLE_SENTENCES,
  LONGER_SENTENCES,
  PUNCTUATION_PHRASES,
} from "./wordLists";

interface TextGeneratorOptions {
  mode: SessionMode;
  length: TextLengthOption;
  weakKeys?: string[];
  adaptiveIntensity?: number; // 0-1, how much to weight weak keys
}

// Generate text based on options
export function generateText(options: TextGeneratorOptions): string {
  const { mode, length, weakKeys = [], adaptiveIntensity = 0.5 } = options;
  const targetLength = TEXT_LENGTH_CHARS[length];

  switch (mode.contentType) {
    case "words":
      return generateWords(mode, targetLength, weakKeys, adaptiveIntensity);
    case "sentences":
      return generateSentences(mode, targetLength, weakKeys, adaptiveIntensity);
    case "paragraphs":
      return generateParagraphs(mode, targetLength, weakKeys, adaptiveIntensity);
    default:
      return generateWords(mode, targetLength, weakKeys, adaptiveIntensity);
  }
}

// Generate random words
function generateWords(
  mode: SessionMode,
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const wordPool = getFilteredWords(mode);
  const words: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    const word = selectWeightedWord(wordPool, weakKeys, adaptiveIntensity);
    const transformedWord = transformWord(word, mode);

    words.push(transformedWord);
    currentLength += transformedWord.length + 1; // +1 for space
  }

  return words.join(" ");
}

// Generate sentences
function generateSentences(
  mode: SessionMode,
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const sentences = mode.characterTypes.punctuation
    ? [...SIMPLE_SENTENCES, ...PUNCTUATION_PHRASES]
    : SIMPLE_SENTENCES.map((s) => s.replace(/[.,!?;:'"()-]/g, "").trim());

  const result: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    // Weight sentences by weak key presence
    const sentence = selectWeightedSentence(sentences, weakKeys, adaptiveIntensity);
    let transformed = transformSentence(sentence, mode);

    result.push(transformed);
    currentLength += transformed.length + 1;
  }

  return result.join(" ");
}

// Generate paragraphs
function generateParagraphs(
  mode: SessionMode,
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const sentences = [...SIMPLE_SENTENCES, ...LONGER_SENTENCES];
  const paragraphs: string[] = [];
  let currentLength = 0;

  while (currentLength < targetLength) {
    // Each paragraph has 2-4 sentences
    const sentenceCount = 2 + Math.floor(Math.random() * 3);
    const paragraph: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      const sentence = selectWeightedSentence(sentences, weakKeys, adaptiveIntensity);
      paragraph.push(transformSentence(sentence, mode));
    }

    const paragraphText = paragraph.join(" ");
    paragraphs.push(paragraphText);
    currentLength += paragraphText.length + 2; // +2 for paragraph break
  }

  return paragraphs.join("\n\n");
}

// Get words filtered by character types
function getFilteredWords(mode: SessionMode): string[] {
  let words = mode.characterTypes.uppercaseLetters
    ? getAllWords()
    : getBasicWords();

  // Filter based on character types
  if (!mode.characterTypes.uppercaseLetters) {
    words = words.map((w) => w.toLowerCase());
  }

  return words;
}

// Transform a word based on mode settings
function transformWord(word: string, mode: SessionMode): string {
  let result = word;

  if (mode.characterTypes.lowercaseLetters && !mode.characterTypes.uppercaseLetters) {
    result = result.toLowerCase();
  } else if (mode.characterTypes.uppercaseLetters && !mode.characterTypes.lowercaseLetters) {
    result = result.toUpperCase();
  } else if (mode.characterTypes.uppercaseLetters && mode.characterTypes.lowercaseLetters) {
    // Mixed case - occasionally capitalize first letter
    if (Math.random() < 0.3) {
      result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    }
  }

  // Add numbers occasionally if enabled
  if (mode.characterTypes.numbers && Math.random() < 0.15) {
    const num = Math.floor(Math.random() * 100);
    result = Math.random() < 0.5 ? `${result}${num}` : `${num}${result}`;
  }

  return result;
}

// Transform a sentence based on mode settings
function transformSentence(sentence: string, mode: SessionMode): string {
  let result = sentence;

  // Handle case
  if (!mode.characterTypes.uppercaseLetters) {
    result = result.toLowerCase();
  } else if (!mode.characterTypes.lowercaseLetters) {
    result = result.toUpperCase();
  }

  // Remove punctuation if not enabled
  if (!mode.characterTypes.punctuation) {
    result = result.replace(/[.,!?;:'"()-]/g, "");
  }

  // Add numbers if enabled
  if (mode.characterTypes.numbers && Math.random() < 0.2) {
    const words = result.split(" ");
    const insertIndex = Math.floor(Math.random() * words.length);
    const num = Math.floor(Math.random() * 1000);
    words.splice(insertIndex, 0, num.toString());
    result = words.join(" ");
  }

  return result.replace(/\s+/g, " ").trim();
}

// Select a word weighted by weak key presence
function selectWeightedWord(
  words: string[],
  weakKeys: string[],
  intensity: number
): string {
  if (weakKeys.length === 0 || intensity === 0) {
    return words[Math.floor(Math.random() * words.length)];
  }

  // Calculate weights for each word
  const weights = words.map((word) => {
    const weakKeyCount = countWeakKeysInText(word, weakKeys);
    return 1 + weakKeyCount * intensity * 2;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < words.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return words[i];
    }
  }

  return words[words.length - 1];
}

// Select a sentence weighted by weak key presence
function selectWeightedSentence(
  sentences: string[],
  weakKeys: string[],
  intensity: number
): string {
  if (weakKeys.length === 0 || intensity === 0) {
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  // Calculate weights for each sentence
  const weights = sentences.map((sentence) => {
    const weakKeyCount = countWeakKeysInText(sentence, weakKeys);
    return 1 + weakKeyCount * intensity;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < sentences.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return sentences[i];
    }
  }

  return sentences[sentences.length - 1];
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
