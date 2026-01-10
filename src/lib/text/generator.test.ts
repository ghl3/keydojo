import { describe, it, expect } from "vitest";
import { generateBaseText, transformText } from "./generator";
import type { CharacterTypeFlags, ContentType } from "@/types";

// Helper to create character type flags
function createCharacterTypes(
  overrides: Partial<CharacterTypeFlags> = {}
): CharacterTypeFlags {
  return {
    lowercaseLetters: true,
    uppercaseLetters: true,
    numbers: true,
    punctuation: true,
    spaces: true,
    ...overrides,
  };
}

// Helper to check if string contains uppercase letters
function hasUppercase(str: string): boolean {
  return /[A-Z]/.test(str);
}

// Helper to check if string contains lowercase letters
function hasLowercase(str: string): boolean {
  return /[a-z]/.test(str);
}

// Helper to check if string contains numbers
function hasNumbers(str: string): boolean {
  return /\d/.test(str);
}

// Helper to check if string contains common punctuation
function hasPunctuation(str: string): boolean {
  return /[.,!?;:'"()\-@#$%^&*]/.test(str);
}

// Helper to check if string contains any letters
function hasLetters(str: string): boolean {
  return /[a-zA-Z]/.test(str);
}

// Helper to check if string contains spaces
function hasSpaces(str: string): boolean {
  return / /.test(str);
}

// =============================================================================
// GENERATE BASE TEXT TESTS
// =============================================================================

describe("generateBaseText", () => {
  describe("content types", () => {
    it("generates words content", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
      });

      expect(text).toBeTruthy();
      expect(text.length).toBeGreaterThan(0);
      // Words mode should have spaces between words
      expect(text).toContain(" ");
    });

    it("generates sentences content", () => {
      const text = generateBaseText({
        contentType: "sentences",
        length: "short",
      });

      expect(text).toBeTruthy();
      expect(text.length).toBeGreaterThan(0);
      // Sentences should have punctuation (periods, etc.)
      expect(hasPunctuation(text)).toBe(true);
    });

    it("generates paragraphs content", () => {
      const text = generateBaseText({
        contentType: "paragraphs",
        length: "short",
      });

      expect(text).toBeTruthy();
      expect(text.length).toBeGreaterThan(0);
      // Paragraphs should have sentence-ending punctuation
      expect(text).toMatch(/[.!?]/);
    });

    it("generates code content", () => {
      const text = generateBaseText({
        contentType: "code",
        length: "short",
      });

      expect(text).toBeTruthy();
      expect(text.length).toBeGreaterThan(0);
      // Code should contain typical code characters
      expect(text).toMatch(/[{}();=]/);
    });
  });

  describe("text length options", () => {
    it("generates shorter text for 'short' length", () => {
      const shortText = generateBaseText({
        contentType: "words",
        length: "short",
      });
      const longText = generateBaseText({
        contentType: "words",
        length: "long",
      });

      expect(shortText.length).toBeLessThan(longText.length);
    });

    it("generates medium length text", () => {
      const shortText = generateBaseText({
        contentType: "words",
        length: "short",
      });
      const mediumText = generateBaseText({
        contentType: "words",
        length: "medium",
      });
      const longText = generateBaseText({
        contentType: "words",
        length: "long",
      });

      expect(mediumText.length).toBeGreaterThan(shortText.length);
      expect(mediumText.length).toBeLessThan(longText.length);
    });
  });

  describe("numbers-only mode", () => {
    it("generates number sequences when only numbers are enabled", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        characterTypes: createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: true,
          punctuation: true,
        }),
      });

      expect(text).toBeTruthy();
      expect(hasNumbers(text)).toBe(true);
      // Should contain typical number content like phone numbers, dates, etc.
      expect(text).toMatch(/[\d\-\/.:()$+%]/);
    });

    it("numbers-only mode works regardless of content type", () => {
      const contentTypes: ContentType[] = ["words", "sentences", "paragraphs"];

      for (const contentType of contentTypes) {
        const text = generateBaseText({
          contentType,
          length: "short",
          characterTypes: createCharacterTypes({
            lowercaseLetters: false,
            uppercaseLetters: false,
            numbers: true,
            punctuation: true,
          }),
        });

        expect(text).toBeTruthy();
        expect(hasNumbers(text)).toBe(true);
      }
    });
  });

  describe("punctuation-only mode", () => {
    it("generates punctuation drills when only punctuation is enabled", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        characterTypes: createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: false,
          punctuation: true,
        }),
      });

      expect(text).toBeTruthy();
      expect(hasPunctuation(text)).toBe(true);
    });

    it("punctuation-only mode works regardless of content type", () => {
      const contentTypes: ContentType[] = ["words", "sentences", "paragraphs"];

      for (const contentType of contentTypes) {
        const text = generateBaseText({
          contentType,
          length: "short",
          characterTypes: createCharacterTypes({
            lowercaseLetters: false,
            uppercaseLetters: false,
            numbers: false,
            punctuation: true,
          }),
        });

        expect(text).toBeTruthy();
        expect(hasPunctuation(text)).toBe(true);
      }
    });
  });

  describe("no artificial number injection", () => {
    it("words mode does not inject random numbers", () => {
      // Generate multiple times to ensure consistency
      for (let i = 0; i < 5; i++) {
        const text = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes: createCharacterTypes({
            numbers: false, // Disable numbers
          }),
        });

        // After transformation, there should be no numbers
        const transformed = transformText(
          text,
          createCharacterTypes({ numbers: false })
        );
        expect(hasNumbers(transformed)).toBe(false);
      }
    });
  });
});

// =============================================================================
// TRANSFORM TEXT TESTS
// =============================================================================

describe("transformText", () => {
  const sampleText =
    'The Quick Brown Fox, 123 times! Asked "Why?" at 3:30 PM.';

  describe("case transformations", () => {
    it("converts to lowercase when only lowercase is enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: true,
          uppercaseLetters: false,
        })
      );

      expect(hasUppercase(result)).toBe(false);
      expect(hasLowercase(result)).toBe(true);
    });

    it("converts to uppercase when only uppercase is enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: true,
        })
      );

      expect(hasUppercase(result)).toBe(true);
      expect(hasLowercase(result)).toBe(false);
    });

    it("preserves original case when both are enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: true,
          uppercaseLetters: true,
        })
      );

      expect(hasUppercase(result)).toBe(true);
      expect(hasLowercase(result)).toBe(true);
    });

    it("removes all letters when neither lowercase nor uppercase is enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
        })
      );

      // Should have no letters at all
      expect(hasLetters(result)).toBe(false);
      // But should still have numbers and punctuation
      expect(hasNumbers(result)).toBe(true);
      expect(hasPunctuation(result)).toBe(true);
    });
  });

  describe("punctuation removal", () => {
    it("removes punctuation when disabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          punctuation: false,
        })
      );

      // Basic punctuation should be removed
      expect(result).not.toContain(",");
      expect(result).not.toContain("!");
      expect(result).not.toContain("?");
      expect(result).not.toContain('"');
      expect(result).not.toContain(".");
    });

    it("preserves punctuation when enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          punctuation: true,
        })
      );

      expect(result).toContain(",");
      expect(result).toContain("!");
      expect(result).toContain("?");
    });

    it("removes extended punctuation characters", () => {
      const textWithExtendedPunctuation =
        "Email: test@example.com, price: $100, rate: 50%";

      const result = transformText(
        textWithExtendedPunctuation,
        createCharacterTypes({
          punctuation: false,
        })
      );

      expect(result).not.toContain("@");
      expect(result).not.toContain("$");
      expect(result).not.toContain("%");
      expect(result).not.toContain(":");
    });
  });

  describe("number removal", () => {
    it("removes numbers when disabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          numbers: false,
        })
      );

      expect(hasNumbers(result)).toBe(false);
    });

    it("preserves numbers when enabled", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          numbers: true,
        })
      );

      expect(hasNumbers(result)).toBe(true);
      expect(result).toContain("123");
      expect(result).toContain("3");
      expect(result).toContain("30");
    });

    it("removes multi-digit numbers completely", () => {
      const textWithNumbers = "There are 12345 items and 67890 records.";

      const result = transformText(
        textWithNumbers,
        createCharacterTypes({
          numbers: false,
        })
      );

      expect(result).not.toContain("12345");
      expect(result).not.toContain("67890");
      expect(hasNumbers(result)).toBe(false);
    });
  });

  describe("combined transformations", () => {
    it("applies multiple transformations correctly", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: true,
          uppercaseLetters: false,
          numbers: false,
          punctuation: false,
        })
      );

      expect(hasUppercase(result)).toBe(false);
      expect(hasNumbers(result)).toBe(false);
      expect(hasPunctuation(result)).toBe(false);
      expect(hasLowercase(result)).toBe(true);
    });

    it("handles uppercase only with no punctuation or numbers", () => {
      const result = transformText(
        sampleText,
        createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: true,
          numbers: false,
          punctuation: false,
        })
      );

      expect(hasUppercase(result)).toBe(true);
      expect(hasLowercase(result)).toBe(false);
      expect(hasNumbers(result)).toBe(false);
      expect(hasPunctuation(result)).toBe(false);
    });
  });

  describe("whitespace handling", () => {
    it("collapses multiple spaces into single space", () => {
      const result = transformText(
        "Hello   world    test",
        createCharacterTypes()
      );

      expect(result).not.toContain("  ");
      expect(result).toContain("Hello world test");
    });

    it("trims leading and trailing spaces from lines", () => {
      const result = transformText(
        "  Hello world  ",
        createCharacterTypes()
      );

      expect(result).toBe("Hello world");
    });

    it("preserves newlines but trims each line", () => {
      const result = transformText(
        "  Line one  \n  Line two  ",
        createCharacterTypes()
      );

      expect(result).toBe("Line one\nLine two");
    });

    it("cleans up spaces left by removed punctuation", () => {
      const result = transformText(
        "Hello, world! How are you?",
        createCharacterTypes({
          punctuation: false,
        })
      );

      // Should not have double spaces after punctuation removal
      expect(result).not.toContain("  ");
    });
  });

  describe("code mode preservation", () => {
    it("skips transformations for code content type", () => {
      const codeText = 'const x = 123; console.log("Hello!");';

      const result = transformText(
        codeText,
        createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: true,
          numbers: false,
          punctuation: false,
        }),
        "code"
      );

      // Code mode should preserve everything
      expect(result).toBe(codeText);
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("content generation integration", () => {
  describe("full pipeline for different modes", () => {
    const contentTypes: ContentType[] = [
      "words",
      "sentences",
      "paragraphs",
    ];

    it.each(contentTypes)(
      "generates and transforms %s content correctly",
      (contentType) => {
        const characterTypes = createCharacterTypes();

        const baseText = generateBaseText({
          contentType,
          length: "short",
          characterTypes,
        });

        const transformedText = transformText(
          baseText,
          characterTypes,
          contentType
        );

        expect(transformedText).toBeTruthy();
        expect(transformedText.length).toBeGreaterThan(0);
      }
    );
  });

  describe("character type combinations", () => {
    const combinations: {
      name: string;
      types: Partial<CharacterTypeFlags>;
      checks: {
        hasLower?: boolean;
        hasUpper?: boolean;
        hasNum?: boolean;
        hasPunct?: boolean;
      };
    }[] = [
      {
        name: "all enabled",
        types: {},
        checks: { hasLower: true, hasUpper: true, hasPunct: true },
      },
      {
        name: "lowercase only",
        types: { uppercaseLetters: false, numbers: false, punctuation: false },
        checks: { hasLower: true, hasUpper: false, hasNum: false, hasPunct: false },
      },
      {
        name: "uppercase only",
        types: { lowercaseLetters: false, numbers: false, punctuation: false },
        checks: { hasLower: false, hasUpper: true, hasNum: false, hasPunct: false },
      },
      {
        name: "no numbers",
        types: { numbers: false },
        checks: { hasNum: false },
      },
      {
        name: "no punctuation",
        types: { punctuation: false },
        checks: { hasPunct: false },
      },
    ];

    it.each(combinations)(
      "handles $name correctly",
      ({ types, checks }) => {
        const characterTypes = createCharacterTypes(types);

        const baseText = generateBaseText({
          contentType: "sentences",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        if (checks.hasLower !== undefined) {
          expect(hasLowercase(result)).toBe(checks.hasLower);
        }
        if (checks.hasUpper !== undefined) {
          expect(hasUppercase(result)).toBe(checks.hasUpper);
        }
        if (checks.hasNum !== undefined) {
          expect(hasNumbers(result)).toBe(checks.hasNum);
        }
        if (checks.hasPunct !== undefined) {
          expect(hasPunctuation(result)).toBe(checks.hasPunct);
        }
      }
    );
  });

  describe("edge cases", () => {
    it("handles empty weak keys array", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        weakKeys: [],
        adaptiveIntensity: 0.5,
      });

      expect(text).toBeTruthy();
    });

    it("handles zero adaptive intensity", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        weakKeys: ["a", "s", "d"],
        adaptiveIntensity: 0,
      });

      expect(text).toBeTruthy();
    });

    it("handles high adaptive intensity", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        weakKeys: ["e", "t"],
        adaptiveIntensity: 1,
      });

      expect(text).toBeTruthy();
    });

    it("generates non-empty text for all length options", () => {
      const lengths = ["short", "medium", "long"] as const;

      for (const length of lengths) {
        const text = generateBaseText({
          contentType: "words",
          length,
        });

        expect(text.length).toBeGreaterThan(0);
      }
    });
  });
});

// =============================================================================
// CONTENT QUALITY TESTS
// =============================================================================

describe("content quality", () => {
  describe("natural numbers in sentences", () => {
    it("sentences content includes naturally-occurring numbers", () => {
      // Generate multiple times to increase chance of getting number sentences
      let foundNumberSentence = false;

      for (let i = 0; i < 10; i++) {
        const text = generateBaseText({
          contentType: "sentences",
          length: "medium",
          characterTypes: createCharacterTypes(),
        });

        // Check for naturally-occurring numbers (dates, prices, statistics)
        if (/\d{1,4}[%$]|\$\d|\d{4}|\d{1,2}:\d{2}|\d+%/.test(text)) {
          foundNumberSentence = true;
          break;
        }
      }

      // Should find at least one sentence with natural numbers
      expect(foundNumberSentence).toBe(true);
    });
  });

  describe("numbers-only content quality", () => {
    it("generates recognizable number patterns", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        characterTypes: createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: true,
          punctuation: true,
        }),
      });

      // Should contain recognizable patterns (phone, IP, date, price, etc.)
      const hasRecognizablePattern =
        /\(\d{3}\)/.test(text) || // Phone area code
        /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text) || // IP address
        /\d{4}-\d{2}-\d{2}/.test(text) || // Date
        /\$\d+/.test(text) || // Price
        /\d+:\d{2}/.test(text) || // Time
        /\d+\s*[+\-*/=]\s*\d+/.test(text); // Math

      expect(hasRecognizablePattern).toBe(true);
    });
  });

  describe("punctuation-only content quality", () => {
    it("generates varied punctuation patterns", () => {
      const text = generateBaseText({
        contentType: "words",
        length: "short",
        characterTypes: createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: false,
          punctuation: true,
        }),
      });

      // Should contain multiple different punctuation marks
      const punctuationTypes = [
        /[.,]/, // Basic
        /[!?]/, // Exclamation/question
        /[;:]/, // Semicolon/colon
        /['"()]/, // Quotes/parens
        /[@#$%&*]/, // Special
      ];

      let matchCount = 0;
      for (const pattern of punctuationTypes) {
        if (pattern.test(text)) {
          matchCount++;
        }
      }

      // Should have at least a few different punctuation types
      expect(matchCount).toBeGreaterThanOrEqual(2);
    });
  });
});

// =============================================================================
// GENERATIVE INVARIANT TESTS
// These tests verify that character type settings are strictly enforced
// =============================================================================

describe("generative invariant tests", () => {
  const NUM_ITERATIONS = 20; // Run each test multiple times to catch edge cases
  const contentTypes: ContentType[] = ["words", "sentences", "paragraphs"];

  describe("numbers-only mode invariants", () => {
    it("NEVER contains letters when letters are disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: false,
            uppercaseLetters: false,
            numbers: true,
            punctuation: true,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasLetters(result)).toBe(false);
        }
      }
    });

    it("contains ONLY numbers, punctuation, spaces, and newlines when configured", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const characterTypes = createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: true,
          punctuation: true,
          spaces: true,
        });

        const baseText = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        // Remove allowed characters, nothing should remain
        const stripped = result.replace(/[\d.,!?;:'"()\-@#$%^&*~\/\\+=<>\[\]{}|`_ \n]/g, "");
        expect(stripped).toBe("");
      }
    });

    it("contains ONLY numbers when spaces and punctuation are also disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const characterTypes = createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: true,
          punctuation: false,
          spaces: false,
        });

        const baseText = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        // Remove numbers and newlines, nothing should remain
        const stripped = result.replace(/[\d\n]/g, "");
        expect(stripped).toBe("");
      }
    });
  });

  describe("punctuation-only mode invariants", () => {
    it("NEVER contains letters or numbers when both are disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: false,
            uppercaseLetters: false,
            numbers: false,
            punctuation: true,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasLetters(result)).toBe(false);
          expect(hasNumbers(result)).toBe(false);
        }
      }
    });
  });

  describe("lowercase-only mode invariants", () => {
    it("NEVER contains uppercase letters when uppercase is disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: true,
            uppercaseLetters: false,
            numbers: true,
            punctuation: true,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasUppercase(result)).toBe(false);
        }
      }
    });
  });

  describe("uppercase-only mode invariants", () => {
    it("NEVER contains lowercase letters when lowercase is disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: false,
            uppercaseLetters: true,
            numbers: true,
            punctuation: true,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasLowercase(result)).toBe(false);
        }
      }
    });
  });

  describe("no-numbers mode invariants", () => {
    it("NEVER contains digits when numbers are disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: true,
            uppercaseLetters: true,
            numbers: false,
            punctuation: true,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasNumbers(result)).toBe(false);
        }
      }
    });
  });

  describe("no-punctuation mode invariants", () => {
    it("NEVER contains punctuation when punctuation is disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: true,
            uppercaseLetters: true,
            numbers: true,
            punctuation: false,
            spaces: true,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasPunctuation(result)).toBe(false);
        }
      }
    });
  });

  describe("no-spaces mode invariants", () => {
    it("NEVER contains spaces when spaces are disabled", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        for (const contentType of contentTypes) {
          const characterTypes = createCharacterTypes({
            lowercaseLetters: true,
            uppercaseLetters: true,
            numbers: true,
            punctuation: true,
            spaces: false,
          });

          const baseText = generateBaseText({
            contentType,
            length: "short",
            characterTypes,
          });

          const result = transformText(baseText, characterTypes, contentType);

          expect(hasSpaces(result)).toBe(false);
        }
      }
    });

    it("preserves newlines even when spaces are disabled", () => {
      const characterTypes = createCharacterTypes({
        lowercaseLetters: true,
        uppercaseLetters: true,
        numbers: true,
        punctuation: true,
        spaces: false,
      });

      const baseText = generateBaseText({
        contentType: "sentences",
        length: "medium",
        characterTypes,
      });

      const result = transformText(baseText, characterTypes, "sentences");

      // Should still have newlines for sentence separation
      expect(result).toContain("\n");
      // But no spaces
      expect(hasSpaces(result)).toBe(false);
    });
  });

  describe("combined mode invariants", () => {
    it("handles pure numbers (no letters, no punctuation, no spaces)", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const characterTypes = createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: true,
          punctuation: false,
          spaces: false,
        });

        const baseText = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        expect(hasLetters(result)).toBe(false);
        expect(hasPunctuation(result)).toBe(false);
        expect(hasSpaces(result)).toBe(false);
        expect(hasNumbers(result)).toBe(true);
      }
    });

    it("handles lowercase letters only (no uppercase, no numbers, no punctuation)", () => {
      for (let i = 0; i < NUM_ITERATIONS; i++) {
        const characterTypes = createCharacterTypes({
          lowercaseLetters: true,
          uppercaseLetters: false,
          numbers: false,
          punctuation: false,
          spaces: true,
        });

        const baseText = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        expect(hasUppercase(result)).toBe(false);
        expect(hasNumbers(result)).toBe(false);
        expect(hasPunctuation(result)).toBe(false);
        expect(hasLowercase(result)).toBe(true);
      }
    });
  });

  describe("output is non-empty", () => {
    it("always produces non-empty output for valid character combinations", () => {
      const validCombinations: Partial<CharacterTypeFlags>[] = [
        { lowercaseLetters: true },
        { uppercaseLetters: true },
        { numbers: true },
        { punctuation: true },
        { lowercaseLetters: true, uppercaseLetters: true },
        { numbers: true, punctuation: true },
        { lowercaseLetters: true, numbers: true, punctuation: true },
      ];

      for (const types of validCombinations) {
        const characterTypes = createCharacterTypes({
          lowercaseLetters: false,
          uppercaseLetters: false,
          numbers: false,
          punctuation: false,
          spaces: true,
          ...types,
        });

        const baseText = generateBaseText({
          contentType: "words",
          length: "short",
          characterTypes,
        });

        const result = transformText(baseText, characterTypes);

        expect(result.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
