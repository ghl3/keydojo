/**
 * CodeGenerator - Generates code-based typing practice content
 *
 * Features:
 * - Language selection (JavaScript, TypeScript, Python, etc.)
 * - No character filtering - code shown as-is
 * - Mixed mode for variety
 */

import type { CodeGeneratorOptions, GeneratedContent } from "@/types/generators";
import { getAllCodeSnippets, getSnippetsByLanguage } from "../codeSnippets";
import { shuffle } from "./utils";

export class CodeGenerator {
  generate(options: CodeGeneratorOptions): GeneratedContent {
    const { targetLength, language } = options;

    // Get snippets based on language selection
    const snippets =
      language === "mixed"
        ? getAllCodeSnippets()
        : getSnippetsByLanguage(language);

    if (snippets.length === 0) {
      // Fallback to all snippets if no matches
      return this.generateFromSnippets(getAllCodeSnippets(), targetLength, language);
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
