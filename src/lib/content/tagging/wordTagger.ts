/**
 * Word tagging functions
 *
 * Automatically detects word properties and assigns tags for filtering.
 */

import type {
  WordTag,
  WordLengthTag,
  WordCharacterTag,
  WordKeyboardTag,
  TaggedWord,
} from "../types";

// Keyboard row definitions
const HOME_ROW = new Set("asdfghjkl".split(""));
const TOP_ROW = new Set("qwertyuiop".split(""));
const BOTTOM_ROW = new Set("zxcvbnm".split(""));

// Top 100 most common English words (for frequency tagging)
const TOP_100_WORDS_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
];
const TOP_100_WORDS = new Set(TOP_100_WORDS_LIST);

// Top 500 most common words
const TOP_500_WORDS_LIST = [
  ...TOP_100_WORDS_LIST,
  "great", "need", "find", "ask", "tell", "try", "leave", "call", "keep", "let",
  "begin", "seem", "help", "show", "hear", "play", "run", "move", "live", "believe",
  "hold", "bring", "happen", "write", "provide", "sit", "stand", "lose", "pay", "meet",
  "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "follow", "stop",
  "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win",
  "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send",
  "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise",
  "pass", "sell", "require", "report", "decide", "pull", "return", "explain", "hope", "develop",
  "carry", "break", "receive", "agree", "support", "hit", "produce", "eat", "cover", "catch",
  "draw", "choose", "cause", "point", "listen", "realize", "place", "face", "describe", "share",
  "seek", "plan", "enjoy", "pick", "fight", "surprise", "throw", "cry", "reduce", "force",
  "miss", "drop", "visit", "name", "drive", "fill", "represent", "apply", "control", "increase",
  "accept", "wear", "prepare", "determine", "maintain", "note", "measure", "indicate", "sign", "discover",
  "close", "contain", "avoid", "claim", "check", "express", "mind", "connect", "protect", "enter",
  "form", "imagine", "wonder", "study", "finish", "perform", "join", "fear", "push", "save",
  "treat", "present", "compare", "sleep", "free", "prove", "answer", "manage", "exist", "identify",
  "address", "replace", "result", "relate", "examine", "deal", "assume", "remove", "intend", "notice",
  "touch", "prevent", "supply", "obtain", "fit", "define", "limit", "reflect", "achieve", "succeed",
];
const TOP_500_WORDS = new Set(TOP_500_WORDS_LIST);

// Top 1000 most common words
const TOP_1000_WORDS = new Set([
  ...TOP_500_WORDS_LIST,
  "experience", "afford", "respect", "involve", "improve", "ensure", "grant", "announce",
  "release", "attach", "commit", "purchase", "resolve", "establish", "complete", "enable",
  "acquire", "select", "generate", "confirm", "absolute", "accepted", "accident", "accurate",
  "achieved", "activity", "actually", "addition", "adequate", "advanced", "affected", "agencies",
  "agreement", "allocated", "alongside", "already", "although", "american", "analysis", "announce",
  "anything", "apparent", "appeared", "approach", "approved", "argument", "arranged", "assembly",
  "assessment", "associated", "attention", "attitude", "audience", "authority", "available", "background",
  "beautiful", "beginning", "behaviour", "believe", "benefits", "breaking", "bringing", "brothers",
  "building", "business", "calendar", "campaign", "capacity", "carefully", "category", "century",
  "certainly", "challenge", "chambers", "changing", "chapters", "character", "chemical", "children",
  "citizens", "clearly", "clinical", "clothing", "coalition", "collected", "colleges", "combined",
  "commands", "comments", "commerce", "commercial", "commission", "commitment", "committee", "community",
  "companies", "compared", "competition", "complete", "complex", "component", "computer", "concerned",
  "concluded", "condition", "conducted", "conference", "confirmed", "conflict", "congress", "connected",
  "conscious", "consider", "consistent", "constant", "construction", "consumer", "contact", "contained",
]);

/**
 * Get the length tag for a word
 */
function getLengthTag(word: string): WordLengthTag {
  const len = word.length;
  if (len <= 3) return "length:1-3";
  if (len <= 5) return "length:4-5";
  if (len <= 7) return "length:6-7";
  if (len <= 10) return "length:8-10";
  return "length:11+";
}

/**
 * Get character-based tags for a word
 */
function getCharacterTags(word: string): WordCharacterTag[] {
  const tags: WordCharacterTag[] = [];
  const lower = word.toLowerCase();

  if (word.includes("-")) tags.push("has:hyphen");
  if (word.includes("'")) tags.push("has:apostrophe");
  if (lower.includes("q")) tags.push("has:q");
  if (lower.includes("x")) tags.push("has:x");
  if (lower.includes("z")) tags.push("has:z");

  return tags;
}

/**
 * Get the keyboard row tag for a word
 */
function getKeyboardRowTag(word: string): WordKeyboardTag {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "").split("");
  if (letters.length === 0) return "row:mixed";

  let homeCount = 0;
  let topCount = 0;
  let bottomCount = 0;

  for (const letter of letters) {
    if (HOME_ROW.has(letter)) homeCount++;
    else if (TOP_ROW.has(letter)) topCount++;
    else if (BOTTOM_ROW.has(letter)) bottomCount++;
  }

  const total = letters.length;
  const threshold = 0.7; // 70% of letters must be from one row

  if (homeCount / total >= threshold) return "row:home";
  if (topCount / total >= threshold) return "row:top";
  if (bottomCount / total >= threshold) return "row:bottom";

  return "row:mixed";
}

/**
 * Tag a single word with all applicable tags
 */
export function tagWord(word: string): TaggedWord {
  const tags: WordTag[] = [];
  const lower = word.toLowerCase();

  // Length tag
  tags.push(getLengthTag(word));

  // Frequency tag (mutually exclusive - pick highest frequency band)
  if (TOP_100_WORDS.has(lower)) {
    tags.push("frequency:top-100");
  } else if (TOP_500_WORDS.has(lower)) {
    tags.push("frequency:top-500");
  } else if (TOP_1000_WORDS.has(lower)) {
    tags.push("frequency:top-1000");
  } else {
    tags.push("frequency:common");
  }

  // Character tags
  tags.push(...getCharacterTags(word));

  // Keyboard row tag
  tags.push(getKeyboardRowTag(word));

  return { content: word, tags };
}

/**
 * Tag an array of words
 */
export function tagWords(words: string[]): TaggedWord[] {
  return words.map(tagWord);
}

/**
 * Check if a tagged word matches the given tag filters
 */
export function matchesTags(
  item: TaggedWord,
  requireTags?: WordTag[],
  anyTags?: WordTag[],
  excludeTags?: WordTag[]
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
