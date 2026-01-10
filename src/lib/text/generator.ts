import type { SessionMode, CharCategory, ContentType, CharacterTypeFlags } from "@/types";
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

interface BaseTextOptions {
  contentType: ContentType;
  length: TextLengthOption;
  weakKeys?: string[];
  adaptiveIntensity?: number;
}

// Generate "canonical" base text with all features enabled
// This text includes proper case, punctuation, and numbers
export function generateBaseText(options: BaseTextOptions): string {
  const { contentType, length, weakKeys = [], adaptiveIntensity = 0.5 } = options;
  const targetLength = TEXT_LENGTH_CHARS[length];

  switch (contentType) {
    case "words":
      return generateBaseWords(targetLength, weakKeys, adaptiveIntensity);
    case "sentences":
      return generateBaseSentences(targetLength, weakKeys, adaptiveIntensity);
    case "paragraphs":
      return generateBaseParagraphs(targetLength, weakKeys, adaptiveIntensity);
    default:
      return generateBaseWords(targetLength, weakKeys, adaptiveIntensity);
  }
}

// Transform base text according to character type settings
export function transformText(baseText: string, characterTypes: CharacterTypeFlags): string {
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

  // Remove punctuation if disabled (preserve newlines for sentence/paragraph structure)
  if (!characterTypes.punctuation) {
    result = result.replace(/[.,!?;:'"()\-]/g, "");
  }

  // Remove numbers if disabled
  if (!characterTypes.numbers) {
    result = result.replace(/\d+/g, "");
  }

  // Clean up: collapse multiple spaces (but preserve newlines), trim each line
  result = result
    .split("\n")
    .map(line => line.replace(/ +/g, " ").trim())
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
  return transformText(baseText, options.mode.characterTypes);
}

// Generate base words with mixed case and occasional numbers
function generateBaseWords(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const wordPool = getAllWords();
  const words: string[] = [];
  let currentLength = 0;
  let wordIndex = 0;

  while (currentLength < targetLength) {
    const word = selectWeightedWord(wordPool, weakKeys, adaptiveIntensity);
    let result = word.toLowerCase();

    // Occasionally capitalize (30% chance)
    if (Math.random() < 0.3) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    // Add numbers occasionally (15% chance) - deterministic position based on word index
    if (wordIndex % 7 === 3) {
      const num = Math.floor(Math.random() * 100);
      result = Math.random() < 0.5 ? `${result}${num}` : `${num}${result}`;
    }

    words.push(result);
    currentLength += result.length + 1;
    wordIndex++;
  }

  return words.join(" ");
}

// Generate base sentences with proper case, punctuation, and occasional numbers
function generateBaseSentences(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const sentences = [...SIMPLE_SENTENCES, ...PUNCTUATION_PHRASES];
  const result: string[] = [];
  let currentLength = 0;
  let sentenceIndex = 0;

  while (currentLength < targetLength) {
    let sentence = selectWeightedSentence(sentences, weakKeys, adaptiveIntensity);

    // Add a number to every 4th sentence
    if (sentenceIndex % 4 === 2) {
      const words = sentence.split(" ");
      const insertIndex = Math.floor(words.length / 2);
      const num = Math.floor(Math.random() * 1000);
      words.splice(insertIndex, 0, num.toString());
      sentence = words.join(" ");
    }

    result.push(sentence);
    currentLength += sentence.length + 1;
    sentenceIndex++;
  }

  // Join with newlines - these will be optional (skippable) in the typing UI
  return result.join("\n");
}

// Generate base paragraphs with proper case, punctuation, and occasional numbers
function generateBaseParagraphs(
  targetLength: number,
  weakKeys: string[],
  adaptiveIntensity: number
): string {
  const sentences = [...SIMPLE_SENTENCES, ...LONGER_SENTENCES];
  const paragraphs: string[] = [];
  let currentLength = 0;
  let totalSentenceIndex = 0;

  while (currentLength < targetLength) {
    const sentenceCount = 2 + Math.floor(Math.random() * 3);
    const paragraph: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      let sentence = selectWeightedSentence(sentences, weakKeys, adaptiveIntensity);

      // Add a number to every 4th sentence
      if (totalSentenceIndex % 4 === 2) {
        const words = sentence.split(" ");
        const insertIndex = Math.floor(words.length / 2);
        const num = Math.floor(Math.random() * 1000);
        words.splice(insertIndex, 0, num.toString());
        sentence = words.join(" ");
      }

      paragraph.push(sentence);
      totalSentenceIndex++;
    }

    const paragraphText = paragraph.join(" ");
    paragraphs.push(paragraphText);
    currentLength += paragraphText.length + 2;
  }

  return paragraphs.join("\n\n");
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
