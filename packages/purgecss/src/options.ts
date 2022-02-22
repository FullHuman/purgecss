import { ExtractorResult, Options } from "./types/";

/**
 * @public
 */
export const defaultOptions: Options = {
  css: [],
  content: [],
  defaultExtractor: (content: string): ExtractorResult =>
    content.match(/[A-Za-z0-9_-]+/g) || [],
  extractors: [],
  fontFace: false,
  keyframes: false,
  rejected: false,
  rejectedCss: false,
  sourceMap: false,
  stdin: false,
  stdout: false,
  variables: false,
  safelist: {
    standard: [],
    deep: [],
    greedy: [],
    variables: [],
    keyframes: [],
  },
  blocklist: [],
  skippedContentGlobs: [],
  dynamicAttributes: [],
};
