/**
 * Tag-based content classification system
 *
 * Tags enable multi-dimensional filtering of content:
 * - requireTags: ALL must match (AND)
 * - anyTags: at least ONE must match (OR)
 * - excludeTags: NONE can match (NOT)
 */

// ============= WORD TAGS =============

export type WordLengthTag =
  | "length:1-3"
  | "length:4-5"
  | "length:6-7"
  | "length:8-10"
  | "length:11+";

export type WordFrequencyTag =
  | "frequency:top-100"
  | "frequency:top-500"
  | "frequency:top-1000"
  | "frequency:common";

export type WordCharacterTag =
  | "has:hyphen"
  | "has:apostrophe"
  | "has:q"
  | "has:x"
  | "has:z";

export type WordKeyboardTag = "row:home" | "row:top" | "row:bottom" | "row:mixed";

export type WordTag =
  | WordLengthTag
  | WordFrequencyTag
  | WordCharacterTag
  | WordKeyboardTag;

// ============= SENTENCE TAGS =============

export type SentenceDifficultyTag =
  | "difficulty:easy"
  | "difficulty:medium"
  | "difficulty:hard";

export type SentenceLengthTag =
  | "length:short"
  | "length:medium"
  | "length:long";

export type SentenceThemeTag =
  | "theme:daily-life"
  | "theme:nature"
  | "theme:technology"
  | "theme:business"
  | "theme:science"
  | "theme:arts"
  | "theme:sports"
  | "theme:food"
  | "theme:travel"
  | "theme:education"
  | "theme:health"
  | "theme:general";

export type SentencePunctuationTag =
  | "has:numbers"
  | "has:quotes"
  | "has:semicolons"
  | "has:colons"
  | "has:dashes"
  | "has:parentheses"
  | "has:exclamation"
  | "has:question";

export type SentenceTag =
  | SentenceDifficultyTag
  | SentenceLengthTag
  | SentenceThemeTag
  | SentencePunctuationTag;

// ============= PARAGRAPH TAGS =============

export type ParagraphDifficultyTag =
  | "difficulty:easy"
  | "difficulty:medium"
  | "difficulty:hard";

export type ParagraphThemeTag =
  | "theme:daily-life"
  | "theme:nature"
  | "theme:technology"
  | "theme:business"
  | "theme:science"
  | "theme:arts"
  | "theme:sports"
  | "theme:food"
  | "theme:travel"
  | "theme:education"
  | "theme:health"
  | "theme:general";

export type ParagraphContentTag =
  | "has:numbers"
  | "has:rich-punctuation"
  | "has:quotes"
  | "has:technical-terms";

export type ParagraphTag =
  | ParagraphDifficultyTag
  | ParagraphThemeTag
  | ParagraphContentTag;

// ============= CODE TAGS =============

export type CodeLanguageTag =
  | "lang:javascript"
  | "lang:typescript"
  | "lang:python"
  | "lang:html"
  | "lang:css"
  | "lang:sql"
  | "lang:json"
  | "lang:react"
  | "lang:mixed";

export type CodeComplexityTag =
  | "complexity:basic"
  | "complexity:intermediate"
  | "complexity:advanced";

export type CodePatternTag =
  | "pattern:function"
  | "pattern:class"
  | "pattern:control-flow"
  | "pattern:data-structure"
  | "pattern:async"
  | "pattern:import-export"
  | "pattern:type-definition"
  | "pattern:query";

export type CodeTag = CodeLanguageTag | CodeComplexityTag | CodePatternTag;

// ============= GENERIC TAGGED ITEM =============

export interface TaggedItem<T, TagType extends string> {
  content: T;
  tags: TagType[];
}

export type TaggedWord = TaggedItem<string, WordTag>;
export type TaggedSentence = TaggedItem<string, SentenceTag>;
export type TaggedParagraph = TaggedItem<string[], ParagraphTag>;
export type TaggedCode = TaggedItem<string, CodeTag>;

// ============= QUERY OPTIONS =============

export interface ContentQueryOptions<TagType extends string> {
  /** All these tags must be present (AND) */
  requireTags?: TagType[];
  /** At least one of these tags must be present (OR) */
  anyTags?: TagType[];
  /** None of these tags can be present (NOT) */
  excludeTags?: TagType[];
  /** Shuffle results */
  shuffle?: boolean;
  /** Limit number of results */
  limit?: number;
}

export type WordQueryOptions = ContentQueryOptions<WordTag>;
export type SentenceQueryOptions = ContentQueryOptions<SentenceTag>;
export type ParagraphQueryOptions = ContentQueryOptions<ParagraphTag>;
export type CodeQueryOptions = ContentQueryOptions<CodeTag>;
