/**
 * SentencesGenerator - Generates sentence-based typing practice content
 *
 * Features:
 * - Selection-based number inclusion (prefers sentences with/without numbers)
 * - Filter-based punctuation (strips if disabled)
 * - Falls back to filtering when selection pool is exhausted
 */

import type {
  SentencesGeneratorOptions,
  GeneratedContent,
} from "@/types/generators";
import {
  getTaggedSentences,
  getSentencesWithNumbers,
  getSentencesWithoutNumbers,
  type TaggedSentence,
} from "../taggedContent";
import { selectWeightedItem, stripNumbers, stripPunctuation } from "./utils";

export class SentencesGenerator {
  private allSentences: TaggedSentence[];
  private sentencesWithNumbers: TaggedSentence[];
  private sentencesWithoutNumbers: TaggedSentence[];

  constructor() {
    this.allSentences = getTaggedSentences();
    this.sentencesWithNumbers = getSentencesWithNumbers();
    this.sentencesWithoutNumbers = getSentencesWithoutNumbers();
  }

  generate(options: SentencesGeneratorOptions): GeneratedContent {
    const {
      targetLength,
      includeNumbers,
      includePunctuation,
      weakKeys = [],
      adaptiveIntensity = 0.5,
    } = options;

    // Select appropriate pool based on number preference
    const preferredPool = includeNumbers
      ? this.sentencesWithNumbers
      : this.sentencesWithoutNumbers;

    const sentences: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength) {
      // Try to get from preferred pool first (80% of the time)
      let sentence: TaggedSentence;

      if (preferredPool.length > 0 && Math.random() < 0.8) {
        sentence = selectWeightedItem(preferredPool, weakKeys, adaptiveIntensity);
      } else {
        // Fallback to all sentences
        sentence = selectWeightedItem(this.allSentences, weakKeys, adaptiveIntensity);
      }

      let text = sentence.text;

      // Apply filtering if content doesn't match preference
      if (!includeNumbers && sentence.hasNumbers) {
        text = stripNumbers(text);
      }
      if (!includePunctuation) {
        text = stripPunctuation(text);
      }

      // Skip empty sentences after filtering
      if (text.trim().length === 0) {
        continue;
      }

      sentences.push(text);
      currentLength += text.length + 1;
    }

    // Join with newlines - these will be optional (skippable) in the typing UI
    const text = sentences.join("\n");

    return {
      text,
      metadata: {
        contentType: "sentences",
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
      },
    };
  }
}
