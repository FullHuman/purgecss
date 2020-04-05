import { Options, ExtractorResult } from "./types/";

export const defaultOptions: Options = {
  css: [],
  content: [],
  defaultExtractor: (content: string): ExtractorResult =>
    content.match(/[A-Za-z0-9_-]+/g) || [],
  extractors: [],
  customClassComparator: (node, selector) => node === selector,
  fontFace: false,
  keyframes: false,
  rejected: false,
  stdin: false,
  stdout: false,
  variables: false,
  whitelist: [],
  whitelistPatterns: [],
  whitelistPatternsChildren: [],
};
