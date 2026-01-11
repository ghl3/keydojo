/**
 * ParagraphsGenerator - Generates paragraph-based typing practice content
 *
 * Features:
 * - Selection-based number inclusion (prefers paragraphs with/without numbers)
 * - Filter-based punctuation (strips if disabled)
 * - Falls back to filtering when selection pool is exhausted
 */

import type {
  ParagraphsGeneratorOptions,
  GeneratedContent,
} from "@/types/generators";
import {
  getTaggedParagraphs,
  getParagraphsWithNumbers,
  getParagraphsWithoutNumbers,
  type TaggedParagraph,
} from "../taggedContent";
import { selectWeightedItem, stripNumbers, stripPunctuation } from "./utils";

export class ParagraphsGenerator {
  private allParagraphs: TaggedParagraph[];
  private paragraphsWithNumbers: TaggedParagraph[];
  private paragraphsWithoutNumbers: TaggedParagraph[];

  constructor() {
    this.allParagraphs = getTaggedParagraphs();
    this.paragraphsWithNumbers = getParagraphsWithNumbers();
    this.paragraphsWithoutNumbers = getParagraphsWithoutNumbers();
  }

  generate(options: ParagraphsGeneratorOptions): GeneratedContent {
    const {
      targetLength,
      includeNumbers,
      includePunctuation,
      weakKeys = [],
      adaptiveIntensity = 0.5,
    } = options;

    // Select appropriate pool based on number preference
    const preferredPool = includeNumbers
      ? this.paragraphsWithNumbers
      : this.paragraphsWithoutNumbers;

    const paragraphs: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength) {
      // Try to get from preferred pool first (80% of the time)
      let paragraph: TaggedParagraph;

      if (preferredPool.length > 0 && Math.random() < 0.8) {
        paragraph = selectWeightedItem(preferredPool, weakKeys, adaptiveIntensity);
      } else {
        // Fallback to all paragraphs
        paragraph = selectWeightedItem(this.allParagraphs, weakKeys, adaptiveIntensity);
      }

      // Join sentences within paragraph with spaces
      let text = paragraph.sentences.map((s) => s.text).join(" ");

      // Apply filtering if content doesn't match preference
      if (!includeNumbers && paragraph.hasNumbers) {
        text = stripNumbers(text);
      }
      if (!includePunctuation) {
        text = stripPunctuation(text);
      }

      // Skip empty paragraphs after filtering
      if (text.trim().length === 0) {
        continue;
      }

      paragraphs.push(text);
      currentLength += text.length + 2; // +2 for double newline
    }

    // Join paragraphs with double newlines
    const text = paragraphs.join("\n\n");

    return {
      text,
      metadata: {
        contentType: "paragraphs",
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
      },
    };
  }
}
