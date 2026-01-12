/**
 * Main entry point for content generation
 *
 * This factory function delegates to the appropriate generator based on content type.
 */

import type { ContentGeneratorInput, GeneratedContent } from "../contentTypes";
import { WordsGenerator } from "./WordsGenerator";
import { SentencesGenerator } from "./SentencesGenerator";
import { ParagraphsGenerator } from "./ParagraphsGenerator";
import { CodeGenerator } from "./CodeGenerator";

// Singleton instances (generators are stateless after construction)
let wordsGenerator: WordsGenerator | null = null;
let sentencesGenerator: SentencesGenerator | null = null;
let paragraphsGenerator: ParagraphsGenerator | null = null;
let codeGenerator: CodeGenerator | null = null;

function getWordsGenerator(): WordsGenerator {
  if (!wordsGenerator) {
    wordsGenerator = new WordsGenerator();
  }
  return wordsGenerator;
}

function getSentencesGenerator(): SentencesGenerator {
  if (!sentencesGenerator) {
    sentencesGenerator = new SentencesGenerator();
  }
  return sentencesGenerator;
}

function getParagraphsGenerator(): ParagraphsGenerator {
  if (!paragraphsGenerator) {
    paragraphsGenerator = new ParagraphsGenerator();
  }
  return paragraphsGenerator;
}

function getCodeGenerator(): CodeGenerator {
  if (!codeGenerator) {
    codeGenerator = new CodeGenerator();
  }
  return codeGenerator;
}

/**
 * Generate content based on the provided configuration.
 *
 * @param config - The content generation configuration
 * @returns Generated content with text and metadata
 */
export function generateContent(config: ContentGeneratorInput): GeneratedContent {
  switch (config.type) {
    case "words":
      return getWordsGenerator().generate(config.options);
    case "sentences":
      return getSentencesGenerator().generate(config.options);
    case "paragraphs":
      return getParagraphsGenerator().generate(config.options);
    case "code":
      return getCodeGenerator().generate(config.options);
    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = config;
      throw new Error(`Unknown content type: ${(_exhaustive as { type: string }).type}`);
    }
  }
}
