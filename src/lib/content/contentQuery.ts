/**
 * Content Query API
 *
 * Provides multi-dimensional filtering of tagged content.
 * Supports requireTags (AND), anyTags (OR), excludeTags (NOT), shuffle, and limit.
 */

import type {
  WordTag,
  SentenceTag,
  ParagraphTag,
  CodeTag,
  WordQueryOptions,
  SentenceQueryOptions,
  ParagraphQueryOptions,
  CodeQueryOptions,
  TaggedWord,
  TaggedSentence,
  TaggedParagraph,
  TaggedCode,
} from "./types";
import {
  getTaggedWords,
  getTaggedSentences,
  getTaggedParagraphs,
  getTaggedCode,
} from "./contentRegistry";
import { matchesTags } from "./tagging/wordTagger";
import { matchesSentenceTags } from "./tagging/sentenceTagger";
import { matchesParagraphTags } from "./tagging/paragraphTagger";
import { matchesCodeTags } from "./tagging/codeTagger";

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Query words with tag filters
 *
 * @example
 * // Get short, high-frequency words
 * queryWords({ requireTags: ["length:1-3", "frequency:top-100"] })
 *
 * // Get words with Q, X, or Z
 * queryWords({ anyTags: ["has:q", "has:x", "has:z"], shuffle: true, limit: 50 })
 */
export function queryWords(options: WordQueryOptions = {}): string[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedWords().filter((item) =>
    matchesTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results.map((item) => item.content);
}

/**
 * Query sentences with tag filters
 *
 * @example
 * // Get easy sentences with numbers
 * querySentences({ requireTags: ["difficulty:easy", "has:numbers"] })
 *
 * // Get business or technology themed sentences
 * querySentences({ anyTags: ["theme:business", "theme:technology"] })
 */
export function querySentences(options: SentenceQueryOptions = {}): string[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedSentences().filter((item) =>
    matchesSentenceTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results.map((item) => item.content);
}

/**
 * Query paragraphs with tag filters
 *
 * @example
 * // Get easy nature paragraphs
 * queryParagraphs({ requireTags: ["difficulty:easy", "theme:nature"] })
 *
 * // Get paragraphs with numbers, excluding hard difficulty
 * queryParagraphs({ requireTags: ["has:numbers"], excludeTags: ["difficulty:hard"] })
 */
export function queryParagraphs(options: ParagraphQueryOptions = {}): string[][] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedParagraphs().filter((item) =>
    matchesParagraphTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results.map((item) => item.content);
}

/**
 * Query code snippets with tag filters
 *
 * @example
 * // Get JavaScript functions
 * queryCode({ requireTags: ["lang:javascript", "pattern:function"] })
 *
 * // Get basic complexity code in any language
 * queryCode({ requireTags: ["complexity:basic"], shuffle: true })
 */
export function queryCode(options: CodeQueryOptions = {}): string[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedCode().filter((item) =>
    matchesCodeTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results.map((item) => item.content);
}

/**
 * Query tagged words (returns full tagged items for advanced usage)
 */
export function queryTaggedWords(options: WordQueryOptions = {}): TaggedWord[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedWords().filter((item) =>
    matchesTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Query tagged sentences (returns full tagged items for advanced usage)
 */
export function queryTaggedSentences(options: SentenceQueryOptions = {}): TaggedSentence[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedSentences().filter((item) =>
    matchesSentenceTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Query tagged paragraphs (returns full tagged items for advanced usage)
 */
export function queryTaggedParagraphs(options: ParagraphQueryOptions = {}): TaggedParagraph[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedParagraphs().filter((item) =>
    matchesParagraphTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Query tagged code snippets (returns full tagged items for advanced usage)
 */
export function queryTaggedCode(options: CodeQueryOptions = {}): TaggedCode[] {
  const { requireTags, anyTags, excludeTags, shuffle: shouldShuffle, limit } = options;

  let results = getTaggedCode().filter((item) =>
    matchesCodeTags(item, requireTags, anyTags, excludeTags)
  );

  if (shouldShuffle) {
    results = shuffle(results);
  }

  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Get tag statistics for a content type
 */
export function getTagStats(contentType: "words" | "sentences" | "paragraphs" | "code"): Record<string, number> {
  const stats: Record<string, number> = {};

  let items: Array<{ tags: string[] }>;
  switch (contentType) {
    case "words":
      items = getTaggedWords();
      break;
    case "sentences":
      items = getTaggedSentences();
      break;
    case "paragraphs":
      items = getTaggedParagraphs();
      break;
    case "code":
      items = getTaggedCode();
      break;
  }

  for (const item of items) {
    for (const tag of item.tags) {
      stats[tag] = (stats[tag] || 0) + 1;
    }
  }

  return stats;
}
