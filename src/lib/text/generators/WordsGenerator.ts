/**
 * WordsGenerator - Generates word-based typing practice content
 *
 * Features:
 * - Lowercase/uppercase control
 * - Standalone number words (1776, 42, 2024)
 * - Trailing punctuation (hello, world!)
 * - Special character tokens (@, #, $%)
 */

import type {
  WordsGeneratorOptions,
  GeneratedContent,
} from "@/types/generators";
import { getAllWords } from "../wordLists";
import { selectWeightedItem, selectRandom } from "./utils";

// Pool of number words for typing practice
const NUMBER_WORDS = [
  // Historical/cultural numbers
  "1776",
  "1984",
  "2001",
  "2024",
  "2025",
  // Common numbers
  "42",
  "100",
  "365",
  "24",
  "7",
  "99",
  "1000",
  "13",
  "21",
  "50",
  // Years
  "1990",
  "2000",
  "2010",
  "2020",
  // Quantities
  "12",
  "144",
  "360",
  "500",
  "250",
  // Prices (without $)
  "99",
  "199",
  "299",
  "999",
];

// Pool of special character tokens
const SPECIAL_CHAR_TOKENS = [
  "@",
  "#",
  "$",
  "%",
  "&",
  "*",
  "!",
  "?",
  "@#",
  "$%",
  "&*",
  "!?",
  "#$",
  "%^",
  "*&",
  "@@",
  "##",
  "$$",
];

// Punctuation marks for trailing words
const TRAILING_PUNCTUATION = [",", ".", "!", "?", ";", ":"];

export class WordsGenerator {
  private wordPool: string[];

  constructor() {
    this.wordPool = getAllWords();
  }

  generate(options: WordsGeneratorOptions): GeneratedContent {
    const {
      targetLength,
      lowercase,
      uppercase,
      numbers,
      punctuation,
      specialChars,
      weakKeys = [],
      adaptiveIntensity = 0.5,
    } = options;

    const words: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength) {
      const roll = Math.random();
      let word: string;

      // 10% chance of number word when enabled
      if (numbers && roll < 0.1) {
        word = selectRandom(NUMBER_WORDS);
      }
      // 5% chance of special char when enabled
      else if (specialChars && roll < 0.15) {
        word = selectRandom(SPECIAL_CHAR_TOKENS);
      }
      // Regular word
      else {
        word = selectWeightedItem(this.wordPool, weakKeys, adaptiveIntensity);
        word = this.applyCase(word, lowercase, uppercase);

        // 15% chance of trailing punctuation when enabled
        if (punctuation && Math.random() < 0.15) {
          word += selectRandom(TRAILING_PUNCTUATION);
        }
      }

      words.push(word);
      currentLength += word.length + 1; // +1 for space
    }

    const text = words.join(" ");

    return {
      text,
      metadata: {
        contentType: "words",
        wordCount: words.length,
        characterCount: text.length,
      },
    };
  }

  private applyCase(
    word: string,
    lowercase: boolean,
    uppercase: boolean
  ): string {
    if (uppercase && lowercase) {
      // Mixed case - occasionally capitalize first letter (30% chance)
      return Math.random() < 0.3
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase();
    } else if (uppercase && !lowercase) {
      return word.toUpperCase();
    } else {
      return word.toLowerCase();
    }
  }
}
