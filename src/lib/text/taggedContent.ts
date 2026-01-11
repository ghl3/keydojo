/**
 * Content tagging system for intelligent sentence/paragraph selection.
 *
 * This module provides tagged versions of sentences and paragraphs,
 * enabling selection-based content generation rather than post-hoc filtering.
 */

import {
  SIMPLE_SENTENCES,
  MEDIUM_SENTENCES,
  COMPLEX_SENTENCES,
  PANGRAM_SENTENCES,
  PUNCTUATION_SENTENCES,
  PROVERBS,
} from "./sentences";
import { getAllNumberSentences } from "./numbersContent";
import { getAllPunctuationSentences } from "./punctuationContent";
import {
  DAILY_LIFE_PARAGRAPHS,
  NATURE_PARAGRAPHS,
  TECHNOLOGY_PARAGRAPHS,
  EDUCATION_PARAGRAPHS,
  CAREER_PARAGRAPHS,
  CREATIVE_PARAGRAPHS,
  HEALTH_PARAGRAPHS,
  TRAVEL_PARAGRAPHS,
  STATISTICS_PARAGRAPHS,
  EVENTS_PARAGRAPHS,
} from "./paragraphs";

// ============= TYPES =============

export type SentenceCategory =
  | "simple"
  | "medium"
  | "complex"
  | "pangram"
  | "punctuation"
  | "proverb"
  | "numbers"
  | "technical";

export type Difficulty = "easy" | "medium" | "hard";

export interface TaggedSentence {
  text: string;
  hasNumbers: boolean;
  hasQuotes: boolean;
  hasParentheses: boolean;
  category: SentenceCategory;
  difficulty: Difficulty;
}

export interface TaggedParagraph {
  sentences: TaggedSentence[];
  hasNumbers: boolean;
  category: string;
  difficulty: Difficulty;
}

// ============= DETECTION HELPERS =============

function hasNumbers(text: string): boolean {
  return /\d/.test(text);
}

function hasQuotes(text: string): boolean {
  return /["']/.test(text);
}

function hasParentheses(text: string): boolean {
  return /[()]/.test(text);
}

function calculateDifficulty(text: string): Difficulty {
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const avgWordLength = text.replace(/\s+/g, "").length / wordCount;
  const hasComplexPunctuation = /[;:()"]/.test(text);

  if (wordCount <= 10 && avgWordLength < 5.5 && !hasComplexPunctuation) {
    return "easy";
  }
  if (wordCount > 20 || avgWordLength > 7 || hasComplexPunctuation) {
    return "hard";
  }
  return "medium";
}

// ============= TAGGING FUNCTIONS =============

export function tagSentence(
  text: string,
  category: SentenceCategory
): TaggedSentence {
  return {
    text,
    hasNumbers: hasNumbers(text),
    hasQuotes: hasQuotes(text),
    hasParentheses: hasParentheses(text),
    category,
    difficulty: calculateDifficulty(text),
  };
}

export function tagParagraph(
  sentences: string[],
  category: string
): TaggedParagraph {
  // Infer appropriate category for each sentence
  const taggedSentences = sentences.map((s) => {
    const wordCount = s.split(/\s+/).length;
    let cat: SentenceCategory;
    if (wordCount <= 10) cat = "simple";
    else if (wordCount <= 20) cat = "medium";
    else cat = "complex";
    return tagSentence(s, cat);
  });

  // Paragraph has numbers if any sentence has numbers
  const paragraphHasNumbers = taggedSentences.some((s) => s.hasNumbers);

  // Paragraph difficulty is the max of its sentences
  const difficulty = taggedSentences.reduce<Difficulty>((max, s) => {
    if (s.difficulty === "hard") return "hard";
    if (s.difficulty === "medium" && max !== "hard") return "medium";
    return max;
  }, "easy");

  return {
    sentences: taggedSentences,
    hasNumbers: paragraphHasNumbers,
    category,
    difficulty,
  };
}

// ============= CACHED TAGGED CONTENT =============

let cachedTaggedSentences: TaggedSentence[] | null = null;
let cachedTaggedParagraphs: TaggedParagraph[] | null = null;

export function getTaggedSentences(): TaggedSentence[] {
  if (cachedTaggedSentences) return cachedTaggedSentences;

  cachedTaggedSentences = [
    // Simple sentences (no numbers by default)
    ...SIMPLE_SENTENCES.map((s) => tagSentence(s, "simple")),

    // Medium sentences
    ...MEDIUM_SENTENCES.map((s) => tagSentence(s, "medium")),

    // Complex sentences
    ...COMPLEX_SENTENCES.map((s) => tagSentence(s, "complex")),

    // Pangrams
    ...PANGRAM_SENTENCES.map((s) => tagSentence(s, "pangram")),

    // Punctuation-focused
    ...PUNCTUATION_SENTENCES.map((s) => tagSentence(s, "punctuation")),

    // Proverbs
    ...PROVERBS.map((s) => tagSentence(s, "proverb")),

    // Number sentences (explicitly tagged as numbers category)
    ...getAllNumberSentences().map((s) => tagSentence(s, "numbers")),

    // Rich punctuation sentences
    ...getAllPunctuationSentences().map((s) => tagSentence(s, "punctuation")),
  ];

  return cachedTaggedSentences;
}

export function getTaggedParagraphs(): TaggedParagraph[] {
  if (cachedTaggedParagraphs) return cachedTaggedParagraphs;

  cachedTaggedParagraphs = [
    ...DAILY_LIFE_PARAGRAPHS.map((p) => tagParagraph(p, "daily_life")),
    ...NATURE_PARAGRAPHS.map((p) => tagParagraph(p, "nature")),
    ...TECHNOLOGY_PARAGRAPHS.map((p) => tagParagraph(p, "technology")),
    ...EDUCATION_PARAGRAPHS.map((p) => tagParagraph(p, "education")),
    ...CAREER_PARAGRAPHS.map((p) => tagParagraph(p, "career")),
    ...CREATIVE_PARAGRAPHS.map((p) => tagParagraph(p, "creative")),
    ...HEALTH_PARAGRAPHS.map((p) => tagParagraph(p, "health")),
    ...TRAVEL_PARAGRAPHS.map((p) => tagParagraph(p, "travel")),
    ...STATISTICS_PARAGRAPHS.map((p) => tagParagraph(p, "statistics")),
    ...EVENTS_PARAGRAPHS.map((p) => tagParagraph(p, "events")),
  ];

  return cachedTaggedParagraphs;
}

// ============= FILTERED ACCESS =============

export function getSentencesWithNumbers(): TaggedSentence[] {
  return getTaggedSentences().filter((s) => s.hasNumbers);
}

export function getSentencesWithoutNumbers(): TaggedSentence[] {
  return getTaggedSentences().filter((s) => !s.hasNumbers);
}

export function getParagraphsWithNumbers(): TaggedParagraph[] {
  return getTaggedParagraphs().filter((p) => p.hasNumbers);
}

export function getParagraphsWithoutNumbers(): TaggedParagraph[] {
  return getTaggedParagraphs().filter((p) => !p.hasNumbers);
}

// ============= STATISTICS (for debugging/testing) =============

export function getContentStats(): {
  totalSentences: number;
  sentencesWithNumbers: number;
  sentencesWithoutNumbers: number;
  totalParagraphs: number;
  paragraphsWithNumbers: number;
  paragraphsWithoutNumbers: number;
} {
  const sentences = getTaggedSentences();
  const paragraphs = getTaggedParagraphs();

  return {
    totalSentences: sentences.length,
    sentencesWithNumbers: sentences.filter((s) => s.hasNumbers).length,
    sentencesWithoutNumbers: sentences.filter((s) => !s.hasNumbers).length,
    totalParagraphs: paragraphs.length,
    paragraphsWithNumbers: paragraphs.filter((p) => p.hasNumbers).length,
    paragraphsWithoutNumbers: paragraphs.filter((p) => !p.hasNumbers).length,
  };
}
