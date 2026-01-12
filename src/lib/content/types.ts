// Content generation and tagging types

// ============= GENERATOR TYPES =============

/** Common options shared across all generators */
export interface BaseGeneratorOptions {
  targetLength: number; // Approximate character count
  weakKeys?: string[]; // Keys for adaptive difficulty
  adaptiveIntensity?: number; // 0-1, how much to weight weak keys
}

/** Result from any generator */
export interface GeneratedContent {
  text: string;
  metadata: ContentMetadata;
}

export interface ContentMetadata {
  contentType: ContentType;
  wordCount: number;
  characterCount: number;
  language?: CodeLanguage;
}

// ============= WORDS MODE =============

export interface WordsGeneratorOptions extends BaseGeneratorOptions {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean; // Adds standalone number words: "1776", "42", "2024"
  punctuation: boolean; // Adds trailing punctuation: "hello," "world!"
  specialChars: boolean; // Adds standalone special char words: "@", "#", "$%"
}

// ============= SENTENCES/PARAGRAPHS MODE =============

export interface TextGeneratorOptions extends BaseGeneratorOptions {
  includeNumbers: boolean; // Prefer sentences with/without numbers
  includePunctuation: boolean; // Keep or strip punctuation
}

export type SentencesGeneratorOptions = TextGeneratorOptions;
export type ParagraphsGeneratorOptions = TextGeneratorOptions;

// ============= CODE MODE =============

export type CodeLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "sql"
  | "json"
  | "react"
  | "mixed";

export interface CodeGeneratorOptions extends BaseGeneratorOptions {
  language: CodeLanguage;
}

// ============= CONTENT TYPES =============

export type ContentType = "words" | "sentences" | "paragraphs" | "code";

// ============= UI STATE TYPES =============

/**
 * Words mode UI options
 */
export interface WordsModeOptions {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  punctuation: boolean;
  specialChars: boolean;
}

/**
 * Sentences/Paragraphs mode UI options
 */
export interface TextModeOptions {
  numbers: boolean;
  punctuation: boolean;
}

/**
 * Code mode UI options
 */
export interface CodeModeOptions {
  language: CodeLanguage;
}

/**
 * Discriminated union for content-type-specific options
 */
export type ContentModeConfig =
  | { type: "words"; options: WordsModeOptions }
  | { type: "sentences"; options: TextModeOptions }
  | { type: "paragraphs"; options: TextModeOptions }
  | { type: "code"; options: CodeModeOptions };

// ============= DEFAULT OPTIONS =============

export function getDefaultWordsOptions(): WordsModeOptions {
  return {
    lowercase: true,
    uppercase: false,
    numbers: false,
    punctuation: false,
    specialChars: false,
  };
}

export function getDefaultTextOptions(): TextModeOptions {
  return {
    numbers: false,
    punctuation: true,
  };
}

export function getDefaultCodeOptions(): CodeModeOptions {
  return {
    language: "mixed",
  };
}

export function getDefaultContentMode(): ContentModeConfig {
  return {
    type: "words",
    options: getDefaultWordsOptions(),
  };
}

// ============= GENERATOR INPUT TYPES =============

/**
 * Union type for all generator options (used by factory function)
 */
export type ContentGeneratorInput =
  | { type: "words"; options: WordsGeneratorOptions }
  | { type: "sentences"; options: SentencesGeneratorOptions }
  | { type: "paragraphs"; options: ParagraphsGeneratorOptions }
  | { type: "code"; options: CodeGeneratorOptions };

// ============= CONVERSION HELPERS =============

/**
 * Convert UI mode config to generator options
 */
export function toGeneratorOptions(
  config: ContentModeConfig,
  baseOptions: Omit<BaseGeneratorOptions, "targetLength"> & {
    targetLength: number;
  }
): ContentGeneratorInput {
  const { targetLength, weakKeys, adaptiveIntensity } = baseOptions;

  switch (config.type) {
    case "words":
      return {
        type: "words",
        options: {
          ...config.options,
          targetLength,
          weakKeys,
          adaptiveIntensity,
        },
      };
    case "sentences":
      return {
        type: "sentences",
        options: {
          includeNumbers: config.options.numbers,
          includePunctuation: config.options.punctuation,
          targetLength,
          weakKeys,
          adaptiveIntensity,
        },
      };
    case "paragraphs":
      return {
        type: "paragraphs",
        options: {
          includeNumbers: config.options.numbers,
          includePunctuation: config.options.punctuation,
          targetLength,
          weakKeys,
          adaptiveIntensity,
        },
      };
    case "code":
      return {
        type: "code",
        options: {
          language: config.options.language,
          targetLength,
          weakKeys,
          adaptiveIntensity,
        },
      };
  }
}

// ============= TAG TYPES =============

// Word tags
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

// Sentence tags
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

// Paragraph tags
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

// Code tags
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

// Generic tagged item
export interface TaggedItem<T, TagType extends string> {
  content: T;
  tags: TagType[];
}

export type TaggedWord = TaggedItem<string, WordTag>;
export type TaggedSentence = TaggedItem<string, SentenceTag>;
export type TaggedParagraph = TaggedItem<string[], ParagraphTag>;
export type TaggedCode = TaggedItem<string, CodeTag>;

// Query options
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
