/**
 * Paragraph tagging functions
 *
 * Automatically detects paragraph properties and assigns tags for filtering.
 * Paragraphs are arrays of sentences, so tags are aggregated from the sentences.
 */

import type {
  ParagraphTag,
  ParagraphDifficultyTag,
  ParagraphThemeTag,
  ParagraphContentTag,
  TaggedParagraph,
} from "../types";

// Theme keywords for detection (similar to sentence tagger but aggregated)
const THEME_KEYWORDS: Record<ParagraphThemeTag, string[]> = {
  "theme:daily-life": [
    "morning", "evening", "breakfast", "lunch", "dinner", "home", "house",
    "family", "friend", "work", "school", "office", "sleep", "wake",
    "kitchen", "bedroom", "bathroom", "coffee", "tea", "commute", "routine",
  ],
  "theme:nature": [
    "tree", "flower", "garden", "forest", "river", "ocean", "sea", "mountain",
    "sky", "cloud", "sun", "moon", "star", "rain", "snow", "wind", "bird",
    "animal", "plant", "leaf", "leaves", "weather", "season", "nature",
  ],
  "theme:technology": [
    "computer", "phone", "internet", "software", "hardware", "app", "website",
    "email", "digital", "online", "data", "algorithm", "code", "program",
    "device", "screen", "cloud", "ai", "machine", "automation", "tech",
  ],
  "theme:business": [
    "company", "business", "market", "customer", "client", "meeting", "project",
    "deadline", "budget", "profit", "revenue", "sales", "marketing", "strategy",
    "management", "team", "employee", "workplace", "career", "office",
  ],
  "theme:science": [
    "research", "experiment", "study", "scientist", "discovery", "theory",
    "hypothesis", "data", "evidence", "analysis", "laboratory", "physics",
    "chemistry", "biology", "medicine", "universe", "space", "planet",
  ],
  "theme:arts": [
    "art", "music", "painting", "sculpture", "museum", "gallery", "artist",
    "musician", "song", "dance", "theater", "film", "movie", "book", "novel",
    "poetry", "creative", "design", "photography",
  ],
  "theme:sports": [
    "game", "team", "player", "sport", "football", "basketball", "soccer",
    "tennis", "running", "exercise", "fitness", "gym", "training", "coach",
    "athlete", "competition", "race", "score",
  ],
  "theme:food": [
    "food", "cook", "recipe", "ingredient", "meal", "restaurant", "chef",
    "kitchen", "taste", "flavor", "delicious", "eat", "drink", "healthy",
  ],
  "theme:travel": [
    "travel", "trip", "journey", "vacation", "holiday", "destination", "flight",
    "hotel", "tourist", "explore", "adventure", "passport", "airport", "country",
  ],
  "theme:education": [
    "learn", "teach", "school", "university", "college", "student", "teacher",
    "professor", "class", "lesson", "course", "study", "education", "knowledge",
  ],
  "theme:health": [
    "health", "doctor", "hospital", "medicine", "treatment", "patient", "care",
    "wellness", "mental", "physical", "exercise", "diet", "therapy",
  ],
  "theme:general": [],
};

/**
 * Count total words in a paragraph (array of sentences)
 */
function countWords(sentences: string[]): number {
  const text = sentences.join(" ");
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Get the difficulty tag for a paragraph
 */
function getDifficultyTag(sentences: string[]): ParagraphDifficultyTag {
  const text = sentences.join(" ");
  const wordCount = countWords(sentences);
  const sentenceCount = sentences.length;

  // Average words per sentence
  const avgSentenceLength = wordCount / sentenceCount;

  // Average word length
  const avgWordLength = text.replace(/[^a-zA-Z]/g, "").length / wordCount;

  // Count complex punctuation
  const complexPunctuation = (text.match(/[;:\-"'()]/g) || []).length;

  let score = 0;

  // Sentence count factor
  if (sentenceCount <= 3) score += 0;
  else if (sentenceCount <= 5) score += 1;
  else score += 2;

  // Average sentence length factor
  if (avgSentenceLength <= 12) score += 0;
  else if (avgSentenceLength <= 18) score += 1;
  else score += 2;

  // Average word length factor
  if (avgWordLength <= 4.5) score += 0;
  else if (avgWordLength <= 5.5) score += 1;
  else score += 2;

  // Complex punctuation factor
  if (complexPunctuation <= 3) score += 0;
  else if (complexPunctuation <= 8) score += 1;
  else score += 2;

  if (score <= 3) return "difficulty:easy";
  if (score <= 6) return "difficulty:medium";
  return "difficulty:hard";
}

/**
 * Get the theme tag for a paragraph
 */
function getThemeTag(sentences: string[]): ParagraphThemeTag {
  const text = sentences.join(" ").toLowerCase();
  let bestTheme: ParagraphThemeTag = "theme:general";
  let bestScore = 0;

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as [ParagraphThemeTag, string[]][]) {
    if (theme === "theme:general") continue;

    let score = 0;
    for (const keyword of keywords) {
      // Count occurrences
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  return bestTheme;
}

/**
 * Get content-based tags for a paragraph
 */
function getContentTags(sentences: string[]): ParagraphContentTag[] {
  const text = sentences.join(" ");
  const tags: ParagraphContentTag[] = [];

  // Has numbers
  if (/\d/.test(text)) {
    tags.push("has:numbers");
  }

  // Has quotes
  if (/["']/.test(text)) {
    tags.push("has:quotes");
  }

  // Rich punctuation (semicolons, colons, dashes, parentheses)
  const richPunctCount = (text.match(/[;:\-—–()]/g) || []).length;
  if (richPunctCount >= 3) {
    tags.push("has:rich-punctuation");
  }

  // Technical terms detection (simplified)
  const technicalPatterns = [
    /\b(algorithm|database|software|hardware|interface|protocol)\b/i,
    /\b(function|variable|parameter|module|class)\b/i,
    /\b(hypothesis|analysis|methodology|empirical)\b/i,
  ];
  for (const pattern of technicalPatterns) {
    if (pattern.test(text)) {
      tags.push("has:technical-terms");
      break;
    }
  }

  return tags;
}

/**
 * Tag a single paragraph with all applicable tags
 */
export function tagParagraph(sentences: string[]): TaggedParagraph {
  const tags: ParagraphTag[] = [];

  // Difficulty tag
  tags.push(getDifficultyTag(sentences));

  // Theme tag
  tags.push(getThemeTag(sentences));

  // Content tags
  tags.push(...getContentTags(sentences));

  return { content: sentences, tags };
}

/**
 * Tag an array of paragraphs
 */
export function tagParagraphs(paragraphs: string[][]): TaggedParagraph[] {
  return paragraphs.map(tagParagraph);
}

/**
 * Check if a tagged paragraph matches the given tag filters
 */
export function matchesParagraphTags(
  item: TaggedParagraph,
  requireTags?: ParagraphTag[],
  anyTags?: ParagraphTag[],
  excludeTags?: ParagraphTag[]
): boolean {
  // Check required tags (all must match)
  if (requireTags && requireTags.length > 0) {
    if (!requireTags.every((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  // Check any tags (at least one must match)
  if (anyTags && anyTags.length > 0) {
    if (!anyTags.some((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  // Check exclude tags (none can match)
  if (excludeTags && excludeTags.length > 0) {
    if (excludeTags.some((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  return true;
}
