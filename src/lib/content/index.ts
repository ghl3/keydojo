// Content module - text generation, tagging, and querying

// Types
export * from "./types";

// Generators
export { generateContent } from "./generators";
export { WordsGenerator } from "./generators/WordsGenerator";
export { SentencesGenerator } from "./generators/SentencesGenerator";
export { ParagraphsGenerator } from "./generators/ParagraphsGenerator";
export { CodeGenerator } from "./generators/CodeGenerator";

// Tagging
export {
  tagWord,
  tagWords,
  matchesTags,
  tagSentence,
  tagSentences,
  matchesSentenceTags,
  tagParagraph,
  tagParagraphs,
  matchesParagraphTags,
  tagCode,
  tagCodeSnippets,
  matchesCodeTags,
} from "./tagging";

// Query and Registry
export {
  queryWords,
  querySentences,
  queryParagraphs,
  queryCode,
  queryTaggedWords,
  queryTaggedSentences,
  queryTaggedParagraphs,
  queryTaggedCode,
  getTagStats,
} from "./contentQuery";

export {
  getTaggedWords,
  getTaggedSentences,
  getTaggedParagraphs,
  getTaggedCode,
  clearContentCache,
  warmContentCache,
  getContentStats,
} from "./contentRegistry";
