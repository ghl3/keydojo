// Common English words organized by various criteria

// Most common short words (good for beginners)
export const COMMON_SHORT_WORDS = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
  "did", "oil", "sit", "set", "run", "hot", "eat", "far", "sea", "let",
  "put", "end", "men", "say", "she", "too", "use", "big", "own", "why",
];

// Common medium-length words
export const COMMON_MEDIUM_WORDS = [
  "about", "after", "again", "being", "below", "between", "called", "could",
  "found", "great", "house", "large", "little", "might", "never", "other",
  "place", "right", "small", "sound", "still", "study", "their", "there",
  "these", "thing", "think", "three", "water", "where", "which", "while",
  "world", "would", "write", "years", "before", "change", "different",
  "every", "follow", "letter", "mother", "number", "people", "picture",
  "should", "through", "together", "under", "without",
];

// Common longer words (for advanced practice)
export const COMMON_LONG_WORDS = [
  "beautiful", "different", "important", "something", "understand",
  "everything", "government", "information", "themselves", "development",
  "environment", "international", "organization", "particularly",
  "relationship", "significant", "traditional", "communication",
  "consideration", "professional", "responsibility", "administration",
];

// Words with specific difficult keys
export const WORDS_WITH_Q = [
  "quick", "quiet", "quite", "queen", "quote", "quest", "equal", "square",
  "quality", "question", "require", "unique", "liquid", "equipment",
];

export const WORDS_WITH_Z = [
  "zero", "zone", "zoom", "size", "prize", "organize", "realize", "frozen",
  "amazing", "citizen", "magazine", "recognize", "emphasized", "civilization",
];

export const WORDS_WITH_X = [
  "next", "text", "box", "six", "fix", "mix", "tax", "wax", "exam", "exit",
  "extra", "exact", "exist", "expect", "example", "explain", "express",
];

// Home row focused words (asdfghjkl)
export const HOME_ROW_WORDS = [
  "add", "all", "ask", "dad", "fall", "flag", "glass", "half", "hall", "hand",
  "glad", "flash", "class", "shall", "salad", "alaska", "hassle",
];

// Top row focused words (qwertyuiop)
export const TOP_ROW_WORDS = [
  "wet", "pet", "rip", "tip", "type", "quit", "wire", "riot", "your", "tour",
  "equip", "quote", "power", "tower", "throw", "write", "proper", "poetry",
];

// Bottom row focused words (zxcvbnm)
export const BOTTOM_ROW_WORDS = [
  "can", "van", "ban", "man", "cab", "mix", "box", "zen", "zone", "come",
  "move", "zone", "bomb", "climb", "zombie", "combine",
];

// Numbers as words
export const NUMBER_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "twenty", "hundred", "thousand", "million",
];

// Punctuation practice phrases
export const PUNCTUATION_PHRASES = [
  "Hello, world!",
  "What's your name?",
  "I can't believe it!",
  "Yes, I agree.",
  "No, thank you.",
  "It's a beautiful day.",
  "Wow! That's amazing!",
  "Really? Are you sure?",
  "Let's go; it's time.",
  "Note: be careful here.",
];

// Simple sentences
export const SIMPLE_SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz.",
  "The rain in Spain falls mainly on the plain.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be that is the question.",
  "All that glitters is not gold.",
  "Actions speak louder than words.",
  "Practice makes perfect.",
  "Time flies when you are having fun.",
  "Knowledge is power.",
  "Better late than never.",
  "Every cloud has a silver lining.",
];

// Longer sentences for paragraph mode
export const LONGER_SENTENCES = [
  "The sun was setting behind the mountains, casting long shadows across the peaceful valley below.",
  "She picked up the old photograph and smiled, remembering the happy days of her childhood.",
  "Technology has transformed the way we communicate, work, and interact with each other.",
  "The ancient castle stood proudly on the hilltop, a silent witness to centuries of history.",
  "Learning a new skill requires patience, dedication, and consistent practice over time.",
  "The garden was filled with colorful flowers that attracted butterflies from miles around.",
  "Scientists are working tirelessly to find solutions to the pressing environmental challenges we face.",
  "Music has the unique ability to evoke powerful emotions and bring people together.",
  "The library was a sanctuary of knowledge where curious minds could explore endless possibilities.",
  "Traveling to new places opens our eyes to different cultures and perspectives on life.",
];

// Get all basic words
export function getBasicWords(): string[] {
  return [...COMMON_SHORT_WORDS, ...COMMON_MEDIUM_WORDS];
}

// Get all words (including longer ones)
export function getAllWords(): string[] {
  return [
    ...COMMON_SHORT_WORDS,
    ...COMMON_MEDIUM_WORDS,
    ...COMMON_LONG_WORDS,
  ];
}
