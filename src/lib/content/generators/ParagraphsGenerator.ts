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
  TaggedParagraph,
} from "../types";
import { queryTaggedParagraphs } from "../contentQuery";
import { selectWeightedItemFromTagged, stripNumbers, stripPunctuation } from "./utils";

export class ParagraphsGenerator {
  private allParagraphs: TaggedParagraph[] | null = null;
  private paragraphsWithNumbers: TaggedParagraph[] | null = null;
  private paragraphsWithoutNumbers: TaggedParagraph[] | null = null;

  private getAllParagraphs(): TaggedParagraph[] {
    if (this.allParagraphs === null) {
      this.allParagraphs = queryTaggedParagraphs({});
    }
    return this.allParagraphs;
  }

  private getParagraphsWithNumbers(): TaggedParagraph[] {
    if (this.paragraphsWithNumbers === null) {
      this.paragraphsWithNumbers = queryTaggedParagraphs({
        requireTags: ["has:numbers"],
      });
    }
    return this.paragraphsWithNumbers;
  }

  private getParagraphsWithoutNumbers(): TaggedParagraph[] {
    if (this.paragraphsWithoutNumbers === null) {
      this.paragraphsWithoutNumbers = queryTaggedParagraphs({
        excludeTags: ["has:numbers"],
      });
    }
    return this.paragraphsWithoutNumbers;
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
      ? this.getParagraphsWithNumbers()
      : this.getParagraphsWithoutNumbers();

    const paragraphs: string[] = [];
    let currentLength = 0;

    while (currentLength < targetLength) {
      // Try to get from preferred pool first (80% of the time)
      let taggedParagraph: TaggedParagraph;
      let hasNumbers: boolean;

      if (preferredPool.length > 0 && Math.random() < 0.8) {
        taggedParagraph = selectWeightedItemFromTagged(preferredPool, weakKeys, adaptiveIntensity);
        hasNumbers = taggedParagraph.tags.includes("has:numbers");
      } else {
        // Fallback to all paragraphs
        taggedParagraph = selectWeightedItemFromTagged(this.getAllParagraphs(), weakKeys, adaptiveIntensity);
        hasNumbers = taggedParagraph.tags.includes("has:numbers");
      }

      // Join sentences within paragraph with spaces
      // content is string[] (array of sentences)
      let text = taggedParagraph.content.join(" ");

      // Apply filtering if content doesn't match preference
      if (!includeNumbers && hasNumbers) {
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
