/**
 * Property-based tests for content generators using fast-check
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { WordsGenerator } from "../WordsGenerator";
import { SentencesGenerator } from "../SentencesGenerator";
import { ParagraphsGenerator } from "../ParagraphsGenerator";
import { CodeGenerator } from "../CodeGenerator";
import { generateContent } from "../generateContent";
import type { CodeLanguage, ContentGeneratorInput } from "@/types/generators";

// ============= WORDS GENERATOR =============

describe("WordsGenerator property tests", () => {
  const generator = new WordsGenerator();

  // Arbitrary for valid word options (at least one of lowercase/uppercase must be true)
  const wordsOptionsArb = fc
    .record({
      targetLength: fc.integer({ min: 10, max: 500 }),
      lowercase: fc.boolean(),
      uppercase: fc.boolean(),
      numbers: fc.boolean(),
      punctuation: fc.boolean(),
      specialChars: fc.boolean(),
    })
    .filter((opts) => opts.lowercase || opts.uppercase);

  it("never produces empty output for valid options", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        const result = generator.generate(options);
        return result.text.trim().length > 0;
      })
    );
  });

  it("respects lowercase-only setting", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        if (options.uppercase || !options.lowercase) return true; // Skip mixed/uppercase cases

        const result = generator.generate(options);
        // Extract only letter characters
        const letters = result.text.replace(/[^a-zA-Z]/g, "");
        return letters === letters.toLowerCase();
      }),
      { numRuns: 50 }
    );
  });

  it("respects uppercase-only setting", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        if (options.lowercase || !options.uppercase) return true; // Skip mixed/lowercase cases

        const result = generator.generate(options);
        // Extract only letter characters
        const letters = result.text.replace(/[^a-zA-Z]/g, "");
        return letters === letters.toUpperCase();
      }),
      { numRuns: 50 }
    );
  });

  it("only includes numbers when enabled", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        const result = generator.generate(options);
        const hasDigits = /\d/.test(result.text);

        // If numbers disabled, should not have digits
        if (!options.numbers) {
          return !hasDigits;
        }
        return true; // When enabled, numbers may or may not appear (probabilistic)
      }),
      { numRuns: 50 }
    );
  });

  it("only includes trailing punctuation when enabled", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        // Skip if special chars are enabled (they can contain ! and ?)
        if (options.specialChars) return true;

        const result = generator.generate(options);
        // Check for trailing punctuation marks (.,;: - not ! or ? which appear in special chars)
        const hasPunctuation = /[.,;:]/.test(result.text);

        // If punctuation disabled, should not have punctuation
        if (!options.punctuation) {
          return !hasPunctuation;
        }
        return true; // When enabled, punctuation may or may not appear (probabilistic)
      }),
      { numRuns: 50 }
    );
  });

  it("only includes special characters when enabled", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        const result = generator.generate(options);
        // Check for special character tokens (standalone)
        const hasSpecial = /[@#$%&*]/.test(result.text);

        // If special chars disabled, should not have them
        if (!options.specialChars) {
          return !hasSpecial;
        }
        return true; // When enabled, special chars may or may not appear (probabilistic)
      }),
      { numRuns: 50 }
    );
  });

  it("text length is approximately target length", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        const result = generator.generate(options);
        // Allow 50% variance since we stop after exceeding
        return result.text.length >= options.targetLength * 0.5;
      }),
      { numRuns: 30 }
    );
  });

  it("metadata matches content", () => {
    fc.assert(
      fc.property(wordsOptionsArb, (options) => {
        const result = generator.generate(options);
        return (
          result.metadata.contentType === "words" &&
          result.metadata.characterCount === result.text.length &&
          result.metadata.wordCount > 0
        );
      }),
      { numRuns: 30 }
    );
  });
});

// ============= SENTENCES GENERATOR =============

describe("SentencesGenerator property tests", () => {
  const generator = new SentencesGenerator();

  const sentencesOptionsArb = fc.record({
    targetLength: fc.integer({ min: 20, max: 500 }),
    includeNumbers: fc.boolean(),
    includePunctuation: fc.boolean(),
  });

  it("never produces empty output", () => {
    fc.assert(
      fc.property(sentencesOptionsArb, (options) => {
        const result = generator.generate(options);
        return result.text.trim().length > 0;
      }),
      { numRuns: 50 }
    );
  });

  it("filters numbers when disabled", () => {
    fc.assert(
      fc.property(sentencesOptionsArb, (options) => {
        if (options.includeNumbers) return true; // Skip when numbers enabled

        const result = generator.generate(options);
        return !/\d/.test(result.text);
      }),
      { numRuns: 50 }
    );
  });

  it("filters punctuation when disabled", () => {
    fc.assert(
      fc.property(sentencesOptionsArb, (options) => {
        if (options.includePunctuation) return true;

        const result = generator.generate(options);
        return !/[.,!?;:]/.test(result.text);
      }),
      { numRuns: 50 }
    );
  });

  it("text is separated by newlines", () => {
    fc.assert(
      fc.property(sentencesOptionsArb, (options) => {
        // Use larger target to ensure multiple sentences
        const result = generator.generate({ ...options, targetLength: 200 });
        // Should have at least some content with newlines
        return result.text.includes("\n") || result.text.length < 200;
      }),
      { numRuns: 30 }
    );
  });

  it("metadata matches content", () => {
    fc.assert(
      fc.property(sentencesOptionsArb, (options) => {
        const result = generator.generate(options);
        return (
          result.metadata.contentType === "sentences" &&
          result.metadata.characterCount === result.text.length
        );
      }),
      { numRuns: 30 }
    );
  });
});

// ============= PARAGRAPHS GENERATOR =============

describe("ParagraphsGenerator property tests", () => {
  const generator = new ParagraphsGenerator();

  const paragraphsOptionsArb = fc.record({
    targetLength: fc.integer({ min: 50, max: 500 }),
    includeNumbers: fc.boolean(),
    includePunctuation: fc.boolean(),
  });

  it("never produces empty output", () => {
    fc.assert(
      fc.property(paragraphsOptionsArb, (options) => {
        const result = generator.generate(options);
        return result.text.trim().length > 0;
      }),
      { numRuns: 50 }
    );
  });

  it("filters numbers when disabled", () => {
    fc.assert(
      fc.property(paragraphsOptionsArb, (options) => {
        if (options.includeNumbers) return true;

        const result = generator.generate(options);
        return !/\d/.test(result.text);
      }),
      { numRuns: 50 }
    );
  });

  it("filters punctuation when disabled", () => {
    fc.assert(
      fc.property(paragraphsOptionsArb, (options) => {
        if (options.includePunctuation) return true;

        const result = generator.generate(options);
        return !/[.,!?;:]/.test(result.text);
      }),
      { numRuns: 50 }
    );
  });

  it("metadata matches content", () => {
    fc.assert(
      fc.property(paragraphsOptionsArb, (options) => {
        const result = generator.generate(options);
        return (
          result.metadata.contentType === "paragraphs" &&
          result.metadata.characterCount === result.text.length
        );
      }),
      { numRuns: 30 }
    );
  });
});

// ============= CODE GENERATOR =============

describe("CodeGenerator property tests", () => {
  const generator = new CodeGenerator();

  const languageArb: fc.Arbitrary<CodeLanguage> = fc.constantFrom(
    "javascript",
    "typescript",
    "python",
    "html",
    "css",
    "sql",
    "json",
    "react",
    "mixed"
  );

  const codeOptionsArb = fc.record({
    targetLength: fc.integer({ min: 20, max: 500 }),
    language: languageArb,
  });

  it("never produces empty output", () => {
    fc.assert(
      fc.property(codeOptionsArb, (options) => {
        const result = generator.generate(options);
        return result.text.trim().length > 0;
      }),
      { numRuns: 50 }
    );
  });

  it("preserves code syntax characters", () => {
    fc.assert(
      fc.property(codeOptionsArb, (options) => {
        const result = generator.generate(options);
        // Code should contain typical syntax characters
        return /[{}();=\[\]<>:]/.test(result.text);
      }),
      { numRuns: 50 }
    );
  });

  it("records correct language in metadata", () => {
    fc.assert(
      fc.property(codeOptionsArb, (options) => {
        const result = generator.generate(options);
        return result.metadata.language === options.language;
      }),
      { numRuns: 30 }
    );
  });

  it("metadata matches content", () => {
    fc.assert(
      fc.property(codeOptionsArb, (options) => {
        const result = generator.generate(options);
        return (
          result.metadata.contentType === "code" &&
          result.metadata.characterCount === result.text.length
        );
      }),
      { numRuns: 30 }
    );
  });
});

// ============= CROSS-GENERATOR TESTS =============

describe("Cross-generator invariants", () => {
  it("generateContent factory handles all content types", () => {

    fc.assert(
      fc.property(
        fc.constantFrom("words", "sentences", "paragraphs", "code"),
        (type) => {
          let input: ContentGeneratorInput;
          switch (type) {
            case "words":
              input = {
                type: "words",
                options: {
                  targetLength: 100,
                  lowercase: true,
                  uppercase: false,
                  numbers: false,
                  punctuation: false,
                  specialChars: false,
                },
              };
              break;
            case "sentences":
              input = {
                type: "sentences",
                options: {
                  targetLength: 100,
                  includeNumbers: false,
                  includePunctuation: true,
                },
              };
              break;
            case "paragraphs":
              input = {
                type: "paragraphs",
                options: {
                  targetLength: 100,
                  includeNumbers: false,
                  includePunctuation: true,
                },
              };
              break;
            case "code":
              input = {
                type: "code",
                options: {
                  targetLength: 100,
                  language: "mixed" as CodeLanguage,
                },
              };
              break;
          }

          const result = generateContent(input);
          return (
            result.text.length > 0 && result.metadata.contentType === type
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});
