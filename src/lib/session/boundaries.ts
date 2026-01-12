// Text boundary detection utilities

/**
 * Find word boundaries in text (indices where words start)
 */
export function findWordBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const isWordChar = /\w/.test(text[i]);
    if (isWordChar && !inWord) {
      boundaries.push(i);
      inWord = true;
    } else if (!isWordChar) {
      inWord = false;
    }
  }

  return boundaries;
}

/**
 * Find sentence boundaries (indices where sentences start)
 */
export function findSentenceBoundaries(text: string): number[] {
  const boundaries: number[] = [0]; // First sentence starts at 0
  const sentenceEnders = /[.!?]/;

  for (let i = 0; i < text.length - 1; i++) {
    if (sentenceEnders.test(text[i])) {
      // Skip whitespace to find start of next sentence
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) {
        j++;
      }
      if (j < text.length) {
        boundaries.push(j);
      }
    }
  }

  return boundaries;
}

/**
 * Find paragraph boundaries (indices where paragraphs start)
 */
export function findParagraphBoundaries(text: string): number[] {
  const boundaries: number[] = [0]; // First paragraph starts at 0

  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] === "\n" && text[i + 1] === "\n") {
      // Skip newlines to find start of next paragraph
      let j = i + 2;
      while (j < text.length && text[j] === "\n") {
        j++;
      }
      if (j < text.length) {
        boundaries.push(j);
      }
    }
  }

  return boundaries;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return findWordBoundaries(text).length;
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  return findSentenceBoundaries(text).length;
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text: string): number {
  return findParagraphBoundaries(text).length;
}

/**
 * Extract words from text
 */
export function extractWords(text: string): string[] {
  return text.match(/\w+/g) || [];
}
