/**
 * Content Registry - Lazy loading and caching of tagged content
 *
 * Provides centralized access to all tagged content with lazy initialization.
 * Content is tagged once on first access and cached for subsequent queries.
 */

import type {
  TaggedWord,
  TaggedSentence,
  TaggedParagraph,
  TaggedCode,
} from "./contentTypes";
import { tagWords } from "./tagging/wordTagger";
import { tagSentences } from "./tagging/sentenceTagger";
import { tagParagraphs } from "./tagging/paragraphTagger";
import { tagCodeSnippets } from "./tagging/codeTagger";

// Import content sources
import { getAllWords } from "./wordLists";
import { getAllSentences } from "./sentences";
import { getAllParagraphs } from "./paragraphs";
import { getAllCodeSnippets } from "./codeSnippets";

// Cached tagged content
let cachedWords: TaggedWord[] | null = null;
let cachedSentences: TaggedSentence[] | null = null;
let cachedParagraphs: TaggedParagraph[] | null = null;
let cachedCode: TaggedCode[] | null = null;

/**
 * Get all tagged words (lazy initialization)
 */
export function getTaggedWords(): TaggedWord[] {
  if (cachedWords === null) {
    const words = getAllWords();
    cachedWords = tagWords(words);
  }
  return cachedWords;
}

/**
 * Get all tagged sentences (lazy initialization)
 */
export function getTaggedSentences(): TaggedSentence[] {
  if (cachedSentences === null) {
    const sentences = getAllSentences();
    cachedSentences = tagSentences(sentences);
  }
  return cachedSentences;
}

/**
 * Get all tagged paragraphs (lazy initialization)
 */
export function getTaggedParagraphs(): TaggedParagraph[] {
  if (cachedParagraphs === null) {
    const paragraphs = getAllParagraphs();
    cachedParagraphs = tagParagraphs(paragraphs);
  }
  return cachedParagraphs;
}

/**
 * Get all tagged code snippets (lazy initialization)
 */
export function getTaggedCode(): TaggedCode[] {
  if (cachedCode === null) {
    const snippets = getAllCodeSnippets();
    cachedCode = tagCodeSnippets(snippets);
  }
  return cachedCode;
}

/**
 * Clear all cached content (useful for testing)
 */
export function clearContentCache(): void {
  cachedWords = null;
  cachedSentences = null;
  cachedParagraphs = null;
  cachedCode = null;
}

/**
 * Pre-warm the cache by loading all content
 * Returns timing information for performance monitoring
 */
export function warmContentCache(): {
  words: number;
  sentences: number;
  paragraphs: number;
  code: number;
  total: number;
} {
  const startTotal = performance.now();

  const startWords = performance.now();
  getTaggedWords();
  const wordsTime = performance.now() - startWords;

  const startSentences = performance.now();
  getTaggedSentences();
  const sentencesTime = performance.now() - startSentences;

  const startParagraphs = performance.now();
  getTaggedParagraphs();
  const paragraphsTime = performance.now() - startParagraphs;

  const startCode = performance.now();
  getTaggedCode();
  const codeTime = performance.now() - startCode;

  const totalTime = performance.now() - startTotal;

  return {
    words: wordsTime,
    sentences: sentencesTime,
    paragraphs: paragraphsTime,
    code: codeTime,
    total: totalTime,
  };
}

/**
 * Get content statistics
 */
export function getContentStats(): {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  codeCount: number;
} {
  return {
    wordCount: getTaggedWords().length,
    sentenceCount: getTaggedSentences().length,
    paragraphCount: getTaggedParagraphs().length,
    codeCount: getTaggedCode().length,
  };
}
