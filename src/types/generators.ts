// Content generation types for the hierarchical content system

// ============= BASE TYPES =============

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
