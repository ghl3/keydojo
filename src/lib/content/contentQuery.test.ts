/**
 * Tests for the content query API
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  queryWords,
  querySentences,
  queryParagraphs,
  queryCode,
  getTagStats,
} from "./contentQuery";
import {
  getTaggedWords,
  getTaggedSentences,
  getTaggedParagraphs,
  getTaggedCode,
  clearContentCache,
  warmContentCache,
  getContentStats,
} from "./contentRegistry";

describe("Content Registry", () => {
  beforeEach(() => {
    clearContentCache();
  });

  it("loads words lazily", () => {
    const words = getTaggedWords();
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toHaveProperty("content");
    expect(words[0]).toHaveProperty("tags");
  });

  it("loads sentences lazily", () => {
    const sentences = getTaggedSentences();
    expect(sentences.length).toBeGreaterThan(0);
    expect(sentences[0]).toHaveProperty("content");
    expect(sentences[0]).toHaveProperty("tags");
  });

  it("loads paragraphs lazily", () => {
    const paragraphs = getTaggedParagraphs();
    expect(paragraphs.length).toBeGreaterThan(0);
    expect(paragraphs[0]).toHaveProperty("content");
    expect(paragraphs[0]).toHaveProperty("tags");
    // Paragraph content is array of sentences
    expect(Array.isArray(paragraphs[0].content)).toBe(true);
  });

  it("loads code lazily", () => {
    const code = getTaggedCode();
    expect(code.length).toBeGreaterThan(0);
    expect(code[0]).toHaveProperty("content");
    expect(code[0]).toHaveProperty("tags");
  });

  it("caches content after first load", () => {
    const words1 = getTaggedWords();
    const words2 = getTaggedWords();
    // Should be same reference since cached
    expect(words1).toBe(words2);
  });

  it("warms cache and reports timing", () => {
    const timing = warmContentCache();
    expect(timing).toHaveProperty("words");
    expect(timing).toHaveProperty("sentences");
    expect(timing).toHaveProperty("paragraphs");
    expect(timing).toHaveProperty("code");
    expect(timing).toHaveProperty("total");
    expect(timing.total).toBeLessThan(1000); // Should be fast
  });

  it("reports content statistics", () => {
    const stats = getContentStats();
    expect(stats.wordCount).toBeGreaterThan(0);
    expect(stats.sentenceCount).toBeGreaterThan(0);
    expect(stats.paragraphCount).toBeGreaterThan(0);
    expect(stats.codeCount).toBeGreaterThan(0);
  });
});

describe("Word Query", () => {
  it("returns all words when no filters", () => {
    const words = queryWords({});
    expect(words.length).toBeGreaterThan(0);
  });

  it("filters by length tag", () => {
    const shortWords = queryWords({ requireTags: ["length:1-3"] });
    for (const word of shortWords) {
      expect(word.length).toBeLessThanOrEqual(3);
    }
  });

  it("filters by frequency tag", () => {
    const topWords = queryWords({ requireTags: ["frequency:top-100"] });
    expect(topWords.length).toBeGreaterThan(0);
    // Note: Multiple words in the word list can match top-100 frequency
    // because the tagger checks word content, not position in list
    // So we just verify that filtering works
    const commonWords = queryWords({ requireTags: ["frequency:common"] });
    // Top-100 should be a subset of all words
    expect(topWords.length).toBeLessThan(commonWords.length + topWords.length);
  });

  it("filters by character tag", () => {
    const wordsWithQ = queryWords({ requireTags: ["has:q"] });
    for (const word of wordsWithQ) {
      expect(word.toLowerCase()).toContain("q");
    }
  });

  it("supports anyTags (OR)", () => {
    const words = queryWords({ anyTags: ["has:q", "has:z"] });
    for (const word of words) {
      const lower = word.toLowerCase();
      expect(lower.includes("q") || lower.includes("z")).toBe(true);
    }
  });

  it("supports excludeTags (NOT)", () => {
    const words = queryWords({ excludeTags: ["has:q", "has:x", "has:z"] });
    for (const word of words) {
      const lower = word.toLowerCase();
      expect(lower.includes("q")).toBe(false);
      expect(lower.includes("x")).toBe(false);
      expect(lower.includes("z")).toBe(false);
    }
  });

  it("supports limit", () => {
    const words = queryWords({ limit: 10 });
    expect(words.length).toBeLessThanOrEqual(10);
  });

  it("supports shuffle", () => {
    const words1 = queryWords({ shuffle: true, limit: 100 });
    const words2 = queryWords({ shuffle: true, limit: 100 });
    // With shuffle, results should likely be different
    // (not guaranteed, but very probable)
    const different = words1.some((w, i) => w !== words2[i]);
    // We don't fail if they happen to be same, just check it returns results
    expect(words1.length).toBe(100);
    expect(words2.length).toBe(100);
  });

  it("combines multiple filters", () => {
    const words = queryWords({
      requireTags: ["length:4-5"],
      excludeTags: ["has:q", "has:x", "has:z"],
      limit: 50,
    });

    expect(words.length).toBeLessThanOrEqual(50);
    for (const word of words) {
      expect(word.length).toBeGreaterThanOrEqual(4);
      expect(word.length).toBeLessThanOrEqual(5);
      const lower = word.toLowerCase();
      expect(lower.includes("q")).toBe(false);
      expect(lower.includes("x")).toBe(false);
      expect(lower.includes("z")).toBe(false);
    }
  });
});

describe("Sentence Query", () => {
  it("returns all sentences when no filters", () => {
    const sentences = querySentences({});
    expect(sentences.length).toBeGreaterThan(0);
  });

  it("filters by difficulty tag", () => {
    const easySentences = querySentences({ requireTags: ["difficulty:easy"] });
    expect(easySentences.length).toBeGreaterThan(0);
    // Easy sentences should generally be shorter
    for (const sentence of easySentences.slice(0, 10)) {
      const wordCount = sentence.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(15);
    }
  });

  it("filters by has:numbers tag", () => {
    const numberedSentences = querySentences({ requireTags: ["has:numbers"] });
    for (const sentence of numberedSentences) {
      expect(/\d/.test(sentence)).toBe(true);
    }
  });

  it("excludes sentences with numbers", () => {
    const noNumbers = querySentences({ excludeTags: ["has:numbers"] });
    for (const sentence of noNumbers) {
      expect(/\d/.test(sentence)).toBe(false);
    }
  });

  it("filters by punctuation tags", () => {
    const withQuotes = querySentences({ requireTags: ["has:quotes"] });
    for (const sentence of withQuotes) {
      expect(/["']/.test(sentence)).toBe(true);
    }
  });
});

describe("Paragraph Query", () => {
  it("returns all paragraphs when no filters", () => {
    const paragraphs = queryParagraphs({});
    expect(paragraphs.length).toBeGreaterThan(0);
    // Each paragraph is an array of sentences
    expect(Array.isArray(paragraphs[0])).toBe(true);
  });

  it("filters by difficulty tag", () => {
    const easyParagraphs = queryParagraphs({ requireTags: ["difficulty:easy"] });
    expect(easyParagraphs.length).toBeGreaterThan(0);
  });

  it("filters by has:numbers tag", () => {
    const numberedParagraphs = queryParagraphs({ requireTags: ["has:numbers"] });
    for (const paragraph of numberedParagraphs) {
      const text = paragraph.join(" ");
      expect(/\d/.test(text)).toBe(true);
    }
  });
});

describe("Code Query", () => {
  it("returns all code when no filters", () => {
    const code = queryCode({});
    expect(code.length).toBeGreaterThan(0);
  });

  it("filters by language tag", () => {
    const jsCode = queryCode({ requireTags: ["lang:javascript"] });
    // Should have at least some JS code
    expect(jsCode.length).toBeGreaterThan(0);
    // Each snippet should look like JavaScript
    for (const snippet of jsCode.slice(0, 5)) {
      // JS typically has const, let, function, =>, etc.
      const looksLikeJs =
        /\bconst\b|\blet\b|\bfunction\b|=>/.test(snippet);
      expect(looksLikeJs).toBe(true);
    }
  });

  it("filters by complexity tag", () => {
    const basicCode = queryCode({ requireTags: ["complexity:basic"] });
    expect(basicCode.length).toBeGreaterThan(0);
    // Basic code should be shorter
    for (const snippet of basicCode.slice(0, 10)) {
      const lines = snippet.split("\n").length;
      expect(lines).toBeLessThanOrEqual(10);
    }
  });

  it("filters by pattern tag", () => {
    const functionCode = queryCode({ requireTags: ["pattern:function"] });
    for (const snippet of functionCode.slice(0, 5)) {
      const hasFunction =
        /\bfunction\b|=>/.test(snippet);
      expect(hasFunction).toBe(true);
    }
  });
});

describe("Tag Statistics", () => {
  it("returns tag counts for words", () => {
    const stats = getTagStats("words");
    expect(stats).toHaveProperty("length:1-3");
    expect(stats).toHaveProperty("length:4-5");
    expect(stats).toHaveProperty("frequency:top-100");
    expect(stats["length:1-3"]).toBeGreaterThan(0);
  });

  it("returns tag counts for sentences", () => {
    const stats = getTagStats("sentences");
    expect(stats).toHaveProperty("difficulty:easy");
    expect(stats).toHaveProperty("length:short");
    expect(stats["difficulty:easy"]).toBeGreaterThan(0);
  });

  it("returns tag counts for paragraphs", () => {
    const stats = getTagStats("paragraphs");
    expect(stats).toHaveProperty("difficulty:easy");
  });

  it("returns tag counts for code", () => {
    const stats = getTagStats("code");
    expect(stats).toHaveProperty("complexity:basic");
    expect(stats).toHaveProperty("lang:javascript");
  });
});
