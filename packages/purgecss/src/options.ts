import { Options, ExtractorResult } from "./types/";

export const defaultOptions: Options = {
  css: [],
  content: [],
  defaultExtractor: (content: string): ExtractorResult =>
    content.match(/[A-Za-z0-9_-]+/g) || [],
  extractors: [],
  fontFace: true,
  keyframes: true,
  rejected: false,
  stdin: false,
  stdout: false,
  variables: true,
  whitelist: [],
  whitelistPatterns: [],
  whitelistPatternsChildren: []
};
