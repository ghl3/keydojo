// Session mode utilities and migration helpers

import type {
  SessionMode,
  CharacterTypeFlags,
  LegacySessionMode,
} from "./sessionResult";
import type { ContentType } from "@/lib/content";

/**
 * Convert new SessionMode to legacy CharacterTypeFlags for backwards compatibility
 * with stats tracking and other systems that expect the old format.
 */
export function toLegacyCharacterTypes(mode: SessionMode): CharacterTypeFlags {
  const { content } = mode;

  switch (content.type) {
    case "words":
      return {
        lowercaseLetters: content.options.lowercase,
        uppercaseLetters: content.options.uppercase,
        numbers: content.options.numbers,
        punctuation: content.options.punctuation,
        spaces: true,
      };
    case "sentences":
    case "paragraphs":
      return {
        lowercaseLetters: true,
        uppercaseLetters: true,
        numbers: content.options.numbers,
        punctuation: content.options.punctuation,
        spaces: true,
      };
    case "code":
      // Code mode has all characters enabled
      return {
        lowercaseLetters: true,
        uppercaseLetters: true,
        numbers: true,
        punctuation: true,
        spaces: true,
      };
  }
}

/**
 * Get the content type from a SessionMode
 */
export function getContentType(mode: SessionMode): ContentType {
  return mode.content.type;
}

/**
 * Migrate legacy session mode to new format
 */
export function migrateLegacyMode(legacy: LegacySessionMode): SessionMode {
  const { characterTypes, contentType } = legacy;

  switch (contentType) {
    case "words":
      return {
        content: {
          type: "words",
          options: {
            lowercase: characterTypes.lowercaseLetters,
            uppercase: characterTypes.uppercaseLetters,
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
            specialChars: false,
          },
        },
      };
    case "sentences":
      return {
        content: {
          type: "sentences",
          options: {
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
          },
        },
      };
    case "paragraphs":
      return {
        content: {
          type: "paragraphs",
          options: {
            numbers: characterTypes.numbers,
            punctuation: characterTypes.punctuation,
          },
        },
      };
    case "code":
      return {
        content: {
          type: "code",
          options: {
            language: "mixed",
          },
        },
      };
  }
}

/**
 * Check if a mode object is in the legacy format
 */
export function isLegacyMode(
  mode: SessionMode | LegacySessionMode
): mode is LegacySessionMode {
  return "characterTypes" in mode && "contentType" in mode;
}
