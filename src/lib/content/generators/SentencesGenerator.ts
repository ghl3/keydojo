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
  TaggedSentence,
} from "../contentTypes";
import { querySentences, queryTaggedSentences } from "../contentQuery";
import { selectWeightedItemFromTagged, stripNumbers, stripPunctuation } from "./utils";

export class SentencesGenerator {
  private allSentences: TaggedSentence[] | null = null;
  private sentencesWithNumbers: TaggedSentence[] | null = null;
  private sentencesWithoutNumbers: TaggedSentence[] | null = null;

  private getAllSentences(): TaggedSentence[] {
    if (this.allSentences === null) {
      this.allSentences = queryTaggedSentences({});
    }
    return this.allSentences;
  }

  private getSentencesWithNumbers(): TaggedSentence[] {
    if (this.sentencesWithNumbers === null) {
      this.sentencesWithNumbers = queryTaggedSentences({
        requireTags: ["has:numbers"],
      });
    }
    return this.sentencesWithNumbers;
  }

  private getSentencesWithoutNumbers(): TaggedSentence[] {
    if (this.sentencesWithoutNumbers === null) {
      this.sentencesWithoutNumbers = queryTaggedSentences({
        excludeTags: ["has:numbers"],
      });
    }
    return this.sentencesWithoutNumbers;
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
      ? this.getSentencesWithNumbers()
      : this.getSentencesWithoutNumbers();

    const sentences: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength) {
      // Try to get from preferred pool first (80% of the time)
      let taggedSentence: TaggedSentence;
      let hasNumbers: boolean;

      if (preferredPool.length > 0 && Math.random() < 0.8) {
        taggedSentence = selectWeightedItemFromTagged(preferredPool, weakKeys, adaptiveIntensity);
        hasNumbers = taggedSentence.tags.includes("has:numbers");
      } else {
        // Fallback to all sentences
        taggedSentence = selectWeightedItemFromTagged(this.getAllSentences(), weakKeys, adaptiveIntensity);
        hasNumbers = taggedSentence.tags.includes("has:numbers");
      }

      let text = taggedSentence.content;

      // Apply filtering if content doesn't match preference
      if (!includeNumbers && hasNumbers) {
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
