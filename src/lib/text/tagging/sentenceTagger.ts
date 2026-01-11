/**
 * Sentence tagging functions
 *
 * Automatically detects sentence properties and assigns tags for filtering.
 */

import type {
  SentenceTag,
  SentenceDifficultyTag,
  SentenceLengthTag,
  SentenceThemeTag,
  SentencePunctuationTag,
  TaggedSentence,
} from "@/types/tags";

// Theme keywords for detection
const THEME_KEYWORDS: Record<SentenceThemeTag, string[]> = {
  "theme:daily-life": [
    "morning", "evening", "breakfast", "lunch", "dinner", "home", "house",
    "family", "friend", "work", "school", "office", "sleep", "wake",
    "kitchen", "bedroom", "bathroom", "coffee", "tea", "commute",
  ],
  "theme:nature": [
    "tree", "flower", "garden", "forest", "river", "ocean", "sea", "mountain",
    "sky", "cloud", "sun", "moon", "star", "rain", "snow", "wind", "bird",
    "animal", "plant", "leaf", "leaves", "weather", "season", "spring",
    "summer", "autumn", "fall", "winter",
  ],
  "theme:technology": [
    "computer", "phone", "internet", "software", "hardware", "app", "website",
    "email", "digital", "online", "data", "algorithm", "code", "program",
    "device", "screen", "cloud", "ai", "artificial", "intelligence", "machine",
    "learning", "automation", "robot", "cyber", "tech", "network",
  ],
  "theme:business": [
    "company", "business", "market", "customer", "client", "meeting", "project",
    "deadline", "budget", "profit", "revenue", "sales", "marketing", "strategy",
    "management", "team", "employee", "workplace", "career", "job", "office",
    "presentation", "report", "quarterly", "fiscal",
  ],
  "theme:science": [
    "research", "experiment", "study", "scientist", "discovery", "theory",
    "hypothesis", "data", "evidence", "analysis", "laboratory", "physics",
    "chemistry", "biology", "medicine", "health", "brain", "dna", "cell",
    "molecule", "atom", "universe", "space", "planet",
  ],
  "theme:arts": [
    "art", "music", "painting", "sculpture", "museum", "gallery", "artist",
    "musician", "song", "dance", "theater", "film", "movie", "book", "novel",
    "poetry", "poem", "creative", "design", "photography", "performance",
  ],
  "theme:sports": [
    "game", "team", "player", "sport", "football", "basketball", "soccer",
    "tennis", "golf", "running", "exercise", "fitness", "gym", "training",
    "coach", "athlete", "competition", "race", "score", "win", "champion",
  ],
  "theme:food": [
    "food", "cook", "recipe", "ingredient", "meal", "restaurant", "chef",
    "kitchen", "taste", "flavor", "delicious", "eat", "drink", "healthy",
    "nutrition", "diet", "vegetable", "fruit", "meat", "dessert",
  ],
  "theme:travel": [
    "travel", "trip", "journey", "vacation", "holiday", "destination", "flight",
    "hotel", "tourist", "explore", "adventure", "passport", "airport", "country",
    "city", "culture", "abroad", "foreign", "tour", "sightseeing",
  ],
  "theme:education": [
    "learn", "teach", "school", "university", "college", "student", "teacher",
    "professor", "class", "lesson", "course", "study", "education", "knowledge",
    "skill", "training", "degree", "exam", "test", "homework", "lecture",
  ],
  "theme:health": [
    "health", "doctor", "hospital", "medicine", "treatment", "patient", "care",
    "wellness", "mental", "physical", "exercise", "diet", "sleep", "stress",
    "therapy", "symptom", "disease", "illness", "recovery", "prevention",
  ],
  "theme:general": [], // Default, matches anything
};

/**
 * Count words in a sentence
 */
function countWords(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Get the length tag for a sentence
 */
function getLengthTag(sentence: string): SentenceLengthTag {
  const wordCount = countWords(sentence);
  if (wordCount <= 10) return "length:short";
  if (wordCount <= 20) return "length:medium";
  return "length:long";
}

/**
 * Get the difficulty tag for a sentence
 */
function getDifficultyTag(sentence: string): SentenceDifficultyTag {
  const wordCount = countWords(sentence);
  const avgWordLength = sentence.replace(/[^a-zA-Z]/g, "").length / wordCount;
  const punctuationCount = (sentence.match(/[.,;:!?'"()\-]/g) || []).length;

  // Score based on multiple factors
  let score = 0;

  // Word count factor
  if (wordCount <= 8) score += 0;
  else if (wordCount <= 15) score += 1;
  else score += 2;

  // Average word length factor
  if (avgWordLength <= 4) score += 0;
  else if (avgWordLength <= 5.5) score += 1;
  else score += 2;

  // Punctuation complexity factor
  if (punctuationCount <= 2) score += 0;
  else if (punctuationCount <= 4) score += 1;
  else score += 2;

  // Has semicolons, colons, or dashes = harder
  if (/[;:\-]/.test(sentence)) score += 1;

  // Total score: 0-3 = easy, 4-5 = medium, 6+ = hard
  if (score <= 3) return "difficulty:easy";
  if (score <= 5) return "difficulty:medium";
  return "difficulty:hard";
}

/**
 * Get the theme tag for a sentence
 */
function getThemeTag(sentence: string): SentenceThemeTag {
  const lower = sentence.toLowerCase();
  let bestTheme: SentenceThemeTag = "theme:general";
  let bestScore = 0;

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS) as [SentenceThemeTag, string[]][]) {
    if (theme === "theme:general") continue;

    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score++;
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
 * Get punctuation-based tags for a sentence
 */
function getPunctuationTags(sentence: string): SentencePunctuationTag[] {
  const tags: SentencePunctuationTag[] = [];

  if (/\d/.test(sentence)) tags.push("has:numbers");
  if (/["']/.test(sentence)) tags.push("has:quotes");
  if (/;/.test(sentence)) tags.push("has:semicolons");
  if (/:/.test(sentence)) tags.push("has:colons");
  if (/[-—–]/.test(sentence)) tags.push("has:dashes");
  if (/[()]/.test(sentence)) tags.push("has:parentheses");
  if (/!/.test(sentence)) tags.push("has:exclamation");
  if (/\?/.test(sentence)) tags.push("has:question");

  return tags;
}

/**
 * Tag a single sentence with all applicable tags
 */
export function tagSentence(sentence: string): TaggedSentence {
  const tags: SentenceTag[] = [];

  // Length tag
  tags.push(getLengthTag(sentence));

  // Difficulty tag
  tags.push(getDifficultyTag(sentence));

  // Theme tag
  tags.push(getThemeTag(sentence));

  // Punctuation tags
  tags.push(...getPunctuationTags(sentence));

  return { content: sentence, tags };
}

/**
 * Tag an array of sentences
 */
export function tagSentences(sentences: string[]): TaggedSentence[] {
  return sentences.map(tagSentence);
}

/**
 * Check if a tagged sentence matches the given tag filters
 */
export function matchesSentenceTags(
  item: TaggedSentence,
  requireTags?: SentenceTag[],
  anyTags?: SentenceTag[],
  excludeTags?: SentenceTag[]
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
