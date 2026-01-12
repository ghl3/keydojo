import type { CharCategory } from "@/lib/session";

// Classify a character into its category
export function classifyChar(char: string): CharCategory {
  if (char === " ") return "space";
  if (/[a-z]/.test(char)) return "lowercase";
  if (/[A-Z]/.test(char)) return "uppercase";
  if (/[0-9]/.test(char)) return "number";
  return "punctuation";
}

// Re-export boundary functions from session module for backwards compatibility
export {
  findWordBoundaries,
  findSentenceBoundaries,
  findParagraphBoundaries,
  countWords,
  countSentences,
  countParagraphs,
  extractWords,
} from "@/lib/session";
