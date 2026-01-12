/**
 * Code tagging functions
 *
 * Automatically detects code properties and assigns tags for filtering.
 */

import type {
  CodeTag,
  CodeLanguageTag,
  CodeComplexityTag,
  CodePatternTag,
  TaggedCode,
} from "../types";

// Language detection patterns
const LANGUAGE_PATTERNS: Record<CodeLanguageTag, RegExp[]> = {
  "lang:typescript": [
    /:\s*(string|number|boolean|void|any|unknown|never)\b/,
    /\binterface\s+\w+/,
    /\btype\s+\w+\s*=/,
    /<\w+(\s*,\s*\w+)*>/,
    /\bas\s+(string|number|boolean|any)/,
    /\bReadonly\w*</,
    /\bPartial</,
    /\bRecord</,
  ],
  "lang:javascript": [
    /\bconst\s+\w+\s*=/,
    /\blet\s+\w+\s*=/,
    /\bfunction\s+\w+\s*\(/,
    /=>\s*{/,
    /\bconsole\.(log|error|warn)/,
    /\brequire\s*\(/,
    /\bmodule\.exports/,
    /\bawait\s+/,
    /\basync\s+/,
  ],
  "lang:python": [
    /\bdef\s+\w+\s*\(/,
    /\bclass\s+\w+:/,
    /\bimport\s+\w+/,
    /\bfrom\s+\w+\s+import/,
    /\bif\s+__name__\s*==\s*["']__main__["']/,
    /\bprint\s*\(/,
    /\bself\./,
    /\bNone\b/,
    /\bTrue\b|\bFalse\b/,
    /:\s*$/, // Python-style colon at end of line
  ],
  "lang:html": [
    /<\/?[a-z][a-z0-9]*[^>]*>/i,
    /<html/i,
    /<head/i,
    /<body/i,
    /<div/i,
    /<span/i,
    /<p>/i,
    /class="/,
    /id="/,
  ],
  "lang:css": [
    /\{[\s\S]*?:[^}]+\}/,
    /\.([\w-]+)\s*\{/,
    /#([\w-]+)\s*\{/,
    /margin:|padding:|color:|background:|display:|flex:|grid:/,
    /@media\s*\(/,
    /@import\s+/,
    /:hover|:focus|:active/,
  ],
  "lang:sql": [
    /\bSELECT\b/i,
    /\bFROM\b/i,
    /\bWHERE\b/i,
    /\bINSERT\s+INTO\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bJOIN\b/i,
    /\bORDER\s+BY\b/i,
    /\bGROUP\s+BY\b/i,
    /\bCREATE\s+TABLE\b/i,
  ],
  "lang:json": [
    /^\s*\{[\s\S]*\}\s*$/,
    /"[\w]+"\s*:\s*["{\[\d]/,
    /\[\s*\{/,
    /\}\s*,\s*\{/,
  ],
  "lang:react": [
    /\breturn\s*\(/,
    /<[A-Z]\w*/,
    /\buseState\s*\(/,
    /\buseEffect\s*\(/,
    /\bReact\./,
    /\bcomponent/i,
    /\bprops\./,
    /\bclassName="/,
    /\bonClick\s*=/,
    /\bkey\s*=/,
  ],
  "lang:mixed": [], // Default fallback
};

// Pattern detection for code structure
const CODE_PATTERNS: Record<CodePatternTag, RegExp[]> = {
  "pattern:function": [
    /\bfunction\s+\w+\s*\(/,
    /\bdef\s+\w+\s*\(/,
    /=>\s*[{(]/,
    /\(\s*\)\s*=>/,
    /\bconst\s+\w+\s*=\s*\([^)]*\)\s*=>/,
    /\bconst\s+\w+\s*=\s*async\s*\(/,
  ],
  "pattern:class": [
    /\bclass\s+\w+/,
    /\bconstructor\s*\(/,
    /\bextends\s+\w+/,
    /\bimplements\s+\w+/,
    /\bthis\.\w+/,
    /\bsuper\s*\(/,
  ],
  "pattern:control-flow": [
    /\bif\s*\(/,
    /\belse\s*{/,
    /\bfor\s*\(/,
    /\bwhile\s*\(/,
    /\bswitch\s*\(/,
    /\bcase\s+/,
    /\btry\s*{/,
    /\bcatch\s*\(/,
    /\b\?\s*:/,
  ],
  "pattern:data-structure": [
    /\[\s*\{/,
    /\{\s*\w+\s*:/,
    /\bMap\s*\(/,
    /\bSet\s*\(/,
    /\bArray\s*\(/,
    /\[\s*\.\.\./,
    /\{\s*\.\.\./,
  ],
  "pattern:async": [
    /\basync\s+/,
    /\bawait\s+/,
    /\bPromise\s*\./,
    /\.then\s*\(/,
    /\.catch\s*\(/,
    /\bfetch\s*\(/,
  ],
  "pattern:import-export": [
    /\bimport\s+/,
    /\bexport\s+(default\s+)?/,
    /\bfrom\s+["']/,
    /\brequire\s*\(/,
    /\bmodule\.exports/,
  ],
  "pattern:type-definition": [
    /\binterface\s+\w+/,
    /\btype\s+\w+\s*=/,
    /:\s*\w+\[\]/,
    /:\s*\w+<\w+>/,
    /<\w+\s*extends\s+\w+>/,
  ],
  "pattern:query": [
    /\bSELECT\b/i,
    /\bFROM\b/i,
    /\bWHERE\b/i,
    /\bquery\s*\(/i,
    /\bfind\s*\(/,
    /\bfilter\s*\(/,
  ],
};

/**
 * Get the language tag for a code snippet
 */
function getLanguageTag(code: string): CodeLanguageTag {
  let bestLang: CodeLanguageTag = "lang:mixed";
  let bestScore = 0;

  // Check TypeScript first (it's a superset of JS)
  for (const pattern of LANGUAGE_PATTERNS["lang:typescript"]) {
    if (pattern.test(code)) {
      return "lang:typescript";
    }
  }

  // Check React (before JavaScript since it overlaps)
  let reactScore = 0;
  for (const pattern of LANGUAGE_PATTERNS["lang:react"]) {
    if (pattern.test(code)) reactScore++;
  }
  if (reactScore >= 2) {
    return "lang:react";
  }

  // Check other languages
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS) as [CodeLanguageTag, RegExp[]][]) {
    if (lang === "lang:typescript" || lang === "lang:react" || lang === "lang:mixed") {
      continue;
    }

    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(code)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  return bestLang;
}

/**
 * Get the complexity tag for a code snippet
 */
function getComplexityTag(code: string): CodeComplexityTag {
  const lines = code.split("\n").filter((l) => l.trim().length > 0);
  const lineCount = lines.length;

  // Count nesting depth
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of code) {
    if (char === "{" || char === "(" || char === "[") {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === "}" || char === ")" || char === "]") {
      currentDepth--;
    }
  }

  // Count control structures
  const controlCount = (code.match(/\b(if|else|for|while|switch|try|catch)\b/g) || []).length;

  // Score calculation
  let score = 0;

  // Line count
  if (lineCount <= 5) score += 0;
  else if (lineCount <= 15) score += 1;
  else score += 2;

  // Nesting depth
  if (maxDepth <= 2) score += 0;
  else if (maxDepth <= 4) score += 1;
  else score += 2;

  // Control structures
  if (controlCount <= 1) score += 0;
  else if (controlCount <= 3) score += 1;
  else score += 2;

  if (score <= 2) return "complexity:basic";
  if (score <= 4) return "complexity:intermediate";
  return "complexity:advanced";
}

/**
 * Get pattern tags for a code snippet
 */
function getPatternTags(code: string): CodePatternTag[] {
  const tags: CodePatternTag[] = [];

  for (const [pattern, regexes] of Object.entries(CODE_PATTERNS) as [CodePatternTag, RegExp[]][]) {
    for (const regex of regexes) {
      if (regex.test(code)) {
        tags.push(pattern);
        break;
      }
    }
  }

  return tags;
}

/**
 * Tag a single code snippet with all applicable tags
 */
export function tagCode(code: string): TaggedCode {
  const tags: CodeTag[] = [];

  // Language tag
  tags.push(getLanguageTag(code));

  // Complexity tag
  tags.push(getComplexityTag(code));

  // Pattern tags
  tags.push(...getPatternTags(code));

  return { content: code, tags };
}

/**
 * Tag an array of code snippets
 */
export function tagCodeSnippets(snippets: string[]): TaggedCode[] {
  return snippets.map(tagCode);
}

/**
 * Check if a tagged code snippet matches the given tag filters
 */
export function matchesCodeTags(
  item: TaggedCode,
  requireTags?: CodeTag[],
  anyTags?: CodeTag[],
  excludeTags?: CodeTag[]
): boolean {
  // Check required tags (all must match)
  if (requireTags && requireTags.length > 0) {
    if (!requireTags.every((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  // Check any tags (at least one must match)
  if (anyTags && anyTags.length > 0) {
    if (!anyTags.some((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  // Check exclude tags (none can match)
  if (excludeTags && excludeTags.length > 0) {
    if (excludeTags.some((tag) => item.tags.includes(tag))) {
      return false;
    }
  }

  return true;
}
