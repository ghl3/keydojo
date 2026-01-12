/**
 * CodeGenerator - Generates code-based typing practice content
 *
 * Features:
 * - Language selection (JavaScript, TypeScript, Python, etc.)
 * - No character filtering - code shown as-is
 * - Mixed mode for variety
 */

import type { CodeGeneratorOptions, GeneratedContent, CodeLanguage, CodeLanguageTag } from "../contentTypes";
import { queryCode } from "../contentQuery";
import { shuffle } from "./utils";

// Map generator language options to tag language tags
const LANGUAGE_TO_TAG: Record<CodeLanguage, CodeLanguageTag> = {
  javascript: "lang:javascript",
  typescript: "lang:typescript",
  python: "lang:python",
  html: "lang:html",
  css: "lang:css",
  sql: "lang:sql",
  json: "lang:json",
  react: "lang:react",
  mixed: "lang:mixed",
};

export class CodeGenerator {
  generate(options: CodeGeneratorOptions): GeneratedContent {
    const { targetLength, language } = options;

    // Get snippets based on language selection
    let snippets: string[];
    if (language === "mixed") {
      snippets = queryCode({});
    } else {
      const langTag = LANGUAGE_TO_TAG[language];
      snippets = queryCode({ requireTags: [langTag] });
      // Fallback to all snippets if no matches for this language
      if (snippets.length === 0) {
        snippets = queryCode({});
      }
    }

    return this.generateFromSnippets(snippets, targetLength, language);
  }

  private generateFromSnippets(
    snippets: string[],
    targetLength: number,
    language: CodeGeneratorOptions["language"]
  ): GeneratedContent {
    const selected: string[] = [];
    let currentLength = 0;

    // Shuffle for variety
    let shuffled = shuffle(snippets);
    let index = 0;

    while (currentLength < targetLength) {
      // Cycle through snippets if we need more
      if (index >= shuffled.length) {
        shuffled = shuffle(snippets);
        index = 0;
      }

      const snippet = shuffled[index];
      selected.push(snippet);
      currentLength += snippet.length + 2; // +2 for double newline
      index++;
    }

    // Join code snippets with double newlines for visual separation
    const text = selected.join("\n\n");

    return {
      text,
      metadata: {
        contentType: "code",
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        language,
      },
    };
  }
}
