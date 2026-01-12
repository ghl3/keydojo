/**
 * Tagging module - exports all tagging functions
 */

export { tagWord, tagWords, matchesTags } from "./wordTagger";
export { tagSentence, tagSentences, matchesSentenceTags } from "./sentenceTagger";
export { tagParagraph, tagParagraphs, matchesParagraphTags } from "./paragraphTagger";
export { tagCode, tagCodeSnippets, matchesCodeTags } from "./codeTagger";
