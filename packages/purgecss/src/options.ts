import { Options, ExtractorResult } from "./types/";

export const defaultOptions: Options = {
  css: [],
  content: [],
  defaultExtractor: (content: string): ExtractorResult => {
    const selectors = content.match(/[A-Za-z0-9_-]+/g) || [];
    return {
      attributes: {
        names: new Set(),
        values: new Set()
      },
      classes: new Set(),
      ids: new Set(),
      tags: new Set(),
      undetermined: new Set(selectors)
    };
  },
  extractors: [],
  fontFace: false,
  keyframes: false,
  rejected: false,
  stdin: false,
  stdout: false,
  variables: false,
  whitelist: [],
  whitelistPatterns: [],
  whitelistPatternsChildren: []
};
